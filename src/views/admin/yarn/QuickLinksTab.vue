<template>
    <div class="card" style="height: 60vh;">
        <div class="font-semibold text-xl">Quick Links</div>
        <DataTable 
            :value="links" 
            dataKey="id" 
            :paginator="false" 
            :rows="links.length" 
            :loading="loading"
            class="mb-1 custom-table"
        >
            <template #empty> Data not found. </template>
            <template #loading> Loading data. Please wait. </template>
            <Column>
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <a :href="data.url" target="_blank" style="color: #1BA9E1;">
                            {{ data.label }}
                        </a>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
defineProps({
    links: Array,
    loading: Boolean
});
</script>

<style scoped>
:deep(.p-datatable-tbody > tr > td) {
    border-color: transparent !important;
    padding: 3px !important;
}
</style>