const _ = require('lodash');
const crudadmin = require('../crudadmin');

const Product = require('./Product');
const ProductsVariant = require('./ProductsVariant');

class CartItem {
    constructor(rawObject) {
        if (rawObject instanceof CartItem) {
            return rawObject;
        }

        //Copy all given Product attributes
        for (var key in rawObject) {
            this[key] = rawObject[key];
        }

        if (this.product) {
            this.product = new Product(this.product);
        }

        if (this.variant) {
            this.variant = new ProductsVariant(this.variant);
        }
    }

    getCartItem() {
        return this.variant || this.product;
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
