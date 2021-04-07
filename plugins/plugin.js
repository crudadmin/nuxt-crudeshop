const Vue = require('vue');
const https = require('https');
const CrudAdmin = require('../crudadmin.js');

function getRequestModels(data) {
    var models = {};

    if ('model' in data) {
        models = Object.assign(models, data.model);
    }

    return models;
}

function getQueryParams(route, response) {
    let m = route.matched[0];

    //Redirect by component settings
    if (
        m.components &&
        m.components.default &&
        m.components.default.options.apiSlugsPath
    ) {
        return m.components.default.options.apiSlugsPath();
    }

    //If is single url request and only one model has been passed,
    //we can pass redirected slug into request
    if (
        response.data &&
        Object.keys(route.params).length == 1 &&
        route.params.index
    ) {
        let modelsData = getRequestModels(response.data),
            models = Object.keys(modelsData);

        if (models.length !== 1 || !modelsData[models[0]].slug) {
            return;
        }

        return {
            index: models[0],
        };
    }
}

module.exports = async ({ $axios, app, store, route, redirect }, inject) => {
    await CrudAdmin.installCrudAdminMethods();

    inject('translator', await CrudAdmin.getTranslator());
    inject('action', CrudAdmin.action);

    //On budle update
    $axios.onResponse(function(response) {
        //Set buddle hash data
        if (response.data && response.data.bundle_hash) {
            // if (
            //     store.state.$store.bundleHash &&
            //     response.data.bundle_hash &&
            //     store.state.$store.bundleHash != response.data.bundle_hash
            // ) {
            //     let refreshText = $nuxt.$translator.__(
            //         'Práve sme aktualizovali rozhranie eshopu, pre jeho zobrazenie Vám opätovne načítame webovú stránku.'
            //     );

            //     $nuxt.$dialog
            //         .alert(refreshText, {
            //             customClass: 'dialog-info',
            //             okText: $nuxt.$translator.__('Do toho!'),
            //         })
            //         .then(() => {
            //             window.location.reload();
            //         });
            // }

            //We need update new bundle hash if has been changed or set first time
            if (response.data.bundle_hash != store.state.$store.bundleHash) {
                store.commit('store/setBundleHash', response.data.bundle_hash);
            }
        }
    });

    //Allow unauthorized requests
    $axios.defaults.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    //Handle crudadmin findBySlug history support redirects
    $axios.onResponse(function(response) {
        (() => {
            var slugPath;

            if (
                // Request needs to be redirected
                response.request &&
                response.request._redirectable &&
                response.request._redirectable._redirectCount >= 1 &&
                //Data needs to be available
                response.data &&
                //If route params are available
                (slugPath = getQueryParams(route, response))
            ) {
                var params = route.params;

                for (var key in slugPath) {
                    //If given slugsPath key does not exists in request, we does not want to redirect user
                    if (
                        !(slugPath[key] in response.data) ||
                        !response.data[slugPath[key]].slug
                    ) {
                        return;
                    }

                    params[key] = response.data[slugPath[key]].slug;
                }

                //Todo redirect...
                redirect({ name: route.name, params });
            }
        })();

        //Set seo model
        (() => {
            if (response.data) {
                var models = Object.values(getRequestModels(response.data));

                if (models.length > 0) {
                    store.commit('store/setSeoModel', models);
                }
            }

            //Reset seomodel
            app.router.beforeEach((to, from, next) => {
                store.commit('store/setSeoModel', null);

                next();
            });
        })();
    });
};
