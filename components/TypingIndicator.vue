<script setup lang="ts">
defineProps({
  typingUsers: Set,
});
</script>

<template>
  <div class="flex justify-start">
    <div class="max-w-80 bg-gray-400 flex items-center gap-3 py-1 px-3 rounded-lg text-white text-sm">
      <div class="flex space-x-1">
        <div class="w-1 h-1 bg-white rounded-full animate-typing-dot1"></div>
        <div class="w-1 h-1 bg-white rounded-full animate-typing-dot2"></div>
        <div class="w-1 h-1 bg-white rounded-full animate-typing-dot3"></div>
      </div>

      <p>
        <span v-if="typingUsers?.size && typingUsers.size > 3">Multiple people typing</span>
        <template v-else-if="typingUsers && typingUsers.size < 3">
          <span v-for="(user, index) in Array.from(typingUsers)" :key="index">
            {{ user }}<span v-if="index < typingUsers.size - 1">, </span>
          </span>
          <span v-if="typingUsers?.size === 1"> is typing</span>
          <span v-else> are typing</span>
        </template>
      </p>
    </div>
  </div>
</template>
