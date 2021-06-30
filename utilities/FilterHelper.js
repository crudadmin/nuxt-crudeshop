const _ = require('lodash');

const buildAttributesFromState = (filter, attributes) => {
    let query = {};

    for (var attrId in filter) {
        let attribute = _.find(attributes, {
            id: parseInt(attrId),
        });

        if (attribute) {
            let value = filter[attrId];

            if (_.isArray(value)) {
                let queryString = _.uniq(value.map(id => parseInt(id))).join(
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

const buildAttributesFromQuery = (attributes, query) => {
    let filterObject = {};

    for (var key in query) {
        //Skip reserved queries
        if (key.substr(0, 1) == '_') {
            continue;
        }

        //Boot attributes
        let attribute = _.find(attributes, { slug: key });

        if (attribute) {
            filterObject[attribute.id] = (query[key] + '')
                .split(',')
                .map(id => parseInt(id));
        }
    }

    return filterObject;
};

const buildQueryFromObject = params => {
    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    return query;
};

const hasAttributesChanged = (attributes, newQuery, oldQuery) => {
    attributes = Object.values(attributes);

    for (attribute of attributes) {
        if (newQuery[attribute.slug] != oldQuery[attribute.slug]) {
            return true;
        }
    }

    return false;
};

const queryBuilder = {
    _price: {
        filterEnabled({ state, getters }) {
            return getters.isChangedPriceRange;
        },
        set({ commit }, value) {
            let priceRange = (value + '')
                .split(',')
                .slice(0, 2)
                .map(price => parseFloat(price));

            commit('setPriceRange', priceRange);
        },
        get({ state, getters }) {
            if (
                getters.isChangedPriceRange &&
                state.priceRange.filter(item => item).length
            ) {
                return state.priceRange.join(',');
            }
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
    _search: {
        filterEnabled: false,
        set({ commit }, value) {
            return value;
        },
        get({ state, getters }, value) {
            return value;
        },
    },
};

module.exports = {
    buildAttributesFromState,
    buildAttributesFromQuery,
    queryBuilder,
    buildQueryFromObject,
    hasAttributesChanged,
};
