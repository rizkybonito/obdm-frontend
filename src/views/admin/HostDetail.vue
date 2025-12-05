<script setup>
import { ref, onMounted, watch } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';

const authStore = useAuthStore();
const utilStore = useUtilStore();
import { useLayout } from '@/layout/composables/layout';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const router = useRouter();
const alerts = ref(null);
const nameNodeHeap = ref(null);
const namenodeCpuWio = ref(0);
const namenodeRpc = ref(0);
const namenodeTime = ref('');
const showHeap = ref(false);
const host = ref(null);
const memory = ref([]);
const network = ref([]);
const chartOptions = ref(null);
const cpu = ref([]);
const load = ref([]);
const disk = ref([]);
const itungAlert = ref(0);
const process = ref([]);
const components = ref([]);
const summary = ref(null);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const cpuChartData = ref(null);
const memoryChartData = ref(null);
const networkChartData = ref(null);
const loadChartData = ref(null);
const diskUsageChartData = ref(null);
const processChartData = ref(null);

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

const awal = ref(1);
const onPage = (event) => {
    awal.value = event.first + 1;
    rows.value = event.rows;
};

onMounted(() => {
    chartOptions.value = setChartOptions();
    components.value = utilStore.host.host_components;
    summary.value = utilStore.host.Hosts;
    host.value = utilStore.host;
    showHeap.value = host.value.host_components.some((e) => e.HostRoles.display_name === 'YARN Resource Manager');
    fetchChartData();
    fetchAlerts();
});

const fetchChartData = async () => {
    try {
        const response = await axiosInstancesPython.get('/cpu_host', {
            params: {
                host: summary?.value.host_name,
                selectedTime: selectedTime.value
            }
        });
        if (response.data.metrics) {
            cpu.value = response.data.metrics.cpu;
            for (const key in cpu.value) {
                cpu.value[key].forEach((item) => {
                    item[0] = item[0].toFixed(6);
                });
            }
            setCpuChartOptions(cpu.value);
            load.value = response.data.metrics.load;
            setLoadChartOptions(load.value);
            memory.value = response.data.metrics.memory;
            for (const key in memory.value) {
                memory.value[key].forEach((item) => {
                    item[0] = (item[0] / 1048576).toFixed(2);
                });
            }
            setMemoryChartOptions(memory.value);
            network.value = response.data.metrics.network;
            for (const key in network.value) {
                network.value[key].forEach((item) => {
                    item[0] = (item[0] / 1024).toFixed(6);
                });
            }
            setNetworkChartOptions(network.value);
            disk.value = response.data.metrics.disk;
            setDiskUsageChartOptions(disk.value);
            process.value = response.data.metrics.process;
            setProcessChartOptions(process.value);
        }
        if (showHeap.value) fetchServiceInfo();
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchAlerts = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/host_alerts', {
            params: {
                host: summary?.value.host_name
            }
        });
        alerts.value = response.data.items;
        alerts.value.sort((a, b) => a.Alert.state.localeCompare(b.Alert.state));
        itungAlert.value = alerts.value.filter((item) => item.Alert.state == 'CRITICAL').length;
        utilStore.setAlertCount(itungAlert.value);
        utilStore.setAlertComponent(alerts.value);
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

