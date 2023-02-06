export default class Storage {
    constructor() {
        this.cookieKey = 'storage';
    }

    set(key, value) {
        useCookie(this.getKey(key)).value = value;
    }

    get(key) {
        return useCookie(this.getKey(key)).value;
    }

    getKey(key) {
        return this.cookieKey + '.' + key;
    }
}
