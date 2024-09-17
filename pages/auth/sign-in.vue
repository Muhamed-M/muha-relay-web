<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);

const schema = z.object({
  identifier: z.string().min(3, 'Must be at least 3 characters'),
  password: z.string().min(8, 'Must be at least 8 characters'),
});

type Schema = z.output<typeof schema>;

definePageMeta({
  layout: 'public',
});

const state = reactive({
  identifier: '',
  password: '',
});

async function signIn(event: FormSubmitEvent<Schema>) {
  try {
    await authStore.signIn(event.data, true);
    await navigateTo('/conversations');
  } catch (error: any) {
    useNuxtApp().$toast.error(error.message);
    console.error(error);
  }
}
</script>

<template>
  <div>
    <img src="/images/muharelay-logo.svg" alt="logo" class="ms-auto me-auto mb-6" />

    <div class="p-5 border-2 rounded-md">
      <h2 class="mb-3 font-semibold text-xl">Sign In</h2>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="signIn">
        <UFormGroup label="Username/Email" name="identifier">
          <UInput v-model="state.identifier" placeholder="Your username/email" size="xl" class="w-80" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="Your password" size="xl" class="w-80" />
        </UFormGroup>

        <UButton type="submit" block size="md" :loading="loading"> Sign In </UButton>
      </UForm>
      <p class="text-center mt-3">Forgot password?</p>
    </div>

    <UDivider label="OR" class="my-4" />

    <UButton
      icon="i-mdi-google"
      size="md"
      color="primary"
      variant="solid"
      label="Sign In With Google"
      block
      :trailing="false"
    />

    <div class="mt-5 text-center">
      <p>Don't have an account?</p>
      <NuxtLink to="/auth/sign-up" class="text-blue-500">Sign Up</NuxtLink>
    </div>
  </div>
</template>
