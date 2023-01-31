import { defineNuxtPlugin } from '#app';

// import Vue from 'vue';

// const $bus = new Vue();

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            // bus: $bus,
        },
    };
});
