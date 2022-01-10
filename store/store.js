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
            languages: [],
            language: null,
            categories: [],
            favourites: [],

            //Store settings
            countries: [],
            currency: null,
            vat: true,
            vats: [],
            rounding: 2,
            decimalPlaces: 2,
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
        setDecimalPlaces(state, decimalPlaces) {
            state.decimalPlaces = decimalPlaces;
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
        setLanguages(state, languages) {
            state.languages = languages;
        },
        setLanguage(state, langCode) {
            state.language = langCode;
        },
        setFavourites(state, favourites) {
            state.favourites = favourites;
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
            let digits = state.decimalPlaces || state.rounding;

            number = Math.round(number * 100) / 100;

            return number.toLocaleString(state.language || 'sk', {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
            });
        },
        priceFormat: (state, getters) => (price, negative = false) => {
            //Only positive numbers can be shown as prices
            price = price < 0 && negative == false ? 0 : price;

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
