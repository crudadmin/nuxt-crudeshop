const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Model = require('./Model');

class Discount extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    getProperties(hasVat) {
        hasVat = _.isNil(hasVat) ? crudadmin.store.state.store.vat : hasVat;

        var message;

        if (this.message) {
            if (_.isArray(this.message)) {
                message = this.message
                    .map(msg => msg[hasVat ? 'withVat' : 'withoutVat'])
                    .join(', ');
            } else if (typeof this.message == 'object') {
                message = this.message[hasVat ? 'withVat' : 'withoutVat'];
            } else {
                message = this.message;
            }
        }

        if (!message || this.value == 0) {
            return null;
        }

        return {
            name: this.name,
            value: message,
        };
    }

    getName() {
        return this.getProperties().name;
    }

    getValue() {
        return this.getProperties().value;
    }
}

module.exports = Discount;
