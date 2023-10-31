import _ from 'lodash';
import BaseProduct from './BaseProduct';

class PaymentMethod extends BaseProduct {
    constructor(rawObject) {
        super(rawObject);

        this.loading = ref(false);
    }

    isSelected() {
        return useCartStore().isSelectedPaymentMethod(this);
    }

    isLoading() {
        return this.loading.value;
    }

    isProvider(providerName) {
        return this.paymentProvider
            ? this.paymentProvider.name === providerName
            : false;
    }

    async set() {
        if (this.isSelected() || this.loading.value === true) {
            return;
        }

        this.loading.value = true;

        await useCartStore().setPaymentMethod(this);

        this.loading.value = false;
    }
}

export default PaymentMethod;
