<template>
    <div v-if="message" :class="messageClass" class="response-message">
        {{ message }}
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'success',
        validator: (value) => ['success', 'error'].includes(value)
    }
});

const messageClass = computed(() => ({
    'bg-green-100 text-green-700 border-green-500': props.type === 'success',
    'bg-red-100 text-red-700 border-red-500': props.type === 'error'
}));
</script>

<style scoped>
.response-message {
    padding: 10px;
    margin: 10px 0;
    border: 1px solid;
    border-radius: 5px;
}
</style>
