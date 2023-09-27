import _ from 'lodash';

export const buildAttributesFromState = (filter, attributes) => {
    let query = {};

    for (var attrId in filter) {
        let attribute = _.find(attributes, {
            id: parseInt(attrId),
        });

        if (attribute) {
            let value = filter[attrId];

            if (_.isArray(value)) {
                let queryString = _.uniq(value.map((id) => parseInt(id))).join(
                    ','
                );

                if (queryString) {
                    query[attribute.slug] = queryString;
                }
            } else {
                query[attribute.slug] = value;
            }
        }
    }

    return query;
};

export const buildAttributesFromQuery = (attributes, query) => {
    let filterObject = {};

    for (var key in query) {
        //Skip reserved queries
        if (key.substr(0, 1) == '_') {
            continue;
        }

        //Boot attributes
        let attribute = _.find(attributes, { slug: key });

        if (attribute) {
            let values = (query[key] + '').split(',').map((id) => parseInt(id));

            filterObject[attribute.id] =
                values.length == 1 ? values[0] : values;
        }
    }

    return filterObject;
};

export const buildQueryFromObject = (params) => {
    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map((k) => esc(k) + '=' + esc(params[k]))
        .join('&');

    return query;
};

export const hasAttributesChanged = (attributes, newQuery, oldQuery) => {
    attributes = Object.values(attributes);

    for (attribute of attributes) {
        if (newQuery[attribute.slug] != oldQuery[attribute.slug]) {
            return true;
        }
    }

    return false;
};

export const castAndSortFilterKeys = (object) => {
    if (typeof object != 'object') {
        return object;
    }

    let keys = _.sortBy(Object.keys(object)),
        newObject = {};

    for (key of keys) {
        newObject[key] = _.isNumber(object[key])
            ? object[key] + ''
            : object[key];
    }

    return newObject;
};

export const queryBuilder = {
    _price: {
        filterEnabled({ state, getters }) {
            return getters.isChangedPriceRange;
        },
        set({ commit }, value) {
            let priceRange = (value + '')
                .split(',')
                .slice(0, 2)
                .map((price) => parseFloat(price));

            commit('setPriceRange', priceRange);
        },
        get({ state, getters }) {
            if (
                getters.isChangedPriceRange &&
                state.priceRange.filter((item) => item).length
            ) {
                return state.priceRange.join(',');
            }
        },
        reset({ state }) {
            state.priceRange = _.cloneDeep(state.defaultPriceRange);
        },
    },
    _prices: {
        filterEnabled({ state, getters }) {
            return state.multiplePriceRanges.length >= 1;
        },
        set({ commit }, value) {
            if (!value) {
                return;
            }

            let priceRanges = (value + '')
                .split(';')
                .map((range) =>
                    range
                        .split(',')
                        .filter((item) => item)
                        .map((item) => parseFloat(item))
                )
                .filter((item) => item.length);

            commit('setMultiplePriceRanges', priceRanges);
        },
        get({ state, getters }) {
            if (state.multiplePriceRanges.length) {
                return state.multiplePriceRanges
                    .map((range) => range.join(','))
                    .join(';');
            }
        },
        reset({ state }) {
            state.multiplePriceRanges = [];
        },
    },
    _search: {
        filterEnabled({ state, getters }) {
            return getters.getStaticFilter('_search') ? true : false;
        },
        set({ commit }, value) {
            return value;
        },
        get({ state, getters }, value) {
            return value;
        },
        reset({ state }) {
            state.filters._search = null;
        },
    },
    _sort: {
        filterEnabled: false,
        set({ commit }, value) {
            return value;
        },
        get({ state, getters }, value) {
            return value;
        },
    },
    _limit: {
        filterEnabled: false,
        set({ commit }, value) {
            return value;
        },
        get({ state, getters }, value) {
            return value;
        },
    },
};
