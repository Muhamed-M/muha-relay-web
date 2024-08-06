<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const schema = z.object({
  username: z.string().min(3, 'Must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
});

type Schema = z.output<typeof schema>;

definePageMeta({
  layout: 'public',
});

const state = reactive({
  username: '',
  email: '',
  password: '',
});

async function signUp(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data);
}
</script>

<template>
  <div>
    <img src="/images/muharelay-logo.svg" alt="logo" class="ms-auto me-auto mb-6" />

    <div class="p-5 border-2 rounded-md">
      <h2 class="mb-3 font-semibold text-xl">Sign Up</h2>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="signUp">
        <UFormGroup label="Username" name="username">
          <UInput v-model="state.username" placeholder="Your username" size="md" class="w-80" />
        </UFormGroup>

        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" placeholder="Your email" size="md" class="w-80" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" placeholder="Your password" size="md" class="w-80" />
        </UFormGroup>

        <UButton type="submit" block size="md"> Sign Up </UButton>
      </UForm>
    </div>

    <UDivider label="OR" class="my-4" />

    <UButton
      icon="i-mdi-google"
      size="md"
      color="primary"
      variant="solid"
      label="Sign Up With Google"
      block
      :trailing="false"
    />

    <div class="mt-5 text-center">
      <p>Already have an account?</p>
      <NuxtLink to="/auth/sign-in" class="text-blue-500">Sign In</NuxtLink>
    </div>
  </div>
</template>
