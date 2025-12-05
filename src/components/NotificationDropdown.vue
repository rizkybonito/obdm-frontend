<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import OverlayBadge from 'primevue/overlaybadge';

const props = defineProps({
    notifications: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['notification-click']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const unreadCount = computed(() => props.notifications.length);

function toggleDropdown() {
    isOpen.value = !isOpen.value;
}

function handleClickOutside(event) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
}

function handleNotificationClick(notification) {
    emit('notification-click', notification);
    isOpen.value = false;
}

function toDifTime(time) {
    const now = Date.now();
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInMinute = 1000 * 60;

    const namenodeDifTime = now - time;
    const nDay = Math.floor(namenodeDifTime / millisecondsInDay);
    const nHour = Math.floor((namenodeDifTime % millisecondsInDay) / millisecondsInHour);
    const nMinute = Math.floor((namenodeDifTime % millisecondsInHour) / millisecondsInMinute);
    let namenodeTime = '';
    if (nDay == 1) namenodeTime += 'about a day ';
    else if (nDay > 1 && nDay < 31) namenodeTime += nDay + ' days ';
    else if (nDay < 60 && nDay > 0) namenodeTime += 'about a month ';
    else if (nDay >= 60) namenodeTime += Math.round(nDay / 30) + ' months ';
    if (nHour > 0 && namenodeTime == '') namenodeTime += nHour + 'h ';
    if (nMinute > 0 && namenodeTime == '') namenodeTime += nMinute + 'm ';
    return namenodeTime + 'ago';
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="relative" ref="dropdownRef">
        <OverlayBadge :value="unreadCount" @click="toggleDropdown" class="mt-2" severity="danger" style="cursor: pointer">
            <i class="pi pi-bell mt-1" style="font-size: 18px; padding-top: 2px; cursor: pointer" />
        </OverlayBadge>

        <div v-if="isOpen" class="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 border border-gray-200">
            <div class="p-3 border-b font-semibold">Notifications</div>
            <ul class="max-h-80 overflow-y-auto divide-y">
                <li v-for="(notif, index) in props.notifications" :key="index" class="px-4 py-2 hover:bg-gray-100 cursor-pointer" @click="handleNotificationClick(notif)">
                    <div class="text-sm font-medium font-semibold">{{ notif.Alert.label }}</div>
                    <div class="text-sm font-medium mt-2">{{ notif.Alert.text.length < 71 ? notif.Alert.text : notif.Alert.text.slice(0, 70) + '...' }}</div>
                    <div class="text-sm font-medium mt-2" style="text-align: right">{{ toDifTime(notif.Alert?.original_timestamp) }}</div>
                </li>
            </ul>
            <div v-if="props.notifications.length === 0" class="p-4 text-center text-sm text-gray-500">-</div>
        </div>
    </div>
</template>