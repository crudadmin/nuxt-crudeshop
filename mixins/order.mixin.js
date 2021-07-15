module.exports = {
    methods: {
        processOrder(response, { success }) {
            this.$bus.$emit('tracking/purchase', response.data.order);

            //We need reset cart
            this.$store.commit('cart/setCart', response.data.cart);

            let payment = response.data.payment;

            if (payment.url) {
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
            } else {
                success();
            }
        },
    },
};