const fetchServiceInfo = async () => {
    try {
        const response = await axiosInstancesPython.get('/detail-component-info');
        let temp = response.data.items.filter((item) => item.ServiceComponentInfo.service_name == 'HDFS' && item.ServiceComponentInfo.component_name == 'NAMENODE');
        let idx = 0;

        temp[0].host_components.forEach((e, i) => {
            if (e.HostRoles.host_name == summary.value.host_name) idx = i;
        });
        let tempNameNodeHeap1 = temp[0].host_components[idx].metrics?.jvm ? ((temp[0].host_components[idx].metrics.jvm.HeapMemoryUsed / temp[0].host_components[idx].metrics.jvm.HeapMemoryMax) * 100).toFixed(0) : 0.0;
        nameNodeHeap.value = tempNameNodeHeap1 != 0.0 ? tempNameNodeHeap1 : null;
        const hostComponent = temp[0].host_components[idx] && temp[0].host_components[idx].metrics;
        const namenodeCpuWioValue = hostComponent?.cpu?.cpu_wio ?? 0;

        namenodeCpuWio.value = namenodeCpuWioValue;
        namenodeRpc.value = temp[0].host_components[idx].metrics?.rpc ? temp[0].host_components[idx].metrics.rpc.client.RpcQueueTime_avg_time.toFixed(2) : 0;
        const now = Date.now();
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsInHour = 1000 * 60 * 60;
        const millisecondsInMinute = 1000 * 60;

        const waktuNameNode = temp[0].host_components[idx].metrics?.runtime ? temp[0].host_components[idx].metrics.runtime.StartTime : now;
        const namenodeDifTime = now - waktuNameNode;
        const nDay = Math.floor(namenodeDifTime / millisecondsInDay);
        const nHour = Math.floor((namenodeDifTime % millisecondsInDay) / millisecondsInHour);
        const nMinute = Math.floor((namenodeDifTime % millisecondsInHour) / millisecondsInMinute);
        namenodeTime.value = '';
        if (nDay > 0) namenodeTime.value += nDay + 'd ';
        if (nHour > 0) namenodeTime.value += nHour + 'h ';
        if (nMinute > 0) namenodeTime.value += nMinute + 'm ';
        namenodeTime.value = namenodeTime.value || 'n/a';
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartOptions.value = setChartOptions();
});

function setMemoryChartOptions(data) {
    const labels = data['swap_free._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesSwap = data['swap_free._avg'].map((item) => item[0]);
    const valuesShared = data['mem_shared._avg'].map((item) => item[0]);
    const valuesFree = data['mem_free._avg'].map((item) => item[0]);
    const valuesCached = data['mem_cached._avg'].map((item) => item[0]);

    memoryChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesSwap,
                fill: true,
                borderColor: '#011830',
                backgroundColor: '#011830',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesShared,
                fill: true,
                borderColor: '#197ae0',
                backgroundColor: '#197ae0',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesFree,
                fill: true,
                borderColor: '#1263b8',
                backgroundColor: '#1263b8',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesCached,
                fill: true,
                borderColor: '#95bde8',
                backgroundColor: '#95bde8',
                pointRadius: 0
            }
        ]
    };
}

function setNetworkChartOptions(data) {
    const labels = data['bytes_in._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesBytesIn = data['bytes_in._avg'].map((item) => item[0]);
    const valuesBytesOut = data['bytes_out._avg'].map((item) => item[0]);
    const valuesPktsIn = data['pkts_in._avg'].map((item) => item[0]);
    const valuesPktsOut = data['pkts_out._avg'].map((item) => item[0]);

    networkChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesBytesIn,
                fill: true,
                borderColor: '#011830',
                backgroundColor: '#011830',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesBytesOut,
                fill: true,
                borderColor: '#197ae0',
                backgroundColor: '#197ae0',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesPktsIn,
                fill: true,
                borderColor: '#1263b8',
                backgroundColor: '#1263b8',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesPktsOut,
                fill: true,
                borderColor: '#95bde8',
                backgroundColor: '#95bde8',
                pointRadius: 0
            }
        ]
    };
}

function setCpuChartOptions(data) {
    const labels = data['cpu_idle._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesIdle = data['cpu_idle._avg'].map((item) => item[0]);
    const valuesNiche = data['cpu_nice._avg'].map((item) => item[0]);
    const valuesSystem = data['cpu_system._avg'].map((item) => item[0]);
    const valuesUser = data['cpu_user._avg'].map((item) => item[0]);
    const valuesWio = data['cpu_wio._avg'].map((item) => item[0]);

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
            {
                label: '',
                data: valuesWio,
                fill: true,
                borderColor: '#b0d6ff',
                backgroundColor: '#b0d6ff',
                pointRadius: 0
            }
        ]
    };
}

