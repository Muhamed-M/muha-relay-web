<script setup lang="ts">
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const signOut = () => {
  authStore.signOut();
  navigateTo('/auth/sign-in');
};
</script>

<template>
  <div class="py-5 px-6 space-y-3">
    <div class="text-center space-y-3">
      <UAvatar size="3xl" :alt="user?.username" />
      <div>
        <h2 class="text-lg font-semibold">{{ user?.firstName }}</h2>
        <h3 class="text-slate-700">{{ user?.username }}</h3>
      </div>
    </div>

    <ul>
      <li class="flex items-center gap-3 text-lg" @click="signOut()">
        <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="w-6 h-6"></UIcon>
        <span>Logout</span>
      </li>
    </ul>
  </div>
</template>
