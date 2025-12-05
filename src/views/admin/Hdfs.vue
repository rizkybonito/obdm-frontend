<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const links = ref([]);

const fetchQuickLink = async () => {
    try {
        const response = await axiosInstancesPython.get('/quicklink', {
            params: {
                service: 'HDFS'
            }
        });
        links.value = response.data.items[0].QuickLinkInfo.quicklink_data.QuickLinksConfiguration.configuration.links;
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

const fetchComponentService = async () => {
    try {
        const response = await axiosInstancesPython.get('/component-services', {
            params: {
                service: 'YARN'
            }
        });
        links.value = response.data.items.length > 0 ? response.data.items[0].QuickLinkInfo.quicklink_data.QuickLinksConfiguration.configuration.links : [];
    } catch (error) {
        if (error.status == 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
        console.error(error);
    }
};

onMounted(() => {
    fetchQuickLink();
    fetchComponentService();
});


</script>

<template>
    <div class="row">
        <div class="column-left">
            <div class="col-span-12">
                <div>
                    <div class="font-semibold text-xl mt-2 ml-2 mb-2">Summary</div>
                </div>
            </div>
            <div class="mb-4">
                <div class="card" style="height: 77vh;">

                </div>
            </div>
        </div>
        <div class="column-right">
            <div class="col-span-12">
                <div>
                    <div class="font-semibold text-xl mt-2 ml-2 mb-2">Quick Links</div>
                </div>
            </div>
            <div class="card" style="height: 77vh;">
                <DataTable ref="dt" :value="links" dataKey="id" :paginator="false" :rows="links.length" style="border-color: transparent !important;"
                    :totalRecords="links.length" :loading="loading" class="mb-4">
                    <template style="border-color: transparent !important;" #empty> Data not found. </template>
                    <template style="border-color: transparent !important;" #loading> Loading data. Please wait. </template>
                    <Column style="border-color: transparent !important; padding: 3px !important;">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <a href="" style="color: #1BA9E1;">{{ data.label }}</a>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.column-left {
    float: left;
    width: 75%;
    padding-right: 2rem;
}

.column-right {
    float: left;
    width: 25%;
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
