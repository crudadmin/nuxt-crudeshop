import { defineNuxtPlugin } from '#app';

import Translator from '../../src/utilities/Translator';

export default defineNuxtPlugin(async ({ route, redirect, vueApp, hook }) => {
    let $translator = new Translator(() => {
        return useCrudadminStore().translates;
    });

    await $translator.install(vueApp);

    // if (Localization.isEnabled()) {
    //     await Localization.installDefaultLocaleRedirect(route, redirect);
    // }

    return {
        provide: {
            translator: $translator,
        },
    };
});
