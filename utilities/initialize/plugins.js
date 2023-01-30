import { resolve, basename, join } from 'path';
import { addPlugin, addTemplate } from '@nuxt/kit';

export const addPlugins = (nuxt, moduleOptions) => {
    const rootDir = resolve(__dirname, '../..');

    [
        //Register these modules
        // 'plugins/store.js',
        'plugins/translator.js',
        // 'plugins/action.js',
        // 'plugins/bootstrap.js',
        // 'plugins/plugin.js',
        // 'plugins/bus.js',
        // moduleOptions.tracking ? 'plugins/tracking.client.js' : null,
        // 'mixins/auth.mixin.js',
        'mixins/store.mixin.js',
        // 'middleware/authenticableMiddleware.js',
    ]
        .filter((item) => item)
        .reverse()
        .forEach((plugin) => {
            addPlugin({
                src: resolve(rootDir, plugin),
                fileName: join('crudeshop', basename(plugin)),
            });
        });
};
