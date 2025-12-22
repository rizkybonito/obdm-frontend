<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useAuthStore } from '@/stores/authStore';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { useLoading } from '@/composables/useLoading';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const { startLoading, stopLoading } = useLoading();

const email = ref('');
// const invalid = ref(false);
const password = ref('');
const message = ref('');
const messageType = ref('');
const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
    if(authStore.token){
        router.push('/dashboard')
    }
});

const handleLogin = async () => {
    startLoading();
    try {
        const response = await axiosInstancesPython.post('/login', {
            username: email.value,
            password: password.value
        });
        if (response.data.token) {
            authStore.setToken(response.data.token);
            authStore.setClusterName(response.data.cluster_name);
            authStore.setUser(response.data.username);
            await router.push('/dashboard');
        } else {
            message.value = response.data ? response.data.message : "Terjadi kesalahan yang tidak terduga. Silahkan hubungin admin.";
            messageType.value = 'error';
        }
        stopLoading();
    } catch (e) {
        message.value = e.response.data ? e.response.data.message : "Terjadi kesalahan yang tidak terduga. Silahkan hubungin admin.";
        messageType.value = 'error';
        toast.add({ severity: 'warn', summary: 'Login Gagal', detail: "Terjadi kesalahan yang tidak terduga. Silahkan hubungin admin.", life: 3000 });
        stopLoading();
    }
    finally{
        stopLoading();
        message.value = "Terjadi kesalahan yang tidak terduga. Silahkan hubungin admin.";
            messageType.value = 'error';
    }
};

</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 40px">
                <div class="text-center mb-8">
                    <img alt="logo" src="/demo/images/ONYX-logo.png" style="width: 20rem; margin-left: 70px" />
                </div>
                <ResponseMessage v-if="message" :message="message" :type="messageType" />
                <div>
                    <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Username</label>
                    <InputText id="email1" type="text" placeholder="Username" class="w-full md:w-[30rem] mb-8" v-model="email" />

                    <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                    <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                    <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                        <router-link to="/forgot" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Lupa sandi?</router-link>
                    </div>
                    <Button label="Sign In" class="w-full" severity="info" @click="handleLogin"></Button>
                </div>
                <Loading />
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
