const _ = require('lodash');
const crudadmin = require('../crudadmin');

const Model = require('./Model');

class CartItem extends Model {
    constructor(rawObject) {
        super(rawObject);

        if (rawObject instanceof CartItem) {
            return rawObject;
        }

        this.getIdentifier().bootModels(this);
    }

    getItemKey() {
        let key = [
            this.identifier,
            JSON.stringify(this.getIdentifier().buildObject(this)),
            this.hasParentCartItem()
                ? new CartItem({
                      ...this.parentIdentifier.data,
                      identifier: this.parentIdentifier.identifier,
                  }).getItemKey()
                : null,
        ].filter(item => item || 0);

        return key.join('-');
    }

    getName() {
        return this.getIdentifier().getName(this);
    }

    getPrice(key = 'priceWithVat') {
        return this.getIdentifier().getPrice(this, key);
    }

    getIdentifier() {
        return crudadmin.identifiers[this.identifier || 'products'];
    }

    getCartItem() {
        let identifier = this.getIdentifier();

        if (identifier) {
            return identifier.getCartItem(this);
        }
    }

    /**
     * Return total price with multiple quantities
     *
     * @param  string  key
     */
    totalPriceFormat(key) {
        let total = this.getPrice(key) * this.quantity;

        return crudadmin.store.getters['store/priceFormat'](total);
    }

    /**
     * Return total price with multiple quantities with assigned additional items
     *
     * @param  string  key
     */
    totalWithAssignedPriceFormat(key) {
        let total = this.getPrice(key) * this.quantity;

        for (let item of this.getAssignedItems()) {
            total += item.getPrice(key) * item.quantity;
        }

        return crudadmin.store.getters['store/priceFormat'](total);
    }

    hasParentCartItem() {
        return this.parentIdentifier ? true : false;
    }

    isCartItemParent(childItem) {
        if (!childItem.hasParentCartItem()) {
            return false;
        }

        //If identifier are not same
        if (childItem.parentIdentifier.identifier != childItem.identifier) {
            return false;
        }

        let actualIdentifierData = {};
        for (let key in childItem.parentIdentifier.data) {
            if (key in this) {
                actualIdentifierData[key] = this[key];
            }
        }

        return (
            _.isEqual(childItem.parentIdentifier.data, actualIdentifierData) ===
            true
        );
    }

    getAssignedItems() {
        let items = crudadmin.store.getters['cart/getCartItems']();

        return items.filter(item => {
            return this.isCartItemParent(item);
        });
    }
}

module.exports = CartItem;
