import {
    addTemplate,
    addPlugin,
    updateTemplates,
    isNuxt2,
    isNuxt3,
} from '@nuxt/kit';
import { join } from 'path';
import fs from 'fs';
import { dirname, resolve } from 'path';

function writeFile(path, contents, callback = () => {}) {
    fs.mkdir(dirname(path), { recursive: true }, function (err) {
        if (err) {
            return callback(err);
        }

        fs.writeFile(path, contents, callback);
    });
}

function buildTranslatableRoutes(buildDir, routes) {
    var rewritedRoutes = [];

    for (var route of routes) {
        rewritedRoutes.push("__('" + route.path + "')");
    }

    const extraFilePath = join(buildDir + '/crudeshop/', 'crudadmin_routes.js');

    var routesString = rewritedRoutes.join(', '),
        content = `{ routes: [${routesString}] }`;

    writeFile(extraFilePath, content);
}

export const addTranslatableRoutes = (nuxt) => {
    //Generate routes translations
    if (isNuxt2()) {
        nuxt.hook('build:done', (builder) => {
            buildTranslatableRoutes(nuxt.options.buildDir, builder.routes);
        });
    } else if (isNuxt2()) {
        nuxt.hook('pages:extend', (routes) => {
            buildTranslatableRoutes(nuxt.options.buildDir, routes);
        });
    }
};

export const addCustomRouter = (nuxt) => {
    const rootDir = resolve(__dirname, '../..');

    // console.log('router adding hmm');
    nuxt.hook('pages:extend', (routes) => {
        // console.log('Router extending:', routes);
    });

    nuxt.hook('builder:generateApp', function (a, b) {
        // a.options.router = {
        //     options: {
        //         routes: function (routes) {
        //             console.log('we can mutate routes here...', routes);
        //             return routes;
        //         },
        //     },
        // };
        console.log('Router prerendegin:', a);
        // return config;
    });

    if (isNuxt2()) {
        // Put default router as .nuxt/defaultRouter.js
        let defaultRouter = require.resolve('@nuxt/vue-app/template/router');

        addTemplate({
            src: defaultRouter,
            fileName: 'defaultRouter.js',
        });

        nuxt.hook('build:done', ({ templateVars }) => {
            //Rewrite router
            writeFile(
                resolve(nuxt.options.buildDir, './router.js'),
                fs
                    .readFileSync(resolve(rootDir, './templates/router.js'))
                    .toString()
            );
        });
    } else if (isNuxt3()) {
    }
};
