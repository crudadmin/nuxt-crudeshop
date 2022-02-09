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

//Install all translation helpers
const installTranslator = async () => {
    var a = await CrudAdmin.getTranslator(),
        getSelector = function(selector) {
            return function() {
                var s = selector in a ? selector : '__';

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

    let actualSegment = Localization.getValidLangSegment(route.path),
        defaultLanguageSlug = Localization.all()[0].slug;

    //We cannot use default slug as segment. In this case we need redirect and switch to the default language
    if (actualSegment && actualSegment == defaultLanguageSlug) {
        Localization.setLocalization(actualSegment);

        console.log('redirecting', actualSegment);

        redirect('/');
    }

    //If no valid segment is present in url, but is not default language
    //The nwe need redirect user do the selected lang slug
    else if (
        !actualSegment &&
        Localization.get().slug !== Localization.all()[0].slug
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
