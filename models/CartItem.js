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

    getIdentifier() {
        return crudadmin.identifiers[this.identifier || 'products'];
    }

    getCartItem() {
        let identifier = this.getIdentifier();

        if (identifier) {
            return identifier.getCartItem(this);
        }
    }

    totalPriceFormat(key = 'priceWithVat') {
        let total = this.getCartItem()[key] * this.quantity;

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
