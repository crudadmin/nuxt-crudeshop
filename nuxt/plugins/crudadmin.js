import { defineNuxtPlugin } from '#app';
import crudadmin from '../../src/crudadmin';

export default defineNuxtPlugin(async (nuxtApp) => {
    //Boot app
    await crudadmin.boot();

    return {
        provide: {
            crudadmin: crudadmin,
        },
    };
});
