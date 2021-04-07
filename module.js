import { relative, resolve, basename, join } from 'path';
import { existsSync } from 'fs';

export default function(moduleOptions) {
    //Register these modules
    [
        'plugins/translator.js',
        'plugins/action.js',
        'plugins/bootstrap.js',
        'plugins/plugin.js',
        'plugins/bus.js',
        'plugins/store.js',
        'mixins/store.mixin.js',
    ].forEach(plugin => {
        this.addPlugin({
            src: resolve(__dirname, plugin),
            fileName: join('crudeshop', basename(plugin)),
        });
    });

    // Rewrite default router with crudadmin router
    this.addPlugin({
        src: resolve(__dirname, './templates/router.js'),
        fileName: 'router.js',
    });
    // Put default router as .nuxt/defaultRouter.js
    let defaultRouter = require.resolve('@nuxt/vue-app/template/router');
    this.addTemplate({
        fileName: 'defaultRouter.js',
        src: defaultRouter,
    });
}
