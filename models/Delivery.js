const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Model = require('./Model');

class Delivery extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    isSelected() {
        return crudadmin.store.getters['cart/isSelectedDelivery'](this);
    }

    getPriceTillFreeDelivery() {
        let priceWithVat = crudadmin.store.state.cart.summary.priceWithVat || 0;

        return _.max([0, this.free_from - priceWithVat]);
    }

    isReceivedFreeDelivery() {
        let priceWithVat = crudadmin.store.state.cart.summary.priceWithVat || 0;

        return priceWithVat >= this.free_from;
    }

    isProvider(providerName) {
        return this.shippingProvider?.name === providerName;
    }
}

module.exports = Delivery;
