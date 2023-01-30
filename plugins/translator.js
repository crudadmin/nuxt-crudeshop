import { defineNuxtPlugin } from '#app';

import CrudAdmin from '../crudadmin';
import Localization from '../utilities/Localization';

const gettextSelectors = [
    '__',
    'Gettext',
    'd__',
    'dgettext',
    'dngettext',
    'dnp__',
    'dnpgettext',
    'dp__',
    'dpgettext',
    'gettext',
    'n__',
    'ngettext',
    'np__',
    'npgettext',
    'p__',
    'pgettext',
];

//Install all translation helpers
const installTranslator = async (vueApp) => {
    var a = await CrudAdmin.getTranslator(),
        getSelector = function (selector) {
            return function () {
                var s = selector in a ? selector : '__';

                return a[s].apply(a, arguments);
            };
        };

    vueApp.use({
        install: (Vue, options) => {
            let methods = {};

            for (var i = 0; i < gettextSelectors.length; i++) {
                methods[gettextSelectors[i]] = getSelector(gettextSelectors[i]);
            }

            vueApp.mixin({
                methods: methods,
            });
        },
    });
};

const languageRedirector = (route, redirect) => {
    if (Localization.isEnabled() == false) {
        return;
    }

    let actualSegment = Localization.getValidUrlLangSegment(route.path),
        defaultLanguageSlug = Localization.getDefaultLanguage().slug;

    //We cannot use default slug as segment. In this case we need redirect and switch to the default language
    if (actualSegment && actualSegment == defaultLanguageSlug) {
        Localization.setLocalization(actualSegment);

        redirect('/');
    }

    //If no valid segment is present in url, but is not default language
    //The nwe need redirect user do the selected lang slug
    else if (
        !actualSegment &&
        Localization.get().slug !== Localization.getDefaultLanguage().slug
    ) {
        redirect('/' + Localization.get().slug);
    }
};

export default defineNuxtPlugin(async ({ route, redirect, vueApp, hook }) => {
    await installTranslator(vueApp);

    if (Localization.isEnabled()) {
        languageRedirector(route, redirect);
    }

    return {
        provide: {
            translator: await CrudAdmin.getTranslator(),
        },
    };
});
