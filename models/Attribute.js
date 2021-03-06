const _ = require('lodash');
const crudadmin = require('../crudadmin');
const Model = require('./Model');

// prettier-ignore
const internationalSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL'];

class Attribute extends Model {
    constructor(rawObject) {
        super(rawObject);
    }

    getSortedItems() {
        if (['asc', 'desc'].indexOf(this.sortby) == -1) {
            return this.items;
        }

        let isDesc = ['desc'].indexOf(this.sortby) > -1,
            isNumber = ['number', 'decimal'].includes(this.unitFormat),
            isInternationalSizes =
                this.items
                    .map((item) => item.name)
                    .filter((item) => internationalSizes.indexOf(item) > -1)
                    .length == this.items.length;

        const compareValue = (item) => {
            //Sort by international size number value
            if (isInternationalSizes) {
                return internationalSizes.indexOf(item.name);
            }

            if (isNumber) {
                return parseFloat(item.name);
            }

            return item.name;
        };

        return [].concat(this.items).sort((a, b) => {
            if (this.sortby == 'asc') {
                if (isNumber) {
                    return a - b;
                }

                return (compareValue(a) + '').localeCompare(compareValue(b));
            } else if (this.sortby == 'desc') {
                if (isNumber) {
                    return b - a;
                }

                return (compareValue(b) + '').localeCompare(compareValue(a));
            }
        });
    }

    getValues(separator = ', ') {
        return this.items
            .map((item) => {
                if (this.unitName) {
                    return item.name + ' ' + this.unitName;
                }

                return item.name;
            })
            .join(separator);
    }

    isColor() {
        if (
            (crudadmin.store.getters['store/backendEnv']('ATTR_COLOR_ID') + '')
                .split(',')
                .map((id) => parseInt(id))
                .indexOf(this.id) > -1
        ) {
            return true;
        }

        return this.unitFormat == 'color';
    }

    selectedItems() {
        return this.items.filter((item) =>
            crudadmin.store.getters['filter/isItemChecked'](item)
        );
    }
}

module.exports = Attribute;
