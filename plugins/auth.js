import auth from '~/.nuxt/auth/plugin.js';
import CrudAdmin from '~/crudadmin/crudadmin.js';

export default (context) => {
    auth(context, () => {});

    return context.$auth;
};
