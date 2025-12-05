<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstancesPython from '@/axiosInstancesPython';
const router = useRouter();
const visible = ref(false);
const aiUrl = ref(import.meta.env.VITE_API_URL);
const menu = ref([]);

const model = ref([
    {
        label: 'Clusters', icon: 'pi pi-fw pi-objects-column',
        command: () => {
            visible.value = !visible.value
        },
        items: []
    },
    {
        label: 'Charts', icon: 'pi pi-fw pi-chart-bar',
        items: [{
            label: 'Dashboard',
            icon: 'pi pi-fw pi-chart-bar',
            command: () => {
                router.push('/dashboard');
            }
        }]
    },
    {
        label: 'Hosts', icon: 'pi pi-fw pi-server',
        items: [
            {
                label: 'Hosts', icon: 'pi pi-fw pi-book', command: () => {
                    router.push('/hosts');
                }
            },
        ]
    },
    {
        label: 'Alerts', icon: 'pi pi-fw pi-exclamation-triangle',
        items: [
            {
                label: 'Alerts', icon: 'pi pi-fw pi-book', command: () => {
                    router.push('/alerts');
                }
            },
        ]
    },
    {
        label: 'Cluster Admin', icon: 'pi pi-fw pi-cog',
        items: [
            {
                label: 'Stack and Versions', icon: 'pi pi-fw pi-book', command: () => {
                    router.push('/stacks');
                }
            },
            {
                label: 'Services Accounts', icon: 'pi pi-fw pi-book', command: () => {
                    router.push('/accounts');
                }
            },
            { label: 'Kerberos', icon: 'pi pi-fw pi-book', url: '/notfound' },
            { label: 'Service Auto Start', icon: 'pi pi-fw pi-book', url: '/notfound' },
        ]
    },
    {
        label: 'Onyx AI', icon: 'pi pi-fw pi-microchip-ai', 
        command: () => {
            window.open(
                aiUrl.value,
                'popupWindow',
                'width=800,height=600,top=100,left=100,resizable=yes,scrollbars=yes'
            );
        }
    }

]);

const fetchMenu = async () => {
    try {
        const response = await axiosInstancesPython.get('/menu');
        let temp = response.data.items;
        menu.value = temp.filter(item => item.components[0].StackServiceComponents.is_master == true)
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

function handleClickMenu(jenisMenu) {
    visible.value = false
    router.push(jenisMenu)
}

onMounted(() => {
    fetchMenu();
});
</script>

<template>
    <Drawer v-model:visible="visible" :blockScroll="false" :closable="false" modal header="ONYX Big Data Manager"
        :style="{ borderRadius: '8px', marginLeft: '255px', marginTop: '2vh', minWidth: '25vw', maxWidth: '40vw', maxHeight: '90vh' }"
        position="left" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div>
            <DataTable ref="dt" :value="menu" dataKey="id" :paginator="false" :rows="menu.length"
                :totalRecords="menu.length" :loading="loading" class="mb-4">
                <template #empty> N/A </template>
                <template #loading> Loading data. Please wait. </template>
                <Column>
                    <template #body="{ data }">
                        <div @click="handleClickMenu(data.StackServices.service_name)" class="flex items-center"
                            style="cursor: pointer;">
                            <p style="color: #1BA9E1;">{{ data.StackServices.display_name }}</p>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </Drawer>
    <TieredMenu :model="model" />
</template>

<style>
.p-drawer-title {
    font-size: 15px !important;
}
</style>
