import Translator from 'gettext-translator';
import cartToken from './utilities/cartToken';
import { $axios } from './utilities/axios';

export default {
    booted: false,

    $axios: null,

    $auth: null,

    context: null,

    response: null,

    translator: null,

    translates: [],

    languages: [],

    routes: [],

    seoRoutes: [],

    store: null,

    identifiers: {},

    addIdentifier(name, classReference) {
        if (!(name in this.identifiers)) {
            this.identifiers[name] = new classReference();
        }
    },

    getAuth() {
        //Return booted actual auth object
        if (typeof $nuxt == 'object') {
            return $nuxt.$auth;
        }

        return this.$auth;
    },

    getStorage() {
        return this.getAuth().$storage;
    },

    getAuthorizationHeaders() {
        var auth = this.getAuth(),
            obj = {},
            _authToken,
            _cartToken;

        // if ((_authToken = auth.getStrategy('local').token.get())) {
        //     obj['Authorization'] = _authToken;
        // }

        // if ((_cartToken = cartToken.getCartToken(auth.$storage))) {
        //     obj['Cart-Token'] = _cartToken;
        // }

        return obj;
    },

    async boot() {
        if (this.booted === true) {
            return;
        }

        this.response = await useNuxtApp().$axios.$get('/api/bootstrap');
        // this.response = window.__NUXT__.caResponse;

        this.setBootstrapResponse(this.response.data || {});

        return this;
    },

    setBootstrapResponse(bootstrap) {
        //Refresh/save cart token
        if (bootstrap.cart_token) {
            this.setCartToken(bootstrap.cart_token);
        }

        this.setTranslates(bootstrap.translates);

        this.routes = bootstrap.routes;

        this.languages = bootstrap.languages;

        this.seoRoutes = bootstrap.seo_routes || [];

        this.booted = true;
    },

    bootStore(store, app) {
        this.store = store;

        let data = this.response.data.store;

        if (!data || data.length == 0) {
            return;
        }

        for (var key in data) {
            store.commit(key, data[key]);
        }
    },

    async getTranslator() {
        await this.boot();

        return (this.translator = new Translator(this.translates));
    },

    setTranslates(translates) {
        if (typeof translates == 'string') {
            translates = JSON.parse(translates);
        }

        this.translates = translates;
    },

    setCartToken(token) {
        cartToken.refreshToken(this.getStorage(), token);
    },
};
