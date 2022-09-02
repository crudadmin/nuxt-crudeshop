const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Model = require('./Model');

class Discount extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    getMessageProperties(message, hasVat) {
        hasVat = _.isNil(hasVat) ? crudadmin.store.state.store.vat : hasVat;

        return {
            name: message.name,
            value:
                typeof message.value == 'object'
                    ? message.value[hasVat ? 'withVat' : 'withoutVat']
                    : message.value,
            discount: this,
        };
    }

    getFormatedMessages(hasVat) {
        return this.messages.map((message) =>
            this.getMessageProperties(message, hasVat)
        );
    }

    getName(index = 0) {
        let message = this.getFormatedMessages()[index];

        return message ? message.name : null;
    }

    getValue(index = 0) {
        let message = this.getFormatedMessages()[index];

        return message ? message.value : null;
    }

    getCode(index = 0) {
        let message = this.getFormatedMessages()[index];

        return message ? message.discount.messages[0].code.code : null;
    }
}

module.exports = Discount;
