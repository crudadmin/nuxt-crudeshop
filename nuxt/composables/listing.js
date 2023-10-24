import _ from 'lodash';
import Product from '../models/Product.js';

export const useToProductModels = (products) => {
    return products.map((item) => useToProductModel(item));
};

export const useToProductModel = (product) => {
    return new Product(product);
};

export const useFetchProductDetail = async (options) => {
    const { slug } = options;

    let response = await useAxios().$get(
        useAction('ProductController@show', slug)
    );

    return response;
};

export const useAsyncFetchProductDetail = async (options) => {
    const { data } = await useAsyncData(
        'product.detail.' + options.slug,
        () => {
            return useFetchProductDetail(options);
        }
    );

    let response = _.cloneDeep(data.value);

    response.model.product = useToProductModel(response.model.product);

    return response;
};
