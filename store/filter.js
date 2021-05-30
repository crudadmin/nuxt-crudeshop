const _ = require('lodash');
const Vue = require('vue').default;

const Attribute = require('../models/Attribute.js');

const {
    buildQueryParamFromState,
    buildFromQueryParamToState,
} = require('../utilities/FilterHelper.js');

const store = {
    namespaced: true,

    state() {
        return {
            attributes: [],
            filter: {},
            lastQuery: {},

            defaultPriceRange: [],
            priceRange: [],
            sortBy: null,
            search: null,
        };
    },

    mutations: {
        setFilter(state, filter) {
            state.filter = filter || {};
        },
        setSearch(state, search) {
            state.search = search;
        },
        setAttributes(state, attributes) {
            state.attributes = attributes;
        },
        setAttributeItem(state, { attribute_id, id }) {
            //If empty value has been given, we want remove attribute from filter
            if (_.isNil(id)) {
                if (attribute_id in state.filter) {
                    Vue.delete(state.filter, attribute_id);
                }
            }

            //Set new value
            else {
                Vue.set(state.filter, attribute_id, id);
            }
        },
        toggleAttributeItem(state, { attribute_id, id }) {
            let values = _.castArray(state.filter[attribute_id] || []).map(id =>
                parseInt(id)
            );

            let newValues = _.xor(values, [id]);

            if (newValues.length == 0) {
                Vue.delete(state.filter, attribute_id);
            } else {
                Vue.set(state.filter, attribute_id, newValues);
            }
        },
        setPriceRange(state, range) {
            state.priceRange = range
                ? range.map(price => parseFloat(price))
                : state.defaultPriceRange;
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
        setSortBy(state, order) {
            state.sortBy = order;
        },
        setDefaultPriceRange(state, range) {
            //Set default range
            var defaultRange = range.map(price => parseFloat(price)),
                defaultRange = [
                    parseInt(defaultRange[0]),
                    Math.ceil(defaultRange[1]),
                ];

            state.priceRange = defaultRange;
            state.defaultPriceRange = defaultRange;
        },
        resetFilter(state) {
            state.priceRange = _.cloneDeep(state.defaultPriceRange);

            state.filter = {};
        },
        setLastQuery(state, lastQuery) {
            state.lastQuery = lastQuery;
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
            let filter = state.filter;

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
        setPriceRange: _.debounce(({ state, commit, dispatch }, range) => {
            commit('setPriceRange', range);

            dispatch('updateQuery');
        }, 500),
        setPriceRangeMin: _.debounce(({ state, commit, dispatch }, value) => {
            commit('setPriceRangeMin', value);

            dispatch('updateQuery');
        }, 500),
        setPriceRangeMax: _.debounce(({ state, commit, dispatch }, value) => {
            commit('setPriceRangeMax', value);

            dispatch('updateQuery');
        }, 500),
        setSortBy: ({ state, commit, dispatch }, sortBy) => {
            commit('setSortBy', sortBy);

            dispatch('updateQuery');
        },
        resetPriceRange: ({ state, dispatch, commit }) => {
            commit('setPriceRange', state.defaultPriceRange);

            dispatch('updateQuery');
        },
        updateQuery({ state, getters }) {
            let query = getters.getQueryParams,
                currentRoute = this.$router.currentRoute;

            if (!_.isEqual(query, currentRoute.query)) {
                this.$router.push({
                    path: currentRoute.path,
                    query,
                });
            }
        },
        bootFromQuery({ state, commit }, query) {
            let {
                filterObject,
                priceRange,
                sortBy,
                search,
            } = buildFromQueryParamToState(state, query);

            commit('setLastQuery', query);

            commit('setPriceRange', priceRange);

            commit('setSortBy', sortBy);

            commit('setFilter', filterObject);

            commit('setSearch', search);
        },
        resetFilter({ commit, dispatch }) {
            commit('resetFilter');

            dispatch('updateQuery');
        },
    },

    getters: {
        hasQueryChanged: state => query => {
            console.log(
                'query change check',
                _.isEqual(state.lastQuery, query),
                state.lastQuery,
                query
            );

            return _.isEqual(state.lastQuery, query) === false;
        },
        isChangedPriceRange: (state, getters) => {
            return !_.isEqual(
                getters.priceRangeMutated,
                state.defaultPriceRange
            );
        },
        selectedItems: state => {
            var items = [];

            for (var attrId in state.filter) {
                let attribute = _.find(state.attributes, {
                    id: parseInt(attrId),
                });

                if (!attribute) {
                    continue;
                }

                items = items.concat(
                    attribute.items.filter(item => {
                        //If is multi array of attributes
                        if (_.isArray(state.filter[attrId])) {
                            return _.includes(state.filter[attrId], item.id);
                        }

                        //If is simple attribute item value
                        else if (state.filter[attrId] == item.id) {
                            return true;
                        }
                    })
                );
            }

            return items;
        },
        isItemChecked: state => item => {
            const { attribute_id, id } = item;

            let values = state.filter[attribute_id] || [];

            return values.indexOf(id) > -1;
        },
        isAttributesSelected: state => {
            return Object.keys(state.filter).length > 0;
        },
        isFilterEnabled: (state, getters) => {
            if (getters.isChangedPriceRange) {
                return true;
            }

            if (getters.isAttributesSelected) {
                return true;
            }

            return false;
        },
        defaultPriceRangeMutated: state => {
            return [
                parseInt(state.defaultPriceRange[0]),
                Math.ceil(state.defaultPriceRange[1]),
            ];
        },
        priceRangeMutated: (state, getters) => {
            let min = getters.defaultPriceRangeMutated[0],
                max = getters.defaultPriceRangeMutated[1];

            return [
                _.max([min, state.priceRange[0]]),
                _.min([max, state.priceRange[1]]),
            ];
        },
        getQueryParams: (state, getters) => {
            return buildQueryParamFromState(state, getters);
        },
        getAttributes: state => {
            return Object.values(state.attributes).map(
                attr => new Attribute(attr)
            );
        },
    },
};

module.exports = store;
