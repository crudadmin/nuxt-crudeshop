module.exports = {
    cartKey: 'cart_token',

    refreshToken(storage, token) {
        //Set token if has been changed
        if (storage.getUniversal(this.cartKey) !== token) {
            storage.setUniversal(this.cartKey, token);
        }
    },

    getCartToken(storage) {
        return storage.getUniversal(this.cartKey);
    },
};
