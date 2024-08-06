<script setup lang="ts"></script>

<template>
  <div class="h-screen">
    <slot />
    <div class="w-screen fixed bottom-0 flex justify-around items-center py-4 z-20 bottom-nav-shadow">
      <NuxtLink to="/auth/sign-in">
        <UIcon name="i-ph-chat-thin" class="w-9 h-9"></UIcon>
      </NuxtLink>
      <UButton :ui="{ rounded: 'rounded-full' }" size="xl" class="px-6">
        <UIcon name="i-ph-plus-light" class="w-5 h-5"></UIcon>
        New Chat
      </UButton>
      <NuxtLink to="/auth/sign-up">
        <UIcon name="i-ph-user-circle-thin" class="w-10 h-10"></UIcon>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.bottom-nav-shadow {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style>
