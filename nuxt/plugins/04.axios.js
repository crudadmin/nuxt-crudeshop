import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(({ vueApp }) => {
    return {
        provide: {
            axios: useAxios(),
        },
    };
});
