<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch, nextTick } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';
import { useRouter } from 'vue-router';
import { Table } from 'ckeditor5';

const router = useRouter();

const authStore = useAuthStore();
const utilStore = useUtilStore();
const { getPrimary, getSurface, isDarkTheme } = useLayout();

const statusView = ref('Metrics');
const menu = ref([]);
const memory = ref([]);
const network = ref([]);
const cpu = ref([]);
const load = ref([]);
const diskUsage = ref([]);
const hdfsUsage = ref(null);
const hdfsMasterHeap = ref(null);
const nameNodeHeap = ref(null);
const resourceManagerHeap = ref(null);
const hbaseAveLoad = ref(null);
const dataNodes = ref(0);
const liveDataNodes = ref(0);
const namenodeRpc = ref(0);
const namenodeCpuWio = ref(0);
const hbaseTime = ref('');
const namenodeTime = ref('');
const yarnTime = ref('');
const selectedMetric = ref('');
const bgHeat = ref('red');

const lineChartData = ref(null);
const networkChartData = ref(null);
const cpuChartData = ref(null);
const loadChartData = ref(null);
const diskUsageChartData = ref(null);
const chartOptions = ref(null);
const chartOptionsDonut = ref(null);

const selectedTime = ref(1);
const times = ref([
    { name: 'Last 1 hour', code: 1 },
    { name: 'Last 2 hours', code: 2 },
    { name: 'Last 4 hours', code: 4 },
    { name: 'Last 12 hours', code: 12 },
    { name: 'Last 24 hours', code: 24 },
    { name: 'Last 7 days', code: 168 },
    { name: 'Last 30 days', code: 720 },
    { name: 'Last 1 year', code: 8760 }
]);


const configHistory = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const hosts = ref([]);
const racks = ref([]);

onMounted(() => {
    fetchHosts();
    chartOptions.value = setChartOptions();
    chartOptionsDonut.value = setChartOptionsDonut();
    fetchServiceInfo();
    fetchMemory();
    fetchNetwork();
    fetchCpu();
    fetchLoad();
    fetchMenu();
    fetchConfigHistory();
});

