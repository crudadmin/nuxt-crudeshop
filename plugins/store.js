import _cart from 'crudeshop/store/cart';
import _store from 'crudeshop/store/store';

export default function({ app, store }, inject) {
    store.registerModule('cart', _cart);
    store.registerModule('store', _store);
}
