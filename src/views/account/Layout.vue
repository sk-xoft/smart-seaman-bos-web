<script setup>
import { useAuthStore } from '@/stores';
import { router } from '@/router';

// redirect home if already logged in
const authStore = useAuthStore();
if (authStore.user) {
    router.push('/');
}
</script>

<template>
    <div class="container mx-auto px-4">
        <div class="h-screen flex justify-center items-center">
            <router-view />
        </div>
    </div>
</template>
