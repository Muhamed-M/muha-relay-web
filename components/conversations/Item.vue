<script setup lang="ts">
import { format, isToday, isYesterday } from 'date-fns';
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

const isUserOnline = computed(() => {
  const otherMember = props.conversation?.members.find((member: any) => member.user.id !== authStore.user?.id);
  return otherMember?.user?.activityStatus === 'online' || false;
});

const formatDate = (date: Date) => {
  const parsedDate = new Date(date);
  if (isToday(parsedDate)) {
    return format(parsedDate, 'HH:mm');
  }

  if (isYesterday(parsedDate)) {
    return 'Yesterday';
  }

  return format(parsedDate, 'dd.MM.yyyy');
};
</script>

<template>
  <div
    class="flex justify-between items-center py-3 px-4"
    :class="[conversation?._count?.messages ?? 0 > 0 ? 'bg-primary-100' : '']"
  >
    <div class="flex items-center">
      <UAvatar v-if="conversation?.isGroup" size="xl" :alt="conversationTitle" class="mr-3" />
      <UAvatar
        v-else
        :chip-color="isUserOnline ? 'green' : 'gray'"
        chip-position="top-right"
        size="xl"
        :alt="conversationTitle"
        class="mr-3"
      />
      <div>
        <h3
          class="text-lg font-semibold"
          :class="[conversation?._count?.messages ?? 0 > 0 ? 'text-black font-bold' : 'text-gray-500']"
        >
          {{ conversationTitle }}
        </h3>
        <p
          v-if="conversation?.lastMessageContent"
          class="text-sm"
          :class="[conversation?._count?.messages ?? 0 > 0 ? 'text-black font-bold' : 'text-gray-500']"
        >
          <!-- @vue-ignore -->
          {{ truncateText(conversation?.lastMessageContent, 20) }}
        </p>
        <p v-else class="text-sm text-primary">New!</p>
      </div>
    </div>
    <div>
      <p v-if="conversation?.lastMessageAt" class="text-sm text-gray-500">
        {{ formatDate(conversation?.lastMessageAt) }}
      </p>
      <div
        v-if="conversation?._count.messages > 0"
        class="bg-primary text-white rounded-full w-6 h-6 flex justify-center items-center ms-auto mt-2"
      >
        <p>{{ conversation?._count.messages }}</p>
      </div>
    </div>
  </div>
</template>
