import https from 'https';

import Vue from 'vue';
import CrudAdmin from 'crudeshop';
import axiosMutator from 'crudeshop/utilities/axiosMutator';

import ProductIdentifier from 'crudeshop/identifiers/ProductIdentifier';
import DefaultIdentifier from 'crudeshop/identifiers/DefaultIdentifier';

export default async ({ $axios, store }, inject) => {
    axiosMutator($axios);

    CrudAdmin.bootStore(store);

    //Register cart identifiers
    CrudAdmin.addIdentifier('products', ProductIdentifier);
    CrudAdmin.addIdentifier('default', DefaultIdentifier);

    inject('crudadmin', CrudAdmin);
};
