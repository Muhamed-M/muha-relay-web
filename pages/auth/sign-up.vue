<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);

const schema = z.object({
  firstName: z.string().min(3, 'Must be at least 3 characters'),
  lastName: z.string(),
  username: z.string().min(3, 'Must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z
    .string()
    .optional()
    .refine((data) => data === state.password, {
      message: 'Passwords do not match',
    }),
});

type Schema = z.output<typeof schema>;

definePageMeta({
  layout: 'public',
});

const state = reactive({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

async function signUp(event: FormSubmitEvent<Schema>) {
  try {
    delete event.data.confirmPassword;
    await authStore.signUp(event.data);
    await navigateTo('/auth/sign-in');
  } catch (error: any) {
    useNuxtApp().$toast.error(error.message);
    console.error(error);
  }
}
</script>

<template>
  <div>
    <img src="/images/muharelay-logo.svg" alt="logo" class="ms-auto me-auto my-6" />

    <div class="p-5 border-2 rounded-md">
      <h2 class="mb-3 font-semibold text-xl">Sign Up</h2>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="signUp">
        <UFormGroup label="First Name" name="firstName" required>
          <UInput v-model="state.firstName" placeholder="Your first name" size="xl" class="w-80" />
        </UFormGroup>

        <!-- <UFormGroup label="Last Name" name="firstName">
          <UInput v-model="state.lastName" placeholder="Your last name" size="xl" class="w-80" />
        </UFormGroup> -->

        <UFormGroup label="Username" name="username" required>
          <UInput v-model="state.username" placeholder="Your username" size="xl" class="w-80" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput v-model="state.email" placeholder="Your email" size="xl" class="w-80" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" required>
          <UInput v-model="state.password" type="password" placeholder="Your password" size="xl" class="w-80" />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirmPassword" required>
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Confirm password"
            size="xl"
            class="w-80"
          />
        </UFormGroup>

        <UButton type="submit" block size="md" :loading="loading"> Sign Up </UButton>
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
