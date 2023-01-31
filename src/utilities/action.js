import CrudAdmin from '../crudadmin.js';

export default (controller) => {
    var routes = CrudAdmin.routes,
        actions = {};

    for (var key in routes || {}) {
        actions[key] = routes[key];
    }

    var regex = /{[a-z|A-Z|0-9|\_|\-|\?]+}/g,
        action = actions[controller];

    if (!action) {
        console.error('Action not found ' + controller);
        return '';
    }

    var matches = action.match(regex) || [];

    //Replace action param
    for (let i = 0; i < matches.length; i++) {
        action = action.replace(matches[i], arguments[i + 1] || '');
    }

    return action;
};
