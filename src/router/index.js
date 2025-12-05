import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/authStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    mode: 'history',
    history: createWebHistory(),
    publicPath: '/obdm/',
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'home',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/notfound',
                    name: 'notfound',
                    component: () => import('@/views/admin/NotFound.vue')
                },
                {
                    path: '/hosts',
                    name: 'hosts',
                    component: () => import('@/views/admin/Hosts.vue')
                },
                {
                    path: '/stacks',
                    name: 'stacks',
                    component: () => import('@/views/admin/StackVersion.vue')
                },
                {
                    path: '/versions',
                    name: 'versions',
                    component: () => import('@/views/admin/Versions.vue')
                },
                {
                    path: '/accounts',
                    name: 'accounts',
                    component: () => import('@/views/admin/ServiceAccounts.vue')
                },
                {
                    path: '/AIRFLOW',
                    name: 'AIRFLOW',
                    component: () => import('@/views/admin/Airflow.vue')
                },
                {
                    path: '/ATLAS',
                    name: 'ATLAS',
                    component: () => import('@/views/admin/Atlas.vue')
                },
                {
                    path: '/HBASE',
                    name: 'HBASE',
                    component: () => import('@/views/admin/Hbase.vue')
                },
                {
                    path: '/HDFS',
                    name: 'HDFS',
                    component: () => import('@/views/admin/Hdfs.vue')
                },
                {
                    path: '/KUDU',
                    name: 'KUDU',
                    component: () => import('@/views/admin/Kudu.vue')
                },
                {
                    path: '/AMBARI_METRICS',
                    name: 'AMBARI_METRICS',
                    component: () => import('@/views/admin/AmbariMetrics.vue')
                },
                {
                    path: '/AMBARI_INFRA_SOLR',
                    name: 'AMBARI_INFRA_SOLR',
                    component: () => import('@/views/admin/Solr.vue')
                },
                {
                    path: '/DRUID',
                    name: 'DRUID',
                    component: () => import('@/views/admin/Druid.vue')
                },
                {
                    path: '/FLINK',
                    name: 'FLINK',
                    component: () => import('@/views/admin/Flink.vue')
                },
                {
                    path: '/HUE',
                    name: 'HUE',
                    component: () => import('@/views/admin/Hue.vue')
                },
                {
                    path: '/IMPALA',
                    name: 'IMPALA',
                    component: () => import('@/views/admin/Impala.vue')
                },
                {
                    path: '/KAFKA',
                    name: 'KAFKA',
                    component: () => import('@/views/admin/Kafka.vue')
                },
                {
                    path: '/KNOX',
                    name: 'KNOX',
                    component: () => import('@/views/admin/Knox.vue')
                },
                {
                    path: '/KYUUBI',
                    name: 'KYUUBI',
                    component: () => import('@/views/admin/Kyuubi.vue')
                },
                {
                    path: '/MAPREDUCE2',
                    name: 'MAPREDUCE2',
                    component: () => import('@/views/admin/Mapreduce2.vue')
                },
                {
                    path: '/NIFI_REGISTRY',
                    name: 'NIFI_REGISTRY',
                    component: () => import('@/views/admin/NifiRegistry.vue')
                },
                {
                    path: '/OPENSEARCH',
                    name: 'OPENSEARCH',
                    component: () => import('@/views/admin/Opensearch.vue')
                },
                {
                    path: '/RANGER',
                    name: 'RANGER',
                    component: () => import('@/views/admin/Ranger.vue')
                },
                {
                    path: '/RANGER_KMS',
                    name: 'RANGER_KMS',
                    component: () => import('@/views/admin/RangerKms.vue')
                },
                {
                    path: '/REDIS',
                    name: 'REDIS',
                    component: () => import('@/views/admin/Redis.vue')
                },
                {
                    path: '/STORM',
                    name: 'STORM',
                    component: () => import('@/views/admin/Storm.vue')
                },
                {
                    path: '/SUPERSET',
                    name: 'SUPERSET',
                    component: () => import('@/views/admin/Superset.vue')
                },
                {
                    path: '/YARN',
                    name: 'YARN',
                    component: () => import('@/views/admin/Yarn.vue')
                },
                {
                    path: '/ZEPPELIN',
                    name: 'ZEPPELIN',
                    component: () => import('@/views/admin/Zeppelin.vue')
                },
                {
                    path: '/alerts',
                    name: 'alerts',
                    component: () => import('@/views/admin/Alerts.vue')
                },
                {
                    path: '/hostAlerts',
                    name: 'hostAlerts',
                    component: () => import('@/views/admin/HostAlerts.vue')
                },
                {
                    path: '/hostDetail',
                    name: 'hostDetail',
                    component: () => import('@/views/admin/HostDetail.vue')
                },
                {
                    path: '/hostVersions',
                    name: 'hostVersions',
                    component: () => import('@/views/admin/HostVersions.vue')
                },
            ]
        },
        /* {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }, */
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = !!authStore.token; // Check if the token exists

    // If the user is trying to access a protected route
    if (to.path !== '/auth/login' && to.path !== '/forgot' && to.path !== '/reset' && !isAuthenticated) {
        next('/auth/login'); // Redirect to login page
    } else {
        next(); // Proceed to the route
    }
});

export default router;
