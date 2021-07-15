const Product = require('../models/Product');
const ProductsVariant = require('../models/ProductsVariant');
const Identifier = require('./Identifier');

class ProductIdentifier extends Identifier {
    identifierKeys() {
        return {
            variant: ProductsVariant,
            product: Product,
        };
    }

    buildObject(object) {
        let data = {
            id: parseInt(object.product_id || object.id),
        };

        if (object.variant_id) {
            data.variant_id = parseInt(object.variant_id);
        }

        return data;
    }

    /**
     * Returns name of product from cart item
     */
    getName(CartItem) {
        if (CartItem.variant && CartItem.variant.name) {
            return CartItem.variant.name;
        }

        if (CartItem.product) {
            return CartItem.product.name;
        }
    }

    /**
     * Return cart item price value specific price type
     *
     * @param  CartItem  CartItem
     * @param  string  key
     */
    getPrice(CartItem, key = 'priceWithVat') {
        return CartItem.getCartItem()[key];
    }
}

module.exports = ProductIdentifier;
