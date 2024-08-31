<script setup lang="ts">
const authStore = useAuthStore();

const signOut = () => {
  authStore.signOut();
  navigateTo('/auth/sign-in');
};
</script>

<template>
  <ul class="py-5 px-6">
    <li class="flex items-center gap-3 text-lg" @click="signOut()">
      <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="w-6 h-6"></UIcon>
      <span>Logout</span>
    </li>
  </ul>
</template>
