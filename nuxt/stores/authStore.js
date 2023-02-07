const cookieTokenKey = 'auth.token';

export const options = {
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
            this.token = useNuxtApp().$storage.get(cookieTokenKey);
        },

        setUser(user, token) {
            this.user = user;

            if (token) {
                this.setToken(token);
            }
        },
        setToken(token, save = true) {
            if (save === true) {
                useNuxtApp().$storage.set(cookieTokenKey, token);
            }

            this.token = token;
        },
        logout() {
            this.user = null;
            this.token = null;

            useNuxtApp().$storage.set(cookieTokenKey, null);
        },
    },
};

export const useAuthStore = defineStore('AuthStore', options);

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
