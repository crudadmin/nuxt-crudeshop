const _ = require('lodash');
const crudadmin = require('../crudadmin');
const BaseProduct = require('./BaseProduct');
const ProductsVariant = require('./ProductsVariant');

class Product extends BaseProduct {
    constructor(rawObject) {
        super(rawObject);

        //Cast also product variants if are available
        if (this.isType('variants') && this.variants) {
            this.variants = this.variants.map(
                variant => new ProductsVariant(variant)
            );
        }
    }

    priceFormatWithCheapestVariant(key) {
        if (this.product_type == 'variants') {
            let cheapestPrice = _.uniqBy(
                _.sortBy(this.variants.map(variant => variant[key]))
            );

            //If multiple prices are available, show from price
            if (cheapestPrice.length > 1) {
                let price = crudadmin.store.getters['store/priceFormat'](
                    cheapestPrice[0]
                );

                return crudadmin.translator.__('Od %s', price);
            }

            //Return default price
            else {
                return crudadmin.store.getters['store/priceFormat'](
                    cheapestPrice[0]
                );
            }
        }

        return this.priceFormat(key);
    }

    isType(type) {
        return this.product_type == type;
    }

    hasAllVariantsAttribute(attribute_id) {
        let variantsWithSizes = this.variants.filter(variant => {
            return variant.getAttribute(attribute_id);
        });

        return variantsWithSizes.length == this.variants.length;
    }

    getCategoriesTree() {
        let trees = [];

        const buildTreeLevels = parentId => {
            let levels = [];

            for (let category of _.filter(this.categories, {
                category_id: parentId,
            })) {
                levels.push(category.id);

                levels = levels.concat(buildTreeLevels(category.id));
            }

            return levels;
        };

        for (let category of _.filter(this.categories, { category_id: null })) {
            let treeLevel = [category.id].concat(buildTreeLevels(category.id));

            trees.push(treeLevel.map(id => _.find(this.categories, { id })));
        }

        return trees;
    }

    canAddToCart() {
        if (this.hasStock == true) {
            return true;
        }

        return ['everytime'].indexOf(this.stock_type) > -1;
    }
}

module.exports = Product;
