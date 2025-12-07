<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  showCloseButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showCloseButton: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  dismiss: [];
}>();

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const handleDismiss = () => {
  isVisible.value = false;
  emit('dismiss');
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleDismiss();
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
          enter-to-class="translate-y-0 sm:scale-100 opacity-100"
          leave-from-class="translate-y-0 sm:scale-100 opacity-100"
          leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
        >
          <div
            v-if="isVisible"
            class="relative w-full sm:max-w-lg h-[85vh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <!-- Drag Handle (mobile only) -->
            <div class="sm:hidden flex justify-center pt-3 pb-1">
              <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 v-if="title" class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h2>
              <div v-else></div>
              <button
                v-if="showCloseButton"
                @click="handleDismiss"
                class="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
