<script setup lang="ts">
const route = useRoute();
const conversationId = ref(route.params.id);

definePageMeta({
  layout: 'blank',
});

const user = {
  id: 1,
  name: 'sam',
  image: 'https://avatars.githubusercontent.com/u/739984?v=4',
};

const conversation = ref({
  id: 1,
  image: 'https://avatars.githubusercontent.com/u/739984?v=4',
  name: 'John Doe',
  messages: [
    {
      id: 1,
      content: 'Hello, how are you?',
      createdAt: '2023-09-01T10:00:00Z',
      userId: 1,
    },
    {
      id: 2,
      content: 'I am good, thank you!',
      createdAt: '2023-09-01T10:05:00Z',
      userId: 2,
    },
    {
      id: 3,
      content: 'What are you doing?',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 2,
    },
    {
      id: 4,
      content: 'Wasting my life',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
    {
      id: 5,
      content: 'Haha',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 2,
    },
    {
      id: 6,
      content: 'I am going to sleep',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
    {
      id: 7,
      content: 'Good night',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 2,
    },
    {
      id: 8,
      content: 'Good night',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
    {
      id: 9,
      content:
        'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 2,
    },
    {
      id: 10,
      content: 'ma jedi ti govna nemoj sovat mrve',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
    {
      id: 11,
      content: 'ne moras svako jutro te edamer te livada sir... Ispeci jaje jebo ti sebi mater, i narezi salate',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
    {
      id: 12,
      content: 'ne moras svako jutro te edamer te livada sir... Ispeci jaje jebo ti sebi mater, i narezi salate',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
    {
      id: 13,
      content: 'ne moras svako jutro te edamer te livada sir... Ispeci jaje jebo ti sebi mater, i narezi salate ads',
      createdAt: '2023-09-01T10:10:00Z',
      userId: 1,
    },
  ],
});

const chatContainer = ref(null);
const newMessage = ref('');

onMounted(() => {
  setTimeout(() => {
    scrollToLastMessage();
  }, 100);
});

const sendMessage = async () => {
  conversation.value.messages.push({
    id: conversation.value.messages.length + 1,
    content: newMessage.value,
    createdAt: new Date().toISOString(),
    userId: user.id,
  });

  newMessage.value = '';

  await nextTick();
  scrollToLastMessage();
};

const scrollToLastMessage = () => {
  const lastMessage = chatContainer.value.lastElementChild;
  lastMessage.scrollIntoView({ behavior: 'smooth' });
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
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
        <h4 class="text-lg font-semibold">{{ conversation.name }}</h4>
        <p class="text-sm text-gray-500">Online</p>
      </div>
    </div>

    <div ref="chatContainer" class="mb-32 p-2">
      <template v-for="message in conversation.messages">
        <div v-if="message.userId === user.id" class="flex justify-end mb-3">
          <span class="max-w-80 bg-primary text-white p-3 rounded-lg">
            {{ message.content }}
          </span>
        </div>
        <div v-else class="flex justify-start mb-3">
          <span class="max-w-80 bg-gray-200 p-3 rounded-lg">
            {{ message.content }}
          </span>
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
