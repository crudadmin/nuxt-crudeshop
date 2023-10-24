import https from 'https';
import { createAxios } from '../../src/utilities/axios';

const isServer = process.server;

export const useAppHeaders = (options = {}) => {
    let obj = {},
        enabledHeaders = options.enabledHeaders || {};

    //Locale
    if (enabledHeaders.appLocale !== false) {
        let localeSlug = useGetLocaleSlug();
        if (localeSlug) {
            obj['App-Locale'] = localeSlug;
        }
    }

    //Cart token
    if (enabledHeaders.cartToken !== false) {
        let _cartToken;
        if ((_cartToken = useGetCartToken())) {
            obj['Cart-Token'] = _cartToken;
        }
    }

    //Authorization
    if (enabledHeaders.authorization !== false) {
        let token = useGetAuthToken();
        if (token) {
            obj['Authorization'] = 'Bearer ' + token;
        }
    }

    if (enabledHeaders.cartStep !== false) {
        let cartStep = useCartStep();
        if (cartStep) {
            obj['Cart-Step'] = cartStep;
        }
    }

    return obj;
};

export const useAxios = (options) => {
    const headers = useAppHeaders(options);

    const $axios = createAxios({
        baseURL: useRuntimeConfig().public.API_URL,
        addHeaders() {
            return headers;
        },
        ...options,
    });

    //Allow self signed https for development purposes
    if (isServer) {
        $axios.defaults['httpsAgent'] = new https.Agent({
            rejectUnauthorized: false,
        });
    }

    return $axios;
};
