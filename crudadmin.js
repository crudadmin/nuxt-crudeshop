const Translator = require('gettext-translator').default;
const cartToken = require('./utilities/cartToken');
const axiosMutator = require('./utilities/axiosMutator');

const CrudAdmin = {
    booted: false,

    $axios: null,

    $auth: null,

    context: null,

    response: null,

    translator: null,

    translates: [],

    routes: [],

    store: null,

    identifiers: {},

    /**
     * We need reset this data on each new request
     */
    setNewInstance() {
        this.$auth = null;

        this.booted = false;

        this.context = null;
    },

    addIdentifier(name, classReference) {
        if (!(name in this.identifiers)) {
            this.identifiers[name] = new classReference();
        }
    },

    setContext(context) {
        this.context = context;
    },

    setAuth($auth) {
        let obj = this.context || {};

        $auth(obj, () => {});

        this.$auth = obj.$auth;
    },

    setAxios($axios) {
        $axios(this, () => {});
    },

    getAuth() {
        //Return booted actual auth object
        if (typeof $nuxt == 'object') {
            return $nuxt.$auth;
        }

        return this.$auth;
    },

    getAuthorizationHeaders() {
        var auth = this.getAuth(),
            obj = {},
            _authToken,
            _cartToken;

        if ((_authToken = auth.getStrategy('local').token.get())) {
            obj['Authorization'] = _authToken;
        }

        if ((_cartToken = cartToken.getCartToken(auth.$storage))) {
            obj['Cart-Token'] = _cartToken;
        }

        return obj;
    },

    async bootApp() {
        if (this.booted === true) {
            return;
        }

        var response = await this.$axios.$get('/api/bootstrap');

        var bootstrap = response.data;

        //Refresh/save cart token
        cartToken.refreshToken(this.getAuth().$storage, bootstrap.cart_token);

        this.response = bootstrap;

        this.setTranslates(bootstrap.translates);

        this.routes = bootstrap.routes;

        this.booted = true;
    },

    bootStore(store) {
        this.store = store;

        let data = this.response.store;
        if (!data || data.length == 0) {
            return;
        }

        for (var key in data) {
            store.commit(key, data[key]);
        }
    },

    async getTranslator() {
        await this.bootApp();

        return (this.translator = new Translator(this.translates));
    },

    setTranslates(translates) {
        if (typeof translates == 'string') {
            translates = JSON.parse(translates);
        }

        this.translates = translates;
    },

    async rewriteRoutes(routes) {
        var translator = await this.getTranslator();

        //Translate routes from backend
        for (var key in routes) {
            routes[key].original = routes[key].path;
            routes[key].path = translator.__(routes[key].path);
        }

        return routes;
    },
};

module.exports = CrudAdmin;
