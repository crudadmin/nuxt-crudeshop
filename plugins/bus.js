const Vue = require('vue');

const $bus = new Vue();

module.exports = function({ app, store }, inject) {
    inject('bus', $bus);
};
