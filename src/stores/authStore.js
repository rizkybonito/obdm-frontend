// src/stores/authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        user: null
    }),
    actions: {
        setToken(newToken) {
            this.token = newToken;
        },
        setUser(newUser) {
            this.user = newUser;
        },
        clearToken() {
            this.token = null;
            this.user = null;
        }
    },
    persist: true
});
