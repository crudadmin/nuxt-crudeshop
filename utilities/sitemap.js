import axios from 'axios';
const https = require('https');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

let sitemap = {};

export default async () => {
    let routes = await axios
        .get(process.env.API_URL + '/api/sitemap', { httpsAgent })
        .then((response) => response.data);

    return routes;
};
