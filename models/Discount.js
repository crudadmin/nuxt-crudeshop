const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Model = require('./Model');

class Discount extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    getProperties(hasVat) {
        hasVat = _.isNil(hasVat) ? crudadmin.store.state.store.vat : hasVat;

        let itemMessage = this.message,
            message =
                itemMessage && typeof itemMessage == 'object'
                    ? itemMessage[hasVat ? 'withVat' : 'withoutVat']
                    : itemMessage;

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
