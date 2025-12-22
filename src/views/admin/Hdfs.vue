<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useAuthStore } from '@/stores/authStore';
import SummaryTab from './hdfs/SummaryTab.vue';
import QuickLinksTab from './hdfs/QuickLinksTab.vue';

const authStore = useAuthStore();
const router = useRouter();
const links = ref([]);
const loading = ref(false);
const activeTab = ref('summary');

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/quicklink', {
            params: { service: 'HDFS' }
        });
        links.value = response.data.items[0].QuickLinkInfo.quicklink_data.QuickLinksConfiguration.configuration.links;
    } catch (error) {
        if (error.response?.status === 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="p-4">
        <div class="flex gap-2 mb-4 border-b border-gray-200">
            <button 
                @click="activeTab = 'summary'"
                :class="['tab-btn', activeTab === 'summary' ? 'active' : '']"
            >
                Status
            </button>
            <button 
                @click="activeTab = 'instance'"
                :class="['tab-btn', activeTab === 'instance' ? 'active' : '']"
            >
                Instances
            </button>
            <button 
                @click="activeTab = 'configuration'"
                :class="['tab-btn', activeTab === 'configuration' ? 'active' : '']"
            >
                Configuration
            </button>
            <button 
                @click="activeTab = 'links'"
                :class="['tab-btn', activeTab === 'links' ? 'active' : '']"
            >
                Quick Links
            </button>
        </div>

        <div class="tab-container">
            <SummaryTab v-if="activeTab === 'summary'" />
            
            <QuickLinksTab 
                v-if="activeTab === 'links'" 
                :links="links" 
                :loading="loading" 
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-btn {
    padding: 0.5rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 600;
    color: #6c757d;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &.active {
        color: #1BA9E1;
        border-bottom: 2px solid #1BA9E1;
    }
    
    &:hover:not(.active) {
        background: #f8f9fa;
    }
}
</style>