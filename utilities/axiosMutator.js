const https = require('https');
const crudadmin = require('../crudadmin.js');

module.exports = $axios => {
    //Allow self signed https for development purposes
    $axios.defaults['httpsAgent'] = new https.Agent({
        rejectUnauthorized: false,
    });

    $axios.interceptors.request.use(
        successfulReq => {
            //Push admin headers into each request
            if (successfulReq.headers) {
                //Add cart and auth headers into axios
                var authHeaders = crudadmin.getAuthorizationHeaders();

                for (var key in authHeaders) {
                    successfulReq.headers[key] = authHeaders[key];
                }
            }

            return successfulReq;
        },
        error => {
            return Promise.reject(error);
        }
    );
};
