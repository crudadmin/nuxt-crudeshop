const https = require('https');
const crudadmin = require('../crudadmin.js');

module.exports = $axios => {
    //Allow self signed https for development purposes
    $axios.defaults['httpsAgent'] = new https.Agent({
        rejectUnauthorized: false,
    });

    //Add cart and auth headers into axios
    var authHeaders = crudadmin.getAuthorizationHeaders();
    for (var key in authHeaders) {
        $axios.setHeader(key, authHeaders[key]);
    }
};
