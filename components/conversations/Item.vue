<script setup lang="ts">
defineProps({
  conversation: Object,
});
</script>

<template>
  <div class="flex justify-between items-center py-3 px-4">
    <div class="flex items-center">
      <UAvatar
        chip-color="green"
        chip-position="top-right"
        size="xl"
        :src="conversation.image"
        alt="Avatar"
        class="mr-3"
      />
      <div>
        <h3 class="text-lg font-semibold">{{ conversation.name }}</h3>
        <p class="text-sm text-gray-500">{{ conversation.lastMessage }}</p>
      </div>
    </div>
    <div>
      <p class="text-sm text-gray-500">{{ conversation.lastMessageTime }}</p>
      <div
        v-if="conversation.unreadMessages > 0"
        class="bg-primary text-white rounded-full w-6 h-6 flex justify-center items-center ms-auto mt-2"
      >
        <p>{{ conversation.unreadMessages }}</p>
      </div>
    </div>
  </div>
</template>
