import _ from 'lodash';

export default {
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

    getMode() {
        let mode = useGetLocalesConfig().type;

        return ['domain', 'slug'].includes(mode) ? mode : 'slug';
    },

    getHost() {
        let host = useRequestURL().host;

        return host.split(':')[0];
    },

    getDomainName() {
        return (this.getHost() + '').split('.').pop();
    },

    getPath() {
        return useRequestURL().pathname;
    },

    isEnabled() {
        let languages = this.all();

        return languages && languages.length >= 1;
    },

    setLocalization(slug) {
        let $storage = useStorage();

        // Set slug if has been changed
        if ($storage.get(this.localizationKey) !== slug) {
            $storage.set(this.localizationKey, slug);
        }

        this.languageSlug = slug;
    },

    getSlug(cache = true) {
        let locales = useGetLocales(),
            mode = this.getMode();

        //Cached language
        if (cache == true && this.languageSlug) {
            return this.languageSlug;
        }

        if (mode == 'domain') {
            //Get language by domain name
            let domainSlug = this.getValidDomainSlug();

            if (domainSlug) {
                return domainSlug;
            }
        } else {
            //Get first segment, if it is valid language slug. we can return this value
            let urlSlug = this.getValidUrlLangSegment();
            if (urlSlug) {
                return urlSlug;
            }

            //Get selected language from storage
            let storageLangSlug = this.getSlugFromStorage();
            if (storageLangSlug && storageLangSlug in locales) {
                return storageLangSlug;
            }
        }

        //Return default first language
        return Object.keys(locales)[0];
    },

    get(cache = true) {
        let languages = this.all(),
            slug = this.getSlug();

        return _.find(languages, { slug: this.languageSlug });
    },

    getSlugFromStorage() {
        return useStorage().get(this.localizationKey);
    },

    getDefaultLanguage() {
        return this.all()[0];
    },

    all() {
        var languages = useCrudadminStore().languages || [],
            domainName = this.getDomainName(),
            host = this.getHost();

        languages = languages.sort((lang) => {
            return lang.domain == host || lang.slug == domainName ? -1 : 1;
        });

        return languages;
    },

    isDefaultLanguage(slug) {
        return this.getDefaultLanguage().slug == (slug || this.getSlug());
    },

    getRewritedRoutes(routes) {
        const translator = useTranslator();

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

        routes = this.asyncAddSlugIntoRoutes(routes);

        return routes;
    },

    asyncAddSlugIntoRoutes(routes) {
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
            locales = useGetLocales();

        return [(path + '').split('/').filter((item) => item)[0]].filter(
            (slug) => slug in locales
        )[0];
    },

    getValidDomainSlug() {
        let locales = useGetLocales(),
            domainName = this.getDomainName(),
            host = this.getHost();

        for (let slug in locales) {
            if (locales[slug].includes(host)) {
                return slug;
            }
        }

        if (domainName in locales) {
            return domainName;
        }
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
