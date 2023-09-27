import { find } from 'lodash';
import { getActivePinia } from 'pinia';

export const useCrudadminStore = defineStore('CrudadminStore', {
    state: () => {
        return {
            initialized: false,
            languages: [],
            translates: [],
            routes: [],
        };
    },
    actions: {
        async boot() {
            if (this.initialized === true) {
                return;
            }

            let response = await useBootstrapResponse(),
                bootstrap = response.data.crudadmin;

            this.translates =
                typeof bootstrap.translates == 'string'
                    ? JSON.parse(bootstrap.translates)
                    : [];

            this.routes = bootstrap.routes || [];
            this.languages = bootstrap.languages || [];
            this.seoRoutes = bootstrap.seo_routes || [];

            this.initialized = true;

            this.setStore(response.data.store);
        },
        setStore(storeData) {
            const dynamicStores = [useAuthStore(), useListingStore()];

            for (var path in storeData) {
                let parts = path.split('/'),
                    key = parts[0],
                    callback = parts[1],
                    value = storeData[path],
                    store = find(dynamicStores, { $id: key });

                if (store) {
                    if (typeof store[callback] == 'function') {
                        store[callback](value);
                    } else {
                        let obj = {};
                        obj[callback] = value;
                        store.$patch(obj);
                    }
                }
            }
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCrudadminStore, import.meta.hot));
}
