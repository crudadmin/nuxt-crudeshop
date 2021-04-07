const Vue = require('vue');
const Translator = require('gettext-translator').default;
// const auth = require('./plugins/auth');
const https = require('https');
const cartToken = require('./utilities/cartToken');

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

    gettextSelectors: [
        '_',
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

    /**
     * We need reset this data on each new request
     */
    setNewInstance() {
        this.$auth = null;

        this.booted = false;

        this.context = null;
    },

    setAxios($axios) {
        $axios(this, () => {});

        //Allow self signed https
        this.$axios.defaults['httpsAgent'] = new https.Agent({
            rejectUnauthorized: false,
        });
    },

    setAuth($auth) {
        $auth(this, () => {});
    },

    setContext(context) {
        this.context = context;
    },

    getAuth() {
        //Return booted actual auth object
        if (typeof $nuxt == 'object') {
            return $nuxt.$auth;
        }

        if (this.$auth) {
            return this.$auth;
        }

        return (this.$auth = auth(this.context || {}));
    },

    getAuthorizationHeaders() {
        var auth = this.getAuth(),
            obj = {},
            _authToken,
            _cartToken;

        if ((_authToken = auth.getToken('local'))) {
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

        var response = await this.$axios.$get('/api/bootstrap', {
            headers: this.getAuthorizationHeaders(),
        });

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

    async installCrudAdminMethods() {
        var a = await this.getTranslator(),
            getSelector = function(selector) {
                return function() {
                    var s = selector in a ? selector : '__';

                    return a[s].apply(a, arguments);
                };
            };

        Vue.use({
            install: (Vue, options) => {
                for (var i = 0; i < this.gettextSelectors.length; i++) {
                    Vue.prototype[this.gettextSelectors[i]] = getSelector(
                        this.gettextSelectors[i]
                    );
                }

                Vue.prototype.route = route => {
                    return a.__(route);
                };

                Vue.prototype.action = this.action;
            },
        });
    },

    action(controller) {
        var routes = CrudAdmin.routes,
            actions = {};

        for (var key in routes || {}) {
            actions[key] = routes[key];
        }

        var regex = /{[a-z|A-Z|0-9|\_|\-|\?]+}/g,
            action = actions[controller];

        if (!action) {
            console.error('Action not found ' + controller);
            return '';
        }

        var matches = action.match(regex) || [];

        //Replace action param
        for (let i = 0; i < matches.length; i++) {
            action = action.replace(matches[i], arguments[i + 1] || '');
        }

        return action;
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
