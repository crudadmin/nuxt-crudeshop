import _ from 'lodash';
import BaseProduct from './BaseProduct';
import ProductsVariant from './ProductsVariant';
import Attribute from './Attribute';
import { filterUnexistingConfiguredAttributeItems } from '../utils/ProductHelper.js';

export default class Product extends BaseProduct {
    constructor(rawObject) {
        super(rawObject);

        //Cast also product variants if are available
        if (this.isType('variants') && this.variants) {
            this.variants = this.variants.map(
                (variant) => new ProductsVariant(variant)
            );
        }
    }

    /**
     * Returns producti identifier, when multiple products with same id needs to be in category layout.
     * Then we can generate keys from variants ids
     */
    getVariantsKey() {
        return [this.id]
            .concat((this.variants || []).map((variant) => variant.id))
            .join('-');
    }

    hasMultiplePrices() {
        if (this.isType('variants') && this.variants.length > 1) {
            return true;
        }

        return false;
    }

    priceFormatWithCheapestVariant(key) {
        if (this.isType('variants')) {
            let cheapestPrice = _.uniqBy(
                _.sortBy(this.variants.map((variant) => variant[key]))
            );

            //If multiple prices are available, show from price
            if (cheapestPrice.length > 1) {
                let price = useStoreStore().priceFormat(cheapestPrice[0]);

                return crudadmin.translator.__('Od %s', price);
            }

            //Return default price
            else {
                return useStoreStore().priceFormat(cheapestPrice[0]);
            }
        }

        return this.priceFormat(key);
    }

    isType(type) {
        return this.product_type == type;
    }

    getCategoriesTree() {
        let trees = [];

        const buildTreeLevels = (parentId) => {
            let levels = [];

            for (let category of _.filter(this.categories, {
                category_id: parentId,
            })) {
                levels.push(category.id);

                levels = levels.concat(buildTreeLevels(category.id));
            }

            return _.uniqBy(levels);
        };

        for (let category of _.filter(this.categories, { category_id: null })) {
            let treeLevel = [category.id].concat(buildTreeLevels(category.id));

            trees.push(treeLevel.map((id) => _.find(this.categories, { id })));
        }

        return trees;
    }

    canAddToCart(productOrVariant) {
        productOrVariant = productOrVariant || this;

        return productOrVariant.hasOnStock();
    }

    addToCart(quantity = 1) {
        useCartStore().addToCart({
            product_id: this.id,
            quantity: quantity,
        });
    }

    cartQuantityExceed(variant) {
        let productOrVariant = variant || this;

        let cartItem = useStoreStore().getCartItemFromObject({
            product_id: this.id,
            variant_id: variant ? variant.id : null,
        });

        if (
            this.canOrderEverytime !== true &&
            cartItem &&
            cartItem.quantity >= productOrVariant.stock_quantity
        ) {
            return true;
        }

        return false;
    }

    /**
     * Attributes
     *
     */

    hasAllVariantsAttribute(attribute_id) {
        let variantsWithSizes = this.variants.filter((variant) => {
            return variant.getAttribute(attribute_id);
        });

        return variantsWithSizes.length == this.variants.length;
    }

    getVariantsAttributes(options) {
        let {
            withoutOneItem = true,
            productOrVariant,
            onlyForVariants = false,
        } = options || {};

        let isVariant = this.isType('variants');

        if (onlyForVariants == true && isVariant == false) {
            return [];
        }

        //Find all attributes which are shared accross all variants
        let allAttributes = _.cloneDeep(
                isVariant
                    ? _.flatten(
                          this.variants.map((variant) => variant.attributesList)
                      )
                    : this.attributesList
            ),
            sharedAttributes = _.uniqBy(allAttributes, 'id')
                .filter((attribute) => attribute.variants == true)
                .filter((attribute) =>
                    isVariant
                        ? this.variants.filter((variant) =>
                              _.find(variant.attributesList, {
                                  id: attribute.id,
                              })
                          ).length == this.variants.length
                        : true
                )
                .map((attribute) => {
                    let sharedAttr = new Attribute(_.cloneDeep(attribute));

                    sharedAttr.items = _.uniqBy(
                        _.filter(allAttributes, {
                            id: attribute.id,
                        }).map((attr) => attr.items[0]),
                        'id'
                    );

                    return sharedAttr;
                });

        //Filter out attributes with only one item. we does not want show this attribute in switch
        if (withoutOneItem == true) {
            sharedAttributes = sharedAttributes.filter(
                (attribute) => attribute.items.length > 1
            );
        }

        //Filter unexisting combinations of variants
        if (productOrVariant && isVariant) {
            filterUnexistingConfiguredAttributeItems(
                sharedAttributes,
                this,
                productOrVariant
            );
        }

        return sharedAttributes;
    }

    getAlternativeVariantByItem(item, actualVariant) {
        if (this.isType('variants') === false) {
            return this;
        }

        let variantsWithGivenItem = this.variants.filter((variant) =>
            variant.hasExactAttributeItem(item.id)
        );

        let variantAttributesExceptGiven = this.getVariantsAttributes().filter(
            (attribute) => attribute.id != item.attribute_id
        );

        let filtratedVariants = variantsWithGivenItem;

        for (let attribute of variantAttributesExceptGiven) {
            if (!attribute.items.length) {
                continue;
            }

            let filtrated = filtratedVariants.filter((variant) =>
                variant.hasExactAttributeItem(
                    actualVariant.getAttributeItemId(attribute.id)
                )
            );

            //If this attribute does not share value with no other variants, we want skip this filter
            //and try other attribute filters. If no exact match has been found, we will return first available attribute.
            if (filtrated.length == 0) {
                continue;
            }

            filtratedVariants = filtrated;

            //If end match has been found
            if (filtrated.length == 1) {
                break;
            }
        }

        return filtratedVariants[0];
    }
}
