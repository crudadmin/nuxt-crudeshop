//Roter
import Router from 'vue-router';
import {
    createRouter as createDefaultRouter,
    routerOptions,
} from './defaultRouter';

//Axios
import $axios from '~/.nuxt/axios';
import $auth from '~/.nuxt/auth.js';

import axiosMutator from 'crudeshop/utilities/axiosMutator';
import CrudAdmin from 'crudeshop';
import Localization from 'crudeshop/utilities/Localization';

export async function createRouter(ssrContext, config) {
    const options = routerOptions
        ? routerOptions
        : createDefaultRouter(ssrContext).options;

    //We need reset data on each new request, because otherwise storage will be shared accross all requests
    CrudAdmin.setNewInstance();

    //Assign content into crudadmin
    CrudAdmin.setContext(ssrContext);

    //Set authentification for build request
    CrudAdmin.setAuth($auth);

    //Boot axios for build purposes
    CrudAdmin.setAxios($axios);

    axiosMutator(CrudAdmin.$axios);

    let routes = await Localization.rewriteRoutes(
        options.routes,
        ssrContext ? ssrContext.req.url : null
    );

    return new Router({
        ...options,
        routes,
    });
}
