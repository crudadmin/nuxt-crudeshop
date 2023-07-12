const _ = require('lodash');
const crudadmin = require('../crudadmin.js');

module.exports = {
    languageSlug: null,

    localizationKey: 'localization',

    initialize(ssrContext) {
        if (this.isEnabled() == true) {
            let language = this.get(false);

            if (language) {
                this.setLocalization(language.slug);
            }
        }

        return this;
    },

    getHost() {
        let host = '';

        if (crudadmin.context) {
            host = crudadmin.context.req.headers.host;
        } else if (typeof window == 'object') {
            host = window.location.host;
        }

        return (host.split(':')[0] || '').replace('www.', '');
    },

    getDomainName() {
        return (this.getHost() + '').split('.').pop();
    },

    getPath() {
        if (crudadmin.context) {
            return crudadmin.context.req.url;
        } else if (typeof window == 'object') {
            return window.location.pathname;
        }
    },

    isEnabled() {
        let languages = this.all();

        return languages && languages.length >= 1;
    },

    setLocalization(slug) {
        let storage = crudadmin.getStorage();

        // Set slug if has been changed
        if (storage.getUniversal(this.localizationKey) !== slug) {
            storage.setUniversal(this.localizationKey, slug);
        }

        this.languageSlug = slug;
    },

    get(cache = true) {
        let languages = this.all(),
            urlLang,
            storageLang,
            storageLangSlug = this.getSlugFromStorage();

        //Cached language
        if (cache == true && this.languageSlug) {
            return _.find(languages, { slug: this.languageSlug });
        }

        //Get language by domain name
        let domainLang = this.getValidDomainLang();
        if (domainLang) {
            return domainLang;
        }

        //Get first segment, if it is valid language slug. we can return this value
        let urlSlug = this.getValidUrlLangSegment();
        if (urlSlug && (urlLang = _.find(languages, { slug: urlSlug }))) {
            return urlLang;
        }

        //Get selected language from storage
        if (
            storageLangSlug &&
            (storageLang = _.find(languages, { slug: storageLangSlug }))
        ) {
            return storageLang;
        }

        //Return default first language
        return languages[0];
    },

    getSlugFromStorage() {
        let storage = crudadmin.getStorage();

        return storage.getUniversal(this.localizationKey);
    },

    getDefaultLanguage() {
        return this.all()[0];
    },

    all() {
        var languages = crudadmin.languages || [],
            domainName = this.getDomainName(),
            host = this.getHost();

        languages = languages.sort((lang) => {
            return lang.domain == host || lang.slug == domainName ? -1 : 1;
        });

        return languages;
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

    getValidUrlLangSegment() {
        let path = this.getPath(),
            all = this.all();

        return [(path + '').split('/').filter((item) => item)[0]].filter(
            (slug) => _.find(all, { slug })
        )[0];
    },

    getValidDomainLang() {
        let all = this.all(),
            domainName = this.getDomainName(),
            domainLanguage =
                _.find(all, { domain: this.getHost() }) ||
                _.find(all, { slug: domainName });

        return domainLanguage;
    },

    getLocaleHeaders(obj = {}) {
        var _locale;

        if ((_locale = this.get())) {
            obj['App-Locale'] = _locale.slug;
        }

        return obj;
    },
};