function setProcessChartOptions(data) {
    const labels = data['proc_total._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const valuesTotal = data['proc_total._avg'].map((item) => item[0]);
    const valuesRun = data['proc_run._avg'].map((item) => item[0]);

    processChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: valuesTotal,
                fill: true,
                borderColor: '#50D240',
                backgroundColor: '#50D240',
                pointRadius: 0
            },
            {
                label: '',
                data: valuesRun,
                fill: true,
                borderColor: '#0d4d06',
                backgroundColor: '#0d4d06',
                pointRadius: 0
            }
        ]
    };
}

function setLoadChartOptions(data) {
    const labels = data['load_one._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const values1min = data['load_one._avg'].map((item) => item[0]);
    const valuesNodes = data['load_five._avg'].map((item) => item[0]);
    const valuesProcs = data['load_fifteen._avg'].map((item) => item[0]);

    loadChartData.value = {
        labels: labels,
        datasets: [
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
        ]
    };
}

function diskUsagePercentage(data) {
    if (data && data.metrics && data.metrics.disk) {
        const total = data.metrics.disk.disk_total;
        const free = data.metrics.disk.disk_free;

        if (total && free !== undefined && total > 0) {
            const used = total - free;
            return ((used / total) * 100).toFixed(2);
        }
    }
    return 0;
}

function setDiskUsageChartOptions(data) {
    const labels = data['disk_free._avg'].map((item) => new Date(item[1] * 1000).toISOString());
    const values1min = data['disk_free._avg'].map((item) => item[0]);
    const valuesNodes = data['disk_total._avg'].map((item) => item[0]);

    diskUsageChartData.value = {
        labels: labels,
        datasets: [
            {
                label: '',
                data: values1min,
                fill: true,
                borderColor: '#0d4d06',
                backgroundColor: '#0d4d06',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: '',
                data: valuesNodes,
                fill: true,
                borderColor: '#50D240',
                backgroundColor: '#50D240',
                tension: 1,
                borderWidth: 1,
                pointRadius: 0
            }
        ]
    };
}

function handleTimeChange() {
    fetchChartData();
}

function handleToAlert() {
    router.push('hostAlerts');
}

function handleToVersion() {
    router.push('hostVersions');
}

function getServiceName(service_name) {
    let svc = utilStore.menu.filter((item) => item.StackServices.service_name == service_name);
    return svc[0].StackServices.display_name;
}

function getServiceType(service) {
    let svc = utilStore.menu.filter((item) => item.StackServices.service_name == service.service_name);
    let tipe = '-';
    svc[0].components.forEach((element) => {
        if (service.component_name == element.StackServiceComponents.component_name) {
            tipe = element.StackServiceComponents.component_category;
            tipe = tipe.charAt(0).toUpperCase() + tipe.slice(1).toLowerCase();
        }
    });
    return tipe;
}

function getDifferenceTime(waktu) {
    const now = Date.now();
    const differenceInMilliseconds = now - waktu;
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInMinute = 1000 * 60;
    const hDay = Math.floor(differenceInMilliseconds / millisecondsInDay);
    const hHour = Math.floor((differenceInMilliseconds % millisecondsInDay) / millisecondsInHour);
    const hMinute = Math.floor((differenceInMilliseconds % millisecondsInHour) / millisecondsInMinute);
    let sentence = '';
    sentence += hDay ? hDay + ' day(s)' : '';
    sentence += hHour ? hHour + ' hour(s)' : '';
    sentence += hMinute ? hMinute + ' minute(s)' : '';
    sentence += sentence ? ' ago' : 'less than a minute ago';
    return sentence;
}
function handleClickMenu(jenisMenu) {
    router.push(jenisMenu);
}
const itemDropdown = [
    {
        label: 'Restart',
        /* icon: 'pi pi-refresh', */
        command: () => {
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
        }
    },
    {
        label: 'Stop',
        command: () => {
            toast.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
        }
    },
    {
        label: 'Turn On Maintenance Mode',
        command: () => {
            toast.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
        }
    },
    {
        label: 'Delete',
        command: () => {
            toast.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
        }
    }
];
const itemDropdown2 = [
    {
        label: 'Start',
        command: () => {
            toast.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
        }
    },
    {
        label: 'Turn On Maintenance Mode',
        command: () => {
            toast.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
        }
    },
    {
        label: 'Delete',
        command: () => {
            toast.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
        }
    }
];

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
</script>

<template>
    <div class="row">
        <div class="col-12">
            <button style="border-bottom: 3px #10b981 solid; padding: 5px" class="mb-4 font-semibold mr-3" disabled>Summary</button>
            <button class="font-semibold ml-3 mr-3" @click="handleToAlert">
                Alerts
                <Badge v-if="itungAlert" :value="itungAlert" severity="danger" />
            </button>
            <button class="font-semibold ml-3 mr-3" @click="handleToVersion">Versions</button>
        </div>
        <div class="column-left">
            <div class="card">
                <div class="flex justify-between gap-2 mb-5">
                    <div>
                        <div class="font-semibold text-xl mt-2">Components</div>
                    </div>
                </div>
                <DataTable
                    ref="dt"
                    :value="components"
                    dataKey="id"
                    :paginator="false"
                    :rows="rows"
                    :totalRecords="totalRecords"
                    :loading="loading"
                    @page="onPage"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} from {first} hosts"
                >
                    <template #empty> Data not found. </template>
                    <template #loading> Loading data. Please wait. </template>
                    <Column header="Status">
                        <template #body="{ data }">
                            <div>
                                <Button
                                    icon="pi pi-check"
                                    v-tooltip.bottom="{ value: data.HostRoles.state }"
                                    style="margin-left: 13px; width: 17px; height: 8px"
                                    rounded
                                    v-if="data.HostRoles.state == 'INSTALLED' || data.HostRoles.state == 'STARTED'"
                                ></Button>
                                <Button
                                    icon="pi pi-times"
                                    v-tooltip.bottom="{ value: data.HostRoles.state }"
                                    severity="danger"
                                    style="margin-left: 13px; width: 17px; height: 8px"
                                    rounded
                                    v-if="data.HostRoles.state != 'INSTALLED' && data.HostRoles.state != 'STARTED'"
                                ></Button>
                            </div>
                        </template>
                    </Column>
                    <Column header="Name">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <p>{{ data.HostRoles.display_name + ' / ' }}</p>
                                <p @click="handleClickMenu(data.HostRoles.service_name)" class="flex items-center" style="color: #1ba9e1; cursor: pointer">{{ getServiceName(data.HostRoles.service_name) }}</p>
                            </div>
                        </template>
                    </Column>
                    <Column header="Type">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <p>{{ getServiceType(data.HostRoles) }}</p>
                            </div>
                        </template>
                    </Column>
                    <Column header="Action">
                        <template #body="{ data }">
                            <SplitButton severity="secondary" v-if="data.HostRoles.state == 'INSTALLED' || data.HostRoles.state == 'STARTED'" icon="pi pi-cog" :model="itemDropdown" />
                            <SplitButton v-if="data.HostRoles.state != 'INSTALLED' && data.HostRoles.state != 'STARTED'" dropdownIcon="pi pi-cog" :model="itemDropdown2" />
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="card">
                <div class="flex justify-between gap-2 mb-5">
                    <div>
                        <div class="font-semibold text-xl mt-2">Summary</div>
                    </div>
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Hostname</th>
                            <td>{{ summary?.host_name }}</td>
                        </tr>
                        <tr>
                            <th>IP Address</th>
                            <td>{{ summary?.ip }}</td>
                        </tr>
                        <tr>
                            <th>Rack</th>
                            <td>{{ summary?.rack_info }}</td>
                        </tr>
                        <tr>
                            <th>OS</th>
                            <td>{{ summary?.os_type }}</td>
                        </tr>
                        <tr>
                            <th>Cores (CPU)</th>
                            <td>{{ summary?.cpu_count + '(' + summary?.ph_cpu_count + ')' }}</td>
                        </tr>
                        <tr>
                            <th>Disk</th>
                            <td>{{ diskUsagePercentage(host) + '%' }}</td>
                        </tr>
                        <tr>
                            <th>Memory</th>
                            <td>{{ summary ? (parseInt(summary.total_mem) / 1048576).toFixed(2) + ' GB' : '-' }}</td>
                        </tr>
                        <tr>
                            <th>Load Avg</th>
                            <td>{{ host?.metrics?.load.load_one }}</td>
                        </tr>
                        <tr>
                            <th>Heartbeat</th>
                            <td>{{ summary?.last_heartbeat_time ? getDifferenceTime(summary.last_heartbeat_time) : '-' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="column-right">
            <div class="card grid grid-cols-12 gap-4">
                <div class="col-span-8">
                    <div>
                        <div class="font-semibold text-xl mt-2 ml-2">Chart</div>
                    </div>
                </div>
                <div class="col-span-12 xl:col-span-4">
                    <div>
                        <Select v-model="selectedTime" :options="times" option-value="code" optionLabel="name" @change="handleTimeChange" style="max-width: 150px; float: right" class="w-full md:w-76" />
                    </div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card mt-4" style="background-color: var(--surface-ground)">
                        <Chart v-if="cpu.length != 0" type="line" :data="cpuChartData" :options="chartOptions" />
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">CPU Usage</div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card mt-4" style="background-color: var(--surface-ground)">
                        <Chart v-if="load.length != 0" type="line" :data="loadChartData" :options="chartOptions" />
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">Load</div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card mt-4" style="background-color: var(--surface-ground)">
                        <Chart v-if="disk.length != 0" type="line" :data="diskUsageChartData" :options="chartOptions" />
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">Disk Usage</div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card mt-4" style="background-color: var(--surface-ground)">
                        <Chart v-if="memory.length != 0" type="line" :data="memoryChartData" :options="chartOptions" />
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">Memory Usage</div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card mt-4" style="background-color: var(--surface-ground)">
                        <Chart v-if="network.length != 0" type="line" :data="networkChartData" :options="chartOptions" />
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">Network Usage</div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card mt-4" style="background-color: var(--surface-ground)">
                        <Chart v-if="process.length != 0" type="line" :data="processChartData" :options="chartOptions" />
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">Processes</div>
                </div>
                <div class="col-span-12 xl:col-span-6" v-if="showHeap">
                    <div class="card" style="background-color: var(--surface-ground)">
                        <div style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <Knob :size="140" v-model="nameNodeHeap" readonly />
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">NameNode Heap</div>
                </div>
                <div class="col-span-12 xl:col-span-6" v-if="showHeap">
                    <div class="card" style="background-color: var(--surface-ground)">
                        <div v-if="namenodeCpuWio" style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <Knob :size="140" v-model="namenodeCpuWio" readonly />
                        </div>
                        <div v-else style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 15px"> No Data Available </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">NameNode CPU WIO</div>
                </div>
                <div class="col-span-12 xl:col-span-6" v-if="showHeap">
                    <div class="card" style="background-color: var(--surface-ground)">
                        <div style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 28px">
                                {{ namenodeRpc + ' ms' }}
                            </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">NameNode RPC</div>
                </div>
                <div class="col-span-12 xl:col-span-6" v-if="showHeap">
                    <div class="card" style="background-color: var(--surface-ground)">
                        <div style="display: flex; justify-content: center; align-items: center; height: 150px">
                            <span style="font-size: 28px">
                                {{ namenodeTime }}
                            </span>
                        </div>
                    </div>
                    <div class="font-semibold items-center mb-4" style="text-align: center !important; margin-top: -15px">NameNode Uptime</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
<style scoped lang="scss">
table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    /* color: #8a8989; */
}

th {
    text-align: right;
    padding: 8px;
    font-weight: bold;
}

td {
    padding: 8px 12px;
    /* border-bottom: 1px solid #ddd; */
}

table,
th,
td {
    /* border-bottom: 1px solid #ddd; */
}

.column-left {
    float: left;
    width: 50%;
    padding-right: 2rem;
}

.column-right {
    float: left;
    width: 50%;
}

@media screen and (max-width: 600px) {
    .column-left,
    .column-right {
        width: 100%;
        margin-top: 20px;
    }
}

table {
    border-radius: 8px;
    overflow: auto !important;
}
</style>
