<script setup lang="ts">
import UserService from '~/services/userService';

const groups = [
  {
    key: 'users',
    label: (q: string) => q && `Users matching “${q}”...`,
    search: async (q: string) => {
      // if (!q || q.length < 2) {
      //   return [];
      // }

      const users: any[] = await UserService.findUsersBySearch(q);

      return users.map((user) => ({ id: user.id, label: user.username, suffix: user.email }));
    },
  },
];
</script>

<template>
  <UCommandPalette
    nullable
    :autoselect="false"
    placeholder="Find users..."
    :groups="groups"
    :fuse="{ resultLimit: 10, fuseOptions: { threshold: 0.1 } }"
    :empty-state="{
      icon: 'i-heroicons-magnifying-glass-20-solid',
      label: `We couldn't find any users.`,
      queryLabel: `We couldn't find any users with that term. Please try again.`,
    }"
    :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
    :ui="{ wrapper: 'min-h-72', input: { base: 'rounded border' } }"
  />
</template>
