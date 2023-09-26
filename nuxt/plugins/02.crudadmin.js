import { defineNuxtPlugin } from '#app';

export const config = {
    test: 1,
};

export default defineNuxtPlugin({
    enforce: 'pre',
    setup: async (nuxtApp) => {
        await useCrudadminStore().boot();
    },
});
