<script setup lang="ts">
const { showPrompt, deviceInfo, dismissPrompt } = usePwaInstall();

const handleDismiss = () => {
  dismissPrompt();
};

const instructions = computed(() => {
  if (deviceInfo.value.isIOS) {
    return {
      title: 'Add to Home Screen',
      subtitle: 'Get the full app experience',
      steps: [
        {
          icon: 'i-heroicons-arrow-up-on-square',
          text: 'Tap the Share button',
          detail: 'at the bottom of your browser',
        },
        {
          icon: 'i-heroicons-plus-circle',
          text: 'Scroll down and tap',
          detail: '"Add to Home Screen"',
        },
        {
          icon: 'i-heroicons-check-circle',
          text: 'Tap "Add" to confirm',
          detail: 'in the top right corner',
        },
      ],
    };
  }

  return {
    title: 'Install Muha Relay',
    subtitle: 'Get the full app experience',
    steps: [
      {
        icon: 'i-heroicons-ellipsis-vertical',
        text: 'Tap the menu button',
        detail: 'in the top right corner',
      },
      {
        icon: 'i-heroicons-device-phone-mobile',
        text: 'Select "Install app"',
        detail: 'or "Add to Home Screen"',
      },
      {
        icon: 'i-heroicons-check-circle',
        text: 'Tap "Install" to confirm',
        detail: 'and enjoy the app!',
      },
    ],
  };
});
</script>

<template>
  <DismissableModal v-model="showPrompt" :title="instructions.title" @dismiss="handleDismiss">
    <div class="px-5 py-6 space-y-8">
      <!-- Hero Section -->
      <div class="text-center space-y-4">
        <div class="relative inline-flex">
          <div
            class="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/40"
          >
            <img src="/favicon.svg" alt="Muha Relay" class="w-12 h-12" />
          </div>
          <div
            class="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md"
          >
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 text-white" />
          </div>
        </div>
        <p class="text-gray-600 dark:text-gray-400 text-base">{{ instructions.subtitle }}</p>
      </div>

      <!-- Benefits -->
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div
            class="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-bolt" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Faster</span>
        </div>
        <div class="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div
            class="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-bell-alert" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Notifications</span>
        </div>
        <div class="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div
            class="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Native Feel</span>
        </div>
      </div>

      <!-- Steps -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">How to install</h3>
        <div class="space-y-3">
          <div
            v-for="(step, index) in instructions.steps"
            :key="index"
            class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div
              class="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center relative overflow-hidden"
            >
              <UIcon :name="step.icon" class="w-6 h-6 text-primary" />
              <div
                class="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-semibold text-gray-900 dark:text-white">{{ step.text }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ step.detail }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="space-y-3">
        <UButton block size="xl" color="primary" @click="handleDismiss"> Got it, I'll install later </UButton>
        <button
          @click="handleDismiss"
          class="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2"
        >
          Don't show this again
        </button>
      </div>
    </template>
  </DismissableModal>
</template>
