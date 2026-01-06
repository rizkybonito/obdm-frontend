<script setup>
import { ref, onMounted } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';
const authStore = useAuthStore();
const utilStore = useUtilStore();

const router = useRouter();
const hosts = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);

const fetchHosts = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/hosts');
        totalRecords.value = response.data.itemTotal;
        hosts.value = response.data.items;
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
    fetchHosts(event.page + 1);
};

const toHost = (host) => {
    utilStore.setHost(host);
    router.push('/hostDetail')
}

onMounted(() => {
    fetchHosts();
});

function diskUsagePercentage(data) {
    if (data && data.metrics && data.metrics.disk) {
        const total = data.metrics.disk.disk_total;
        const free = data.metrics.disk.disk_free;

        if (total && free !== undefined && total > 0) {
            const used = total - free;
            return (used / total) * 100;
        }
    }
    return 0;
}
</script>

<template>
    <div class="card">
        <DataTable ref="dt" :value="hosts" dataKey="id" :paginator="false" :rows="rows" :totalRecords="totalRecords"
            :loading="loading" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]" currentPageReportTemplate="Showing {first} to {last} from {first} hosts">
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column header="No.">
                <template #body="{ index }">
                    <div class="flex items-center gap-2">
                        <span>{{ index + awal }}.</span>
                    </div>
                </template>
            </Column>
            <Column header="Host Name">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <a @click="toHost(data)" style="color: #2A79E3; cursor: pointer;">{{
                            data.Hosts.public_host_name }}</a>
                    </div>
                </template>
            </Column>
            <Column field="Hosts.ip" header="IP Address" />
            <Column field="status" header="Disk Usage">
                <template #body="{ data }">
                    <ProgressBar :value="diskUsagePercentage(data)" :showValue="false"></ProgressBar>
                </template>
            </Column>
        </DataTable>
        <Paginator :rows="rows" :rowsPerPageOptions="[5, 10, 25]" @page="onPage" :totalRecords="totalRecords"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} from {totalRecords} Hosts  " />
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
