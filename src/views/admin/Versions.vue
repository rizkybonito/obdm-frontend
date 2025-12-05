<script setup>
import { ref, onMounted, version } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';

const authStore = useAuthStore();
const utilStore = useUtilStore();

const router = useRouter();
const stack = ref([]);
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
        stack.value = utilStore.services
        stack.value = stack.value.filter((item) => item.is_installed == true)
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
    fetchStack(event.page + 1);
};

function handleToStack() {
    router.push('\stacks')
}

onMounted(() => {
    lapas_id.value = authStore.user.lapas_id;
    fetchStack();
});
</script>

<template>
    <div class="col-12 mb-2">
        <button class="mb-4 font-semibold mr-3" @click="handleToStack">Stack</button>
        <button class="font-semibold ml-3 mr-3" disabled
            style="border-bottom: 3px #10b981 solid; padding: 5px;">Versions</button>
    </div>
    <div class="card">
        <DataTable ref="dt" :value="stack" dataKey="id" :paginator="false" :rows="rows" :totalRecords="totalRecords"
            :loading="loading" @page="onPage"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]" currentPageReportTemplate="Showing {first} to {last} from {first} stack">
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column field="StackServices.display_name" header="" />
            <Column>
                <template #body="{ data }">
                    <div style="width: 100px;background-color: green; text-align: center; padding: 5px; ">
                        <a style="color: #fff;">{{ data.StackServices.service_version }}</a>
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
