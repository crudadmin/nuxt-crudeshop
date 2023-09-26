import fs from 'fs';
import { dirname, resolve, join } from 'path';

function writeFile(path, contents, callback = () => {}) {
    fs.mkdir(dirname(path), { recursive: true }, function (err) {
        if (err) {
            return callback(err);
        }

        fs.writeFile(path, contents, callback);
    });
}

export const buildTranslatableRoutes = (buildDir, routes) => {
    var rewritedRoutes = [];

    for (var route of routes) {
        rewritedRoutes.push("__('" + route.path + "')");
    }

    const extraFilePath = join(buildDir + '/crudeshop/', 'crudadmin_routes.js');

    var routesString = rewritedRoutes.join(', '),
        content = `{ routes: [${routesString}] }`;

    writeFile(extraFilePath, content);
};
