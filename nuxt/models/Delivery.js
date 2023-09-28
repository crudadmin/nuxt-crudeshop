import _ from 'lodash';
import Model from './Model';

class Delivery extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    isSelected() {
        return useCartStore().isSelectedDelivery(this);
    }

    getPriceTillFreeDelivery() {
        let priceWithVat = useCartStore().summary.priceWithVat || 0;

        return _.max([0, this.free_from - priceWithVat]);
    }

    isReceivedFreeDelivery() {
        let priceWithVat = useCartStore().summary.priceWithVat || 0;

        return priceWithVat >= this.free_from;
    }

    hasMultipleLocations() {
        return this.multiple_locations === true;
    }

    isProvider(providerName) {
        return this.shippingProvider
            ? this.shippingProvider.name === providerName
            : false;
    }
}

export default Delivery;
