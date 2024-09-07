<script setup lang="ts">
import ConversationService from '~/services/conversationService';
import type { Conversation } from '~/types';
import socket from '~/utils/websocket';
const authStore = useAuthStore();
const loading = ref<boolean>(true);
const conversations = ref<Conversation[]>([]);

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

onMounted(async () => {
  await fetchConversations();

  if (!socket) return;

  socket.onmessage = async ({ data }) => {
    const messageObj = JSON.parse(data);

    // If the message is for a specific conversation update
    if (messageObj.type === 'conversation-update') {
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
    }
  };
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
