import { mapGetters, mapState } from 'vuex';
import Vue from 'vue';
import Product from '~/crudadmin/models/Product.js';

var storeMixin = {
    methods: {
        toProductModels(products) {
            return products.map((item) => new Product(item));
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
    },
    computed: {
        ...mapGetters('store', ['backendEnv']),
    },
};

Vue.mixin(storeMixin);
