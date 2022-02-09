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

    initialize() {
        if (this.isEnabled() == false) {
            return;
        }

        let language = this.get(false);

        this.languageSlug = language ? language.slug : null;

        //Get first segment, if it is valid language slug. we can return this value
        let slug = this.getValidLangSegment(this.path);

        //If slug has been changed
        if (slug && slug != this.languageSlug) {
            this.setLocalization(slug);
        }
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

        //Set slug if has been changed
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

    async rewriteRoutes(routes, currentPath) {
        var translator = await crudadmin.getTranslator();

        //Initialize localization on ssr and also client
        this.setPath(currentPath || this.path).initialize();

        //Translate routes from backend
        for (var key in routes) {
            routes[key].meta = {
                ...(routes[key].meta || {}),
                _original: routes[key].path,
            };

            routes[key].path = translator.__(routes[key].path);
        }

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

        routes = routes.map(route => {
            route.path = '/' + this.get().slug + route.path;

            return route;
        });

        return routes;
    },

    getValidLangSegment(path) {
        return [(path + '').split('/').filter(item => item)[0]].filter(slug =>
            _.find(this.all(), { slug })
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
