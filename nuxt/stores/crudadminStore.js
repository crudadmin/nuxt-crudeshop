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

            useAuthStore().boot();

            let response = await useAxios().$get('/api/bootstrap'),
                bootstrap = response.data,
                crudadmin = bootstrap.crudadmin;

            this.translates =
                typeof bootstrap.translates == 'string'
                    ? JSON.parse(bootstrap.translates)
                    : [];

            this.routes = bootstrap.routes || {};
            this.languages = bootstrap.languages || [];
            this.seoRoutes = bootstrap.seo_routes || [];

            this.initialized = true;
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCrudadminStore, import.meta.hot));
}
