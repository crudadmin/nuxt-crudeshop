import { mapGetters, mapState } from 'vuex';
import Vue from 'vue';
import Product from 'crudeshop/models/Product.js';

var storeMixin = {
    methods: {
        toProductModels(products) {
            return products.map(item => new Product(item));
        },
        toProductModel(item) {
            return new Product(item);
        },
        /*
         * Parse number into price number format
         */
        numberFormat(number) {
            return this.$store.getters['store/numberFormat'](number);
        },
        /*
         * Parse number int oprice number format and add currency
         */
        priceFormat(number) {
            return this.$store.getters['store/priceFormat'](number, this);
        },
        priceFormatWithFree(number) {
            if (number == 0) {
                return this.$translator.__('Zdarma');
            }

            return this.$store.getters['store/priceFormat'](number, this);
        },
        priceFormatWithVatName(number, vat) {
            return this.$store.getters['store/priceFormatWithVatName'](
                number,
                vat
            );
        },
        /*
         * Return price with vat or with not by given selector type
         * price / defaultPrice...
         */
        productPrice(item, vat, selector) {
            //Use default global vat chosen by user
            if ([true, false].indexOf(vat) === -1) {
                vat = this.$store.state.store.vat;
            }

            //If selector was not given
            if (!selector) {
                selector = 'price';
            }

            return (
                item[vat ? selector + 'WithVat' : selector + 'WithoutVat'] || 0
            );
        },

        async fetchStoreSession(callback) {
            // prettier-ignore
            var { data } = await this.$axios.get(this.action('Cart\\CartController@getFullSummary'), {
                    headers: { 'Cart-Initialize': 1 },
                }),
                data = data.data;

            //Authenticate logged client and cart identification
            if (data.client) {
                this.setClient(data.client);
            }

            //If user is not logged anymore, we need logout him. Otherwise errors may occur.
            else if (this.$auth.loggedIn) {
                this.$auth.logout();
            }

            this.$crudadmin.setCartToken(data.cartToken);
            this.$store.commit('cart/setCart', data);

            //other data
            //...

            //Set cart summary data
            if (data.favourites) {
                this.$store.commit('store/setFavourites', data.favourites);
            }

            if (callback && typeof callback == 'function') {
                callback(data);
            }
        },
    },
    computed: {
        ...mapGetters('store', ['backendEnv']),
    },
};

Vue.mixin(storeMixin);
