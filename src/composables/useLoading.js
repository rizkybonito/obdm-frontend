import { ref } from 'vue';

const loading = ref(false);

export function useLoading() {
    function startLoading() {
        loading.value = true;
    }

    function stopLoading() {
        loading.value = false;
    }

    return {
        loading,
        startLoading,
        stopLoading,
    };
}
