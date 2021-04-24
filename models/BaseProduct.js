const _ = require('lodash');
const crudadmin = require('../crudadmin');

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
    getAttribute(attributeId) {
        return _.find(this.attributesList, {
            id: attributeId,
        });
    }

    getAttributeItems(attributeId) {
        let attribute = this.getAttribute(attributeId);

        if (!attribute) {
            return [];
        }

        return attribute.items;
    }

    getAttributeItemId(attributeId) {
        let items = this.getAttributeItems(attributeId);

        return items[0] ? items[0].id : null;
    }

    hasAttributeItem(id) {
        return _.find(
            _.flatten(this.attributesList.map(attribute => attribute.items)),
            { id }
        )
            ? true
            : false;
    }
}

module.exports = BaseProduct;
