const _ = require('lodash');

/**
 * If matched attributes has been found in all variants.
 * We want filter items out of each attribute in synchronious order,
 * if previously selected attribute items does not exists in actual attribute item list.
 */
const filterUnexistingConfiguredAttributeItems = (
    sharedAttributes,
    product,
    productOrVariant
) => {
    sharedAttributes.forEach((attribute, index) => {
        let previousAttributes = sharedAttributes.concat([]).slice(0, index);
        let availableSelectableVariants = product.variants;

        for (var i = 0; i < previousAttributes.length; i++) {
            let selectedItemId = productOrVariant.getAttributeItemId(
                previousAttributes[i].id
            );

            availableSelectableVariants = availableSelectableVariants.filter(
                variant =>
                    _.find(
                        variant.getAttributeItems(previousAttributes[i].id),
                        { id: selectedItemId }
                    )
            );
        }

        attribute.items = attribute.items.filter(item => {
            return (
                availableSelectableVariants.filter(variant =>
                    variant.hasAttributeItem(item.id)
                ).length > 0
            );
        });
    });
};

module.exports = {
    filterUnexistingConfiguredAttributeItems,
};
