import { relative, resolve } from 'path';
import { existsSync } from 'fs';

export default function () {
    //Rewrite default router with crudadmin router
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
