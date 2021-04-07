import https from 'https';

import Vue from 'vue';
import CrudAdmin from 'crudeshop';
import axiosMutator from 'crudeshop/utilities/axiosMutator';

export default async ({ $axios, store }, inject) => {
    axiosMutator($axios);

    CrudAdmin.bootStore(store);
};
