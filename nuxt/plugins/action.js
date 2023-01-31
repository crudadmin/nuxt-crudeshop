import { defineNuxtPlugin } from '#app';
import action from '../../src/utilities/action';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use({
        install: (Vue, options) => {
            Vue.mixin({
                methods: {
                    action,
                },
            });
        },
    });

    return {
        provide: {
            action,
        },
    };
});
