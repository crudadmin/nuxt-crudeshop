import axios from 'axios';

let sitemap = {};

export default async () => {
    let routes = await axios
        .get(process.env.API_URL + '/api/sitemap')
        .then(response => response.data);

    return routes;
};
