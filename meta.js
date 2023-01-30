import _ from 'lodash';
import { bindModelMeta } from './utilities/meta.js';
import crudadmin from './crudadmin.js';

const getActualSeoRoute = (route) => {
    if (crudadmin.seoRoutes.length == 0 || !route) {
        return;
    }

    let matchedRoute = route.matched
        .map((matched) => {
            let meta = matched ? matched.meta || {} : {};

            return meta._original;
        })
        .filter((item) => item);

    if (matchedRoute.length > 0) {
        return _.find(crudadmin.seoRoutes, {
            url: matchedRoute[matchedRoute.length - 1],
        });
    }
};

export default (models, route, properties = {}) => {
    var options = {
        title: '',
        meta: [],
    };

    let actualSeoRoute = getActualSeoRoute(route);

    models = models ? _.toArray(models).filter((item) => item) : [];

    if (actualSeoRoute) {
        models = [actualSeoRoute].concat(models);
    }

    if (models && models.length > 0) {
        let reversedModels = models.reverse();

        for (var i = 0; i < reversedModels.length; i++) {
            bindModelMeta(options, reversedModels[i], properties);
        }
    }

    //We want remove duplicate attributes in reverse order, and then reverse them back
    options.meta = _.uniqBy(options.meta.reverse(), 'hid').reverse();

    return options;
};
