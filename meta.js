const _ = require('lodash');
const { bindModelMeta } = require('./utilities/meta.js');

module.exports = models => {
    var options = {
        title: '',
        meta: [],
    };

    models = models ? _.toArray(models).filter(item => item) : null;

    if (models && models.length > 0) {
        let reversedModels = models.reverse();

        for (var i = 0; i < reversedModels.length; i++) {
            bindModelMeta(options, reversedModels[i]);
        }
    }

    //We want remove duplicate attributes in reverse order, and then reverse them back
    options.meta = _.uniqBy(options.meta.reverse(), 'hid').reverse();

    return options;
};
