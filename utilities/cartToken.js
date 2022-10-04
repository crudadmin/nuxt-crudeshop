module.exports = {
    cartKey: 'cart_token',

    refreshToken(storage, token) {
        //Set token if has been changed
        //And make sure token is set in cookies as well
        if (
            storage.getUniversal(this.cartKey) !== token ||
            storage.getCookie(this.cartKey) !== token
        ) {
            storage.setUniversal(this.cartKey, token);
        }
    },

    getCartToken(storage) {
        return storage.getUniversal(this.cartKey);
    },
};
