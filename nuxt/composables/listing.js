import Product from '../models/Product.js';

export const useToProductModels = (products) => {
    return products.map((item) => new Product(item));
};
