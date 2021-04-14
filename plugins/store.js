import cartModule from 'crudeshop/store/cart';
import storeModule from 'crudeshop/store/store';
import filterModule from 'crudeshop/store/filter';

export default function({ app, store }, inject) {
    let storeModules = {
        cart: cartModule,
        store: storeModule,
        filter: filterModule,
    };

    //Register modules if they are not registred
    //Because we may extend or rewrite given modules
    for (var key in storeModules) {
        if (store.hasModule(key) == false) {
            store.registerModule(key, storeModules[key]);
        }
    }
}
