const _ = require('lodash');
const Vue = require('vue').default;

const Attribute = require('../models/Attribute.js');

const {
    buildAttributesFromState,
    buildAttributesFromQuery,
    queryBuilder,
    castAndSortFilterKeys,
} = require('../utilities/FilterHelper.js');

var filterTimeout;

const store = {
    namespaced: true,

    //You can mutate bootable queries for filtration
    queryBuilder,

    state() {
        return {
            attributes: [],
            attributesFilter: {},
            filters: {},

            defaultPriceRange: [],
            instantPriceRange: [],

            priceRange: [],
        };
    },

    mutations: {
        setAttributesFilter(state, filter) {
            state.attributesFilter = filter || {};
        },
        setAttributes(state, attributes) {
            state.attributes = attributes;
        },
        setStaticFilter(state, data) {
            state.filters = Object.assign({}, state.filters, data);
        },
        setAttributeItem(state, { attribute_id, id }) {
            //If empty value has been given, we want remove attribute from filter
            if (_.isNil(id)) {
                if (attribute_id in state.attributesFilter) {
                    Vue.delete(state.attributesFilter, attribute_id);
                }
            }

            //Set new value
            else {
                Vue.set(state.attributesFilter, attribute_id, id);
            }
        },
        toggleAttributeItem(state, { attribute_id, id }) {
            let values = _.castArray(
                state.attributesFilter[attribute_id] || []
            ).map(id => parseInt(id));

            let newValues = _.xor(
                values,
                _.castArray(id).map(id => parseInt(id))
            );

            if (newValues.length == 0) {
                Vue.delete(state.attributesFilter, attribute_id);
            } else {
                Vue.set(state.attributesFilter, attribute_id, newValues);
            }
        },
        setPriceRange(state, range) {
            state.priceRange = range
                ? range.map(price => parseFloat(price))
                : state.defaultPriceRange;
        },
        setInstantPriceRange(state, range) {
            state.instantPriceRange = range;
        },
        setPriceRangeMin(state, value) {
            let priceRange = _.cloneDeep(state.priceRange);
            priceRange[0] = parseFloat(value);

            state.priceRange = priceRange;
        },
        setPriceRangeMax(state, value) {
            let priceRange = _.cloneDeep(state.priceRange);
            priceRange[1] = parseFloat(value);

            state.priceRange = priceRange;
        },
        setDefaultPriceRange(state, range) {
            if (!range) {
                return;
            }

            //Set default range
            var defaultRange = range.map(price => parseFloat(price)),
                defaultRange = [
                    parseInt(defaultRange[0]),
                    Math.ceil(defaultRange[1]),
                ];

            state.priceRange = defaultRange;
            state.defaultPriceRange = defaultRange;
        },
        resetFilter(state, allParams = false) {
            for (let key in store.queryBuilder) {
                if (store.queryBuilder[key].reset) {
                    store.queryBuilder[key].reset({ state });
                }
            }

            state.attributesFilter = {};

            if (allParams) {
                let data = {};

                for (let key in store.queryBuilder) {
                    let defaultState = store.queryBuilder[key].default;

                    data[key] = defaultState ? _.cloneDeep(defaultState) : null;
                }

                state.filters = Object.assign({}, state.filters, data);
            }
        },
    },

    actions: {
        setAttributeItem({ state, commit, dispatch }, { attribute_id, id }) {
            commit('setAttributeItem', { attribute_id, id });

            dispatch('updateQuery');
        },
        toggleAttributeItem({ state, commit, dispatch }, item) {
            const { attribute_id, id } = item;

            commit('toggleAttributeItem', { attribute_id, id });

            dispatch('updateQuery');
        },
        removeAttributeItem({ state, commit, dispatch }, id) {
            let filter = state.attributesFilter;

            for (var attrId in filter) {
                let values = filter[attrId];

                //If is array and item exists in array, we need remove it
                if (_.isArray(values)) {
                    if (_.includes(values, id)) {
                        commit('toggleAttributeItem', {
                            attribute_id: attrId,
                            id,
                        });
                    }
                }

                //If attribute value is same as given id, we need remove this attribute
                else if (values == id) {
                    commit('setAttributeItem', { attribute_id: attrId });
                }
            }

            dispatch('updateQuery');
        },
        setPriceRange: ({ state, commit, dispatch }, range) => {
            if (filterTimeout) {
                clearTimeout(filterTimeout);
            }

            commit('setInstantPriceRange', range);

            filterTimeout = setTimeout(() => {
                commit('setInstantPriceRange', []);

                commit('setPriceRange', range);

                dispatch('updateQuery');
            }, 500);
        },
        setPriceRangeMin: _.debounce(({ state, commit, dispatch }, value) => {
            commit('setPriceRangeMin', value);

            dispatch('updateQuery');
        }, 500),
        setPriceRangeMax: _.debounce(({ state, commit, dispatch }, value) => {
            commit('setPriceRangeMax', value);

            dispatch('updateQuery');
        }, 500),
        setSortBy: ({ state, commit, dispatch }, sortBy) => {
            commit('setStaticFilter', {
                _sort: sortBy,
            });

            dispatch('updateQuery');
        },
        setSearch: _.debounce(function({ state, commit, dispatch }, query) {
            commit('setStaticFilter', {
                _search: query,
            });

            dispatch('updateQuery');
        }, 750),
        setLimit: ({ state, commit, dispatch }, limit) => {
            commit('setStaticFilter', {
                _limit: limit,
            });

            dispatch('updateQuery');
        },
        resetPriceRange: ({ state, dispatch, commit }) => {
            commit('setPriceRange', state.defaultPriceRange);

            dispatch('updateQuery');
        },
        updateQuery({ state, getters }, route) {
            let query = castAndSortFilterKeys(
                    _.cloneDeep(getters.getQueryParams)
                ),
                currentRoute = route || this.$router.currentRoute,
                currentQuery = castAndSortFilterKeys(
                    _.cloneDeep(currentRoute.query)
                );

            //Remove whitelisted keys
            for (let key of this.state.listing.whitelistedQueries) {
                if (key in query) delete query[key];
                if (key in currentQuery) delete currentQuery[key];
            }

            if (!_.isEqual(query, currentQuery)) {
                this.$router
                    .push({
                        path: currentRoute.path,
                        query,
                    })
                    .catch(e => e);
            }
        },
        bootFromQuery({ state, commit }, query) {
            //Boot dynamic attributes
            let filterObject = buildAttributesFromQuery(
                state.attributes,
                query
            );

            commit('setAttributesFilter', filterObject);

            let filters = {};

            //Boot additional attributes
            for (let key in store.queryBuilder) {
                let value = store.queryBuilder[key].set(
                    {
                        state,
                        commit,
                    },
                    query[key]
                );

                filters[key] = value;
            }

            commit('setStaticFilter', filters);
        },
        resetFilter({ commit, dispatch }, allParams) {
            var route;

            if (_.isObject(allParams)) {
                var { allParams = false, route } = allParams;
            }

            commit('resetFilter', allParams);

            dispatch('updateQuery', route);
        },
    },

    getters: {
        getStaticFilter: state => key => {
            return state.filters[key];
        },
        selectedItems: state => {
            var items = [],
                filter = state.attributesFilter;

            for (var attrId in filter) {
                let attribute = _.find(state.attributes, {
                    id: parseInt(attrId),
                });

                if (!attribute) {
                    continue;
                }

                items = items.concat(
                    attribute.items.filter(item => {
                        //If is multi array of attributes
                        if (_.isArray(filter[attrId])) {
                            return _.includes(filter[attrId], item.id);
                        }

                        //If is simple attribute item value
                        else if (filter[attrId] == item.id) {
                            return true;
                        }
                    })
                );
            }

            return items;
        },
        isItemChecked: state => item => {
            const { attribute_id, id } = item;

            let values = _.castArray(
                state.attributesFilter[attribute_id] || []
            );

            return values.indexOf(id) > -1;
        },
        isAttributesSelected: state => {
            return Object.keys(state.attributesFilter).length > 0;
        },
        isFilterEnabled: (state, getters) => {
            let staticFilterEnabled = false;

            for (let key in store.queryBuilder) {
                let filterEnabled = store.queryBuilder[key].filterEnabled;

                //If filter enable state is disabled all the time
                if (filterEnabled === false) {
                    continue;
                }

                //If filter has callback for enabled state
                else if (typeof filterEnabled == 'function') {
                    if (
                        filterEnabled(
                            {
                                state,
                                getters,
                            },
                            state.filters[key]
                        )
                    ) {
                        staticFilterEnabled = true;
                        break;
                    }
                }

                //If filter has set values
                else {
                    let value = state.filters[key];

                    if (
                        !_.isNil(value) &&
                        !(_.isArray(value) && value.length == 0)
                    ) {
                        staticFilterEnabled = true;

                        break;
                    }
                }
            }

            return staticFilterEnabled || getters.isAttributesSelected;
        },
        getQueryParams: (state, getters) => {
            let query = buildAttributesFromState(
                state.attributesFilter,
                state.attributes
            );

            for (let key in store.queryBuilder) {
                let queryValue = store.queryBuilder[key].get(
                    {
                        state,
                        getters,
                    },
                    state.filters[key]
                );

                if (queryValue) {
                    query[key] = queryValue;
                }
            }

            return query;
        },
        getAttributes: state => {
            return Object.values(state.attributes).map(
                attr => new Attribute(attr)
            );
        },

        /**
         * Price filter
         */
        defaultPriceRangeMutated: state => {
            return [
                parseInt(state.defaultPriceRange[0]),
                Math.ceil(state.defaultPriceRange[1]),
            ];
        },
        priceRangeMutated: (state, getters) => {
            let min = getters.defaultPriceRangeMutated[0],
                max = getters.defaultPriceRangeMutated[1],
                priceRange =
                    state.instantPriceRange.length > 0
                        ? state.instantPriceRange
                        : state.priceRange;

            return [_.max([min, priceRange[0]]), _.min([max, priceRange[1]])];
        },
        isPriceRangeEnabled: (state, getters) => {
            return (
                getters.defaultPriceRangeMutated.filter(item => !_.isNil(item))
                    .length == 2
            );
        },
        isChangedPriceRange: (state, getters) => {
            return !_.isEqual(
                getters.priceRangeMutated,
                state.defaultPriceRange
            );
        },
        getSortBy: (state, getters) => {
            return getters.getStaticFilter('_sort');
        },
    },
};

module.exports = store;
