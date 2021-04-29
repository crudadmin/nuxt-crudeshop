class Identifier {
    getCartItem(cartItem) {
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
}

module.exports = Identifier;
