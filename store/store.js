const _ = require('lodash');

const store = {
    namespaced: true,

    state() {
        return {
            //Page settings
            backendEnv: {},
            bundleHash: null,
            seoModel: null,
            settings: {},
            categories: [],
            articles: [],

            //Store settings
            countries: [],
            currency: null,
            vat: true,
            vats: [],
            rounding: 2,
        };
    },

    mutations: {
        setSettings(state, settings) {
            state.settings = settings;
        },
        setBundleHash(state, hash) {
            state.bundleHash = hash;
        },
        setSeoModel(state, model) {
            state.seoModel = model;
        },
        setBackendEnv(state, backendEnv) {
            state.backendEnv = backendEnv;
        },
        setCategories(state, categories) {
            state.categories = categories;
        },
        setCurrency(state, currency) {
            state.currency = currency;
        },
        setRounding(state, rounding) {
            state.rounding = rounding;
        },
        setVat(state, vat) {
            state.vat = vat;
        },
        setVats(state, vats) {
            state.vats = vats;
        },
        setCountries(state, countries) {
            state.countries = countries;
        },
        setArticles(state, articles) {
            state.articles = articles;
        },
    },

    getters: {
        defaultVat: state => {
            return _.find(state.vats, { default: true });
        },
        backendEnv: state => key => {
            return state.backendEnv[key];
        },
        addDefaultVat: (state, getters) => price => {
            var defaultVat = (getters.defaultVat || {}).vat || 0;

            return price * (1 + defaultVat / 100);
        },
        numberFormat: state => number => {
            number = Math.round(number * 100) / 100;

            return number.toLocaleString(undefined, {
                minimumFractionDigits: state.rounding,
                maximumFractionDigits: state.rounding,
            });
        },
        priceFormat: (state, getters) => price => {
            //Only positive numbers can be shown as prices
            price = price < 0 ? 0 : price;

            return getters.numberFormat(price) + ' ' + state.currency;
        },
        priceFormatWithVatName: (state, getters) => (price, vat) => {
            //Use default vat value if no vat has been given
            if (_.isNil(vat)) {
                vat = state.vat;
            }

            var vatText =
                price == 0 ? '' : ' ' + (vat ? _('s DPH') : _('bez DPH'));

            return getters.priceFormat(price) + vatText;
        },
    },
};

module.exports = store;
