import {
    defineNuxtModule,
    loadNuxtConfig,
    addPluginTemplate,
    createResolver,
    addPlugin,
} from '@nuxt/kit';
const { resolve } = createResolver(import.meta.url);

// import {
//     addTranslatableRoutes,
//     addCustomRouter,
// } from './utilities/initialize/routes.js';
// import { addSitemap } from './utilities/initialize/sitemap.js';
// import { addPlugins } from './utilities/initialize/plugins.js';

export default defineNuxtModule({
    // Default configuration options for your module
    defaults: {},
    hooks: {},
    async setup(moduleOptions, nuxt) {
        // addTranslatableRoutes(nuxt);
        // addSitemap(nuxt, moduleOptions);
    },
});
