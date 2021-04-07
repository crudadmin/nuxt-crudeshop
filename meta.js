import _ from 'lodash';
import { bindModelMeta } from './utilities/meta.js';

export default (models) => {
    var options = {
        title: '',
        meta: [],
    };

    models = models ? _.toArray(models).filter((item) => item) : null;

    if (models && models.length > 0) {
        for (var i = 0; i < models.length; i++) {
            bindModelMeta(options, models[i]);
        }
    }

    //We want remove duplicate attributes in reverse order, and then reverse them back
    options.meta = _.uniqBy(options.meta.reverse(), 'hid').reverse();

    return options;
};
