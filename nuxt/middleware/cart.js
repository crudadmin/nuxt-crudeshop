export default defineNuxtRouteMiddleware(async (to, from) => {
    //If cart has errors
    try {
        const step = useCartStep(to);

        var { data } = await useAxios({
            enabledHeaders: {
                cartStep: false,
            },
        }).$get(useAction('Cart\\CartController@passesValidation', step));

        if (data) {
            useCartStore().setCart(data);
        }
    } catch (e) {
        //If is browser, we want show alert
        if (process.client) {
            const message = e.response.data.orderErrors.join('<br>');

            useErrorAlert(message);
        }

        return navigateTo({
            name: to.meta.goTo,
        });
    }
});
