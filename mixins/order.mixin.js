const redirectIfCartIsNotValid = async ({ app, step, goTo }) => {
    const { $axios, $action, $translator, redirect, store } = app;

    //If cart has errors
    try {
        var response = await $axios.$get(
            $action('Cart\\CartController@passesValidation', step)
        );

        if (response.data) {
            store.commit('cart/setCart', response.data);
        }

        return response;
    } catch (e) {
        //If is browser, we want show alert
        if (process.client) {
            $nuxt.$dialog.destroy();

            $nuxt.$dialog.alert(e.response.data.orderErrors.join('<br>'), {
                html: true,
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
    data() {
        return {
            loading: false,
            stripePayment: {
                secret: null,
                return_url: null,
                enabled: false,
                loading: false,
                error: null,
            },
        };
    },
    methods: {
        processOrder(
            response,
            { callback, successWithoutCallback, stripeIntentCallback }
        ) {
            this.$bus.$emit('tracking/purchase', response.data.order);

            //We need reset cart
            this.$store.commit('cart/setCart', response.data.cart);

            let payment = response.data.payment;

            if (callback && typeof callback == 'function') {
                callback(payment, response);
            }

            //Stripe elements payment
            else if (payment.provider == 'StripeIntentPayment') {
                if (stripeIntentCallback) {
                    stripeIntentCallback(payment, response);
                } else {
                    this.stripeCartElements(payment.secret, payment.return_url);
                }
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
        initializeStripe(callback) {
            let stripePbKey = this.backendEnv('STRIPE_PB_KEY');

            if (!stripePbKey || !process.browser) {
                return;
            }

            this.bootStripe = setInterval(() => {
                if (window.Stripe) {
                    this.$stripe = window.Stripe(stripePbKey);

                    clearInterval(this.bootStripe);

                    if (callback) {
                        callback();
                    }
                }
            }, 50);
        },
        stripeCartElements(secret, return_url) {
            this.stripePayment.enabled = true;
            this.stripePayment.secret = secret;
            this.stripePayment.return_url = return_url;

            // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 3
            this.$elements = this.$stripe.elements({
                clientSecret: this.stripePayment.secret,
                // Fully customizable with appearance API.
                appearance: {
                    /*...*/
                },
            });

            // Create and mount the Payment Element
            const paymentElement = this.$elements.create('payment');

            paymentElement.mount('#payment-element');

            paymentElement.on('ready', () => {
                this.scrollTo('#payment-element');
            });
        },
        async submitCard() {
            if (this.stripePayment.loading) {
                return;
            }

            this.stripePayment.loading = true;
            this.stripePayment.error = null;

            const { error, paymentIntent } = await this.$stripe.confirmPayment({
                //`Elements` instance that was used to create the Payment Element
                elements: this.$elements,
                confirmParams: {
                    return_url: this.stripePayment.return_url,
                },
                // redirect: 'if_required', (only dev testing)
            });

            this.stripePayment.loading = false;

            if (error) {
                console.error('[stripe payment]', error);

                // This point will only be reached if there is an immediate error when
                // confirming the payment. Show error to your customer (for example, payment
                // details incomplete)
                this.stripePayment.error = error.message;
            } else {
                console.log('[stripe payment]', paymentIntent);

                //Completed:
                // Your customer will be redirected to your `return_url`. For some payment
                // methods like iDEAL, your customer will be redirected to an intermediate
                // site first to authorize the payment, then redirected to the `return_url`.
            }
        },
    },
};
