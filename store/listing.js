const { buildQueryFromObject } = require('../utilities/FilterHelper');
const _ = require('lodash');

const products = {
    namespaced: true,

    state() {
        return {
            //Global listing states
            defaultFetchRoute: null,
            defaultLimit: null,
            loading: false,
            latestRequest: {},
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
        setLatestRequest(state, requestData) {
            state.latestRequest = requestData;
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
        async fetchProducts(
            { state, commit, dispatch, getters },
            options = {}
        ) {
            var { url, resetFilter } = options || {};

            commit('setLoading', true);

            //Reset filter if needed
            if (resetFilter === true) {
                this.dispatch('filter/resetFilter');
            }

            let route = this.$router.currentRoute,
                params = route.params;

            url = getters.getUrlWithParams({ url, query: route.query });

            let postData = {
                    filter: this.getters['filter/getQueryParams'],
                },
                //Build latest request data
                latestRequest = { url, postData };

            //Disable fire duplicate requests.
            if (_.isEqual(state.latestRequest, latestRequest)) {
                return;
            }

            //Save request data, to be able identifiry duplicate requests.
            commit('setLatestRequest', latestRequest);

            const response = await this.$axios.$post(url, postData);

            dispatch('setProductsResponse', {
                response,
                options,
            });

            return response;
        },
        setProductsResponse({ state, commit }, { response, options }) {
            var { resetDefaultPriceRange, setProducts } = options || {};

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
