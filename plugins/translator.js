import Vue from 'vue';
import CrudAdmin from 'crudeshop';

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

export default async ({}, inject) => {
    await installTranslator();

    inject('translator', await CrudAdmin.getTranslator());
};
