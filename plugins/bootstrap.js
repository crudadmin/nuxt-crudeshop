import https from 'https';

import Vue from 'vue';
import CrudAdmin from 'crudeshop';
import axiosMutator from 'crudeshop/utilities/axiosMutator';

import ProductIdentifier from 'crudeshop/identifiers/ProductIdentifier';

export default async ({ $axios, store }, inject) => {
    axiosMutator($axios);

    CrudAdmin.bootStore(store);

    //Register cart identifiers
    CrudAdmin.addIdentifier('products', ProductIdentifier);

    inject('crudadmin', CrudAdmin);
};
