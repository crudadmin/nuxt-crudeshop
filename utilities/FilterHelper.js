const _ = require('lodash');

const buildQueryParamFromState = (state, getters) => {
    let query = {},
        filter = state.filter;

    for (var attrId in filter) {
        let attribute = _.find(state.attributes, {
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

    if (
        getters.isChangedPriceRange &&
        state.priceRange.filter(item => item).length
    ) {
        query['_price'] = state.priceRange.join(',');
    }

    if (state.sortBy) {
        query['_sort'] = state.sortBy;
    }

    if (state.search) {
        query['_search'] = state.search;
    }

    return query;
};

const buildFromQueryParamToState = (state, query) => {
    let filterObject = {},
        priceRange = null,
        sortBy = null,
        search = null;

    for (var key in query) {
        //Boot price
        if (key == '_price') {
            priceRange = (query[key] + '')
                .split(',')
                .slice(0, 2)
                .map(price => parseFloat(price));
        }

        //Boot order
        else if (key == '_sort') {
            sortBy = query[key];
        }

        //Boot search
        else if (key == '_search') {
            search = query[key];
        }

        //Boot attributes
        else {
            let attribute = _.find(state.attributes, { slug: key });

            if (attribute) {
                filterObject[attribute.id] = (query[key] + '')
                    .split(',')
                    .map(id => parseInt(id));
            }
        }
    }

    return { filterObject, priceRange, sortBy, search };
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

module.exports = {
    buildQueryParamFromState,
    buildFromQueryParamToState,
    buildQueryFromObject,
    hasAttributesChanged,
};
