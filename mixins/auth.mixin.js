import Vue from 'vue';

const authMixin = {
    computed: {
        /**
         * Determine if user has been logged in. And has been fetched successfully yet
         */
        loggedIn() {
            return this.$auth.user && this.$auth.user.id ? true : false;
        },
    },
    methods: {
        getUserToken() {
            return (this.$auth.getStrategy('local').token.get() || '').substr(
                7
            );
        },
        setClient(client, token) {
            if (client) {
                this.$auth.setUser(client);
            }

            if (token) {
                var token = 'Bearer ' + token;

                this.$axios.setToken(token);
                this.$auth.getStrategy('local').token.set(token);
            }

            this.bootSentryUser();
        },
        bootSentryUser() {
            if (this.$auth.user && this.$sentry) {
                this.$sentry.setUser({ id: this.$auth.user.id });
            }
        },
    },
};

Vue.mixin(authMixin);
