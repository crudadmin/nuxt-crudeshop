import { defineNuxtPlugin } from '#app';

import Localization from '../../src/utilities/Localization';

export default defineNuxtPlugin(async ({ route, redirect, vueApp, hook }) => {
    await Localization.install(vueApp);

    if (Localization.isEnabled()) {
        await Localization.installDefaultLocaleRedirect(route, redirect);
    }

    return {
        provide: {
            translator: await Localization.getTranslator(),
        },
    };
});
