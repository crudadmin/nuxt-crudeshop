const redirectIfCartIsNotValid = async ({ app, step, goTo }) => {
    const { $axios, $action, $translator, redirect } = app;

    //If cart has errors
    try {
        var response = await $axios.get(
            $action('Cart\\CartController@passesValidation', step)
        );
    } catch (e) {
        //If is browser, we want show alert
        if (process.client) {
            $nuxt.$dialog.destroy();

            $nuxt.$dialog.alert(e.response.data.orderErrors.join('<br>'), {
                html: true,
                okText: $translator.__('Okay'),
                customClass: 'dialog-error',
                backdropClose: true,
            });
        }

        return redirect({
            name: goTo,
        });
    }
};

module.exports = {
    redirectIfCartIsNotValid,
    methods: {
        processOrder(response, { callback, successWithoutCallback }) {
            this.$bus.$emit('tracking/purchase', response.data.order);

            //We need reset cart
            this.$store.commit('cart/setCart', response.data.cart);

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
        },
    },
};
