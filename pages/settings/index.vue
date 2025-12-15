<script setup lang="ts">
import { getWebSocket } from '~/utils/websocket';
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const socket = getWebSocket();

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});

const { isSupported, isGranted, isPWA, subscription, enableNotifications } = usePushNotifications();
const notifLoading = ref(false);

// Show as fully enabled only if permission granted AND subscription exists
const isFullyEnabled = computed(() => isGranted.value && subscription.value !== null);

async function handleEnableNotifications() {
  notifLoading.value = true;
  const success = await enableNotifications();
  if (!success) {
    console.error('Failed to enable notifications');
  }
  notifLoading.value = false;
}

const signOut = () => {
  authStore.signOut();
  if (socket) socket.close();
  navigateTo('/auth/sign-in');
};
</script>

<template>
  <div class="py-5 px-6 space-y-6">
    <div class="text-center space-y-3">
      <UAvatar size="3xl" :alt="user?.username" />
      <div>
        <h2 class="text-lg font-semibold">{{ user?.firstName }}</h2>
        <h3 class="text-slate-700 dark:text-slate-300">{{ user?.username }}</h3>
      </div>
    </div>

    <ul class="space-y-4">
      <li v-if="isSupported" class="flex items-center justify-between text-lg">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-bell-20-solid" class="w-6 h-6" />
          <span>Notifications</span>
        </div>
        <div v-if="isFullyEnabled" class="flex items-center gap-2 text-green-600">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
          <span class="text-sm">Enabled</span>
        </div>
        <UButton v-else size="xs" :loading="notifLoading" @click="handleEnableNotifications"> Enable </UButton>
      </li>

      <li v-if="isSupported && !isFullyEnabled && !isPWA" class="text-xs text-amber-600 pl-9">
        For iOS, install this app to your home screen first.
      </li>

      <li class="flex items-center justify-between text-lg">
        <div class="flex items-center gap-3">
          <ClientOnly>
            <UIcon v-if="isDark" name="i-heroicons-moon-20-solid" class="w-6 h-6" />
            <UIcon v-else name="i-heroicons-sun-20-solid" class="w-6 h-6" />
            <template #fallback>
              <div class="w-6 h-6" />
            </template>
          </ClientOnly>
          <span>Dark Mode</span>
        </div>
        <ClientOnly>
          <UToggle v-model="isDark" />
          <template #fallback>
            <div class="h-5 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
          </template>
        </ClientOnly>
      </li>

      <li class="flex items-center gap-3 text-lg cursor-pointer" @click="signOut()">
        <UIcon name="i-heroicons-arrow-left-start-on-rectangle" class="w-6 h-6" />
        <span>Logout</span>
      </li>
    </ul>
  </div>
</template>
