const { mapState, mapActions, mapMutations, mapGetters } = require('vuex');
const _ = require('lodash');
const { hasAttributesChanged } = require('../utilities/FilterHelper.js');

//From which route should we fetch products by default on attribute filter change
const setListingFetchRoute = async (store, route, action, fetchOptions) => {
    // prettier-ignore
    let category = route.params.category5 || route.params.category4 || route.params.category3 || route.params.category2 || route.params.category1;

    store.commit(
        'listing/setDefaultFetchRoute',
        action('ListingController@index', category)
    );

    return await store.dispatch('listing/fetchProducts', {
        route,
        ...(fetchOptions || {}),
    });
};

//From which route should we fetch products by default on attribute filter change
//prettier-ignore
const listingAsyncData = async ({ route, $axios, $action, store, error }) => {
    try {
        await setListingFetchRoute(store, route, $action, {
            resetFilter: true,
            query: route.query,
        });
    } catch (e) {
        return error({ statusCode: 404 });
    }

    //Then we can boot filter params.
    //States must be initialized after attributes and default price has been set, because we may replace price range.
    store.dispatch('filter/bootFromQuery', route.query);
};

module.exports = {
    setListingFetchRoute,
    listingAsyncData,
    parentListingMixin: {
        watchQuery(newQuery, oldQuery) {
            if (this && this.$bus) {
                this.$bus.$emit('queryChange', { newQuery, oldQuery });
            }
        },
    },
    listingMixin: {
        mounted() {
            this.updateQuery();

            this.onQueryChangeListener();
        },
        beforeDestroy() {
            //Reregister again
            this.$bus.$off('queryChange', this.onQueryChange);
        },
        computed: {
            ...mapGetters('filter', ['getStaticFilter']),
            ...mapState('listing', [
                'loadingNextPage',
                'products',
                'pagination',
                'loading',
                'limit',
            ]),
            filtratedProducts() {
                return this.toProductModels(this.products);
            },
        },
        methods: {
            ...mapActions('filter', ['updateQuery', 'setLimit']),
            ...mapActions('listing', ['fetchProducts']),
            ...mapMutations('listing', ['setProducts', 'setLoadingNextPage']),
            /*
             * This method is usefull when we have pagination [10, 15, 100], and from backend we retrieve limit 20.
             * So we add 20 into options from backend pagination.
             */
            limitOptions(options) {
                return _.uniqBy(
                    _.sortBy(
                        options
                            .map(limit => parseInt(limit))
                            .concat(this.pagination.per_page)
                    )
                );
            },
            onQueryChangeListener() {
                this.$bus.$on('queryChange', this.onQueryChange);
            },
            onQueryChange: _.debounce(function({ newQuery, oldQuery }) {
                if (
                    //Component is not initialized yet
                    //prettier-ignore
                    (!_.isEqual(this.$router.currentRoute.query, newQuery) || _.isEqual(newQuery, oldQuery)) ||

                    //Or user manually clicked on next page button
                    this.loadingNextPage === true
                ) {
                    return;
                }

                this.$store.dispatch('filter/bootFromQuery', newQuery);

                // prettier-ignore
                this.fetchProducts({
                    resetDefaultPriceRange: hasAttributesChanged(this.$store.state.filter.attributes, newQuery, oldQuery),
                });

                //ON page change
                if (newQuery?.page != oldQuery?.page) {
                    this.scrollOnListing();
                }
            }, 50),
            async loadNextPage(options) {
                let { rewritePageQuery = false } = options || {};

                //If pagination has no more pages.
                if (
                    !this.pagination.next_page_url ||
                    this.loadingNextPage === true
                ) {
                    return;
                }

                this.setLoadingNextPage(true);

                if (rewritePageQuery === true) {
                    let page = (
                        this.pagination.next_page_url.split('page=')[1] + ''
                    ).split('%')[0];

                    this.$router
                        .push({
                            query: {
                                ...this.$route.query,
                                ...{ page },
                            },
                        })
                        .catch(() => {});
                }

                try {
                    let response = await this.fetchProducts({
                        url: this.pagination.next_page_url,
                        setProducts: false,
                    });

                    this.setProducts(
                        this.products.concat(response.data.pagination.data)
                    );
                } catch (e) {}

                this.setLoadingNextPage(false);
            },
            scrollOnListing: _.debounce(function() {
                let scrollTop = $(window).scrollTop();

                //Disable scroll if scrollTop is not present
                if (scrollTop < 500) {
                    return;
                }

                this.scrollTo('[data-listing]', null, null, 70);
            }, 100),
        },
    },
};
