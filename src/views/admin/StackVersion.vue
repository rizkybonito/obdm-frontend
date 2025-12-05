<script setup>
import { ref, onMounted } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';

const authStore = useAuthStore();
const utilStore = useUtilStore();

const router = useRouter();
const stack = ref([]);
const services = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const lapas_id = ref(null);

const fetchStack = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/stack-version');
        totalRecords.value = response.data.itemTotal;
        stack.value = response.data.items;
        fetchInstalledService();
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

const fetchInstalledService = async () => {
    try {
        const response = await axiosInstancesPython.get('/stack-version-services');
        services.value = response.data.items;
        stack.value.forEach((item, i) => {
            const isInstalled = services.value.some(
                (service) => item.StackServices.service_name === service.ServiceInfo.service_name
            );
            stack.value[i] = {
                ...stack.value[i],
                is_installed: isInstalled
            };
        });
        utilStore.setServices(stack.value)
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const awal = ref(1);
const onPage = (event) => {
    awal.value = event.first + 1;
    rows.value = event.rows;
    fetchStack(event.page + 1);
};

function handleToVersion() {
    router.push('versions')
}

onMounted(() => {
    lapas_id.value = authStore.user.lapas_id;
    fetchStack();
});
</script>

<template>
    <div class="col-12 mb-2">
        <button class="mb-4 font-semibold mr-3" disabled style="border-bottom: 3px #10b981 solid; padding: 5px;">Stack</button>
        <button class="font-semibold ml-3 mr-3" @click="handleToVersion">Versions</button>
    </div>
    <div class="card">
    <!-- <iframe
      src="http://10.10.6.50:9891"
      width="100%"
      height="600"
      frameborder="0"
    ></iframe> -->
        <div class="flex justify-between gap-2 mb-5">
            <div>
                <div class="font-semibold text-xl mt-2">Stack</div>
            </div>
        </div>
        <DataTable ref="dt" :value="stack" dataKey="id" :paginator="false" :rows="rows" :totalRecords="totalRecords"
            :loading="loading" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]" currentPageReportTemplate="Showing {first} to {last} from {first} stack">
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column field="StackServices.display_name" header="Service" />
            <Column field="StackServices.service_version" header="Version" />
            <Column header="Status">
                <template #body="{ data }">
                    <div style="width: 100px;">
                        <a style="padding: 7px; height: 25px; background-color: green; color: #fff;" v-if="data.is_installed" disabled>Installed</a>
                        <a icon="pi pi-times" severity="info" style="width: 100px; height: 25px; cursor: pointer; color: midnightblue;" v-else>Add Service</a>
                    </div>
                </template>
            </Column>
            <Column field="StackServices.comments" header="Descriptiom" />
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
