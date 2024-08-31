<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <div class="h-screen">
    <div class="sticky top-0 flex justify-between items-center px-4 py-2 shadow-md z-20 bg-white">
      <img src="/favicon.svg" alt="logo" width="50px" />
      <h2 class="font-semibold text-lg">Conversations</h2>
      <UIcon name="i-mdi-magnify" class="w-9 h-9"></UIcon>
    </div>

    <main>
      <slot />
    </main>

    <div class="w-screen fixed bottom-0 flex justify-around items-center py-4 z-20 bottom-nav-shadow bg-white">
      <NuxtLink to="/conversations">
        <UIcon name="i-ph-chat-thin" class="w-9 h-9"></UIcon>
      </NuxtLink>
      <UButton :ui="{ rounded: 'rounded-full' }" size="xl" class="px-6" @click="isOpen = true">
        <UIcon name="i-ph-plus-light" class="w-5 h-5"></UIcon>
        New Chat
      </UButton>
      <NuxtLink to="/settings">
        <UIcon name="i-ph-user-circle-thin" class="w-10 h-10"></UIcon>
      </NuxtLink>
    </div>

    <ConversationsHandler v-model="isOpen" />
  </div>
</template>

<style scoped>
.bottom-nav-shadow {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style>
