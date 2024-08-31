<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import ConversationService from '~/services/conversationService';

const emit = defineEmits(['close']);

const groupSchema = z.object({
  name: z.string().min(4, 'Must be at least 4 characters').max(30, 'Must be at most 30 characters'),
  users: z
    .array(z.object({ id: z.number(), label: z.string(), suffix: z.string() }))
    .nonempty('Must select at least one user'),
});

type Schema = z.output<typeof groupSchema>;

const items = [
  {
    key: 'group',
    label: 'Groups',
    description: 'Create a new group chat.',
  },
  {
    key: 'chat',
    label: 'Direct Chat',
    description: 'Start a new direct chat.',
  },
];

const groupFormRef = ref();
const groupForm = reactive({ name: '', users: [] });
const chatForm = reactive({ user: null as any });

const createGroupConversation = async (form: FormSubmitEvent<Schema>) => {
  const usersIds = form.data.users.map((user) => user.id);

  const groupPayload = {
    name: form.data.name,
    isGroup: true,
    usersIds,
  };

  try {
    const result = await ConversationService.createConversation(groupPayload);

    emit('close');
    navigateTo(`/conversations/${result.data.id}`);

    useNuxtApp().$toast.success(result.message);
  } catch (error: any) {
    console.error(error);
    useNuxtApp().$toast.error(error.message);
  }
};

const createConversation = async () => {
  if (!chatForm.user) {
    return useNuxtApp().$toast.error('Please select a user to start a chat.');
  }

  const conversationPayload = {
    name: '',
    isGroup: false,
    usersIds: [chatForm.user.id],
  };

  try {
    const result = await ConversationService.createConversation(conversationPayload);

    emit('close');
    navigateTo(`/conversations/${result.data.id}`);

    useNuxtApp().$toast.success(result.message);
  } catch (error: any) {
    console.error(error);
    useNuxtApp().$toast.error(error.message);
  }
};
</script>

<template>
  <UModal>
    <UTabs :items="items" class="w-full p-2">
      <template #item="{ item }">
        <UCard>
          <template #header>
            <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ item.label }}
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ item.description }}
            </p>
          </template>

          <div v-if="item.key === 'group'">
            <UForm
              ref="groupFormRef"
              :state="groupForm"
              :schema="groupSchema"
              class="space-y-4"
              @submit="createGroupConversation"
            >
              <UFormGroup name="name">
                <UInput v-model="groupForm.name" type="text" placeholder="Group Name"></UInput>
              </UFormGroup>

              <UFormGroup name="users">
                <FindUsers v-model="groupForm.users" multiple />
              </UFormGroup>
            </UForm>
          </div>
          <div v-else-if="item.key === 'chat'" class="space-y-3">
            <FindUsers v-model="chatForm.user" />
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton variant="outline" color="black" class="mr-4" @click="emit('close')">Cancel</UButton>

              <UButton color="black" @click="item.key === 'group' ? groupFormRef.submit() : createConversation()">
                Create {{ item.key === 'group' ? 'Group' : 'Chat' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UTabs>
  </UModal>
</template>
