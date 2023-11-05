import _ from 'lodash';

import Model from './Model';

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
        ].filter((item) => item || 0);

        return key.join('-');
    }

    getName() {
        return this.getIdentifier().getName(this);
    }

    getPrice(options) {
        const {
            key = 'priceWithVat',
            withChildItems = false,
            total = false,
        } = options;

        let parentPrice = this.getIdentifier().getPrice(this, key);

        if (total === true) {
            parentPrice = parentPrice * this.quantity;
        }

        if (withChildItems === true) {
            this.getAssignedItems().forEach((subItem) => {
                parentPrice += subItem.getPrice({ key, total });
            });
        }

        return parentPrice;
    }

    getIdentifier() {
        let identifiers = useCartIdentifiers();

        return (
            identifiers[this.identifier || 'products'] || identifiers['default']
        );
    }

    getCartItem(key = null) {
        let identifier = this.getIdentifier();

        if (identifier) {
            return identifier.getCartItem(this, key);
        }
    }

    /**
     * Return total price with multiple quantities
     *
     * @param  string  key
     */
    totalPriceFormat(key) {
        let total = this.getPrice(key) * this.quantity;

        return useStoreStore().priceFormat(total);
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

        return useStoreStore().priceFormat(total);
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
        let items = useCartStore().getCartItems();

        return items.filter((item) => {
            return this.isCartItemParent(item);
        });
    }

    updateQuantity(quantity) {
        useCartStore().updateQuantity({
            item: this,
            quantity: quantity,
        });
    }

    remove() {
        useCartStore().removeItem(this);
    }
}

export default CartItem;
