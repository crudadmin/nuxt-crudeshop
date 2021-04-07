import _ from 'lodash';
import crudadmin from '~/crudadmin/crudadmin';

class Discount {
    constructor(rawObject) {
        //Copy all given Product attributes
        for (var key in rawObject) {
            this[key] = rawObject[key];
        }
    }

    getProperties(hasVat) {
        hasVat = _.isNil(hasVat) ? crudadmin.store.state.store.vat : hasVat;

        let itemMessage = this.message,
            message =
                itemMessage && typeof itemMessage == 'object'
                    ? itemMessage[hasVat ? 'withVat' : 'withoutVat']
                    : itemMessage;

        if (!message || this.value == 0) {
            return null;
        }

        return {
            name: this.name,
            value: message,
        };
    }

    getName() {
        return this.getProperties().name;
    }

    getValue() {
        return this.getProperties().value;
    }
}

export default Discount;
