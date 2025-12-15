<script setup lang="ts">
import { format, isSameMinute, isToday, isYesterday } from 'date-fns';
import { getWebSocket, addMessageHandler } from '~/utils/websocket';
import type { Message } from '~/types';
import { playIncomingMessageSound, playSentMessageSound } from '~/utils/sounds';
import messageReceiptService from '~/services/messageReceiptService';
const route = useRoute();
const authStore = useAuthStore();
const conversationsStore = useConversationsStore();
const user = authStore.user;
const socket = getWebSocket();
const { showLocalNotification } = usePushNotifications();

// Store cleanup function for message handler
let removeHandler: (() => void) | null = null;

definePageMeta({
  layout: 'blank',
});

const { loadingConversation, conversation } = storeToRefs(conversationsStore);
const conversationId = ref<number>(Number(route.params.id));
const chatContainer = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLElement | null>(null);
const mainContainer = ref<HTMLElement | null>(null);
const loading = ref<boolean>(true);
const messages = ref<Message[]>([]);
const newMessage = ref<string>('');
const isAsideExpanded = ref<boolean>(false);
const typingUsers = ref(new Set<string>());
const isTyping = ref<boolean>(false);
let typingTimeout: ReturnType<typeof setTimeout>;

// Check if running as PWA (standalone mode)
const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
};

// Handle iOS keyboard - adjust layout when keyboard opens (only in PWA mode)
const handleViewportChange = () => {
  if (!window.visualViewport) return;

  // Only apply transforms in PWA/standalone mode
  // Regular Safari browser handles keyboard natively
  if (!isStandalone()) return;

  const viewport = window.visualViewport;
  const offsetTop = viewport.offsetTop;
  const keyboardHeight = window.innerHeight - viewport.height;

  // Only apply transforms if keyboard is actually open (height > 100px threshold)
  const isKeyboardOpen = keyboardHeight > 100;

  // Keep header at top of visual viewport
  if (headerRef.value) {
    headerRef.value.style.transform = isKeyboardOpen ? `translateY(${offsetTop}px)` : '';
  }

  // Move input above keyboard
  if (inputRef.value) {
    inputRef.value.style.transform = isKeyboardOpen ? `translateY(-${keyboardHeight}px)` : '';
  }

  // Adjust chat container to account for keyboard
  if (chatContainer.value) {
    chatContainer.value.style.paddingBottom = isKeyboardOpen ? `${keyboardHeight}px` : '';
    if (isKeyboardOpen) {
      // Scroll to bottom when keyboard opens
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }
};

const conversationTitle = computed<string>(() => {
  if (conversation.value?.name) {
    return conversation.value.name;
  }

  if (conversation.value?.members?.length === 2) {
    const otherMember = conversation.value.members.find((member: any) => member.user.id !== user?.id);
    return otherMember?.user?.username || 'Unknown';
  }

  return 'Unknown Conversation';
});

const isUserOnline = computed(() => {
  const otherMember = conversation.value?.members?.find((member: any) => member.user.id !== user?.id);
  return otherMember?.user?.activityStatus === 'online' || false;
});

const onlineMembersCount = computed(() => {
  return conversation.value?.members?.filter((m) => m.user?.activityStatus === 'online').length;
});

// Handler for WebSocket messages in this conversation
const handleWebSocketMessage = async ({ data }: MessageEvent) => {
  const messageObj = JSON.parse(data);

  switch (messageObj.type) {
    case 'message':
      // Only process messages for this conversation
      if (messageObj.conversationId !== conversationId.value) return;

      // update state
      messages.value.push(messageObj);
      playIncomingMessageSound();
      showLocalNotification('New message in Muha Relay', messageObj.content);

      // scroll to last message
      await nextTick();
      scrollToLastMessage();
      await markMessagesAsRead();
      break;
    case 'user-activity':
      conversation.value?.members?.forEach((m) => {
        if (m.user?.id === messageObj.userId && m.user?.activityStatus) {
          m.user.activityStatus = messageObj.activityStatus;
        }
      });
      break;
    case 'user-typing':
      // Only process typing for this conversation
      if (messageObj.conversationId && messageObj.conversationId !== conversationId.value) return;

      typingUsers.value.add(messageObj.username);

      // Scroll typing indicator in the view
      await nextTick();
      if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
      break;
    case 'user-stopped-typing':
      typingUsers.value.delete(messageObj.username);
      break;
  }
};

onMounted(async () => {
  conversationsStore.getConversation(conversationId.value, user?.id);
  await getMessages();
  markMessagesAsRead();

  await nextTick();
  scrollToLastMessage();

  // Set up visualViewport listeners to handle iOS keyboard
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
  }

  if (!socket) return;

  // IMPORTANT: Register message handler BEFORE sending join message
  // This prevents race conditions where messages arrive before handler is set up
  removeHandler = addMessageHandler(handleWebSocketMessage);

  // Now send the join message
  socket.send(JSON.stringify({ type: 'join', conversationId: conversationId.value }));
});

