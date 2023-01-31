import axios from 'axios';

const sitemapGenerator = async () => {
    let routes = await axios
        .get(process.env.API_URL + '/api/sitemap')
        .then((response) => response.data);

    return routes;
};

export const addSitemap = (nuxt, moduleOptions) => {
    if (moduleOptions.sitemap) {
        nuxt.options.sitemap = {
            hostname: nuxt.options.env.baseUrl,
            routes: () => {
                return sitemapGenerator();
            },
        };
    }
};
