<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const props = defineProps({
    diskUsage: Array,
    hdfsUsage: [Number, String], 
    nameNodeHeap: [Number, String],
    dataNodes: Number,
    liveDataNodes: Number,
    namenodeRpc: [Number, String],
    namenodeCpuWio: Number,
    namenodeTime: String
});
const loading = ref(false);
const selectedTime = ref('1h');
const times = ref([
    { name: 'Last 1 hour', code: '1h' },
    { name: 'Last 6 hours', code: '6h' },
    { name: 'Last 1 day', code: '1d' }
]);

const handleTimeChange = (event) => {
    console.log("Time changed to:", event.value);
};

const handleClickMenu = (service) => {
    console.log("Service clicked:", service);
};
</script>

<template>
    <div class="row">

        <div class="column-right">
            <div class="grid grid-cols-12 gap-8">
                <div class="col-span-12 xl:col-span-4">
                    <Select v-model="selectedTime" :options="times" optionValue="code" optionLabel="name"
                        @change="handleTimeChange" style="max-width: 150px; float: right;" class="w-full" />
                </div>

                <div class="col-span-12 xl:col-span-4">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">HDFS Disk Usage</div>
                        <div class="flex justify-center items-center h-40">
                            <Knob :size="140" :model-value="Number(hdfsUsage)" readonly />
                        </div>
                    </div>
                </div>

                <div class="col-span-12 xl:col-span-4">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">NameNode Heap</div>
                        <div class="flex justify-center items-center h-40">
                            <Knob :size="140" :model-value="Number(nameNodeHeap)" readonly />
                        </div>
                    </div>
                </div>

                <div class="col-span-12 xl:col-span-4">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">NameNode CPU WIO</div>
                        <div class="flex justify-center items-center h-40">
                            <Knob :size="140" :model-value="Number(namenodeCpuWio)" readonly />
                        </div>
                    </div>
                </div>

                <div class="col-span-12 xl:col-span-4">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">NameNode RPC</div>
                        <div class="flex justify-center items-center h-40 text-2xl">
                            {{ namenodeRpc }} ms
                        </div>
                    </div>
                </div>

                <div class="col-span-12 xl:col-span-4">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">NameNode Uptime</div>
                        <div class="flex justify-center items-center h-40 text-2xl">
                            {{ namenodeTime }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>