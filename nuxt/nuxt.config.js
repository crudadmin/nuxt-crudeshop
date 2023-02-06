import { createResolver } from '@nuxt/kit';
const { resolve } = createResolver(import.meta.url);

export default {
    modules: [resolve('./module.js')],

    modules: [
        [
            '@pinia/nuxt',
            {
                autoImports: ['defineStore', 'acceptHMRUpdate'],
            },
        ],
    ],

    imports: {
        dirs: ['stores'],
    },
};
