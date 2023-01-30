import https from 'https';
import crudadmin from '../crudadmin.js';
import Localization from './Localization.js';

export default ($axios) => {
    //Allow self signed https for development purposes
    $axios.defaults['httpsAgent'] = new https.Agent({
        rejectUnauthorized: false,
    });

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
