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

export const useRedirectIfCartIsNotValid = ({ step, goTo }) => {
    return async (to, from) => {
        //If cart has errors
        try {
            var { data } = await useAxios().$get(
                useAction('Cart\\CartController@passesValidation', step)
            );

            if (data) {
                useCartStore().setCart(data);
            }
        } catch (e) {
            console.log(e);
            //If is browser, we want show alert
            // if (process.client) {
            // const message = e.response.data.orderErrors.join('<br>');

            //TODO: error dialog.
            // $nuxt.$dialog.destroy();

            // $nuxt.$dialog.alert(message, {
            //     html: true,
            //     okText: $translator.__('Okay'),
            //     customClass: 'dialog-error',
            //     backdropClose: true,
            // });
        }

        // return redirect({
        //     name: goTo,
        // });
    };
};

// export default {
//     redirectIfCartIsNotValid,
//     methods: {
//         processOrder(response, { callback, successWithoutCallback }) {
//             this.$bus.$emit('tracking/purchase', response.data.order);

//             //We need reset cart
//             this.$store.commit('cart/setCart', response.data.cart);

//             let payment = response.data.payment;

//             if (callback && typeof callback == 'function') {
//                 callback(payment, response);
//             }

//             //Automatic callback
//             else if (payment.url) {
//                 if (payment.provider == 'GopayPayment') {
//                     if (window._gopay) {
//                         _gopay.checkout({
//                             gatewayUrl: payment.url,
//                             inline: true,
//                         });
//                     } else {
//                         window.location.href = payment.url;
//                     }
//                 } else if (payment.provider == 'GPWebPayment') {
//                     window.location.href = payment.url;
//                 } else {
//                     window.location.href = payment.url;
//                 }
//             }

//             //If no callback has been found
//             else if (successWithoutCallback) {
//                 successWithoutCallback(payment, response);
//             }
//         },
//     },
// };
