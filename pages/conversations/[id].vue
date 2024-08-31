<script setup lang="ts">
import { format, isSameMinute } from 'date-fns';
import socket from '~/utils/websocket';
const route = useRoute();
const authStore = useAuthStore();
const conversationId = ref(route.params.id);
const user = authStore?.user;

definePageMeta({
  layout: 'blank',
});

const chatContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const conversation: any = ref();
const newMessage = ref('');

const conversationTitle = computed(() => {
  if (conversation.value?.name) {
    return conversation.value.name;
  }

  if (conversation.value?.members?.length === 2) {
    const otherMember = conversation.value.members.find((member: any) => member.user.id !== user?.id);
    return otherMember?.user?.username || 'Unknown';
  }

  return 'Unknown Conversation';
});

onMounted(async () => {
  await getMessages();

  setTimeout(() => {
    scrollToLastMessage();
  }, 50);

  if (!socket) return;

  socket.onmessage = async ({ data }) => {
    const messageObj = JSON.parse(data);
    // update state
    conversation.value.messages.push({
      id: messageObj.id,
      content: messageObj.content,
      createdAt: messageObj.createdAt,
      senderId: messageObj.senderId,
    });

    // scroll to last message
    await nextTick();
    scrollToLastMessage();
  };
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const { data } = await axios.post('/messages', {
      content: newMessage.value,
      senderId: user?.id,
      conversationId: conversation.value.id,
    });

    // update state
    conversation.value.messages.push({
      id: data.id,
      content: data.content,
      createdAt: data.createdAt,
      senderId: data.senderId,
    });

    if (socket) socket.send(JSON.stringify(data));

    // reset input
    newMessage.value = '';

    await nextTick();
    scrollToLastMessage();
  } catch (error) {
    console.error(error);
    useNuxtApp().$toast.error('Failed to send a message');
  }
};

const getMessages = async () => {
  try {
    const { data } = await axios.get(`/conversations/${conversationId.value}`, {
      params: {
        userId: user?.id,
      },
    });

    conversation.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const scrollToLastMessage = () => {
  if (!chatContainer.value) return;

  const lastMessage = chatContainer.value.lastElementChild;
  lastMessage?.scrollIntoView({ behavior: 'smooth' });
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const displayTime = (createdAt: string) => {
  const now = new Date();

  const displayTime = isSameMinute(new Date(createdAt), now) ? 'now' : format(new Date(createdAt), 'HH:mm');

  return displayTime;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="flex shadow-md py-3 mb-3 sticky top-0 z-20 bg-white">
      <NuxtLink to="/conversations">
        <UButton variant="ghost" size="md" class="mr-4">
          <template #leading>
            <UIcon name="i-lets-icons-back-light" class="w-7 h-7"></UIcon>
          </template>
        </UButton>
      </NuxtLink>

      <div>
        <h4 class="text-lg font-semibold">{{ conversationTitle }}</h4>
        <p class="text-sm text-gray-500">Online</p>
      </div>
    </div>

    <div ref="chatContainer" class="mb-32 p-2">
      <div v-if="!loading && conversation?.messages.length === 0" class="flex items-center justify-center mt-40">
        <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-9 h-9 mr-3" />
        <h3 class="text-lg font-semibold">No Messages</h3>
      </div>

      <!-- loop over messages in conversation -->
      <template v-else v-for="message in conversation?.messages">
        <!-- sent messages conversation cloud -->
        <div v-if="message.senderId === user?.id" class="flex justify-end mb-3">
          <div class="max-w-80 bg-primary text-white py-2 px-4 rounded-lg rounded-br-none">
            <p>
              {{ message.content }}
            </p>
            <p class="text-slate-200 text-sm text-right mt-2">{{ displayTime(message.createdAt) }}</p>
          </div>
        </div>

        <!-- received messages conversation cloud -->
        <div v-else class="flex justify-start mb-3">
          <div class="max-w-80 bg-gray-200 py-2 px-4 rounded-lg rounded-bl-none">
            <p>
              {{ message.content }}
            </p>
            <p class="text-slate-800 text-sm text-left mt-2">{{ displayTime(message.createdAt) }}</p>
          </div>
        </div>
      </template>
    </div>

    <div class="w-full fixed bottom-0 bg-white pb-2 px-2">
      <div class="w-full bg-gray-200 rounded-lg px-4 py-4">
        <UTextarea
          v-model="newMessage"
          variant="none"
          placeholder="Message..."
          :padded="false"
          class="mb-1"
          @keydown="handleKeyDown"
        />

        <div class="flex justify-between items-center">
          <div>
            <UIcon name="i-iconamoon-attachment-thin" class="w-6 h-6 mr-3"></UIcon>
            <UIcon name="i-ph-microphone-thin" class="w-6 h-6"></UIcon>
          </div>
          <UButton size="md" label="Send" @click="sendMessage">
            <template #trailing>
              <UIcon name="i-iconamoon-send-thin" class="w-5 h-5"></UIcon>
            </template>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
