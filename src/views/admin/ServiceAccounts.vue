<script setup>
import { ref, onMounted } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

const router = useRouter();
const totalRecords = ref(0);
const loading = ref(false);
const rows = ref(10);
const accounts = ref([]);

const fetchAccounts = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/service-accounts');
        let temp = response.data.items
        temp.forEach(element => {
            let acc = element.configurations.filter(item => item.StackConfigurations.property_value_attributes.type == "user");
            acc.forEach(itm => {
                accounts.value.push({ name: itm.StackConfigurations.property_display_name, value: itm.StackConfigurations.property_value })
            })
        });
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

const fetchAccount = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/accounts');
        let temp = response.data.configurations
        let temp2 = temp.filter(item => item.StackLevelConfigurations.property_value_attributes.type == "user");
        accounts.value = []
        temp2.forEach(element => {
            accounts.value.push({ name: element.StackLevelConfigurations.property_display_name, value: element.StackLevelConfigurations.property_value })
        })
        fetchAccounts()
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

onMounted(() => {
    fetchAccount();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between gap-2 mb-5">
            <div>
                <div class="font-semibold text-xl mt-2">Services User and Groups</div>
            </div>
        </div>
        <DataTable ref="dt" :value="accounts" dataKey="id" :paginator="false"
            :rows="rows" :totalRecords="totalRecords" :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]" currentPageReportTemplate="Showing {first} to {last} from {first} stack">
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column field="name" header="Name" />
            <Column field="value" header="Value" />
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
