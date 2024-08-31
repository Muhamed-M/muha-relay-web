<script setup lang="ts">
import ConversationService from '~/services/conversationService';
const authStore = useAuthStore();
const loading = ref(true);
const conversations: any = ref([]);

const fetchConversations = async () => {
  try {
    const result = await ConversationService.getConversations(authStore?.user?.id);

    conversations.value = result;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchConversations);
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center space-x-4 py-3 px-4">
      <USkeleton class="h-14 w-14" :ui="{ rounded: 'rounded-full' }" />
      <div class="space-y-2">
        <USkeleton class="h-4 w-[250px]" />
      </div>
    </div>

    <div v-if="!loading && conversations.length === 0" class="flex items-center justify-center mt-40">
      <UIcon name="i-heroicons-archive-box-x-mark" class="w-9 h-9 mr-3" />
      <h3 class="text-lg font-semibold">No Active Conversations</h3>
    </div>
    <ul v-else class="pb-20">
      <li v-for="conversation in conversations" :key="conversation.id">
        <NuxtLink :to="`/conversations/${conversation.id}`">
          <ConversationsItem :conversation="conversation" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
