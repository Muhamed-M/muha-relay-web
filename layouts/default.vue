<script setup lang="ts">
const isOpen = ref(false);

// Initialize push notifications (registers SW and restores subscription if granted)
usePushNotifications();
</script>

<template>
  <div class="min-h-screen">
    <div class="header-safe sticky top-0 flex items-center gap-4 px-4 py-2 shadow-md z-20 bg-white dark:bg-gray-900">
      <img src="/favicon.svg" alt="logo" width="50px" />
      <h2 class="font-semibold text-lg">Conversations</h2>
    </div>

    <main>
      <slot />
    </main>

    <div
      class="bottom-safe w-screen fixed bottom-0 flex justify-around items-center py-4 z-20 bottom-nav-shadow bg-white dark:bg-gray-900"
    >
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

    <ConversationsHandler v-model="isOpen" @close="isOpen = false" />
    <PwaInstallPrompt />
  </div>
</template>

<style scoped>
.bottom-nav-shadow {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* Safe area for iOS notch/status bar */
.header-safe {
  padding-top: max(0.5rem, env(safe-area-inset-top, 0.5rem));
}

/* Safe area for iOS home indicator */
.bottom-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
}
</style>
