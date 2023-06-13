import https from 'https';
import { createAxios } from '../../src/utilities/axios';

const isServer = process.server;

export const useAppHeaders = () => {
    let obj = {};

    let token = useAuthStore().token;

    if (token) {
        obj['Authorization'] = 'Bearer ' + token;
    }

    return obj;
};

export const useAxios = () => {
    const $axios = createAxios({
        baseURL: useRuntimeConfig().API_URL,
        addHeaders() {
            let headers = useAppHeaders();

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
