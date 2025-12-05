<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstancesPython from '@/axiosInstancesPython';

import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';

const authStore = useAuthStore();
const utilStore = useUtilStore();

const router = useRouter();
const alert = ref([]);
const alertDef = ref([]);
const menu = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);

const fetchAlerts = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/alerts');
        alert.value = response.data.items;
        fetchAlertDefinitions();
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

const fetchAlertDefinitions = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/alert-definitions');
        totalRecords.value = response.data.items.length;
        alertDef.value = response.data.items;
        const alertMap = new Map(alert.value.map((itm) => [itm.Alert.definition_id, itm.Alert]));
        alertDef.value = alertDef.value.map((def) => {
            const matchedAlert = alertMap.get(def.AlertDefinition.id);
            return matchedAlert ? { ...def, Alert: matchedAlert } : def;
        });
        alertDef.value.sort((a, b) => a.Alert?.state.localeCompare(b.Alert?.state));
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
    let namenodeTime = 'for ';
    if (nDay == 1) namenodeTime += 'about a day ';
    else if (nDay > 1 && nDay < 31) namenodeTime += nDay + ' days ';
    else if (nDay < 60 && nDay > 0) namenodeTime += 'about a month ';
    else if (nDay >= 60) namenodeTime += Math.round(nDay / 30) + ' months ';
    if (nHour > 0 && namenodeTime == 'for ') namenodeTime += nHour + 'h ';
    if (nMinute > 0 && namenodeTime == 'for ') namenodeTime += nMinute + 'm ';
    return namenodeTime;
}

function getServiceName(service_name) {
    const nama = menu.value.filter((item) => item.StackServices.service_name == service_name);
    return nama[0]?.StackServices.display_name;
}

onMounted(() => {
    menu.value = utilStore.menu;
    fetchAlerts();
});
</script>

<template>
    <div class="card mt-2">
        <div class="flex justify-between gap-2 mb-5"></div>
        <DataTable
            ref="dt"
            :value="alertDef"
            dataKey="id"
            :paginator="true"
            :rows="rows"
            :totalRecords="totalRecords"
            :loading="loading"
            @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} from {totalRecords} alerts"
        >
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column header="Status">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span
                            :style="{
                                color: '#fff',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                backgroundColor: data.Alert?.state == 'OK' ? 'green' : data.Alert?.state == 'CRITICAL' ? 'red' : data.Alert?.state == 'UNKNOWN' ? '#fcad03' : 'gray',
                                paddingTop: '5px',
                                paddingBottom: '5px',
                                fontSize: '11px',
                                maxWidth: '90px',
                                minWidth: '90px'
                            }"
                        >
                            {{ data.Alert?.state ? data.Alert?.state : 'NONE' }}
                        </span>
                    </div>
                </template>
            </Column>
            <Column field="AlertDefinition.label" header="Alert Definition Name" />
            <Column field="Alert.service_name" header="Service">
                <template #body="{ data }">
                    {{ getServiceName(data.AlertDefinition.service_name) ? getServiceName(data.AlertDefinition.service_name) : data.AlertDefinition.service_name }}
                </template>
            </Column>
            <Column header="Last Status Changed">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.Alert ? toDifTime(data.Alert?.latest_timestamp, data.Alert?.original_timestamp, data.Alert?.state) : '-' }}</span>
                    </div>
                </template>
            </Column>
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
