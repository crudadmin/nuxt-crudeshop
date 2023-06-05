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
    const $axios = createAxios(
        {
            baseURL: useRuntimeConfig().API_URL,
            addHeaders() {
                let headers = useAppHeaders();

                return headers;
            },
        },
        isServer
    );

    return $axios;
};
