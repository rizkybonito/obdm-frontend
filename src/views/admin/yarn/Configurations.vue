<script setup>
import { ref, onMounted, watch } from 'vue'
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
            params: { service: 'HDFS' }
        })

        dataConfig.value = response.data.items[0].configurations
        formData.value = {}
        formData.value.namenode_dir = dataConfig.value[11].properties['dfs.namenode.name.dir']
        formData.value.namenode_heapsize = dataConfig.value[0].properties['namenode_heapsize']
        formData.value.namenode_serverthreads = dataConfig.value[11].properties['dfs.namenode.handler.count']
        formData.value.namenode_minimumreplicated = dataConfig.value[11].properties['dfs.namenode.safemode.threshold-pct'] * 100
        formData.value.datanode_dir = dataConfig.value[11].properties['dfs.datanode.data.dir']
        formData.value.datanode_disktolerance = dataConfig.value[11].properties['dfs.datanode.failed.volumes.tolerated']
        formData.value.datanode_heapsize = dataConfig.value[0].properties['dtnode_heapsize']
        formData.value.datanode_maxtransferthreads = dataConfig.value[11].properties['dfs.datanode.max.transfer.threads'] 

        /* formData.value = {}
        dataConfig.value.forEach(item => {
            formData.value[item.key] = item.value
        }) */

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

    // Example POST
    // await axiosInstancesPython.post('/configurations', {
    //   service: 'HDFS',
    //   data: formData.value
    // })
}

onMounted(fetchData)
</script>


<template>

    <div v-if="loading" class="m-4">Loading...</div>

    <form v-else @submit.prevent="submitForm">
        <div class="card p-4">
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3"
                    class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1 font-semibold">NameNode
                </label>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">NameNode
                    directories</label>
                <div class="col-span-12 md:col-span-9">
                    <InputText v-model="formData.namenode_dir" type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">NameNode Java heap
                    size</label>
                <div class="col-span-12 md:col-span-9">
                    <InputText v-model="formData.namenode_heapsize" type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">NameNode Server
                    threads</label>
                <div class="col-span-12 md:col-span-9">
                    <InputText v-model="formData.namenode_serverthreads" type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">Minimum replicated blocks</label>
                <div class="col-span-3 md:col-span-3">
                    <InputGroup>
                        <InputNumber v-model="formData.namenode_minimumreplicated" />
                        <InputGroupAddon>%</InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </div>
        <div class="card p-4">
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3"
                    class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1 font-semibold">DataNode
                </label>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">DataNode
                    directories</label>
                <div class="col-span-12 md:col-span-9">
                    <InputText v-model="formData.datanode_dir" type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">DataNode failed disk tolerance
                    size</label>
                <div class="col-span-12 md:col-span-9">
                    <InputText v-model="formData.datanode_disktolerance" type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">DataNode maximum Java heap size
                    threads</label>
                <div class="col-span-12 md:col-span-9">
                    <InputText v-model="formData.datanode_heapsize" type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2 m-3">
                <label for="name3" class="flex items-center col-span-12 mb-2 md:col-span-3 md:mb-1">DataNode max data transfer threads</label>
                <div class="col-span-3 md:col-span-3">
                    <InputGroup>
                        <InputNumber v-model="formData.datanode_maxtransferthreads" />
                    </InputGroup>
                </div>
            </div>
        </div>
        <div class="flex justify-end mt-4 mr-2">
            <Button label="Save" type="submit" class="btn-green" />
        </div>

    </form>
</template>
