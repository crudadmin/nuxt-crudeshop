import _ from 'lodash';

class Model {
    constructor(rawObject) {
        if (rawObject instanceof Model) {
            return rawObject;
        }

        //Copy all given Product attributes
        for (var key in rawObject) {
            this[key] = rawObject[key];
        }
    }

    getData() {
        let obj = {};

        for (var key in this) {
            let objectValue =
                this[key] instanceof Model ? this[key].getData() : this[key];

            if (_.isArray(objectValue)) {
                objectValue = objectValue.map((arrayValue) =>
                    arrayValue instanceof Model
                        ? arrayValue.getData()
                        : arrayValue
                );
            }

            obj[key] = objectValue;
        }

        return obj;
    }
}

export default Model;
