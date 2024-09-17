<script setup lang="ts">
const router = useRouter();
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();
const { conversation } = storeToRefs(conversationsStore);
defineEmits(['closeChatAside']);

const loading = ref<boolean>(false);
const mode = ref<string>('view');
const newName = ref<string>(conversation.value?.name || '');
const usersToAdd = ref<any[]>([]);
const modal = ref(false);
const excludeMembers = computed(() => conversation.value?.members?.map((member) => member.user?.id));

const editName = async () => {
  loading.value = true;
  try {
    if (!conversation.value?.id) return;

    if (newName.value?.length < 4) {
      return useNuxtApp().$toast.error('Name must be more than 3 characters!');
    }

    await conversationsStore.editGroupConversation(conversation.value?.id, newName.value);
    mode.value = 'view';
    newName.value = conversation.value?.name || '';
  } catch (error: any) {
    console.error(error);
    useNuxtApp().$toast.error(error.message);
  } finally {
    loading.value = false;
  }
};

const addMembers = async () => {
  try {
    if (!conversation.value?.id) return;

    const usersIds = usersToAdd.value.map((user) => user.id);
    await conversationsStore.addGroupMembers(conversation.value?.id, usersIds);

    usersToAdd.value.forEach((user) => {
      // @ts-ignore
      conversation.value?.members?.push({ user: { id: user.id, username: user.label } });
    });
    resetAddMembers();
  } catch (error: any) {
    console.error(error);
    useNuxtApp().$toast.error(error.message);
  }
};

const resetAddMembers = () => {
  modal.value = false;
  usersToAdd.value = [];
};

const deleteMember = async (userId: number | undefined) => {
  try {
    if (!userId) return;
    await conversationsStore.deleteGroupMembers(conversation.value?.id, [userId]);
  } catch (error: any) {
    console.error(error);
    useNuxtApp().$toast.error(error.message);
  }
};

const leaveGroup = async () => {
  if (!authStore.user?.id) return;
  try {
    await conversationsStore.deleteGroupMembers(conversation.value?.id, [authStore.user?.id]);
    router.push('/conversations');
  } catch (error: any) {
    console.error(error);
    useNuxtApp().$toast.error(error.message);
  }
};
</script>

<template>
  <USlideover>
    <UCard class="h-full" :ui="{ header: { padding: 'px-2 py-3 sm:px-3' } }">
      <template #header>
        <div class="relative flex items-center justify-between h-8">
          <div>
            <UButton color="primary" variant="ghost" size="sm" @click="$emit('closeChatAside')">
              <template #leading>
                <UIcon name="i-heroicons-x-mark" class="w-7 h-7"></UIcon>
              </template>
            </UButton>
          </div>

          <div class="absolute left-1/2 transform -translate-x-1/2">Conversation Settings</div>
        </div>
      </template>

      <div class="space-y-5">
        <div class="flex justify-between items-center">
          <template v-if="mode === 'view'">
            <h3 class="text-lg">{{ conversation?.name }}</h3>
            <UButton variant="ghost" icon="i-heroicons-pencil-square" @click="mode = 'edit'"></UButton>
          </template>
          <template v-else>
            <UInput v-model="newName" size="xl" placeholder="Group Name" class="flex-grow" />
            <UButton
              :loading="loading"
              :disabled="newName === conversation?.name"
              variant="ghost"
              icon="i-heroicons-check"
              @click="editName()"
            ></UButton>
            <UButton v-if="!loading" variant="ghost" icon="i-heroicons-x-mark" @click="mode = 'view'"></UButton>
          </template>
        </div>

        <div class="space-y-4 border border-slate-200 rounded-md p-3 max-h-72 overflow-y-auto">
          <h5>Members ({{ conversation?.members?.length }})</h5>
          <div class="flex items-center gap-2" @click="modal = true">
            <UButton variant="soft" size="lg" icon="i-heroicons-plus" class="rounded-3xl"></UButton>
            <span>Add member</span>
          </div>
          <div
            v-for="memeber in conversation?.members"
            :key="memeber.user?.id"
            class="flex items-center justify-between"
          >
            <div class="space-x-2">
              <UAvatar size="md" :alt="memeber.user?.username" />
              <span>{{ memeber.user?.username }}</span>
              <UBadge v-if="authStore.user?.id === memeber.user?.id" variant="soft" color="green" size="sm">You</UBadge>
            </div>
            <UIcon
              v-if="authStore.user?.id !== memeber.user?.id"
              name="i-heroicons-x-mark"
              class="w-4 h-4"
              @click="deleteMember(memeber.user?.id)"
            />
          </div>
        </div>

        <ul>
          <li class="flex items-center gap-3 text-lg text-red-600" @click="leaveGroup()">
            <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="w-6 h-6"></UIcon>
            <span>Leave group</span>
          </li>
        </ul>
      </div>
    </UCard>

    <UModal v-model="modal">
      <UCard>
        <template #header>
          <h3 class="text-center">Add Members</h3>
        </template>

        <FindUsers v-model="usersToAdd" multiple :exclude="excludeMembers" />

        <template #footer>
          <div class="flex justify-end">
            <UButton variant="outline" color="black" class="mr-4" @click="resetAddMembers()">Cancel</UButton>

            <UButton color="black" @click="addMembers()"> Add selected </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </USlideover>
</template>
