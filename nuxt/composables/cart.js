import ProductIdentifier from '../identifiers/ProductIdentifier';
import DefaultIdentifier from '../identifiers/DefaultIdentifier';

const cartTokenKey = 'cart_token';

export const CartIdentifiers = {
    products: new ProductIdentifier(),
    default: new DefaultIdentifier(),
};

export const useCartIdentifiers = () => {
    return CartIdentifiers;
};

export const useGetCartIdentifier = (key) => {
    let identifiers = useCartIdentifiers();

    return identifiers[key || 'products'];
};

export const useSetCartToken = (token) => {
    useStorage().set(cartTokenKey, token);
};

export const useGetCartToken = () => {
    return useStorage().get(cartTokenKey);
};

export const useFetchCart = async (callback, full = false) => {
    const onCartFetch = (data) => {
        // TODO:
        //Authenticate logged client and cart identification
        // if (data.client) {
        // this.setClient(data.client);
        // }

        //If user is not logged anymore, we need logout him. Otherwise errors may occur.
        // else if ('client' in data && this.$auth.loggedIn) {
        //     this.$auth.logout();
        // }

        //Set cart summary data
        if (data.favourites) {
            useStoreStore().setFavourites(data.favourites);
        }

        //other data
        //...

        if (callback && typeof callback == 'function') {
            callback(data);
        }
    };

    const cartStore = useCartStore();

    //If cart is fully fetched, we does noot need to fetch again in cart.
    //This will result receiving of wrong summary data.
    //Cart may be fetched during validation process.
    if (cartStore.initialized === true && full !== true) {
        return onCartFetch(cartStore.cart.data);
    }

    // prettier-ignore
    var { data } = await useAxios().$get(useAction('Cart\\CartController@'+(full === true ? 'getFullSummary' : 'getSummary')), {
        headers: { 'Cart-Initialize': 1 },
    });

    onCartFetch(data);

    useSetCartToken(data.cartToken);
    cartStore.setCart(data);
};
