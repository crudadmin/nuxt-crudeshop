export const authStore = {
    state: () => {
        return {
            token: null,
            user: null,
        };
    },
    actions: {
        async boot() {
            this.token = useGetAuthToken();
        },

        setUser(user, token) {
            this.user = user;

            if (token) {
                this.setToken(token);
            }
        },
        setToken(token, save = true) {
            if (save === true) {
                useSetAuthToken(token);
            }

            this.token = token;
        },
        logout() {
            this.user = null;
            this.token = null;

            useSetAuthToken(token);
        },
    },
};

export const useAuthStore = defineStore('AuthStore', authStore);

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
