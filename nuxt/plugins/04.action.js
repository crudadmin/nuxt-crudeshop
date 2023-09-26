import { defineNuxtPlugin } from '#app';
import Action from '../../src/utilities/Action';

export default defineNuxtPlugin(({ vueApp }) => {
    let $action = new Action(() => {
        return useCrudadminStore().routes;
    });

    $action.install(vueApp);

    return {
        provide: {
            action: $action.get.bind($action),
        },
    };
});
