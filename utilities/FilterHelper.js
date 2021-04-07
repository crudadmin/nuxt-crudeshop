import _ from 'lodash';

export const buildQueryParamFromState = (state, getters) => {
    let query = {};

    for (var attrId in state.query) {
        let attribute = _.find(state.attributes, {
            id: parseInt(attrId),
        });

        if (attribute) {
            let value = state.query[attrId];

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

    if (getters.isChangedPriceRange) {
        query['_price'] = state.priceRange.join(',');
    }

    return query;
};

export const buildFromQueryParamToState = (state, query) => {
    let queryObject = {},
        priceRange = null;

    for (var key in query) {
        //Boot price
        if (key == '_price') {
            priceRange = query[key]
                .split(',')
                .slice(0, 2)
                .map((price) => parseFloat(price));
        }

        //Boot attributes
        else {
            let attribute = _.find(state.attributes, { slug: key });

            if (attribute) {
                queryObject[attribute.id] = query[key]
                    .split(',')
                    .map((id) => parseInt(id));
            }
        }
    }

    return { queryObject, priceRange };
};

export const buildQueryFromObject = (query) => {
    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map((k) => esc(k) + '=' + esc(params[k]))
        .join('&');

    return query;
};
