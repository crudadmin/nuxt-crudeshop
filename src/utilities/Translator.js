import $GettextTranslator from 'gettext-translator';

//Nuxt 3 loader fix
const GettextTranslator = $GettextTranslator.default || $GettextTranslator;

export default class Translator {
    constructor(rawTranslates) {
        this.rawTranslates = rawTranslates;

        this.gettextSelectors = [
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
    }

    async install(vueApp) {
        vueApp.use({
            install: async (Vue, options) => {
                var _this = this,
                    getSelector = function (selector) {
                        return function () {
                            let a = _this.getTranslator(_this.rawTranslates);
                            var s = selector in a ? selector : '__';

                            return a[s].apply(a, arguments);
                        };
                    };

                let methods = {};

                for (var i = 0; i < this.gettextSelectors.length; i++) {
                    methods[this.gettextSelectors[i]] = getSelector(
                        this.gettextSelectors[i]
                    );
                }

                Vue.mixin({
                    methods: methods,
                });
            },
        });
    }

    getTranslator(translates) {
        translates = translates || this.rawTranslates;

        if (this._translator) {
            return this._translator;
        }

        //Boot localization
        translates = this.getTranslates(translates);

        return (this._translator = new GettextTranslator(translates));
    }

    getTranslates(translates) {
        if (this._translates) {
            return this._translates;
        }

        return (this._translates =
            typeof translates == 'function' ? translates() : translates);
    }
}
