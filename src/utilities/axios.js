import axios from 'axios';
import https from 'https';
import crudadmin from '../crudadmin.js';
import Localization from './Localization.js';

export var $axios = null;

export const addInterceptors = ($axios) => {
    $axios.interceptors.request.use(
        (successfulReq) => {
            //Push admin headers into each request
            if (successfulReq.headers) {
                //Add cart and auth headers into axios
                var storeHeaders = {
                    ...crudadmin.getAuthorizationHeaders(),
                    ...Localization.getLocaleHeaders(),
                };

                for (var key in storeHeaders) {
                    successfulReq.headers[key] = storeHeaders[key];
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
    $axios = axios.create({
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

    addInterceptors($axios);

    // Request helpers ($get, $post, ...)
    addCustomMethods($axios);

    return $axios;
};

// export default $axios;