onBeforeUnmount(() => {
  // Clean up the message handler properly
  if (removeHandler) {
    removeHandler();
    removeHandler = null;
  }

  if (socket) {
    socket.send(JSON.stringify({ type: 'left', conversationId: 0 }));
  }

  // Clean up visualViewport listeners
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleViewportChange);
    window.visualViewport.removeEventListener('scroll', handleViewportChange);
  }

  clearTimeout(typingTimeout);
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const { data } = await axios.post('/messages', {
      content: newMessage.value,
      senderId: user?.id,
      conversationId: conversationId.value,
    });

    // update state
    messages.value.push(data);

    if (socket) {
      socket.send(JSON.stringify({ type: 'message', ...data }));

      if (isTyping.value) {
        isTyping.value = false;
        socket.send(
          JSON.stringify({
            type: 'user-stopped-typing',
            conversationId: conversationId.value,
            username: user?.username,
          })
        );
        clearTimeout(typingTimeout);
      }
    }

    // reset input
    newMessage.value = '';

    playSentMessageSound();

    await nextTick();
    scrollToLastMessage();
  } catch (error) {
    console.error(error);
    useNuxtApp().$toast.error('Failed to send a message');
  }
};

const getMessages = async (cursor: number | null = null) => {
  const scrollHeightBefore = chatContainer.value?.scrollHeight || 0;
  const scrollTopBefore = chatContainer.value?.scrollTop || 0;

  try {
    const { data } = await axios.get('/messages', {
      params: {
        conversationId: conversationId.value,
        cursor,
      },
    });

    messages.value = [...data, ...messages.value];

    // Wait for the DOM to update
    await nextTick();

    // Maintain scroll position after loading older messages
    if (chatContainer.value && data.length > 0 && cursor) {
      const scrollHeightAfter = chatContainer.value.scrollHeight;
      chatContainer.value.scrollTop = scrollHeightAfter - scrollHeightBefore + scrollTopBefore;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const markMessagesAsRead = async () => {
  try {
    await messageReceiptService.markMessagesAsRead(conversationId.value, user?.id);
  } catch (error) {
    console.error(error);
  }
};

const scrollToLastMessage = () => {
  if (!chatContainer.value) return;

  // Scroll to bottom of the chat container
  chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

// function for scroll pagination
const onScroll = async () => {
  if (chatContainer.value && chatContainer.value.scrollTop === 0 && !loading.value) {
    await getMessages(messages.value[0]?.id);
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }

  if (!socket) return;

  if (!isTyping.value) {
    // User started typing
    isTyping.value = true;
    socket.send(
      JSON.stringify({
        type: 'user-typing',
        conversationId: conversationId.value,
        username: user?.username,
      })
    );
  }

  // Clear the previous timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Set a new timeout to detect when the user stops typing
  typingTimeout = setTimeout(() => {
    isTyping.value = false;
    socket.send(
      JSON.stringify({
        type: 'user-stopped-typing',
        conversationId: conversationId.value,
        username: user?.username,
      })
    );
  }, 2000);
};

const displayTime = (createdAt: Date) => {
  const now = new Date();

  const displayTime = isSameMinute(new Date(createdAt), now) ? 'now' : format(new Date(createdAt), 'HH:mm');

  return displayTime;
};

function isSameDay(date1: Date, date2: Date) {
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
}

const shouldDisplayDate = (index: number) => {
  if (messages.value.length === 0) return false;

  const currentMessageDate = new Date(messages.value[index].createdAt);
  const previousMessageDate = index > 0 ? new Date(messages.value[index - 1]?.createdAt) : null;

  if (index === 0) return true; // Always display date for the first message
  return !previousMessageDate || !isSameDay(currentMessageDate, previousMessageDate);
};
</script>

<template>
  <div ref="mainContainer" class="fixed inset-0 flex flex-col overflow-hidden overscroll-none">
    <div
      ref="headerRef"
      class="header-safe flex items-center justify-between shadow-md py-3 px-2 min-h-16 shrink-0 bg-white dark:bg-gray-800 z-50"
    >
      <div class="flex items-center gap-1">
        <NuxtLink to="/conversations">
          <UButton variant="ghost" size="md">
            <template #leading>
              <UIcon name="i-lets-icons-back-light" class="w-7 h-7"></UIcon>
            </template>
          </UButton>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <!-- loading -->
          <template v-if="loadingConversation">
            <div class="flex items-center space-x-4">
              <USkeleton class="h-12 w-12" :ui="{ rounded: 'rounded-full' }" />
              <div class="space-y-2">
                <USkeleton class="h-4 w-[100px]" />
                <USkeleton class="h-4 w-[80px]" />
              </div>
            </div>
          </template>
          <!-- content ready -->
          <template v-else>
            <UAvatar v-if="conversation?.isGroup" size="xl" :alt="conversationTitle" />
            <UAvatar
              v-else
              class="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              :chip-color="isUserOnline ? 'green' : 'gray'"
              chip-position="top-right"
              size="xl"
              :alt="conversationTitle"
            />
            <div>
              <h4 class="text-lg font-semibold">{{ conversationTitle }}</h4>
              <p v-if="conversation?.isGroup" class="text-sm text-gray-500">
                {{ onlineMembersCount }}/{{ conversation?.members?.length }} Online
              </p>
              <p v-else class="text-sm text-gray-500">{{ isUserOnline ? 'Online' : 'Offline' }}</p>
            </div>
          </template>
        </div>
      </div>

      <UButton v-if="conversation?.isGroup" variant="ghost" size="md" @click="isAsideExpanded = true">
        <template #leading>
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-7 h-7"></UIcon>
        </template>
      </UButton>
    </div>

    <div
      ref="chatContainer"
      class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-none px-2"
      @scroll="onScroll"
    >
      <!-- Inner container that pushes messages to bottom -->
      <div class="min-h-full flex flex-col justify-end py-4 space-y-2">
        <div v-if="!loading && messages?.length === 0" class="flex-1 flex items-center justify-center">
          <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-9 h-9 mr-3" />
          <h3 class="text-lg font-semibold">No Messages</h3>
        </div>

        <!-- loop over messages in conversation -->
        <template v-else v-for="(message, index) in messages">
          <!-- display messages dates -->
          <template v-if="shouldDisplayDate(index)">
            <UDivider
              v-if="isToday(message.createdAt)"
              label="Today"
              :ui="{ label: 'bg-gray-200 text-slate-800 py-1 px-2 rounded-lg' }"
            />
            <UDivider
              v-else-if="isYesterday(message.createdAt)"
              label="Yesterday"
              :ui="{ label: 'bg-gray-200 text-slate-800 py-1 px-2 rounded-lg' }"
            />
            <UDivider
              v-else
              :label="format(new Date(message.createdAt), 'EEEE, dd MMMM yyyy')"
              :ui="{ label: 'bg-gray-200 text-slate-800 py-1 px-2 rounded-lg' }"
            />
          </template>

          <!-- sent messages conversation cloud -->
          <div v-if="message.senderId === user?.id" class="flex justify-end">
            <div class="max-w-80 bg-primary text-white py-2 px-4 rounded-lg rounded-br-none break-words">
              <p>
                {{ message.content }}
              </p>
              <div v-if="!conversation?.isGroup" class="flex items-center justify-between gap-4 mt-2">
                <!-- Display message receipts only for direct conversations -->
                <UTooltip v-if="!message.receipts?.[0]?.readAt" text="Sent">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4"></UIcon>
                </UTooltip>
                <UTooltip v-else text="Read">
                  <UIcon name="i-heroicons-book-open" class="w-4 h-4"></UIcon>
                </UTooltip>

                <p class="text-slate-200 text-sm">{{ displayTime(message.createdAt) }}</p>
              </div>
              <p v-else class="text-slate-200 text-sm text-right mt-2">{{ displayTime(message.createdAt) }}</p>
            </div>
          </div>

          <!-- received messages conversation cloud -->
          <div v-else class="flex justify-start">
            <UAvatar v-if="conversation?.isGroup" :alt="message?.sender?.username" size="sm" class="mr-2" />
            <div class="max-w-80 bg-gray-200 dark:bg-gray-800 py-2 px-4 rounded-lg rounded-bl-none break-words">
              <p v-if="conversation?.isGroup" class="text-primary">
                {{ message?.sender?.username }}
              </p>
              <p>
                {{ message.content }}
              </p>
              <p class="text-slate-800 dark:text-slate-200 text-sm text-left mt-2">
                {{ displayTime(message.createdAt) }}
              </p>
            </div>
          </div>
        </template>
        <!-- Typing indicator -->
        <TypingIndicator v-if="typingUsers.size > 0" :typing-users="typingUsers" />
      </div>
    </div>

    <div ref="inputRef" class="input-safe shrink-0 px-2 py-2">
      <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2">
        <UTextarea
          ref="messageInput"
          v-model="newMessage"
          variant="none"
          placeholder="Message..."
          :padded="false"
          :rows="1"
          autoresize
          class="flex-1"
          :ui="{ base: 'max-h-28 overflow-y-auto resize-none text-base' }"
          @keydown="handleKeyDown"
        />
        <UButton size="sm" icon="i-iconamoon-send-thin" @click="sendMessage" class="shrink-0" />
      </div>
    </div>

    <ConversationsAside
      v-if="conversation?.isGroup && !loadingConversation"
      v-model="isAsideExpanded"
      @close-chat-aside="isAsideExpanded = false"
    />
  </div>
</template>

<style scoped>
/* Force 16px font size on textarea to prevent iOS zoom */
:deep(textarea) {
  font-size: 16px !important;
}

/* Safe area for iOS notch/status bar - max() ensures minimum padding on regular browsers */
.header-safe {
  padding-top: max(0.75rem, env(safe-area-inset-top, 0.75rem));
  will-change: transform;
}

/* Safe area for iOS home indicator */
.input-safe {
  will-change: transform;
}
</style>
