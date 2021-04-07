import Router from 'vue-router';

import CrudAdmin from './crudadmin.js';

export async function createRouter(
    ssrContext,
    createDefaultRouter,
    routerOptions
) {
    const options = routerOptions
        ? routerOptions
        : createDefaultRouter(ssrContext).options;

    //We need reset data on each new request, because otherwise storage will be shared accross all requests
    CrudAdmin.setNewInstance();

    CrudAdmin.setContext(ssrContext);

    return new Router({
        ...options,
        routes: await CrudAdmin.rewriteRoutes(options.routes),
    });
}
