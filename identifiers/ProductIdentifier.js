const Product = require('../models/Product');
const ProductsVariant = require('../models/ProductsVariant');
const Identifier = require('./Identifier');

class ProductIdentifier extends Identifier {
    identifierKeys() {
        return {
            variant: ProductsVariant,
            product: Product,
        };
    }

    buildObject(object) {
        let data = {
            id: parseInt(object.product_id || object.id),
        };

        if (object.variant_id) {
            data.variant_id = parseInt(object.variant_id);
        }

        return data;
    }
}

module.exports = ProductIdentifier;
