const _ = require('lodash');
const crudadmin = require('../crudadmin');

// prettier-ignore
const internationalSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL'];

class Attribute {
    constructor(rawObject) {
        //Copy all given Product attributes
        for (var key in rawObject) {
            this[key] = rawObject[key];
        }
    }

    getSortedItems() {
        if (['asc', 'desc'].indexOf(this.sortby) == -1) {
            return this.items;
        }

        let isDesc = ['desc'].indexOf(this.sortby) > -1,
            isInternationalSizes =
                this.items
                    .map(item => item.name)
                    .filter(item => internationalSizes.indexOf(item) > -1)
                    .length == this.items.length;

        const compareValue = item => {
            //Sort by international size number value
            if (isInternationalSizes) {
                return internationalSizes.indexOf(item.name);
            }

            return item.name;
        };

        return [].concat(this.items).sort((a, b) => {
            if (this.sortby == 'asc') {
                return (compareValue(a) + '').localeCompare(compareValue(b));
            } else if (this.sortby == 'desc') {
                return (compareValue(b) + '').localeCompare(compareValue(a));
            }
        });
    }
}

module.exports = Attribute;
