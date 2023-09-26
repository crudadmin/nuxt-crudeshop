import https from 'https';
import { createAxios } from '../../src/utilities/axios';

const isServer = process.server;

export const useAppHeaders = () => {
    let obj = {};

    let token = useGetAuthToken();
    if (token) {
        obj['Authorization'] = 'Bearer ' + token;
    }

    let localeSlug = useGetLocaleSlug();
    if (localeSlug) {
        obj['App-Locale'] = localeSlug;
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
