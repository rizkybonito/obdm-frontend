<script setup>
import { ref, onMounted } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
import { useUtilStore } from '@/stores/utilStore';
const authStore = useAuthStore();

const router = useRouter();
const hosts = ref([]);
const loading = ref(false);
const dataSummary = ref([]);


const fetchSummary = async () => {
    loading.value = true;
    try {
        const response = await axiosInstancesPython.get('/service-instances');
        dataSummary = response.data.items.filter((item) => 
            item.ServiceInfo.service_name == 'HDFS'
        );
        console.log(dataSummary)
        
    } catch (error) {
        if (error.response?.status === 401) {
            authStore.clearToken();
            router.push('/auth/login');
        }
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchSummary();
});
</script>


<template>
  <div class="w-full space-y-4">

    <div class="card w-full p-5">
      <div class="font-semibold text-lg mb-4">HDFS Summary</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
        <div>Total Capacity</div>
        <div class="font-medium">{{ 0 }}</div>

        <div>Used</div>
        <div class="font-medium text-red-500">{{ 0 }}</div>

        <div>Free</div>
        <div class="font-medium text-green-500">{{ 0 }}</div>

        <div>Total Files</div>
        <div class="font-medium">{{ 0 }}</div>
      </div>
    </div>

    <div class="card w-full p-5">
      <div class="font-semibold text-lg mb-4">Health Status</div>

      <div class="flex items-center gap-3 text-sm">
        <span
          class="w-3 h-3 rounded-full"
          :class="healthColor"
        ></span>
        <span class="font-medium">{{  }}</span>
      </div>

      <div class="text-xs text-gray-500 mt-2">
        Last checked: {{  }}
      </div>
    </div>

    <div class="card w-full p-5">
      <div class="font-semibold text-lg mb-4">Hosts</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
        <div>Total Hosts</div>
        <div class="font-medium">{{  }}</div>

        <div>Live</div>
        <div class="font-medium text-green-500">{{  }}</div>

        <div>Dead</div>
        <div class="font-medium text-red-500">{{  }}</div>
      </div>
    </div>

  </div>
</template>
