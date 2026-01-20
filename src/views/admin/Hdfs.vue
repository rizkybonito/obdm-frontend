<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useAuthStore } from '@/stores/authStore';

import SummaryTab from './hdfs/SummaryTab.vue';
import Metrics from './hdfs/Metric.vue';
import Instances from './hdfs/Instances.vue';
import Configurations from './hdfs/Configurations.vue';
import { formatUptime } from '@/utils/formatters';

const authStore = useAuthStore();
const router = useRouter();

const menu = ref(null);
const formattedLinks = ref([]); 
const loading = ref(false);
const activeTab = ref('summary');

const diskUsage = ref([]);
const hdfsUsage = ref(null);
const nameNodeHeap = ref(null);
const dataNodes = ref(0);
const liveDataNodes = ref(0);
const namenodeRpc = ref(0);
const namenodeCpuWio = ref(0);
const namenodeTime = ref('');

const toggleMenu = (event) => {
    menu.value.toggle(event);
};

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/quicklink', {
            params: { service: 'HDFS' }
        });
        
        const rawLinks = response.data.items[0].QuickLinkInfo.quicklink_data.QuickLinksConfiguration.configuration.links;
        formattedLinks.value = rawLinks.map(link => ({
            label: link.label,
            icon: 'pi pi-external-link',
            command: () => {
                window.open(link.url, '_blank');
            }
        }));
        
    } catch (error) {
        if (error.response?.status === 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
    } finally {
        loading.value = false;
    }
};

const fetchServiceInfo = async () => {
    try {
        const response = await axiosInstancesPython.get('/service-info');
        let temp = response.data.items.filter((item) => 
            item.ServiceComponentInfo.service_name == 'HDFS' && 
            item.ServiceComponentInfo.component_name == 'NAMENODE'
        );

        let tempHeap1 = temp[0]?.host_components[0]?.metrics?.jvm ? ((temp[0].host_components[0].metrics.jvm.HeapMemoryUsed / temp[0].host_components[0].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0;
        let tempHeap2 = temp[0]?.host_components[1]?.metrics?.jvm ? ((temp[0].host_components[1].metrics.jvm.HeapMemoryUsed / temp[0].host_components[1].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0;
        nameNodeHeap.value = tempHeap1 != 0 ? tempHeap1 : tempHeap2;

        if (temp[0]?.host_components[0]?.metrics?.dfs) {
            const dfs = temp[0].host_components[0].metrics.dfs.FSNamesystem;
            const used = ((dfs.CapacityTotalGB - dfs.CapacityRemainingGB) / dfs.CapacityTotalGB * 100).toFixed(0);
            hdfsUsage.value = used;
            diskUsage.value = [used, (100 - used)];
            
            let liveNodes = JSON.parse(temp[0].host_components[0].metrics.dfs.namenode.LiveNodes);
            let arrLiveNodes = Object.values(liveNodes);
            dataNodes.value = arrLiveNodes.length;
            liveDataNodes.value = arrLiveNodes.filter(n => n.adminState === "In Service").length;
        }

        const hostComp = (temp[0].host_components[1]?.metrics) || (temp[0].host_components[0]?.metrics);
        namenodeCpuWio.value = hostComp?.cpu?.cpu_wio ?? 0;
        namenodeRpc.value = temp[0].host_components[0].metrics?.rpc ? (temp[0].host_components[0].metrics.rpc.client.RpcQueueTime_avg_time).toFixed(2) : 0;
        const now = Date.now();
        namenodeTime.value = formatUptime(temp[0].host_components[0].metrics?.runtime?.StartTime)|| n

    } catch (error) {
        console.error("Error fetching metrics:", error);
    }
};

onMounted(() => {
    fetchData();
    fetchServiceInfo();
});
</script>

<template>
    <div>
        <div class="flex items-center mb-6 border-b border-gray-200">
            <button @click="activeTab = 'summary'" :class="['tab-btn', activeTab === 'summary' ? 'active' : '']">
                Status
            </button>
            <button @click="activeTab = 'instances'" :class="['tab-btn', activeTab === 'instances' ? 'active' : '']">
                Instances
            </button>
            <button @click="activeTab = 'configurations'" :class="['tab-btn', activeTab === 'configurations' ? 'active' : '']">
                Configuration
            </button>
            <button @click="activeTab = 'metrics'" :class="['tab-btn', activeTab === 'metrics' ? 'active' : '']">
                Metrics
            </button>
            
            <button 
                type="button" 
                class="tab-btn flex items-center gap-2"
                @click="toggleMenu" 
                aria-haspopup="true" 
                aria-controls="overlay_menu"
            >
                Quick Links
            </button>
            <Menu ref="menu" id="overlay_menu" :model="formattedLinks" :popup="true" />
        </div>

        <div class="tab-container">
            <SummaryTab v-if="activeTab === 'summary'" />
            <Instances v-if="activeTab === 'instances'" />
            <Configurations v-if="activeTab === 'configurations'" />

            <div v-if="activeTab === 'metrics'">
                <Metrics
                    :diskUsage="diskUsage" 
                    :hdfsUsage="hdfsUsage" 
                    :nameNodeHeap="nameNodeHeap" 
                    :dataNodes="dataNodes" 
                    :liveDataNodes="liveDataNodes" 
                    :namenodeRpc="namenodeRpc" 
                    :namenodeCpuWio="namenodeCpuWio"
                    :namenodeTime="namenodeTime" 
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 600;
    color: #6c757d;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    outline: none;

    &.active {
        color: #1BA9E1;
        border-bottom: 2px solid #1BA9E1;
    }
    
    &:hover {
        background: #f8f9fa;
        color: #333;
    }
}
</style>