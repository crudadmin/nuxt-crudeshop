const https = require('https');

const Vue = require('vue');
const CrudAdmin = require('../crudadmin.js');

module.exports = async ({ $axios, store }, inject) => {
    CrudAdmin.bootStore(store);

    //Add cart and auth headers into axios
    var authHeaders = CrudAdmin.getAuthorizationHeaders();
    for (var key in authHeaders) {
        $axios.setHeader(key, authHeaders[key]);
    }
};
