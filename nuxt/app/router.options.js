import Localization from '../utils/Localization';

export default {
    routes(routes) {
        routes = useSetLocalizedRoutes(routes);

        return routes;
    },
};
