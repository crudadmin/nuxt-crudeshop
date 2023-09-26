import { defineNuxtModule, createResolver, addPlugin } from '@nuxt/kit';

const { resolve } = createResolver(import.meta.url);

import { dirname, join } from 'path';
import _ from 'lodash';

import { buildTranslatableRoutes } from './utils/CustomRouter.js';
// import { addSitemap } from './utilities/initialize/sitemap.js';

export default defineNuxtModule({
    // Default configuration options for your module
    defaults: {},
    hooks: {},
    setup(moduleOptions, nuxt) {
        nuxt.hook('pages:extend', async (routes) => {
            buildTranslatableRoutes(nuxt.options.buildDir, routes);

            return routes;
        });

        nuxt.hook('app:resolve', async (nuxt) => {
            const plugins = _.uniqBy(
                _.filter(nuxt.plugins, (plugin) => {
                    return (
                        plugin.src.includes('00.') ||
                        plugin.src.includes('01.') ||
                        plugin.src.includes('02.') ||
                        plugin.src.includes('03.')
                    );
                }).concat(nuxt.plugins),
                'src'
            ).filter((item) => item.src.includes('@pinia') == false);

            nuxt.plugins = plugins;
        });
    },
});
