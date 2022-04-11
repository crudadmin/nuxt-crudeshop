const { mapState, mapActions, mapMutations, mapGetters } = require('vuex');
const _ = require('lodash');
const { hasAttributesChanged } = require('../utilities/FilterHelper.js');

//From which route should we fetch products by default on attribute filter change
const config = {
    getListingFetchRoute: ({ route, action, store }) => {
        // prettier-ignore
        let category = route.params.category5 || route.params.category4 || route.params.category3 || route.params.category2 || route.params.category1;

        return action('ListingController@index', category);
    },
};

const fetchListing = async (context, fetchOptions) => {
    const { store, route } = context;

    store.commit(
        'listing/setDefaultFetchRoute',
        config.getListingFetchRoute(context)
    );

    let response = await store.dispatch('listing/fetchProducts', {
        route,
        ...(fetchOptions || {}),
    });

    //Set models
    store.commit(
        'listing/setCategory',
        response.model ? response.model.category : null
    );

    return response;
};

//From which route should we fetch products by default on attribute filter change
//prettier-ignore
const listingAsyncData = async ({ route, $axios, $action, store, error }, callback) => {
    try {
        var response = await fetchListing({ store, route, action : $action }, {
            resetFilter: true,
            query: route.query,
        });
    } catch (e) {
        console.error(e);

        return error({ statusCode: 404 });
    }

    //Then we can boot filter params.
    //States must be initialized after attributes and default price has been set, because we may replace price range.
    store.dispatch('filter/bootFromQuery', route.query);

    if ( callback ){
        return await callback(response);
    }
};

module.exports = {
    config,
    fetchListing,
    listingAsyncData,
    parentListingMixin: {
        watchQuery(newQuery, oldQuery) {
            if (this && this.$bus) {
                this.$bus.$emit('queryChange', { newQuery, oldQuery });
            }
        },
        methods: {
            fetchListing() {
                fetchListing({
                    store: this.$store,
                    route: this.$route,
                    action: this.$action,
                });
            },
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
                if ((newQuery || {}).page != (oldQuery || {}).page) {
                    this.scrollToListing();
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
            scrollToListing: _.debounce(function() {
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
