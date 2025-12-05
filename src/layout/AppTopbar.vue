<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import NotificationDropdown from '@/components/NotificationDropdown.vue';
import axiosInstancesPython from '@/axiosInstancesPython';
const authStore = useAuthStore();
const router = useRouter();
const productDialog = ref(false);
const nama = ref(null);
const username = ref(null);
const pwd = ref(null);
const password_confirmation = ref(null);
const alert = ref([]);

const fetchAlerts = async () => {
    try {
        const response = await axiosInstancesPython.get('/alert-topbar');
        alert.value = response.data.items;
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

async function handleItemClick() {
    router.push('/alerts');
}

const handleLogout = async () => {
    authStore.clearToken();
    router.push('/auth/login');
};

function openNew() {
    pwd.value = '';
    password_confirmation.value = '';
    productDialog.value = true;
}

function closeDialog() {
    productDialog.value = false;
}

onMounted(() => {
    fetchAlerts();
});

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/dashboard" class="layout-topbar-logo" style="color: #0868cf"><img alt="logo" src="/demo/images/ONYX-logo.png" style="height: 60px; margin-left: 20px" /></router-link>
        </div>

        <div class="layout-topbar-actions">
            <NotificationDropdown :notifications="alert" @notification-click="handleItemClick" />
            <div class="layout-config-menu">
                <button type="button" class="mt-1 layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>
            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>
            <!-- <Menubar style="border: none; padding: 0px" :model="items" /> -->

            <div class="mt-1 layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <a href="#" @click="openNew" class="mt-2">{{ authStore.user }}</a>
                    <button type="button" class="layout-topbar-action" @click="handleLogout">
                        <i class="pi pi-sign-out"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="productDialog" :style="{ width: '30%' }" header="User Profile" :modal="true">
        <div class="flex flex-col gap-6">
            <div class="flex flex-col md:flex-row gap-4 mb-2">
                <div class="font-semibold text-x3 mt-2 mr-2" style="width: 30%">Nama</div>
                <InputText v-model="nama" style="width: 70%" :disabled="true" />
            </div>
            <div class="flex flex-col md:flex-row gap-4 mb-2">
                <div class="font-semibold text-x3 mt-2 mr-2" style="width: 30%">Username</div>
                <InputText v-model="username" style="width: 70%" :disabled="true" />
            </div>
            <div class="flex flex-col md:flex-row gap-4 mb-2">
                <div class="font-semibold text-x3 mt-2 mr-2" style="width: 30%">Password</div>
                <Password v-model="pwd" :toggleMask="true" fluid style="width: 70%" />
            </div>
            <div class="flex flex-col md:flex-row gap-4 mb-2">
                <div class="font-semibold text-x3 mt-2 mr-2" style="width: 30%">Ulangi Password</div>
                <Password v-model="password_confirmation" :toggleMask="true" fluid style="width: 70%" />
            </div>
        </div>

        <template #footer>
            <Button label="Batal" @click="closeDialog" severity="danger" />
            <Button label="Simpan" @click="handleSimpan()" severity="info" />
        </template>
    </Dialog>
</template>
<style>
.p-menubar-item-icon {
    /* color: var(--p-menubar-item-icon-color); */
    color: red !important;
}
.p-menubar-item-label {
    color: red;
}
.p-menubar-submenu {
    display: none;
    position: absolute;
    min-width: 12.5rem;
    z-index: 1;
    background: var(--p-menubar-submenu-background);
    border: 1px solid var(--p-menubar-submenu-border-color);
    border-radius: var(--p-menubar-border-radius);
    box-shadow: var(--p-menubar-submenu-shadow);
    color: var(--p-menubar-submenu-color);
    flex-direction: column;
    padding: var(--p-menubar-submenu-padding);
    gap: var(--p-menubar-submenu-gap);
    max-height: 500px; /* Adjust to the height you want */
    overflow-y: auto; /* Enable vertical scrolling when content exceeds max-height */
}
</style>