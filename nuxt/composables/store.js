const storeStore = useStoreStore();

/*
 * Parse number into price number format
 */
export const useNumberFormat = (number) => {
    return storeStore.numberFormat(number);
};

/*
 * Parse number int oprice number format and add currency
 */
export const usePriceFormat = (number) => {
    return storeStore.priceFormat(number);
};

/*
 * Return price with vat or with not by given selector type
 * price / defaultPrice...
 */
export const useProductPrice = (item, vat, selector) => {
    //Use default global vat chosen by user
    if ([true, false].indexOf(vat) === -1) {
        vat = this.$store.state.store.vat;
    }

    //If selector was not given
    if (!selector) {
        selector = 'price';
    }

    return item[vat ? selector + 'WithVat' : selector + 'WithoutVat'] || 0;
};

export const useFromCategoriesTreeToRoute = (name, category, level) => {
    let index = _.findIndex(level, { id: category.id });

    let obj = {
        name,
        params: {},
    };

    for (let i = 1; i <= index + 1; i++) {
        obj.params['category' + i] = level[i - 1].slug;
    }

    return obj;
};
