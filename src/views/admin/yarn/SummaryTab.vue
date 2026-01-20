<script setup>
import { ref, onMounted } from 'vue';
import axiosInstancesPython from '@/axiosInstancesPython';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

const router = useRouter();
const loading = ref(false);
const dataSummary = ref([]);
const namenodeSummary = ref([]);
const nodeManager = ref([]);

const fetchSummary = async () => {
  loading.value = true;
  try {
    const { data } = await axiosInstancesPython.get('/service-instances');
    const yarnService = data?.items?.find(
      item => item?.ServiceInfo?.service_name === 'YARN'
    );
    if (!yarnService) {
      dataSummary.value = [];
      namenodeSummary.value = [];
      return;
    }
    dataSummary.value = [yarnService];
    nodeManager.value = JSON.parse(dataSummary.value[0].components[2].ServiceComponentInfo.rm_metrics.cluster.nodeManagers)
    console.log(nodeManager.value)
    namenodeSummary.value =
      yarnService.components?.filter(
        component =>
          component?.ServiceComponentInfo?.component_name === 'NAMENODE'
      ) || [];

  } catch (error) {
    if (error?.response?.status === 401) {
      authStore.clearToken();
      router.push('/auth/login');
      return;
    }
    console.error('Failed to fetch summary:', error);
  } finally {
    loading.value = false;
  }
};

const formatStorage = (bytes) => {
  if (!bytes || bytes <= 0) return '0.00 MB';

  const MB = 1024 ** 2;
  const GB = 1024 ** 3;
  const TB = 1024 ** 4;

  if (bytes < GB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes < TB) return `${(bytes / GB).toFixed(2)} GB`;

  return `${(bytes / TB).toFixed(2)} TB`;
};

const formatPercentage = (value, total) => {
  if (!value || !total || total <= 0) return '0.00%';
  return `${((value / total) * 100).toFixed(2)}%`;
};

const getNameNodeInfo = () => {
  return namenodeSummary.value.length
    ? namenodeSummary.value[0].ServiceComponentInfo
    : null;
};

const getHdfsComponents = () => {
  return dataSummary.value.length
    ? dataSummary.value[0].components || []
    : [];
};

const getStateClass = (state) => {
  if (!state) return 'text-red-500';

  return state.toLowerCase().includes('not')
    ? 'text-red-500'
    : 'text-green-600';
};

const getStatusCounter = (info) => {
  if (!info) return '0/0';

  const state = info.state?.toLowerCase() || '';
  const total = info.total_count ?? 0;

  if (state.includes('started')) {
    return `${info.started_count ?? 0} of ${total}`;
  }

  if (state.includes('installed')) {
    return `${info.installed_count ?? 0} of ${total}`;
  }

  return `0/${total}`;
};

onMounted(() => {
  fetchSummary();
});
</script>

<template>
  <div class="w-full space-y-4">

    <div class="card w-full p-5">
      <div class="font-semibold text-lg mb-4">Summary</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
        <div>Resource Manager Uptime</div>
        <div class="font-medium">
          {{
            getNameNodeInfo()
              ? formatStorage(getNameNodeInfo().CapacityTotal)
              : '0.00 MB'
          }}
        </div>

        <div>Available Memory</div>
        <div class="font-medium text-red-500">
          {{
            getNameNodeInfo()
              ? formatStorage(getNameNodeInfo().CapacityUsed)
              : '0.00 MB'
          }}
          <span class="text-xs text-gray-500">
            (
            {{
              getNameNodeInfo()
                ? formatPercentage(
                  getNameNodeInfo().CapacityUsed,
                  getNameNodeInfo().CapacityTotal
                )
                : '0.00%'
            }}
            )
          </span>
        </div>

        <div>Used Memory</div>
        <div class="font-medium text-red-500">
          {{
            getNameNodeInfo()
              ? formatStorage(getNameNodeInfo().NonDfsUsedSpace)
              : '0.00 MB'
          }}
          <span class="text-xs text-gray-500">
            (
            {{
              getNameNodeInfo()
                ? formatPercentage(
                  getNameNodeInfo().NonDfsUsedSpace,
                  getNameNodeInfo().CapacityTotal
                )
                : '0.00%'
            }}
            )
          </span>
        </div>
      </div>
    </div>

    <div class="card w-full p-5">
  <div class="font-semibold text-lg mb-4">Node Manager Status</div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
    <template v-for="(node, index) in nodeManager">
      <!-- Hostname -->
      <div>
        {{ node.HostName }}
      </div>

      <!-- Status + detail -->
      <div
        class="font-medium flex flex-col md:flex-row md:items-center md:gap-3"
        :class="getStateClass(node.State)"
      >
        <span>
          {{ node.State }}
        </span>

        <span class="text-xs text-gray-500">
          Containers: {{ node.NumContainers }}
          |
          Used: {{ node.UsedMemoryMB }} MB
          /
          Avail: {{ node.AvailableMemoryMB }} MB
        </span>
      </div>
    </template>
  </div>
</div>


    <div class="card w-full p-5">
      <div class="font-semibold text-lg mb-4">Status</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
        <template v-for="(component, index) in getHdfsComponents()" :key="index">
          <div>
            {{ component.ServiceComponentInfo.display_name }}
          </div>

          <div class="font-medium flex items-center gap-2" :class="getStateClass(component.ServiceComponentInfo.state)">
            {{ component.ServiceComponentInfo.state || 'NOT STARTED' }}

            <span class="text-xs text-gray-500">
              {{ getStatusCounter(component.ServiceComponentInfo) }}
            </span>
          </div>
        </template>
      </div>
    </div>


  </div>
</template>
