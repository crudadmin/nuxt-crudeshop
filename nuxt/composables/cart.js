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
        return onCartFetch(cartStore.data);
    }

    // prettier-ignore
    var { data } = await useAxios().$get(useAction('Cart\\CartController@'+(full === true ? 'getFullSummary' : 'getSummary')), {
        headers: { 'Cart-Initialize': 1 },
    });

    onCartFetch(data);

    useSetCartToken(data.cartToken);
    cartStore.setCart(data);
};

export const useCartStep = (route) => {
    route = route || useRoute();

    if (route && route.matched) {
        return route.matched[0]?.meta?.cartStep;
    }
};

export const useProcessOrder = (
    response,
    { callback, successWithoutCallback }
) => {
    // this.$bus.$emit('tracking/purchase', response.data.order);

    //We need reset cart
    useCartStore().setCart(response.data.cart);

    let payment = response.data.payment;

    if (callback && typeof callback == 'function') {
        callback(payment, response);
    }

    //Automatic callback
    else if (payment.url) {
        if (payment.provider == 'GopayPayment') {
            if (window._gopay) {
                _gopay.checkout({
                    gatewayUrl: payment.url,
                    inline: true,
                });
            } else {
                window.location.href = payment.url;
            }
        } else if (payment.provider == 'GPWebPayment') {
            window.location.href = payment.url;
        } else {
            window.location.href = payment.url;
        }
    }

    //If no callback has been found
    else if (successWithoutCallback) {
        successWithoutCallback(payment, response);
    }
};

export const useFetchOrder = async (id, hash) => {
    let response = await useAxios().$get(
        useAction('Cart\\CartController@success', id, hash)
    );

    return response;
};

export const useAsyncFetchOrder = async (id, hash) => {
    const { data } = await useAsyncData('cart.order.' + id, () => {
        return useFetchOrder(id, hash);
    });

    return {
        order: data.value.data.order,
        items: data.value.data.items,
        invoice_pdf: data.value.data.invoice_pdf,
    };
};
