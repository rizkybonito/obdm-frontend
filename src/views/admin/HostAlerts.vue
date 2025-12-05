<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useUtilStore } from '@/stores/utilStore';
const utilStore = useUtilStore();

const router = useRouter();
const alerts = ref([]);
const menu = ref([]);
const itungAlert = ref(0);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);

const fetchAlerts = async () => {
    loading.value = true;
    alerts.value = utilStore.alertComponent;
    totalRecords.value = alerts.value.length;
    loading.value = false;
};

const awal = ref(1);
const onPage = (event) => {
    awal.value = event.first + 1;
    rows.value = event.rows;
    fetchAlerts(event.page + 1);
};

function toDifTime(time, time2, status) {
    const now = Date.now();
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInMinute = 1000 * 60;

    const namenodeDifTime = status == 'CRITICAL' ? now - time : now - time2;
    const nDay = Math.floor(namenodeDifTime / millisecondsInDay);
    const nHour = Math.floor((namenodeDifTime % millisecondsInDay) / millisecondsInHour);
    const nMinute = Math.floor((namenodeDifTime % millisecondsInHour) / millisecondsInMinute);
    let namenodeTime = 'for '
    if (nDay == 1)
        namenodeTime += 'about a day '
    else if (nDay > 1 && nDay < 31)
        namenodeTime += nDay + ' days '
    else if (nDay < 60)
        namenodeTime += 'about a month '
    else namenodeTime += Math.round(nDay / 30) + ' months '
    if (nHour > 0 && namenodeTime == 'for ')
        namenodeTime += nHour + 'h '
    if (nMinute > 0 && namenodeTime == 'for ')
        namenodeTime += nMinute + 'm '
    return namenodeTime
}

function handleToSummary() {
    router.push('\hostDetail')
}

function handleToVersion() {
    router.push('\hostVersions')
}

function getServiceName(service_name){
    const nama = menu.value.filter(item => item.StackServices.service_name == service_name)
    return nama[0]?.StackServices.display_name;
}

onMounted(() => {
    itungAlert.value = utilStore.alertCount;
    menu.value = utilStore.menu;    
    fetchAlerts();
});
</script>

<template>
    <div class="col-12">
        <button class="mb-4 font-semibold mr-3" @click="handleToSummary">Summary</button>
        <button class="font-semibold ml-3 mr-3" style="border-bottom: 3px #10b981 solid; padding: 5px;" disabled>Alerts <Badge v-if="itungAlert" :value="itungAlert" severity="danger" /></button>
        <button class="font-semibold ml-3 mr-3" @click="handleToVersion">Versions</button>
    </div>
    <div class="card mt-2">
        <div class="flex justify-between gap-2 mb-5">
        </div>
        <DataTable ref="dt" :value="alerts" dataKey="id" :paginator="true" :rows="rows" :totalRecords="totalRecords"
            :loading="loading" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} from {totalRecords} alerts">
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column field="Alert.service_name" header="Service">
                <template #body="{ data }">
                    {{ getServiceName(data.Alert.service_name) ? getServiceName(data.Alert.service_name) : data.Alert.service_name }}
                </template>
            </Column>
            <Column field="Alert.label" header="Alert Definition Name" />
            <Column header="Status">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span :style="{
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            backgroundColor: data.Alert.state == 'OK' ? 'green' : data.Alert.state == 'CRITICAL' ? 'red' : '#fcad03',
                            paddingTop: '5px',
                            paddingBottom: '5px',
                            fontSize: '11px',
                            maxWidth: '90px',
                            minWidth: '90px'
                        }">
                            {{ data.Alert.state }}
                        </span>
                        <span>{{ toDifTime(data.Alert.latest_timestamp, data.Alert.original_timestamp, data.Alert.state) }}</span>
                    </div>
                </template>
            </Column>
            <Column field="Alert.text" header="Response" />
        </DataTable>
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
