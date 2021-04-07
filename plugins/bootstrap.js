import https from 'https';

import Vue from 'vue';
import CrudAdmin from '~/crudadmin/crudadmin.js';

export default async ({ $axios, store }, inject) => {
    CrudAdmin.bootStore(store);

    //Add cart and auth headers into axios
    var authHeaders = CrudAdmin.getAuthorizationHeaders();
    for (var key in authHeaders) {
        $axios.setHeader(key, authHeaders[key]);
    }
};
