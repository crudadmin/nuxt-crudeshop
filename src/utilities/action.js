export default class Action {
    constructor(getRoutes) {
        this.getRoutes = getRoutes || (() => ({}));
    }

    get(controller) {
        var routes = this.getRoutes(),
            actions = {};

        for (var key in routes || {}) {
            actions[key] = routes[key];
        }

        var regex = /{[a-z|A-Z|0-9|\_|\-|\?]+}/g,
            action = actions[controller];

        if (!action) {
            console.error('Action not found ' + controller);
            return '';
        }

        var matches = action.match(regex) || [];

        //Replace action param
        for (let i = 0; i < matches.length; i++) {
            action = action.replace(matches[i], arguments[i + 1] || '');
        }

        return action;
    }

    install(vueApp) {
        let _this = this;

        vueApp.use({
            install: (Vue, options) => {
                Vue.mixin({
                    methods: {
                        action: function () {
                            return _this.get(...arguments);
                        },
                    },
                });
            },
        });
    }
}
