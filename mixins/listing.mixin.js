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

    var response = await store.dispatch('listing/fetchProducts', {
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
            onQueryChangeListener() {
                this.$bus.$on('queryChange', this.onQueryChange);
            },
            onQueryChange: _.debounce(function({ newQuery, oldQuery }) {
                //Component is not initialized yet
                if (_.isEqual(newQuery, oldQuery)) {
                    return;
                }

                this.$store.dispatch('filter/bootFromQuery', newQuery);

                // prettier-ignore
                this.fetchProducts({
                    resetDefaultPriceRange: hasAttributesChanged(this.$store.state.filter.attributes, newQuery, oldQuery),
                });
            }, 50),
            async loadNextPage() {
                //If pagination has no more pages.
                if (
                    !this.pagination.next_page_url ||
                    this.loadingNextPage === true
                ) {
                    return;
                }

                try {
                    this.setLoadingNextPage(true);

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
        },
    },
};
