import https from 'https';
import { createAxios } from '../../src/utilities/axios';

const isServer = process.server;

export const useAppHeaders = () => {
    let obj = {};

    //Locale
    let localeSlug = useGetLocaleSlug();
    if (localeSlug) {
        obj['App-Locale'] = localeSlug;
    }

    //Cart token
    let _cartToken;
    if ((_cartToken = useGetCartToken())) {
        obj['Cart-Token'] = _cartToken;
    }

    //Authorization
    let token = useGetAuthToken();
    if (token) {
        obj['Authorization'] = 'Bearer ' + token;
    }

    return obj;
};

export const useAxios = () => {
    const headers = useAppHeaders();

    const $axios = createAxios({
        baseURL: useRuntimeConfig().public.API_URL,
        addHeaders() {
            return headers;
        },
    });

    //Allow self signed https for development purposes
    if (isServer) {
        $axios.defaults['httpsAgent'] = new https.Agent({
            rejectUnauthorized: false,
        });
    }

    return $axios;
};
