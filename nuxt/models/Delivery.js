import _ from 'lodash';
import BaseProduct from './BaseProduct';

class Delivery extends BaseProduct {
    constructor(rawObject) {
        super(rawObject);

        this.loading = ref(false);
    }

    isSelected() {
        return useCartStore().isSelectedDelivery(this);
    }

    isLoading() {
        return this.loading.value;
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

    async set() {
        if (this.isSelected() || this.loading.value === true) {
            return;
        }

        this.loading.value = true;

        await useCartStore().setDelivery(this);

        this.loading.value = false;
    }
}

export default Delivery;
