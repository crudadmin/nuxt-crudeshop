import https from 'https';
import $axios from '~/.nuxt/axios';

var obj = {};

$axios(obj, () => {});

//Allow self signed https
obj.$axios.defaults['httpsAgent'] = new https.Agent({
    rejectUnauthorized: false,
});

export default obj.$axios;
