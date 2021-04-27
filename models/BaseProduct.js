const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Attribute = require('./Attribute');

class BaseProduct {
    constructor(rawObject) {
        //Copy all given Product attributes
        for (var key in rawObject) {
            this[key] = rawObject[key];
        }

        if (this.attributesList) {
            this.attributesList = this.attributesList.map(
                attr => new Attribute(attr)
            );
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
            id: parseInt(attributeId),
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

    /*
     * Any item of given attribute is presnet
     */
    hasAttributeItem(id) {
        return this.hasExactAttributeItem(id);
    }

    /*
     * Only Main/first item of attribute is present
     * This is helpfull when you have need match attribute in alternative filter in product detail
     */
    hasExactAttributeItem(id) {
        return _.find(
            this.attributesList.map(attribute => attribute.items[0]),
            { id }
        )
            ? true
            : false;
    }

    /*
     * Has given product present attribute item in any position
     * For example product has 3 colors, so yellow may be in any position order, and may not be first like in hasExactAttributeItem.
     */
    hasAnyAttributeItem(id) {
        return _.find(
            _.flatten(this.attributesList.map(attribute => attribute.items)),
            { id }
        )
            ? true
            : false;
    }
}

module.exports = BaseProduct;
