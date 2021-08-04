import Vue from 'vue';
import VueGtag from 'vue-gtag';
import CartItemModel from 'crudeshop/models/CartItem.js';

const buildGa4ItemFromCartItem = (CartItem, quantity) => {
    CartItem = new CartItemModel(CartItem);

    let id = CartItem.id,
        model = CartItem.getCartItem();

    return {
        item_id: CartItem.id,
        item_name: model ? model.name : null,
        item_variant: model ? model.attributesText : null,
        price: model ? model.priceWithVat : null,
        currency: 'EUR',
        quantity: _.isNil(quantity) ? CartItem.quantity : quantity,
    };
};

export default async ({ app, store, $bus }) => {
    Vue.use(
        VueGtag,
        {
            config: {
                id: process.env.NUXT_ENV_GTAG_MEASUREMENT_ID,
            },
            appName: process.env.NUXT_ENV_GTAG_APP_NAME,
        },
        app.router
    );

    $bus.$on('tracking/addToCart', ({ cartItem, quantity }) => {
        gtag('event', 'add_to_cart', {
            currency: 'EUR',
            items: [buildGa4ItemFromCartItem(cartItem, quantity)],
        });
    });

    $bus.$on('tracking/removeFromCart', ({ cartItem, quantity }) => {
        gtag('event', 'remove_from_cart', {
            currency: 'EUR',
            items: [buildGa4ItemFromCartItem(cartItem, quantity)],
        });
    });

    $bus.$on('tracking/beginPurchase', () => {
        let items = store.state.cart.items.map(cartItem =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'begin_checkout', {
            currency: 'EUR',
            items: items,
            value: store.state.cart.summary.priceWithVat,
        });
    });

    $bus.$on('tracking/setDelivery', () => {
        let items = store.state.cart.items.map(cartItem =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'add_shipping_info', {
            currency: 'EUR',
            items: items,
            value: store.state.cart.summary.priceWithVat,
            shipping_tier: store.state.cart.selectedDelivery.name,
        });
    });

    $bus.$on('tracking/setPaymentMethod', () => {
        let items = store.state.cart.items.map(cartItem =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'add_payment_info', {
            currency: 'EUR',
            items: items,
            value: store.state.cart.summary.priceWithVat,
            payment_type: store.state.cart.selectedPaymentMethod.name,
        });
    });

    $bus.$on('tracking/purchase', order => {
        let items = store.state.cart.items.map(cartItem =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'purchase', {
            currency: 'EUR',
            transaction_id: order.id,
            items: items,
            value: order.price_vat,
            tax: order.price_vat - order.price,
            payment_type: store.state.cart.selectedPaymentMethod?.name,
            shipping: order.delivery_price,
        });
    });
};
