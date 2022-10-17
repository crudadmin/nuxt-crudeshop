const _ = require('lodash');
const crudadmin = require('../crudadmin.js');

module.exports = {
    languageSlug: null,

    localizationKey: 'localization',

    path: null,

    setPath(path) {
        this.path = path;

        return this;
    },

    initialize(currentPath) {
        if (this.isEnabled() == true) {
            //Initialize localization on ssr and also client
            this.setPath(currentPath || this.path);

            let language = this.get(false);

            this.languageSlug = language ? language.slug : null;

            //Get first segment, if it is valid language slug. we can return this value
            let slug = this.getValidLangSegment(this.path);

            //If slug has been changed
            if (slug && slug != this.languageSlug) {
                this.setLocalization(slug);
            }
        }

        return this;
    },

    isEnabled() {
        let languages = this.all();

        return languages && languages.length >= 1;
    },

    setLocalization(slug) {
        let storage = crudadmin.getStorage();

        //We does not save default slug into storage.
        //Because when we will be sending default storage as header and we dont do want that.
        if (this.isDefaultLanguage(slug) === true) {
            storage.removeUniversal(this.localizationKey);
        }

        // Set slug if has been changed
        else if (storage.getUniversal(this.localizationKey) !== slug) {
            storage.setUniversal(this.localizationKey, slug);
        }

        this.languageSlug = slug;
    },

    get(cache = true) {
        let languages = this.all();

        if (cache == true && this.languageSlug) {
            return _.find(languages, { slug: this.languageSlug });
        }

        return (
            _.find(languages, { slug: this.getSlugFromStorage() }) ||
            languages[0]
        );
    },

    getSlugFromStorage() {
        let storage = crudadmin.getStorage();

        return storage.getUniversal(this.localizationKey);
    },

    getDefaultLanguage() {
        return this.all()[0];
    },

    all() {
        return crudadmin.languages || [];
    },

    isDefaultLanguage(slug) {
        return this.getDefaultLanguage().slug == (slug || this.get().slug);
    },

    async rewriteRoutes(routes) {
        var translator = await crudadmin.getTranslator();

        //We does not want to rewrite routes, it may be buggy
        //We need remove unique duplicates from beggining, latest routes are
        //final. Because we may add new routes from extendRoutes method in nuxt.config.js
        routes = _.uniqBy(_.cloneDeep(routes).reverse(), (route) => {
            return route.name;
        }).reverse();

        routes = routes.map((route) => {
            //Translate routes from backend
            route.meta = {
                ...(route.meta || {}),
                _original: route.path,
            };

            route.path = translator.__(route.path);

            return route;
        });

        return await this.asyncAddSlugIntoRoutes(routes);
    },

    async asyncAddSlugIntoRoutes(routes) {
        if (this.isEnabled() == false) {
            return routes;
        }

        //We does not want to add prefix for default language
        if (this.isDefaultLanguage()) {
            return routes;
        }

        routes = routes.map((route) => {
            route.path = '/' + this.get().slug + route.path;

            return route;
        });

        return routes;
    },

    getValidLangSegment(path) {
        return [(path + '').split('/').filter((item) => item)[0]].filter(
            (slug) => _.find(this.all(), { slug })
        )[0];
    },

    getLocaleHeaders(obj = {}) {
        var _localeSlug;

        if ((_localeSlug = this.getSlugFromStorage())) {
            obj['App-Locale'] = _localeSlug;
        }

        return obj;
    },
};
