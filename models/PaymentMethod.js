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
}

module.exports = PaymentMethod;
