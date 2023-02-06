const cookieKey = 'auth.token';

export const useAuthStore = defineStore('AuthStore', {
    state: () => {
        return {
            token: null,
            user: null,
        };
    },
    actions: {
        async boot() {
            await this.useSetTokenFromCookie();
        },

        useSetTokenFromCookie() {
            this.token = useNuxtApp().$storage.get(cookieKey);
        },

        setUser(user, token) {
            this.user = user;

            if (token) {
                this.setToken(token);
            }
        },

        setToken(token, save = true) {
            if (save === true) {
                useNuxtApp().$storage.set(cookieKey, token);
            }

            this.token = token;
        },
    },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
