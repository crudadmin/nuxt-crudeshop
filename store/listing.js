const { buildQueryFromObject } = require('../utilities/FilterHelper');

const products = {
    namespaced: true,

    state() {
        return {
            //Global listing states
            defaultFetchRoute: null,
            defaultLimit: null,
            loading: false,
            pagination: {},
            products: [],
            whitelistedQueries: ['page', 'limit', 'search'],

            //Eshop
            category: null,
        };
    },

    mutations: {
        setDefaultFetchRoute(state, defaultFetchRoute) {
            state.defaultFetchRoute = defaultFetchRoute;
        },
        setLoading(state, loading) {
            state.loading = loading;
        },
        setProducts(state, products) {
            state.products = products;
        },
        setPagination(state, pagination) {
            state.pagination = pagination;
        },
        setDefaultLimit(state, DefaultLimit) {
            state.defaultLimit = DefaultLimit;
        },
        setCategory(state, category) {
            state.category = category;
        },
    },

    actions: {
        async fetchProducts({ state, commit, getters }, options = {}) {
            var { url, resetFilter, resetDefaultPriceRange, setProducts } =
                options || {};

            commit('setLoading', true);

            //Reset filter if needed
            if (resetFilter === true) {
                this.dispatch('filter/resetFilter');
            }

            let route = this.$router.currentRoute,
                params = route.params;

            url = getters.getUrlWithParams({ url, query: route.query });

            const response = await this.$axios.$post(url, {
                filter: this.getters['filter/getQueryParams'],
            });

            //Set filter attributes
            this.commit('filter/setAttributes', response.data.attributes);

            //First we need set default price
            if (resetDefaultPriceRange !== false) {
                this.commit(
                    'filter/setDefaultPriceRange',
                    response.data.pagination.price_range
                );
            }

            //Base listing response
            commit('setPagination', response.data.pagination);
            commit('setDefaultLimit', response.data.defaultLimit);

            //Skip setting products
            if (setProducts !== false) {
                commit('setProducts', response.data.pagination.data);
            }

            commit('setLoading', false);

            return response;
        },
    },
    getters: {
        getUrlWithParams: state => ({ url, query }) => {
            url = url || state.defaultFetchRoute;

            let obj = {};

            for (let key of state.whitelistedQueries) {
                if (query[key]) {
                    obj[key] = query[key];
                }
            }

            url = url + (url.indexOf('?') > -1 ? '&' : '?');

            return url + buildQueryFromObject(obj);
        },
    },
};

module.exports = products;
