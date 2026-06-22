import Vue from 'vue';
import CrudAdmin from 'crudeshop';
import Localization from 'crudeshop/utilities/Localization';

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

//Holds the translator for the current request. Updated every request, but the
//Vue prototype helpers are installed only once (see below).
let currentTranslator = null;
let translatorInstalled = false;

//Install all translation helpers
const installTranslator = async () => {
    //Refresh the active translator for this request.
    currentTranslator = await CrudAdmin.getTranslator();

    //Install the global Vue.prototype helpers only ONCE. This plugin runs on
    //every SSR request; calling Vue.use({...}) with a fresh object each time
    //grows Vue._installedPlugins unbounded and retains one Translator per
    //request (SSR memory leak). The helpers read `currentTranslator` at call
    //time, so they always use the current request's translator.
    if (translatorInstalled) {
        return;
    }
    translatorInstalled = true;

    var getSelector = function (selector) {
        return function () {
            var a = currentTranslator;
            var s = a && selector in a ? selector : '__';

            return a[s].apply(a, arguments);
        };
    };

    Vue.use({
        install: (Vue, options) => {
            for (var i = 0; i < gettextSelectors.length; i++) {
                Vue.prototype[gettextSelectors[i]] = getSelector(
                    gettextSelectors[i]
                );
            }
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

export default async ({ route, redirect }, inject) => {
    await installTranslator();

    inject('translator', await CrudAdmin.getTranslator());

    if (Localization.isEnabled()) {
        languageRedirector(route, redirect);
    }
};
