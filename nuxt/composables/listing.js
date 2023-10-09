import Product from '../models/Product.js';

export const useToProductModels = (products) => {
    return products.map((item) => new Product(item));
};

export const useFetchProductDetail = async (slug) => {
    let response = await useAxios().$get(
        useAction('ProductController@show', slug)
    );

    return response;
};

export const useAsyncFetchProductDetail = (slug) => {
    return useAsyncData('product.detail.' + slug, () => {
        return useFetchProductDetail(slug);
    });
};
