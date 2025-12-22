// src/stores/authStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        clusterName: null,
        user: null
    }),
    actions: {
        setToken(newToken) {
            this.token = newToken;
        },
        setClusterName(newClusterName) {
            this.clusterName = newClusterName;
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
