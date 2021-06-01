const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Model = require('./Model');

class PaymentMethod extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    isSelected() {
        return crudadmin.store.getters['cart/isSelectedPaymentMethod'](this);
    }

    isProvider(providerName) {
        return this.paymentProvider
            ? this.paymentProvider.name === providerName
            : false;
    }
}

module.exports = PaymentMethod;
