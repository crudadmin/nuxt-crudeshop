import _ from 'lodash';
import crudadmin from '~/crudadmin/crudadmin';
import BaseProduct from './BaseProduct';
import ProductsVariant from './ProductsVariant';

class Product extends BaseProduct {
    constructor(rawObject) {
        super(rawObject);

        //Cast also product variants if are available
        if (this.isType('variants') && this.variants) {
            this.variants = this.variants.map(
                (variant) => new ProductsVariant(variant)
            );
        }
    }

    priceFormatWithCheapestVariant(key) {
        if (this.product_type == 'variants') {
            let cheapestPrice = _.uniqBy(
                _.sortBy(this.variants.map((variant) => variant[key]))
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
        let variantsWithSizes = this.variants.filter((variant) => {
            return variant.getAttribute(attribute_id);
        });

        return variantsWithSizes.length == this.variants.length;
    }
}

export default Product;
