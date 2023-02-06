// import Localization from '../../src/utilities/Localization';

export default {
    routes(routes) {
        //await does not work here. I dont know yet how to sole that.
        // routes = await Localization.initialize().getRewritedRoutes(routes);
        // console.log('Custom routes boot.');
        return routes;
    },
};
