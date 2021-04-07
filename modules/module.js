const fs = require('fs');
const path = require('path');

export.default = async function() {
    this.nuxt.hook('build:done', builder => {
        var routes = [];

        for (var key in builder.routes) {
            routes.push("__('" + builder.routes[key].path + "')");
        }

        const extraFilePath = path.join(
            builder.nuxt.options.buildDir,
            'crudadmin_routes.js'
        );

        var routesString = routes.join(', ');

        fs.writeFileSync(extraFilePath, `{ routes: [${routesString}] }`);
    });
}
