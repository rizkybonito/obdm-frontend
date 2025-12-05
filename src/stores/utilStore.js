// src/stores/utilStore.js
import { defineStore } from 'pinia';

export const useUtilStore = defineStore('util', {
    state: () => ({
        host: null,
        menu: null,
        services: null,
        alertComponent: null,
        alertCount: 0,
    }),
    actions: {
        setHost(newHost) {
            this.host = newHost;
        },
        setMenu(newMenu) {
            this.menu = newMenu;
        },
        setAlertComponent(newAlertComponent) {
            this.alertComponent = newAlertComponent;
        },
        setAlertCount(newAlertCount) {
            this.alertCount = newAlertCount;
        },
        setServices(newServices) {
            this.services = newServices;
        }
    },
    persist: true
});
