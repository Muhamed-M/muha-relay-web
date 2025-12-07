<script setup lang="ts">
const { isSupported, isGranted, isPWA, enableNotifications } = usePushNotifications();
const loading = ref(false);

async function handleEnable() {
  loading.value = true;
  await enableNotifications();
  loading.value = false;
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="!isSupported" class="text-sm text-gray-500">
      Push notifications are not supported in this browser.
    </div>
    
    <div v-else-if="isGranted" class="flex items-center gap-2 text-sm text-green-600">
      <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
      Notifications enabled
    </div>
    
    <div v-else class="space-y-2">
      <UButton
        :loading="loading"
        @click="handleEnable"
        color="primary"
        size="sm"
      >
        Enable Notifications
      </UButton>
      
      <p v-if="!isPWA" class="text-xs text-amber-600">
        For best experience on iOS, install this app to your home screen first.
      </p>
    </div>
  </div>
</template>

