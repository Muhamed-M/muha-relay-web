<script setup lang="ts">
const conversations = [
  {
    id: 1,
    image: 'https://avatars.githubusercontent.com/u/739984?v=4',
    name: 'John Doe',
    lastMessage: 'Hello, how are you?',
    lastMessageTime: '10:00 AM',
    unreadMessages: 2,
  },
  {
    id: 2,
    image: 'https://avatars.githubusercontent.com/u/739984?v=4',
    name: 'Jane Stone',
    lastMessage: 'I am good, thank you!',
    lastMessageTime: '10:05 AM',
    unreadMessages: 0,
  },
];
</script>

<template>
  <ul>
    <li v-for="conversation in conversations" :key="conversation.id">
      <NuxtLink :to="`/conversations/${conversation.id}`">
        <ConversationsItem :conversation="conversation" />
      </NuxtLink>
    </li>
  </ul>
</template>
