class Identifier {
    getCartItem(cartItem, key = null) {
        if (key && cartItem[key]) {
            return cartItem[key];
        }

        for (var key in this.identifierKeys()) {
            if (cartItem[key]) {
                return cartItem[key];
            }
        }
    }

    bootModels(cartItem) {
        let identifiers = this.identifierKeys();

        for (var key in identifiers) {
            if (cartItem[key]) {
                cartItem[key] = new identifiers[key](cartItem[key]);
            }
        }
    }

    buildObject(object) {}

    /**
     * Returns name of product from cart item
     */
    getName(CartItem) {
        //...
    }

    /**
     * Return cart item price value specific price type
     *
     * @param  CartItem  CartItem
     * @param  string  key
     */
    getPrice(CartItem, key = 'priceWithVat') {
        //..
    }
}

export default Identifier;
