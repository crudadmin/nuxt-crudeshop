import Action from '../../src/utilities/Action';

export const useBootstrapResponse = async () => {
    return await useAxios().$get('/api/bootstrap');
};

export const useAction = function () {
    let $action = new Action(() => {
        return useCrudadminStore().routes;
    });

    return $action.get.bind($action)(...arguments);
};
