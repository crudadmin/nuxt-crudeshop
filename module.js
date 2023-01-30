import { defineNuxtModule } from '@nuxt/kit';

import {
    addTranslatableRoutes,
    addCustomRouter,
} from './utilities/initialize/routes.js';
import { addSitemap } from './utilities/initialize/sitemap.js';
import { addPlugins } from './utilities/initialize/plugins.js';

export default defineNuxtModule({
    // Default configuration options for your module
    defaults: {},
    hooks: {},
    async setup(moduleOptions, nuxt) {
        addPlugins(nuxt, moduleOptions);

        addCustomRouter(nuxt, moduleOptions);

        addTranslatableRoutes(nuxt);

        //Refactor
        addSitemap(nuxt, moduleOptions);
    },
});
