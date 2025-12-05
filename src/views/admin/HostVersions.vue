<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useUtilStore } from '@/stores/utilStore';
const utilStore = useUtilStore();

const router = useRouter();
const hosts = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const itungAlert = ref(0);

const fetchHosts = () => {
    loading.value = true;
    totalRecords.value = utilStore.host.stack_versions.length;
    hosts.value = utilStore.host.stack_versions;
    loading.value = false;
};
const awal = ref(1);
const onPage = (event) => {
    awal.value = event.first + 1;
    rows.value = event.rows;
    fetchHosts(event.page + 1);
};

function handleToSummary() {
    router.push('\hostDetail')
}

function handleToAlert() {
    router.push('\hostAlerts')
}

onMounted(() => {
    fetchHosts();
    itungAlert.value = utilStore.alertCount;
});

</script>

<template>
    <div class="col-12 mb-2">
        <button class="mb-4 font-semibold mr-3" @click="handleToSummary">Summary</button>
        <button class="font-semibold ml-3 mr-3" @click="handleToAlert">
            Alerts <Badge v-if="itungAlert" :value="itungAlert" severity="danger" />
        </button>
        <button class="font-semibold ml-3 mr-3" disabled style="border-bottom: 3px #10b981 solid; padding: 5px;">Versions</button>
    </div>
    <div class="card">
        <div class="flex justify-between gap-2 mb-5">
            <div>
                <div class="font-semibold text-xl mt-2">Versions</div>
            </div>
        </div>
        <DataTable ref="dt" :value="hosts" dataKey="id" :paginator="false" :rows="rows" :totalRecords="totalRecords"
            :loading="loading" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]" currentPageReportTemplate="Showing {first} to {last} from {first} hosts">
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column field="HostStackVersions.stack" header="Stack" />
            <Column header="Name">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span>{{ data.repository_versions[0].RepositoryVersions.display_name }}</span>
                    </div>
                </template>
            </Column>
            <Column header="Status">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <span :style="{
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            backgroundColor: 'green',
                            paddingTop: '5px',
                            paddingBottom: '5px',
                            fontSize: '11px',
                            maxWidth: '90px',
                            minWidth: '90px'
                        }">{{ data.HostStackVersions.state }}</span>
                    </div>
                </template>
            </Column>
            <Column header=" ">
                <template #body="{data}">
                    <div><Button disabled severity="secondary" label="Install" icon="pi pi-power-off" /></div>
                </template>
            </Column>
        </DataTable>
        <Paginator :rows="rows" :rowsPerPageOptions="[5, 10, 25]" @page="onPage" :totalRecords="totalRecords"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} from {totalRecords} versions  " />
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
