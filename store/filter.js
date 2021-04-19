const _ = require('lodash');
const Vue = require('vue').default;

const {
    buildQueryParamFromState,
    buildFromQueryParamToState,
} = require('../utilities/FilterHelper.js');

const store = {
    namespaced: true,

    state() {
        return {
            attributes: [],
            query: {},

            defaultPriceRange: [],
            priceRange: [],
            sortBy: null,
        };
    },

    mutations: {
        setQuery(state, query) {
            state.query = query || {};
        },
        setAttributes(state, attributes) {
            state.attributes = attributes;
        },
        setAttributeItem(state, { attribute_id, id }) {
            //If empty value has been given, we want remove attribute from query
            if (_.isNil(id)) {
                if (attribute_id in state.query) {
                    Vue.delete(state.query, attribute_id);
                }
            }

            //Set new value
            else {
                Vue.set(state.query, attribute_id, id);
            }
        },
        toggleAttributeItem(state, { attribute_id, id }) {
            let values = _.castArray(state.query[attribute_id] || []).map(id =>
                parseInt(id)
            );

            let newValues = _.xor(values, [id]);

            if (newValues.length == 0) {
                Vue.delete(state.query, attribute_id);
            } else {
                Vue.set(state.query, attribute_id, newValues);
            }
        },
        setPriceRange(state, range) {
            state.priceRange = range
                ? range.map(price => parseFloat(price))
                : state.defaultPriceRange;
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

            state.query = {};
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
            let query = state.query;

            for (var attrId in query) {
                let values = query[attrId];

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
        setSortBy: ({ state, commit, dispatch }, sortBy) => {
            commit('setSortBy', sortBy);

            dispatch('updateQuery');
        },
        resetPriceRange: ({ state, dispatch, commit }) => {
            commit('setPriceRange', state.defaultPriceRange);

            dispatch('updateQuery');
        },
        updateQuery({ state, getters }) {
            let query = getters.getQueryParams;

            if (!_.isEqual(query, $nuxt.$route.query)) {
                $nuxt.$router.push({
                    path: $nuxt.$route.path,
                    query: query,
                });
            }
        },
        bootFromQuery({ state, commit }, query) {
            let {
                priceRange,
                queryObject,
                sortBy,
            } = buildFromQueryParamToState(state, query);

            commit('setPriceRange', priceRange);

            commit('setSortBy', sortBy);

            commit('setQuery', queryObject);
        },
        resetFilter({ commit, dispatch }) {
            commit('resetFilter');

            dispatch('updateQuery');
        },
    },

    getters: {
        isChangedPriceRange: (state, getters) => {
            return !_.isEqual(
                getters.priceRangeMutated,
                state.defaultPriceRange
            );
        },
        selectedItems: state => {
            var items = [];

            for (var attrId in state.query) {
                let attribute = _.find(state.attributes, {
                    id: parseInt(attrId),
                });

                if (!attribute) {
                    continue;
                }

                items = items.concat(
                    attribute.items.filter(item => {
                        //If is multi array of attributes
                        if (_.isArray(state.query[attrId])) {
                            return _.includes(state.query[attrId], item.id);
                        }

                        //If is simple attribute item value
                        else if (state.query[attrId] == item.id) {
                            return true;
                        }
                    })
                );
            }

            return items;
        },
        isItemChecked: state => item => {
            const { attribute_id, id } = item;

            let values = state.query[attribute_id] || [];

            return values.indexOf(id) > -1;
        },
        isAttributesSelected: state => {
            return Object.keys(state.query).length > 0;
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
    },
};

module.exports = store;
