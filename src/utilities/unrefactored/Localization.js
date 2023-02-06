import _ from 'lodash';
import crudadmin from '../crudadmin.js';
import Translator from './Translator.js';

export default {
    languageSlug: null,

    localizationKey: 'localization',

    translator: null,

    gettextSelectors: [
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
    ],

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

        return host.split(':')[0];
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

        //Get language by domain name
        let domainLang = this.getValidDomainLang();
        if (domainLang) {
            return domainLang;
        }

        //Return default first language
        return languages[0];
    },

    getSlugFromStorage() {
        //TODO:
        // let storage = crudadmin.getStorage();
        // return storage.getUniversal(this.localizationKey);
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

    async getRewritedRoutes(routes) {
        // var translator = await Translator.getTranslator();

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

        routes = await this.asyncAddSlugIntoRoutes(routes);

        return routes;
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

    async installDefaultLocaleRedirect(route, redirect) {
        if (this.isEnabled() == false) {
            return;
        }

        let actualSegment = this.getValidUrlLangSegment(route.path),
            defaultLanguageSlug = this.getDefaultLanguage().slug;

        //We cannot use default slug as segment. In this case we need redirect and switch to the default language
        if (actualSegment && actualSegment == defaultLanguageSlug) {
            this.setLocalization(actualSegment);

            redirect('/');
        }

        //If no valid segment is present in url, but is not default language
        //The nwe need redirect user do the selected lang slug
        else if (
            !actualSegment &&
            this.get().slug !== this.getDefaultLanguage().slug
        ) {
            redirect('/' + this.get().slug);
        }
    },
};