const fetchHosts = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/hosts-dashboard');
        hosts.value = response.data.items;
        hosts.value.sort((a, b) => a.Hosts.rack_info.localeCompare(b.Hosts.rack_info))
        hosts.value.forEach((e, i) => {
            if (i == 0 || hosts.value[i - 1].Hosts.rack_info != e.Hosts.rack_info)
                racks.value.push(e.Hosts.rack_info)
        })
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const fetchMenu = async () => {
    try {
        const response = await axiosInstancesPython.get('/menu');
        let temp = response.data.items;
        utilStore.setMenu(temp);
        menu.value = temp.filter(item => item.components[0].StackServiceComponents.is_master == true)
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchServiceInfo = async () => {
    try {
        const response = await axiosInstancesPython.get('/service-info');
        let temp = response.data.items.filter((item) => item.ServiceComponentInfo.service_name == 'HDFS' && item.ServiceComponentInfo.component_name == 'NAMENODE');
        let tempNameNodeHeap1 = temp[0]?.host_components[0]?.metrics?.jvm ? ((temp[0].host_components[0].metrics.jvm.HeapMemoryUsed / temp[0].host_components[0].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        let tempNameNodeHeap2 = temp[0]?.host_components[1]?.metrics?.jvm ? ((temp[0].host_components[1].metrics.jvm.HeapMemoryUsed / temp[0].host_components[1].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        nameNodeHeap.value = tempNameNodeHeap1 != 0.00 ? tempNameNodeHeap1 : tempNameNodeHeap2;
        let tempRM = response.data.items.filter((item) => item.ServiceComponentInfo.service_name == 'YARN' && item.ServiceComponentInfo.component_name == 'RESOURCEMANAGER');
        let tempRMHeap1 = tempRM[0]?.host_components[0]?.metrics?.jvm ? ((tempRM[0].host_components[0].metrics.jvm.HeapMemoryUsed / tempRM[0].host_components[0].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        let tempRMHeap2 = tempRM[0]?.host_components[1]?.metrics?.jvm ? ((tempRM[0].host_components[1].metrics.jvm.HeapMemoryUsed / tempRM[0].host_components[1].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        resourceManagerHeap.value = tempRMHeap1 != 0.00 ? tempRMHeap1 : tempRMHeap2;
        let tempAveLoad = response.data.items.filter((item) => item.ServiceComponentInfo.service_name == 'HBASE' && item.ServiceComponentInfo.component_name == 'HBASE_MASTER');
        let tempHbase1 = tempAveLoad[0].host_components[0]?.metrics ? (tempAveLoad[0].host_components[0].metrics.hbase.master.AverageLoad).toFixed(2) : 0.00
        let tempHbase2 = tempAveLoad[0].host_components[1]?.metrics ? (tempAveLoad[0].host_components[1].metrics.hbase.master.AverageLoad).toFixed(2) : 0.00
        let tempMasterHeap1 = tempAveLoad[0].host_components[0]?.metrics ? ((tempAveLoad[0].host_components[0].metrics.jvm.HeapMemoryUsed / tempAveLoad[0].host_components[0].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        let tempMasterHeap2 = tempAveLoad[0].host_components[1]?.metrics ? ((tempAveLoad[0].host_components[1].metrics.jvm.HeapMemoryUsed / tempAveLoad[0].host_components[1].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.00
        hbaseAveLoad.value = tempHbase1 != 0.00 ? tempHbase1 : tempHbase2
        diskUsage.value.push(temp[0].host_components[0]?.metrics?.dfs ? (temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB - temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityRemainingGB) / temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB * 100 : 0);
        hdfsUsage.value = temp[0].host_components[0]?.metrics?.dfs ? ((temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB - temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityRemainingGB) / temp[0].host_components[0].metrics.dfs.FSNamesystem.CapacityTotalGB * 100).toFixed() : 0;
        hdfsMasterHeap.value = tempHbase1 != 0.00 ? tempMasterHeap1 : tempMasterHeap2;
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
        const waktuHbase = tempAveLoad[0].host_components[0]?.metrics ? tempAveLoad[0].host_components[0].metrics.hbase.master.MasterStartTime : tempAveLoad[0].host_components[1]?.metrics ? tempAveLoad[0].host_components[1].metrics.hbase.master.MasterStartTime : now
        const differenceInMilliseconds = now - waktuHbase;
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsInHour = 1000 * 60 * 60;
        const millisecondsInMinute = 1000 * 60;
        const hDay = Math.floor(differenceInMilliseconds / millisecondsInDay);
        const hHour = Math.floor((differenceInMilliseconds % millisecondsInDay) / millisecondsInHour);
        const hMinute = Math.floor((differenceInMilliseconds % millisecondsInHour) / millisecondsInMinute);
        hbaseTime.value = ''
        if (hDay > 0)
            hbaseTime.value += hDay + 'd '
        if (hHour > 0)
            hbaseTime.value += hHour + 'h '
        if (hMinute > 0)
            hbaseTime.value += hMinute + 'm '
        if (hbaseTime.value == '')
            hbaseTime.value = 'n/a'

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

        const waktuYarn = tempRM[0]?.host_components[0]?.metrics ? tempRM[0].host_components[0].metrics.runtime.StartTime : now
        const yarnDifTime = now - waktuYarn;
        const yDay = Math.floor(yarnDifTime / millisecondsInDay);
        const yHour = Math.floor((yarnDifTime % millisecondsInDay) / millisecondsInHour);
        const yMinute = Math.floor((yarnDifTime % millisecondsInHour) / millisecondsInMinute);
        yarnTime.value = ''
        if (yDay > 0)
            yarnTime.value += yDay + 'd '
        if (nHour > 0)
            yarnTime.value += yHour + 'h '
        if (nMinute > 0)
            yarnTime.value += yMinute + 'm '
        yarnTime.value = yarnTime.value || 'n/a'

        setDiskUsageChartOptions(diskUsage.value);
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchMemory = async () => {
    try {
        const response = await axiosInstancesPython.get('/memory', {
            params: {
                selectedTime: selectedTime.value
            }
        });
        if (response.data.metrics) {
            memory.value = response.data.metrics.memory;
            for (const key in memory.value) {
                memory.value[key].forEach((item) => {
                    item[0] = (item[0] / 1048576).toFixed(2);
                });
            }
            setLineChartOptions(memory.value);
        }
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchNetwork = async () => {
    try {
        const response = await axiosInstancesPython.get('/network', {
            params: {
                selectedTime: selectedTime.value
            }
        });
        if (response.data.metrics) {
            network.value = response.data.metrics.network;
            for (const key in network.value) {
                network.value[key].forEach((item) => {
                    item[0] = (item[0] / 1024).toFixed(6);
                });
            }
            setNetworkChartOptions(network.value);
        }
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchCpu = async () => {
    try {
        const response = await axiosInstancesPython.get('/cpu', {
            params: {
                selectedTime: selectedTime.value
            }
        });
        if (response.data.metrics) {
            cpu.value = response.data.metrics.cpu;
            for (const key in cpu.value) {
                cpu.value[key].forEach((item) => {
                    item[0] = (item[0]).toFixed(6);
                });
            }
            setCpuChartOptions(cpu.value);
        }
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchLoad = async () => {
    try {
        const response = await axiosInstancesPython.get('/load', {
            params: {
                selectedTime: selectedTime.value
            }
        });
        if (response.data.metrics) {
            load.value = response.data.metrics.load;
            setLoadChartOptions(load.value);
        }
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

function setLineChartOptions(data) {
    const labels = data['Buffer._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesBuffer = data['Buffer._avg'].map((item) => item[0]);
    const valuesCache = data['Cache._avg'].map((item) => item[0]);
    const valuesShare = data['Share._avg'].map((item) => item[0]);
    const valuesSwap = data['Swap._avg'].map((item) => item[0]);
    const valuesTotal = data['Total._avg'].map((item) => item[0]);
    const valuesUse = data['Use._avg'].map((item) => item[0]);

    lineChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesBuffer,
                fill: true,
                borderColor: '#011830',
                backgroundColor: '#011830',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesCache,
                fill: true,
                borderColor: '#1263b8',
                backgroundColor: '#1263b8',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesShare,
                fill: true,
                borderColor: '#197ae0',
                backgroundColor: '#197ae0',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesSwap,
                fill: true,
                borderColor: '#368be3',
                backgroundColor: '#368be3',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesTotal,
                fill: true,
                borderColor: '#95bde8',
                backgroundColor: '#95bde8',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesUse,
                fill: true,
                borderColor: '#6da4de',
                backgroundColor: '#6da4de',
                pointRadius: 0
            },
        ]
    };
}

function setNetworkChartOptions(data) {
    const labels = data['In._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesIn = data['In._avg'].map((item) => item[0]);
    const valuesOut = data['Out._avg'].map((item) => item[0]);

    networkChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesIn,
                fill: true,
                borderColor: '#50D240',
                backgroundColor: '#50D240',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: '',
                data: valuesOut,
                fill: true,
                borderColor: '#2e8024',
                backgroundColor: '#2e8024',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            }
        ],
    };
}

function setCpuChartOptions(data) {
    const labels = data['Idle._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesIdle = data['Idle._avg'].map((item) => item[0]);
    const valuesNiche = data['Nice._avg'].map((item) => item[0]);
    const valuesSystem = data['System._avg'].map((item) => item[0]);
    const valuesUser = data['User._avg'].map((item) => item[0]);

    cpuChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesNiche,
                fill: true,
                borderColor: '#011830',
                /* backgroundColor: '#1263b8', */
                pointRadius: 0
            },
            {
                label: '',
                data: valuesSystem,
                fill: true,
                borderColor: '#197ae0',
                backgroundColor: '#197ae0',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesIdle,
                fill: true,
                borderColor: '#1263b8',
                backgroundColor: '#1263b8',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesUser,
                fill: true,
                borderColor: '#95bde8',
                backgroundColor: '#95bde8',
                pointRadius: 0
            },
        ],
    };
}

function setLoadChartOptions(data) {
    const labels = data['CPUs._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const values1min = data['1-min._avg'].map((item) => item[0]);
    const valuesCpu = data['CPUs._avg'].map((item) => item[0]);
    const valuesNodes = data['Nodes._avg'].map((item) => item[0]);
    const valuesProcs = data['Procs._avg'].map((item) => item[0]);

    loadChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesCpu,
                fill: true,
                borderColor: '#c4f5bf',
                backgroundColor: '#c4f5bf',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: '',
                data: valuesNodes,
                fill: true,
                borderColor: '#0d4d06',
                backgroundColor: '#0d4d06',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: '',
                data: values1min,
                fill: true,
                borderColor: '#50D240',
                backgroundColor: '#50D240',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: '',
                data: valuesProcs,
                fill: true,
                borderColor: '#2e8024',
                backgroundColor: '#2e8024',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            }
        ],
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.1,
        scales: {
            x: {
                ticks: {
                    display: false
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: true
                }
            }
        }
    };
}

function setChartOptionsDonut() {

    return {
        plugins: { legend: { display: false } },
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.1,
        scales: {
            x: {
                ticks: {
                    display: false
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                ticks: {
                    display: false
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

const popover = ref();
const selectedHost = ref(null);
const selectedDisk = ref('');
const selectedCpu = ref('');
const selectedMemory = ref('');
const componentHost = ref('');

const itemHeatmap = ref([
    {
        name: 'HBase',
        code: 'AU',
        metrics: [
            { cname: 'HBase Memstore Size', code: 'A-SY' },
            { cname: 'HBase Read Request Count', code: 'A-NE' },
            { cname: 'HBase Write Request Count', code: 'A-WO' },
            { cname: 'HBase Regions', code: 'regions' },
            { cname: 'HBase Compaction Queue Size', code: 'A-TO' }
        ]
    },    
]);

const doHover = (event, host) => {
    popover.value.hide()
    selectedHost.value = host
    if (host.metrics) {
        selectedDisk.value = (((host.metrics.disk.disk_total - host.metrics.disk.disk_free) / host.metrics.disk.disk_total) * 100).toFixed(1) + '%'
        selectedCpu.value = (host.metrics.cpu.cpu_system + host.metrics.cpu.cpu_user).toFixed(1) + '%'
        selectedMemory.value = (((host.metrics.memory.mem_total - host.metrics.memory.mem_free) / host.metrics.memory.mem_total) * 100).toFixed(1) + '%'
    }
    else {
        selectedDisk.value = '0%'
        selectedCpu.value = '0%'
        selectedMemory.value = '0%'
    }
    componentHost.value = ''
    host.host_components.forEach((e, i) => {
        if (i == 0)
            componentHost.value += e.HostRoles.display_name
        else componentHost.value += ', ' + e.HostRoles.display_name
    })
    nextTick(() => {
        popover.value.show(event);
    });
}

const toHost = (host) => {
    utilStore.setHost(host);
    router.push('/hostDetail')
}

const xHover = () => {
    popover.value.hide()
}

const fetchConfigHistory = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/config-history');
        totalRecords.value = response.data.items.length;
        configHistory.value = response.data.items;
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    } finally {
        loading.value = false;
    }
};

function handleChangeHeatmap(){
    console.log(selectedMetric.value)
}

function handleTimeChange() {
    fetchServiceInfo();
    fetchMemory();
    fetchNetwork();
    fetchCpu();
    fetchLoad();
    fetchMenu();
}

function handleClickMenu(jenisMenu) {
    router.push(jenisMenu)
}

function toReadableTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartOptions.value = setChartOptions();
    chartOptionsDonut.value = setChartOptionsDonut();
});
</script>

<template>
    <Tabs value="0">
        <TabList>
            <Tab value="0">Metrics</Tab>
            <Tab value="1">Heatmaps</Tab>
            <Tab value="2">Config History</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <div class="row">
                    <div class="column-left">
                        <div class="col-span-12">
                            <div>
                                <div class="font-semibold text-xl mt-4 ml-2 mb-8">{{ authStore.clusterName }}</div>
                            </div>
                        </div>
                        <div class="mb-4">
                            <div class="card">
                                <DataTable ref="dt" :value="menu" dataKey="id" :paginator="false" :rows="menu.length"
                                    :totalRecords="menu.length" :loading="loading" class="mb-4">
                                    <template #empty> Data not found. </template>
                                    <template #loading> Loading data. Please wait. </template>
                                    <Column>
                                        <template #body="{ data }">
                                            <div @click="handleClickMenu(data.StackServices.service_name)"
                                                class="flex items-center" style="cursor: pointer;">
                                                <p style="color: #1BA9E1;">{{ data.StackServices.display_name }}</p>
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                    <div class="column-right">
                        <div class="grid grid-cols-12 gap-8">
                            <div class="col-span-8">
                                <div>
                                    <div class="font-semibold text-xl mt-4 ml-2">Chart</div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div>
                                    <Select v-model="selectedTime" :options="times" option-value="code"
                                        optionLabel="name" @change="handleTimeChange"
                                        style="max-width: 150px; float: right;" class="w-full md:w-76" />
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">HDFS Disk Usage</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <Knob :size="140" v-model="hdfsUsage" readonly />
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">HBase Master Heap</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <Knob :size="140" v-model="hdfsMasterHeap" readonly />
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">Memory Usage</div>
                                    <Chart v-if="memory.length != 0" type="line" :data="lineChartData"
                                        :options="chartOptions" />
                                    <div v-else
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 15px">
                                            No Data Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">Network Usage</div>
                                    <Chart v-if="network.length != 0" type="line" :data="networkChartData"
                                        :options="chartOptions" />
                                    <div v-else
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 15px">
                                            No Data Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">CPU Usage</div>
                                    <Chart v-if="cpu.length != 0" type="line" :data="cpuChartData"
                                        :options="chartOptions" />
                                    <div v-else
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 15px">
                                            No Data Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">Cluster Load</div>
                                    <Chart v-if="load.length != 0" type="line" :data="loadChartData"
                                        :options="chartOptions" />
                                    <div v-else
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 15px">
                                            No Data Available
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">NameNode Heap</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <Knob :size="140" v-model="nameNodeHeap" readonly />
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">ResourceManager Heap</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <Knob :size="140" v-model="resourceManagerHeap" readonly />
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">HBase Ave Load</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 28px">
                                            {{ hbaseAveLoad }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">DataNodes Live</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 28px">
                                            {{ liveDataNodes + "/" + dataNodes }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">NameNode CPU WIO</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <Knob :size="140" v-model="namenodeCpuWio" readonly />
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">NameNode RPC</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 28px">
                                            {{ namenodeRpc + ' ms' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">HBase Master Uptime</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 28px">
                                            {{ hbaseTime }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">NameNode Uptime</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 28px">
                                            {{ namenodeTime }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-span-12 xl:col-span-4">
                                <div class="card">
                                    <div class="font-semibold text-xl mb-4">ResourceManager Uptime</div>
                                    <div
                                        style="display: flex; justify-content: center; align-items: center; height: 150px;">
                                        <span style="font-size: 28px">
                                            {{ yarnTime }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>
            <TabPanel value="1">
                <div class="column-left">
                    <div class="card mt-4">
                        <CascadeSelect v-model="selectedMetric" :options="itemHeatmap" optionLabel="cname" @change="handleChangeHeatmap"
                            optionGroupLabel="name" :optionGroupChildren="['metrics']" class="w-56"
                            placeholder="Select Metric" />
                        <div class="row mt-4">
                            <Button :style="{backgroundColor: '#68ba38', borderColor: '#68ba38', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">0 - 40</span>
                        </div>
                        <div class="row">
                            <Button :style="{backgroundColor: '#275c08', borderColor: '#275c08', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">40 - 80</span>
                        </div>
                        <div class="row">
                            <Button :style="{backgroundColor: '#e5e827', borderColor: '#e5e827', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">80 - 120</span>
                        </div>
                        <div class="row">
                            <Button :style="{backgroundColor: '#e37107', borderColor: '#e37107', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">120 - 160</span>
                        </div>
                        <div class="row">
                            <Button :style="{backgroundColor: 'red', borderColor: 'red', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">160 - 200</span>
                        </div>
                        <div class="row">
                            <Button :style="{background: 'repeating-linear-gradient(45deg, #c5c5c5, #545353 10px, #c5c5c5 10px, #545353 20px)', borderColor: '#c5c5c5', width: '45px', height: '25px', margin: '5px'}"></Button>                            
                            <span class="ml-2">Invalid Data</span>
                        </div>
                        <div class="row">
                            <Button :style="{backgroundColor: '#545353', borderColor: '#545353', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">Data Not Available</span>
                        </div>
                        <div class="row">
                            <Button :style="{backgroundColor: '#c5c5c5', borderColor: '#c5c5c5', width: '45px', height: '25px', margin: '5px'}"></Button>
                            <span class="ml-2">Not Applicable</span>
                        </div>
                    </div>
                </div>
                <div class="column-right">
                    <div class="card mb-4 mt-4" v-for="(rack) in racks">
                        <div class="font-semibold text-xl mb-4">{{ rack }}</div>
                        <div class="grid grid-cols-4 gap-1">
                            <div v-for="(host, index) in hosts">
                                <Button :style="{backgroundColor: bgHeat, borderColor: bgHeat}" @mouseleave="xHover()" @mouseover="doHover($event, host)"
                                    @click="toHost(host)" style="width: 100%;"
                                    v-if="host.Hosts.rack_info == rack"></Button>
                            </div>
                        </div>
                    </div>
                    <Popover ref="popover">
                        <div class="flex flex-col gap-2 w-[33rem]">
                            <div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <th colspan="2">{{ selectedHost.Hosts.public_host_name }}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th style="width: 30%">OS</th>
                                            <td>{{ selectedHost.Hosts.os_type }}</td>
                                        </tr>
                                        <tr>
                                            <th>IP Address</th>
                                            <td>{{ selectedHost.Hosts.ip }}</td>
                                        </tr>
                                        <tr>
                                            <th>Rack</th>
                                            <td>{{ selectedHost.Hosts.rack_info }}</td>
                                        </tr>
                                        <tr>
                                            <th>Disk</th>
                                            <td>{{ selectedDisk }}</td>
                                        </tr>
                                        <tr>
                                            <th>CPU</th>
                                            <td>{{ selectedCpu }}</td>
                                        </tr>
                                        <tr>
                                            <th>Memory</th>
                                            <td>{{ selectedMemory }}</td>
                                        </tr>
                                        <tr>
                                            <th>Components</th>
                                            <td>{{ componentHost }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Popover>
                </div>
            </TabPanel>
            <TabPanel value="2">
                <div class="card mt-4">
                    <div class="flex justify-between gap-2 mb-5">
                        <div>
                            <div class="font-semibold text-xl mt-2">Config History</div>
                        </div>
                    </div>
                    <DataTable ref="dt" :value="configHistory" dataKey="id" :paginator="true" :rows="rows"
                        :totalRecords="totalRecords" :loading="loading"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        :rowsPerPageOptions="[5, 10, 25]"
                        currentPageReportTemplate="Showing {first} to {last} from {totalRecords}">
                        <template #empty> Data not found. </template>
                        <template #loading> Loading data. Please wait. </template>
                        <Column header="Service">
                            <template #body="{ data }">
                                <div class="flex items-center gap-2">
                                    <span>
                                        <Tag severity="info">
                                            {{ 'v' + data.service_config_version }}
                                        </Tag>
                                        {{ data.service_name }}
                                    </span>
                                </div>
                            </template>
                        </Column>
                        <Column header="Config Group">
                            <template #body="{ data }">
                                <div class="flex items-center gap-2">
                                    <span>
                                        {{ data.group_name }}
                                        <Tag severity="success" v-if="data.is_current">
                                            {{ 'Current' }}
                                        </Tag>
                                    </span>
                                </div>
                            </template>
                        </Column>
                        <Column header="Created">
                            <template #body="{ data }">
                                <div class="flex items-center gap-2">
                                    <span>
                                        {{ toReadableTime(data.createtime) }}
                                    </span>
                                </div>
                            </template>
                        </Column>
                        <Column field="user" header="Author" />
                        <Column field="service_config_version_note" header="Notes" />
                    </DataTable>
                </div>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>
<style>
.p-tablist-tab-list {
    background: transparent !important;
}
</style>

<style scoped lang="scss">
.p-tieredmenu {
    padding-top: 150px !important;
    padding-left: 5px;
    /* background: #2b2f31 !important; */
    background: #03090F !important;
    /* border-color: #2b2f31 !important; */
    border-color: #03090F !important;
    overflow: visible !important;
    display: block !important;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    color: #8a8989;
}

th {
    text-align: left;
    padding: 8px;
    font-size: 11px;
    font-weight: bold;
}

td {
    padding: 8px 12px;
    font-size: 11px;
    border-bottom: 1px solid #ddd;
}

table,
th,
td {
    border-bottom: 1px solid #ddd;
}

table {
    border-radius: 8px;
    overflow: hidden;
}

.p-tabpanels {
    background: transparent !important;
}

.p-tab-active {
    background: var(--p-tabs-tab-active-background);
    border-color: #03090F !important;
    color: var(--p-tabs-tab-color);
}

.column-left {
    float: left;
    width: 30%;
    padding-right: 2rem;
}

.column-right {
    float: left;
    width: 70%;
}

.row:after {
    content: "";
    display: table;
    clear: both;
}

@media screen and (max-width: 600px) {

    .column-left,
    .column-right {
        width: 100%;
    }
}
</style>
