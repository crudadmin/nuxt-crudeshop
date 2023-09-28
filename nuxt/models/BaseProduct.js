import _ from 'lodash';
import Attribute from './Attribute';
import Model from './Model';

export default class BaseProduct extends Model {
    constructor(rawObject) {
        super(rawObject);

        if (this.attributesList) {
            this.attributesList = this.attributesList.map(
                (attr) => new Attribute(attr)
            );
        }
    }

    /**
     * Add support for global is type product method as fallback to other models
     */
    isType(type) {
        return type == 'regular';
    }

    /**
     * Prices
     *
     */
    priceFormat(key) {
        let number = this[key];

        return useStoreStore().priceFormat(number);
    }

    hasDiscount() {
        return this.initialPriceWithVat > this.priceWithVat;
    }

    discountPercentage() {
        return (
            100 -
            (100 / this.initialPriceWithVat) * this.priceWithVat
        ).toFixed(0);
    }

    discountPrice() {
        return this.initialPriceWithVat - this.priceWithVat;
    }

    /**
     * Attributes
     *
     */
    getAttribute(attributeId) {
        return _.find(this.getAttributesList(), {
            id: parseInt(attributeId),
        });
    }

    getAttributesList() {
        return this.attributesList || [];
    }

    getAttributeItems(attributeId) {
        let attribute = this.getAttribute(attributeId);

        if (!attribute) {
            return [];
        }

        return attribute.items;
    }

    getAttributeItemId(attributeId) {
        let items = this.getAttributeItems(attributeId);

        return items[0] ? items[0].id : null;
    }

    /*
     * Any item of given attribute is presnet
     */
    hasAttributeItem(id) {
        return this.hasExactAttributeItem(id);
    }

    /*
     * Only Main/first item of attribute is present
     * This is helpfull when you have need match attribute in alternative filter in product detail
     */
    hasExactAttributeItem(id) {
        return _.find(
            this.getAttributesList().map((attribute) => attribute.items[0]),
            { id }
        )
            ? true
            : false;
    }

    /*
     * Has given product present attribute item in any position
     * For example product has 3 colors, so yellow may be in any position order, and may not be first like in hasExactAttributeItem.
     */
    hasAnyAttributeItem(id) {
        return _.find(
            _.flatten(
                this.getAttributesList().map((attribute) => attribute.items)
            ),
            { id }
        )
            ? true
            : false;
    }

    getFavouriteObject() {
        //We can mutate post data via this object
        let mutator = this._favouritePostData || {};

        if (this.product_id) {
            return {
                ...mutator,
                variant_id: this.id,
                product_id: this.product_id,
            };
        } else {
            return {
                ...mutator,
                product_id: this.id,
            };
        }
    }

    async toggleFavourite() {
        try {
            let response = await $nuxt.$axios.$post(
                $nuxt.$action('FavouriteController@toggleFavourite'),
                this.getFavouriteObject()
            );

            useStoreStore().setFavourites(response.data.favourites);
        } catch (e) {
            console.error(e);
        }
    }

    isFavourite() {
        return _.find(useStoreStore().favourites, this.getFavouriteObject())
            ? true
            : false;
    }

    hasOnStock() {
        if (this.hasStock == true) {
            return true;
        }

        return this.canOrderEverytime;
    }

    getMaxQuantity() {
        if (this.canOrderEverytime) {
            return 999999999999;
        }

        let cartItem = useCartStore().getCartItemFromObject({
            product_id: this.product_id || this.id,
            variant_id: this.product_id ? this.id : null,
        });

        if (cartItem) {
            return this.stock_quantity - cartItem.quantity;
        }

        return this.stock_quantity;
    }
}
