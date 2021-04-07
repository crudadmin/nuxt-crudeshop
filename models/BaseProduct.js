import _ from 'lodash';
import crudadmin from '~/crudadmin/crudadmin';

class BaseProduct {
    constructor(rawObject) {
        //Copy all given Product attributes
        for (var key in rawObject) {
            this[key] = rawObject[key];
        }
    }

    /**
     * Prices
     *
     */
    priceFormat(key) {
        let number = this[key];

        return crudadmin.store.getters['store/priceFormat'](number);
    }

    hasDiscount() {
        return this.initialPriceWithVat > this.priceWithVat;
    }

    discountPercentage() {
        return (
            100 -
            (100 / this.initialPriceWithVat) * this.priceWithVat
        ).toFixed(0);
    }

    discountPrice() {
        return this.initialPriceWithVat - this.priceWithVat;
    }

    /**
     * Attributes
     *
     */
    getAttribute(attribute_id) {
        return _.find(this.attributes_items, {
            attribute_id,
        });
    }

    getAttributeItems(attribute_id) {
        let attribute = this.getAttribute(attribute_id);

        if (!attribute) {
            return [];
        }

        return attribute.items;
    }

    getAttributeItemId(attribute_id) {
        let items = this.getAttributeItems(attribute_id);

        return items[0] ? items[0].id : null;
    }
}

export default BaseProduct;
