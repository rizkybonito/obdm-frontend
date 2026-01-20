<script setup>
import { ref, onMounted } from 'vue'
import axiosInstancesPython from '@/axiosInstancesPython'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const dataConfig = ref([])
const formData = ref({})
const loading = ref(false)

const fetchData = async () => {
    loading.value = true
    try {
        const response = await axiosInstancesPython.get('/configurations', {
            params: { service: 'HBASE' }
        })

        dataConfig.value = response.data.items[0].configurations
        formData.value = {}

        formData.value.namenode_dir = dataConfig.value[11].properties['dfs.namenode.name.dir']
        formData.value.namenode_heapsize = dataConfig.value[0].properties['namenode_heapsize']
        formData.value.namenode_serverthreads = dataConfig.value[11].properties['dfs.namenode.handler.count']
        formData.value.namenode_minimumreplicated =
            dataConfig.value[11].properties['dfs.namenode.safemode.threshold-pct'] * 100
        formData.value.datanode_dir = dataConfig.value[11].properties['dfs.datanode.data.dir']
        formData.value.datanode_disktolerance =
            dataConfig.value[11].properties['dfs.datanode.failed.volumes.tolerated']
        formData.value.datanode_heapsize = dataConfig.value[0].properties['dtnode_heapsize']
        formData.value.datanode_maxtransferthreads =
            dataConfig.value[11].properties['dfs.datanode.max.transfer.threads']

    } catch (error) {
        if (error.response?.status === 401) {
            authStore.clearToken()
            router.push('/auth/login')
        }
    } finally {
        loading.value = false
    }
}

const submitForm = async () => {
    console.log('Submitted data:', formData.value)
}

onMounted(fetchData)
</script>

<template>
    <div v-if="loading" class="m-4">Loading...</div>

    <form v-else @submit.prevent="submitForm">
        <div class="card p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 m-4">

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        HBase Master Maximum Memory
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputText v-model="formData.namenode_dir" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        HBase RegionServer Maximum Memory
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputText v-model="formData.namenode_heapsize" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        % of RegionServer Allocated to Read Buffers
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputGroup class="w-full">
                            <InputNumber v-model="formData.namenode_minimumreplicated" />
                            <InputGroupAddon>%</InputGroupAddon>
                        </InputGroup>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Memstore Flush Size
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        HBase Region Block Multiplier
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Number of Handlers per RegionServer
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_serverthreads" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Maximum Client Retries
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Maximum Record Size
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Maximum Region File Size
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Major Compaction Interval
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Maximum Files for Compaction
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Zookeeper Session Timeout
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        HBase RPC Timeout
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Enable Authentication
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Enable Authorization
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Enable Phoenix
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Phoenix Query Timeout
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-2">
                    <label class="col-span-12 md:col-span-5 flex items-center">
                        Number of Phoenix Index Handlers per RegionServer
                    </label>
                    <div class="col-span-12 md:col-span-7">
                        <InputNumber v-model="formData.namenode_minimumreplicated" class="w-full" />
                    </div>
                </div>

            </div>
        </div>

        <div class="flex justify-end mt-4 mr-2">
            <Button label="Save" type="submit" class="btn-green" />
        </div>
    </form>
</template>
