import Vue from 'vue';

const $bus = new Vue();

export default function ({ app, store }, inject) {
    inject('bus', $bus);
}
