import Vue from 'vue';
import VueGtag from 'vue-gtag';
import CartItemModel from 'crudeshop/models/CartItem.js';
import { sumBy } from 'lodash';

const currencyCode = () => {
    return (
        ($nuxt.$store.state.store.currency || {}).code || currencyCode()
    ).toUpperCase();
};

const buildGa4ItemFromCartItem = (CartItem, quantity) => {
    CartItem = new CartItemModel(CartItem);

    let id = CartItem.id,
        productOrVariant = CartItem.getCartItem(),
        product = CartItem.getCartItem('product');

    return {
        item_id: CartItem.id,
        item_name: productOrVariant ? productOrVariant.name : null,
        item_variant: productOrVariant ? productOrVariant.attributesText : null,
        price: productOrVariant ? productOrVariant.priceWithVat : null,
        currency: currencyCode(),
        quantity: _.isNil(quantity) ? CartItem.quantity : quantity,
        ...$nuxt.$tracking.onProductModelItem(productOrVariant, product),
    };
};

const sumByItems = (items) => {
    return sumBy(items, (item) => item.price * (item.quantity || 1));
};

export default async ({ app, store, $bus }, inject) => {
    inject('tracking', {
        onProductModelItem: (productOrVariant, product) => {
            let obj = {};

            let categories = [];
            try {
                categories = product ? product.getCategoriesTree()[0] : [];

                for (var i = 0; i < categories.length; i++) {
                    obj['item_category' + (i == 0 ? '' : i + 1)] =
                        categories[i].name;
                }
            } catch (e) {}

            try {
                obj = {
                    ...obj,
                    ...app.$tracking.buildProductItem(
                        productOrVariant,
                        product
                    ),
                };
            } catch {}

            return obj;
        },
        buildProductItem: (productOrVariant, product) => {
            return {};
        },
    });

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
        let items = [buildGa4ItemFromCartItem(cartItem, quantity)];

        gtag('event', 'add_to_cart', {
            currency: currencyCode(),
            value: sumByItems(items),
            items,
        });
    });

    $bus.$on('tracking/removeFromCart', ({ cartItem, quantity }) => {
        let items = [buildGa4ItemFromCartItem(cartItem, quantity)];

        gtag('event', 'remove_from_cart', {
            currency: currencyCode(),
            value: sumByItems(items),
            items,
        });
    });

    $bus.$on('tracking/beginPurchase', (stepName) => {
        let items = store.state.cart.items.map((cartItem) =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', stepName || 'begin_checkout', {
            currency: currencyCode(),
            value: store.state.cart.summary.priceWithVat,
            items: items,
        });
    });

    $bus.$on('tracking/setDelivery', () => {
        let items = store.state.cart.items.map((cartItem) =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'add_shipping_info', {
            currency: currencyCode(),
            items: items,
            value: store.state.cart.summary.priceWithVat,
            shipping_tier: store.state.cart.selectedDelivery.name,
        });
    });

    $bus.$on('tracking/setPaymentMethod', () => {
        let items = store.state.cart.items.map((cartItem) =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'add_payment_info', {
            currency: currencyCode(),
            items: items,
            value: store.state.cart.summary.priceWithVat,
            payment_type: store.state.cart.selectedPaymentMethod.name,
        });
    });

    $bus.$on('tracking/purchase', (order) => {
        let items = store.state.cart.items.map((cartItem) =>
            buildGa4ItemFromCartItem(cartItem)
        );

        gtag('event', 'purchase', {
            currency: currencyCode(),
            transaction_id: order.id,
            items: items,
            value: order.price_vat,
            tax: order.price_vat - order.price,
            payment_type: store.state.cart.selectedPaymentMethod
                ? store.state.cart.selectedPaymentMethod.name
                : null,
            shipping: order.delivery_price,
        });
    });

    $bus.$on('tracking/productDetail', ({ product, productOrVariant }) => {
        dataLayer.push({
            event: 'view_item',
            currency: currencyCode(),
            value: productOrVariant.priceWithVat,
            items: [
                {
                    item_id: productOrVariant.id,
                    item_name: productOrVariant.name,
                    currency: currencyCode(),
                    price: productOrVariant.priceWithVat,
                    ...app.$tracking.onProductModelItem(
                        productOrVariant,
                        product
                    ),
                },
            ],
        });
    });
};
