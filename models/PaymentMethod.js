import _ from 'lodash';
import crudadmin from '../crudadmin';
import Model from './Model';

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

export default PaymentMethod;
