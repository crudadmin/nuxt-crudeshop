import { createPinia, setActivePinia } from 'pinia';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin({
    enforce: 'pre',
    setup: (nuxtApp) => {
        const pinia = createPinia();
        nuxtApp.vueApp.use(pinia);
        setActivePinia(pinia);
        if (process.server) {
            nuxtApp.payload.pinia = pinia.state.value;
        } else if (nuxtApp.payload && nuxtApp.payload.pinia) {
            pinia.state.value = nuxtApp.payload.pinia;
        }
        return {
            provide: {
                pinia,
            },
        };
    },
});
