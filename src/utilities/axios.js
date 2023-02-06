import axios from 'axios';
import https from 'https';

export const addInterceptors = ($axios, addHeaders) => {
    $axios.interceptors.request.use(
        (successfulReq) => {
            //Push admin headers into each request
            if (successfulReq.headers) {
                // prettier-ignore
                console.log('[AXIOS]', successfulReq.method.toUpperCase(), '-', successfulReq.url);

                //Add cart and auth headers into axios
                var appHeaders =
                    typeof addHeaders == 'function' ? addHeaders() : {};

                for (var key in appHeaders) {
                    successfulReq.headers[key] = appHeaders[key];
                }
            }

            return successfulReq;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};

const addCustomMethods = ($axios) => {
    for (let method of [
        'request',
        'delete',
        'get',
        'head',
        'options',
        'post',
        'put',
        'patch',
    ]) {
        $axios['$' + method] = async function () {
            return this[method]
                .apply(this, arguments)
                .then((res) => res && res.data);
        };
    }
};

export const createAxios = (options = {}) => {
    const $axios = axios.create({
        ...options,
        headers: {
            common: {},
        },
    });

    //Allow self signed https for development purposes
    if (process.server) {
        $axios.defaults['httpsAgent'] = new https.Agent({
            rejectUnauthorized: false,
        });
    }

    addInterceptors($axios, options.addHeaders);

    // Request helpers ($get, $post, ...)
    addCustomMethods($axios);

    return $axios;
};
