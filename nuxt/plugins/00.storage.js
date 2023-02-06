import { defineNuxtPlugin } from '#app';

import Storage from '../utils/Storage';

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            storage: new Storage(),
        },
    };
});
