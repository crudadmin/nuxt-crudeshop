const { buildQueryFromObject } = require('../utilities/FilterHelper');
const Localization = require('../utilities/Localization');
const _ = require('lodash');

const products = {
    namespaced: true,

    state() {
        return {
            //Global listing states
            defaultFetchRoute: null,
            defaultFilterParams: {},
            loading: false,
            loadingNextPage: false,
            latestRequest: {},
            pagination: {},
            products: [],
            whitelistedQueries: ['page', 'limit', 'search'],

            //Eshop
            category: null,
            categories: [],
        };
    },

    mutations: {
        setDefaultFetchRoute(state, defaultFetchRoute) {
            if (!defaultFetchRoute) {
                return;
            }

            //Reset latest request on route change
            state.latestRequest = null;

            if (typeof defaultFetchRoute == 'string') {
                state.defaultFetchRoute = defaultFetchRoute;
                state.defaultFilterParams = {};
            } else if (typeof defaultFetchRoute == 'object') {
                state.defaultFetchRoute = defaultFetchRoute.url;
                state.defaultFilterParams = defaultFetchRoute.filter || {};
            }
        },
        setLoading(state, loading) {
            state.loading = loading;
        },
        setLoadingNextPage(state, loading) {
            state.loadingNextPage = loading;
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
        setCategory(state, category) {
            state.category = category;
        },
        setCategories(state, categories) {
            state.categories = categories;
        },
    },

    actions: {
        async fetchProducts(
            { state, commit, dispatch, getters },
            options = {}
        ) {
            var { url, resetFilter, query, route } = options || {};

            commit('setLoading', true);

            route = route || this.$router.currentRoute;
            url = getters.getUrlWithParams({ url, query: route.query });

            //Reset filter on onitial asynData request
            //but only when page view has been changed.
            //For example if we are on same category route view, but we are changing only subcategory level,
            //then we want reset filters from previous category.
            //
            //this.$router.currentRoute will be set as previous route, and route property is new route. So this is how
            //can we check if router has been changed from other page.
            if (
                resetFilter === true &&
                this.$router.currentRoute.name == route.name
            ) {
                this.dispatch('filter/resetFilter', {
                    route,
                    allParams: true,
                });
            }

            let postData = {
                    filter: {
                        ...(query || this.getters['filter/getQueryParams']),
                        ...state.defaultFilterParams,
                    },
                },
                //Build latest request data
                latestRequest = {
                    url,
                    postData,
                    lang: (Localization.get() || {}).slug,
                };

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

            //Skip setting products
            if (setProducts !== false) {
                commit('setProducts', response.data.pagination.data);
            }

            commit('setLoading', false);
        },
    },
    getters: {
        getUrlWithParams:
            (state) =>
            ({ url, query }) => {
                url = url || state.defaultFetchRoute;

                let obj = {};

                for (let key of state.whitelistedQueries) {
                    //Add whitelisted query from url, only when given url does not contain value already
                    if (query[key] && url.includes(key + '=') === false) {
                        obj[key] = query[key];
                    }
                }

                url = url + (url.indexOf('?') > -1 ? '&' : '?');

                return url + buildQueryFromObject(obj);
            },
    },
};

module.exports = products;
