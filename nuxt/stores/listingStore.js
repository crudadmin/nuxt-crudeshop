import { buildQueryFromObject } from '../utils/FilterHelper';

import _ from 'lodash';

const listingStore = {
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

    actions: {
        /**
         * Mutations
         */
        setDefaultFetchRoute(defaultFetchRoute) {
            if (!defaultFetchRoute) {
                return;
            }

            //Reset latest request on route change
            this.latestRequest = null;

            if (typeof defaultFetchRoute == 'string') {
                this.defaultFetchRoute = defaultFetchRoute;
                this.defaultFilterParams = {};
            } else if (typeof defaultFetchRoute == 'object') {
                this.defaultFetchRoute = defaultFetchRoute.url;
                this.defaultFilterParams = defaultFetchRoute.filter || {};
            }
        },
        setLoading(loading) {
            this.loading = loading;
        },
        setLoadingNextPage(loading) {
            this.loadingNextPage = loading;
        },
        setLatestRequest(requestData) {
            this.latestRequest = requestData;
        },
        setProducts(products) {
            this.products = products;
        },
        setPagination(pagination) {
            this.pagination = pagination;
        },
        setCategory(category) {
            this.category = category;
        },
        setCategories(categories) {
            this.categories = categories;
        },

        /**
         * Actions
         */
        async fetchProducts(options = {}) {
            var { url, resetFilter, query, route } = options || {};

            this.setLoading(true);

            route = route || this.$router.currentRoute;
            url = this.getUrlWithParams({ url, query: route.query });

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
                //TODO: refactor
                // this.dispatch('filter/resetFilter', {
                //     route,
                //     allParams: true,
                // });
            }

            let postData = {
                    filter: {
                        // ...(query || this.getters['filter/getQueryParams']), //refactor
                        ...this.defaultFilterParams,
                    },
                },
                //Build latest request data
                latestRequest = {
                    url,
                    postData,
                    lang: useGetLocaleSlug(),
                };

            //Disable fire duplicate requests.
            if (_.isEqual(state.latestRequest, latestRequest)) {
                return;
            }

            //Save request data, to be able identifiry duplicate requests.
            this.setLatestRequest = latestRequest;

            const response = await useAxios().$post(url, postData);

            this.setProductsResponse({
                response: response.data,
                options,
            });

            return response;
        },
        setProductsResponse({ response, options }) {
            var { resetDefaultPriceRange, setProducts } = options || {};

            //Set filter attributes
            // this.commit('filter/setAttributes', response.attributes); todo: refactor

            //First we need set default price
            if (resetDefaultPriceRange !== false) {
                //todod
                // this.commit(
                //     'filter/setDefaultPriceRange',
                //     response.pagination.price_range
                // );
            }

            //Base listing response
            this.setPagination(response.pagination);

            //Skip setting products
            if (setProducts !== false) {
                this.setProducts(response.pagination.data);
            }

            this.setLoading(false);
        },
    },
    getters: {
        getUrlWithParams({ url, query }) {
            url = url || this.defaultFetchRoute;

            let obj = {};

            for (let key of this.whitelistedQueries) {
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

export const useListingStore = defineStore('listingStore', listingStore);

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useListingStore, import.meta.hot));
}
