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
});
