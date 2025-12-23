<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useAuthStore } from '@/stores/authStore';
import SummaryTab from './hdfs/SummaryTab.vue';
import QuickLinksTab from './hdfs/QuickLinksTab.vue';
import Metrics from './hdfs/Metric.vue';

const authStore = useAuthStore();
const router = useRouter();
const links = ref([]);
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

const fetchServiceInfo = async () => {
    try {
        const response = await axiosInstancesPython.get('/service-info');
        let temp = response.data.items.filter((item) => item.ServiceComponentInfo.service_name == 'HDFS' && item.ServiceComponentInfo.component_name == 'NAMENODE');
        let tempNameNodeHeap1 = temp[0]?.host_components[0]?.metrics?.jvm ? ((temp[0].host_components[0].metrics.jvm.HeapMemoryUsed / temp[0].host_components[0].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        let tempNameNodeHeap2 = temp[0]?.host_components[1]?.metrics?.jvm ? ((temp[0].host_components[1].metrics.jvm.HeapMemoryUsed / temp[0].host_components[1].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        nameNodeHeap.value = tempNameNodeHeap1 != 0.00 ? tempNameNodeHeap1 : tempNameNodeHeap2;        
        
        diskUsage.value.push(temp[0].host_components[0]?.metrics?.dfs ? (temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB - temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityRemainingGB) / temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB * 100 : 0);
        hdfsUsage.value = temp[0].host_components[0]?.metrics?.dfs ? ((temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB - temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityRemainingGB) / temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB * 100).toFixed() : 0;
        diskUsage.value.push(temp[0].host_components[0]?.metrics?.dfs ? temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityRemainingGB / temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB * 100 : 0);
        if (temp[0].host_components[0].metrics?.dfs) {
            let strLiveNodes = temp[0].host_components[0].metrics.dfs.namenode.LiveNodes;
            let tempLiveNodes = JSON.parse(strLiveNodes)
            let arrLiveNodes = Object.values(tempLiveNodes)
            let tempLive = arrLiveNodes.filter(live => live.adminState == "In Service");
            dataNodes.value = arrLiveNodes.length
            liveDataNodes.value = tempLive.length
        }
        else {
            dataNodes.value = 0
            liveDataNodes.value = 0
        }
        const hostComponent = (temp[0].host_components[1] && temp[0].host_components[1].metrics) ||
            (temp[0].host_components[0] && temp[0].host_components[0].metrics);

        const namenodeCpuWioValue = hostComponent?.cpu?.cpu_wio ?? 0;

        namenodeCpuWio.value = namenodeCpuWioValue;
        namenodeRpc.value = temp[0].host_components[0].metrics?.rpc ? (temp[0].host_components[0].metrics.rpc.client.RpcQueueTime_avg_time).toFixed(2) : 0;
        const now = Date.now();        

        const waktuNameNode = temp[0].host_components[0].metrics?.runtime ? temp[0].host_components[0].metrics.runtime.StartTime : now
        const namenodeDifTime = now - waktuNameNode;
        const nDay = Math.floor(namenodeDifTime / millisecondsInDay);
        const nHour = Math.floor((namenodeDifTime % millisecondsInDay) / millisecondsInHour);
        const nMinute = Math.floor((namenodeDifTime % millisecondsInHour) / millisecondsInMinute);
        namenodeTime.value = ''
        if (nDay > 0)
            namenodeTime.value += nDay + 'd '
        if (nHour > 0)
            namenodeTime.value += nHour + 'h '
        if (nMinute > 0)
            namenodeTime.value += nMinute + 'm '
        namenodeTime.value = namenodeTime.value || 'n/a'
        setDiskUsageChartOptions(diskUsage.value);
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

function setDiskUsageChartOptions(data) {
    const labels = ['Used', 'Remaining'];
    const values = data;

    diskUsageChartData.value = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: ['#FF6384', '#DDDDDD']
            }
        ]
    };
}

onMounted(() => {
    fetchData();
    fetchServiceInfo();
});
</script>

<template>
    <div class="p-4">
        <div class="flex gap-2 mb-4 ">
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
                @click="activeTab = 'metrics'"
                :class="['tab-btn', activeTab === 'metrics' ? 'active' : '']"
            >
                Metrics
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
            <Metrics
                v-if="activeTab === 'metrics'"
                :diskUsage="diskUsage" 
                :hdfsUsage="hdfsUsage" 
                :nameNodeHeap="nameNodeHeap" 
                :dataNodes="dataNodes" 
                :liveDataNodes="liveDataNodes" 
                :namenodeRpc="namenodeRpc" 
                :namenodeCpuWio="namenodeCpuWio"
                :namenodeTime="namenodeTime" 
            />            
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