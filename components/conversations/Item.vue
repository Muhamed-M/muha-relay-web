<script setup lang="ts">
import { format } from 'date-fns';
const authStore = useAuthStore();

const props = defineProps({
  conversation: Object,
});

const conversationTitle = computed(() => {
  if (props.conversation?.name) {
    return props.conversation.name;
  }

  if (props.conversation?.members?.length === 2) {
    const otherMember = props.conversation.members.find((member: any) => member.user.id !== authStore.user?.id);
    return otherMember?.user?.username || 'Unknown';
  }

  return 'Unknown Conversation';
});
</script>

<template>
  <div class="flex justify-between items-center py-3 px-4">
    <div class="flex items-center">
      <UAvatar chip-color="green" chip-position="top-right" size="xl" :alt="conversationTitle" class="mr-3" />
      <div>
        <h3 class="text-lg font-semibold">{{ conversationTitle }}</h3>
        <p v-if="conversation?.messages[0]?.content" class="text-sm text-gray-500">
          <!-- @vue-ignore -->
          {{ truncateText(conversation?.messages[0].content, 30) }}
        </p>
        <p v-else class="text-sm text-primary">New!</p>
      </div>
    </div>
    <div>
      <p v-if="conversation?.messages[0]?.createdAt" class="text-sm text-gray-500">
        {{ format(new Date(conversation?.messages[0]?.createdAt), 'dd.MM.yyyy') }}
      </p>
      <div
        v-if="conversation?.unreadMessages > 0"
        class="bg-primary text-white rounded-full w-6 h-6 flex justify-center items-center ms-auto mt-2"
      >
        <p>{{ conversation?.unreadMessages }}</p>
      </div>
    </div>
  </div>
</template>
