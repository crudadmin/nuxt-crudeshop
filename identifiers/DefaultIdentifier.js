import Product from '../models/Product';
import ProductsVariant from '../models/ProductsVariant';
import Identifier from './Identifier';

class ProductIdentifier extends Identifier {
    identifierKeys() {
        return {};
    }

    /**
     * Returns name of product from cart item
     */
    getName(CartItem) {
        return CartItem.item_name;
    }

    /**
     * Return cart item price value specific price type
     *
     * @param  CartItem  CartItem
     * @param  string  key
     */
    getPrice(CartItem, key = 'priceWithVat') {
        if (key.indexOf('withVat') > -1) {
            return CartItem.item_price_vat;
        } else {
            return CartItem.item_price;
        }
    }
}

export default ProductIdentifier;
