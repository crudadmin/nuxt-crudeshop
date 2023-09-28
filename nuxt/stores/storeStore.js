import _ from 'lodash';

export const storeStore = {
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

    actions: {
        setSettings(settings) {
            this.settings = settings;
        },
        setBundleHash(hash) {
            this.bundleHash = hash;
        },
        setSeoModel(model) {
            this.seoModel = model;
        },
        setBackendEnv(backendEnv) {
            this.backendEnv = backendEnv;
        },
        setCategories(categories) {
            this.categories = categories;
        },
        setCurrency(currency) {
            this.currency = currency;
        },
        setRounding(rounding) {
            this.rounding = rounding;
        },
        setDecimalPlaces(decimalPlaces) {
            this.decimalPlaces = decimalPlaces;
        },
        setVat(vat) {
            this.vat = vat;
        },
        setVats(vats) {
            this.vats = vats;
        },
        setCountries(countries) {
            this.countries = countries;
        },
        setLanguages(languages) {
            this.languages = languages;
        },
        setLanguage(langCode) {
            this.language = langCode;
        },
        setFavourites(favourites) {
            this.favourites = favourites;
        },
    },

    getters: {
        defaultVat() {
            return _.find(this.vats, { default: true });
        },
        addDefaultVat(state) {
            return (price) => {
                var defaultVat = (this.defaultVat || {}).vat || 0;

                return price * (1 + defaultVat / 100);
            };
        },
        numberFormat(state) {
            return (number) => {
                let digits = this.decimalPlaces || this.rounding;

                number = Math.round(number * 100) / 100;

                return number.toLocaleString(this.language || 'sk', {
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits,
                });
            };
        },
        priceFormat(state) {
            return (price, negative = true) => {
                //Only positive numbers can be shown as prices
                price = price < 0 && negative == false ? 0 : price;

                let currencyChar = this.currency?.char || '';

                return this.numberFormat(price) + ' ' + currencyChar;
            };
        },
        priceFormatWithVatName(state) {
            return (price, vat) => {
                //Use default vat value if no vat has been given
                if (_.isNil(vat)) {
                    vat = this.vat;
                }

                var vatText =
                    price == 0 ? '' : ' ' + (vat ? _('s DPH') : _('bez DPH'));

                return this.priceFormat(price) + vatText;
            };
        },
    },
};

export const useStoreStore = defineStore('store', storeStore);

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useStoreStore, import.meta.hot));
}
