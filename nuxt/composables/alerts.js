export const useShowPaymentModal = (options) => {
    const { successMessage } = options || {};

    var query = useRoute().query;

    //Payment messages
    if (query && query.paymentError && query.paymentMessage) {
        useErrorAlert(query.paymentMessage);
    } else if (query && query.paymentSuccess) {
        useSuccessAlert(
            successMessage ||
                useTranslator().__('Platba bola úspešne zaznamenaná. Ďakujeme.')
        );
    }
};
