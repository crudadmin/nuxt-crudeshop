import { defineNuxtPlugin } from '#app';
import { createAxios } from '../../src/utilities/axios';

export default defineNuxtPlugin((nuxtApp) => {
    const $axios = createAxios({
        baseURL: useRuntimeConfig().API_URL,
    });

    return {
        provide: {
            axios: $axios,
        },
    };
});
