import _ from 'lodash';
import Model from './Model';

class PaymentMethod extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    isSelected() {
        return useCartStore().isSelectedPaymentMethod(this);
    }

    isProvider(providerName) {
        return this.paymentProvider
            ? this.paymentProvider.name === providerName
            : false;
    }
}

export default PaymentMethod;
