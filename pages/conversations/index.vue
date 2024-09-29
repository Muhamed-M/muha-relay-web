<script setup lang="ts">
import { getWebSocket } from '~/utils/websocket';
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();
const socket = getWebSocket();

const { loading, conversations } = storeToRefs(conversationsStore);

onMounted(async () => {
  await conversationsStore.fetchConversations(authStore?.user?.id);

  if (!socket) return;

  socket.onmessage = async ({ data }) => {
    const messageObj = JSON.parse(data);

    // If the message is for a specific conversation update
    if (messageObj.type === 'conversation-update' && messageObj.senderId !== authStore.user?.id) {
      // Update conversation list with the new message data
      const conversationIndex = conversations.value.findIndex((c) => c.id === messageObj.conversationId);
      if (conversationIndex !== -1) {
        // Update last message content and timestamp in the conversation list
        conversations.value[conversationIndex].lastMessageContent = messageObj.lastMessageContent;
        conversations.value[conversationIndex].lastMessageAt = messageObj.lastMessageAt;
        if (conversations.value[conversationIndex]._count) {
          conversations.value[conversationIndex]._count.messages += 1;
        }

        // Remove the conversation from its current position
        const updatedConversation = conversations.value.splice(conversationIndex, 1)[0];

        // Add the conversation to the beginning of the array
        conversations.value.unshift(updatedConversation);
      }
    } else if (messageObj.type === 'user-activity') {
      // Update user activity status in the conversation list
      const conversationIndex = conversations.value.findIndex(
        (c) => c.members?.some((m) => m.user?.id === messageObj.userId) && !c.isGroup
      ); // Find the conversation where the user is a member and it's not a group

      if (conversationIndex !== -1) {
        conversations.value[conversationIndex].members?.forEach((m) => {
          if (m.user?.id === messageObj.userId && m.user?.activityStatus) {
            m.user.activityStatus = messageObj.activityStatus;
          }
        });
      }
    }
  };
});

onBeforeUnmount(() => {
  if (socket) {
    socket.onmessage = null;
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="flex items-center space-x-4 py-3 px-4">
      <USkeleton class="h-14 w-14" :ui="{ rounded: 'rounded-full' }" />
      <div class="space-y-2">
        <USkeleton class="h-4 w-[250px]" />
      </div>
    </div>

    <template v-else>
      <div v-if="conversations.length === 0" class="flex items-center justify-center mt-40">
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
    </template>
  </div>
</template>
