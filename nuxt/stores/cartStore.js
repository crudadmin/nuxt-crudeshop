import CartItem from '../models/CartItem.js';
import Discount from '../models/Discount.js';
import Delivery from '../models/Delivery.js';
import PaymentMethod from '../models/PaymentMethod.js';
import Model from '../models/Model.js';
import _ from 'lodash';

const getIdentifierFromObject = (object) => {
    return useGetCartIdentifier(object.identifier);
};

const cartError = (error, response) => {
    console.error('error', error, response);
    throw error;
};

var cartStore = {
    namespaced: true,

    state() {
        return {
            initialized: false,
            data: {},
            cartToken: null,
            items: [],
            itemsHidden: [],
            discounts: [],
            summary: {},
            summaryTotal: {},
            deliveries: [],
            paymentMethods: [],
            selectedDelivery: null,
            selectedDeliveryData: null,
            selectedLocation: null,
            selectedCountry: null,
            selectedPaymentMethod: null,
            clientData: null,
            newItem: null,

            //Custom eshop
            //...
        };
    },

    actions: {
        setCart(cart) {
            this.data = cart;

            //We can mutate this variable from outside
            for (var key in cart) {
                if (key in this) {
                    this[key] = cart[key];
                }
            }

            this.initialized = true;
        },
        setClientData(clientData) {
            this.clientData = clientData;
        },
        setNewItem(item) {
            this.newItem = item;
        },
        async addToCart(object) {
            try {
                let obj = {
                    ...object,
                    ...getIdentifierFromObject(object).buildObject(object),
                    cart_item: object.cart_item
                        ? getIdentifierFromObject(object.cart_item).buildObject(
                              object.cart_item
                          )
                        : null,
                };

                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@addItem'),
                    obj
                );

                this.setCart(data);

                this.sendItemEvent({
                    event: 'addToCart',
                    cartItem: object,
                    quantity: object.quantity,
                });

                this.showNewItem(data.addedItems[0]);
            } catch (e) {
                cartError(e);
            }
        },
        async toggleCartItems(array) {
            try {
                let items = [];

                for (var object of array) {
                    let obj = {
                        ...object,
                        ...getIdentifierFromObject(object).buildObject(object),
                    };

                    //If cart item is assigned to another cart item, we want send this data as well
                    if (new CartItem(object).hasParentCartItem()) {
                        obj.cart_item = object.parentIdentifier.data;
                    } else if (object.cart_item) {
                        obj.cart_item = getIdentifierFromObject(
                            object.cart_item
                        ).buildObject(object.cart_item);
                    }

                    items.push(obj);
                }

                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@toggleItems'),
                    { items }
                );

                this.setCart(data);
            } catch (e) {
                cartError(e);
            }
        },
        toggleItem(object) {
            let cartItem = this.getCartItemFromObject(object);

            if (!cartItem) {
                this.addToCart({
                    ...object,
                    quantity: object.quantity || 1,
                });
            } else {
                this.removeItem(cartItem);
            }
        },
        showNewItem(object) {
            var timeOutSeconds = 10,
                newItem = this.getCartItemFromObject(object);

            if (this.newItemTimeout) {
                clearTimeout(this.newItemTimeout);
            }

            this.setNewItem(newItem);

            this.newItemTimeout = setTimeout(() => {
                this.setNewItem(null);
            }, timeOutSeconds * 1000);
        },
        async updateQuantity(obj) {
            let { item, quantity } = obj;

            if (quantity < 1) {
                quantity = 1;
            }

            //If no change
            if (item.quantity == quantity) {
                return;
            }

            //If user increases quantity
            if (item.quantity < quantity) {
                this.sendItemEvent({
                    event: 'addToCart',
                    cartItem: item,
                    quantity: quantity - item.quantity,
                });
            } else {
                this.sendItemEvent({
                    event: 'removeFromCart',
                    cartItem: item,
                    quantity: item.quantity - quantity,
                });
            }

            try {
                let request = {
                    ...getIdentifierFromObject(item).buildObject(item),
                    quantity: quantity,
                };

                //If cart item is assigned to another cart item, we want send this data as well
                if (new CartItem(item).hasParentCartItem()) {
                    request.cart_item = item.parentIdentifier.data;
                }

                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@updateQuantity'),
                    request
                );

                this.setCart(data);
            } catch (e) {
                cartError(e);
            }
        },
        async removeItem(cartItem) {
            try {
                //We need dispatch event before item will be remove from cart list, because we need retrieve product into.
                this.sendItemEvent({
                    event: 'removeFromCart',
                    cartItem: cartItem,
                    quantity: cartItem.quantity,
                });

                let obj = {
                    identifier: cartItem.identifier,
                    ...getIdentifierFromObject(cartItem).buildObject(cartItem),
                };

                if (new CartItem(cartItem).hasParentCartItem()) {
                    obj.cart_item = cartItem.parentIdentifier.data;
                }

                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@removeItem'),
                    obj
                );

                this.setCart(data);
            } catch (e) {
                cartError(e);
            }
        },
        sendItemEvent({ event, cartItem, quantity }) {
            cartItem = cartItem ? this.getCartItemFromObject(cartItem) : null;

            //TODO:
            // this.$bus.$emit('tracking/' + event, {
            //     cartItem,
            //     quantity,
            // });
        },
        async setDelivery(object) {
            let location_id,
                id,
                deliveryData = undefined;

            //If object is
            if (object && typeof object === 'object') {
                id = object.id;
                location_id = object.location_id;
                deliveryData = object.data;
            } else {
                id = object;
            }

            var obj = {
                delivery_id: id || null,
                location_id: location_id || null,
            };

            //Add delivery data
            if (deliveryData !== undefined) {
                obj.data = deliveryData;
            }

            try {
                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@setDelivery'),
                    obj
                );

                this.setCart(data);

                this.sendItemEvent({ event: 'setDelivery' });
            } catch (e) {
                cartError(e);
            }
        },
        async setDeliveryLocation(locationId) {
            var obj = {
                id: locationId,
            };

            try {
                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@setDeliveryLocation'),
                    obj
                );

                this.setCart(data);

                this.sendItemEvent({ event: 'setDelivery' });
            } catch (e) {
                cartError(e);
            }
        },
        async setPaymentMethod(id) {
            if (_.isObject(id)) {
                id = id.id;
            }

            try {
                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@setPaymentMethod'),
                    {
                        payment_method_id: id,
                    }
                );

                this.setCart(data);

                this.sendItemEvent({ event: 'setPaymentMethod' });
            } catch (e) {
                cartError(e);
            }
        },
        async setCountry(id) {
            if (_.isObject(id)) {
                id = id.id;
            }

            try {
                var { data } = await useAxios().$post(
                    useAction('Cart\\CartController@setCountry'),
                    {
                        country_id: id,
                    }
                );

                this.setCart(data);
            } catch (e) {
                cartError(e);
            }
        },
        async fetchFullSummary() {
            var { data } = await useAxios().$get(
                useAction('Cart\\CartController@getFullSummary')
            );

            this.setCart(data);
        },
    },

    getters: {
        getSummary: (state) => (key) => {
            return state.summary[key] || 0;
        },
        getTotalSummary: (state) => (key) => {
            return state.summaryTotal[key] || 0;
        },
        getCartItems:
            (state) =>
            (options = {}) => {
                let items = (
                    options.hidden == true ? state.itemsHidden : state.items
                ).map((item) => new CartItem(item));

                if (options.withAssignedChildItems === false) {
                    items = items.filter((item) => {
                        return item.hasParentCartItem() == false;
                    });
                }

                return items;
            },
        getDiscounts: (state) => {
            return state.discounts.map((item) => new Discount(item));
        },
        //Returns all available discount values.
        //One discount provider may have multiple discounts. For example discount codes.
        getDiscountsMessages:
            (state, getters) =>
            (whitelistedDiscounts = [], hasVat = null) => {
                let messages = [];

                for (let discount of getters.getDiscounts) {
                    if (
                        whitelistedDiscounts.length == 0 ||
                        whitelistedDiscounts.indexOf(discount.key) > -1
                    ) {
                        messages = messages.concat(
                            discount.getFormatedMessages(hasVat)
                        );
                    }
                }

                return messages;
            },
        getItemsQuantityCount: (state) => {
            return _.sum(state.items.map((item) => item.quantity));
        },
        isInCart: (state, getters) => (object) => {
            return getters.getCartItemFromObject(object) ? true : false;
        },
        getCartItemFromObject: (state) => (object) => {
            var search = getIdentifierFromObject(object).buildObject(object);

            //If has parent identifier, we need check also parent identifier match
            if (object.cart_item) {
                search.parentIdentifier = {
                    identifier: object.cart_item.identifier,
                    data: getIdentifierFromObject(object.cart_item).buildObject(
                        object.cart_item
                    ),
                };
            }

            let item = _.find(state.items, search);

            return item ? new CartItem(item) : null;
        },
        getDiscountCode: (state) => {
            let item = _.find(state.discounts, { key: 'DiscountCode' });
            if (item) {
                return new Discount(item);
            }
        },
        isSelectedPaymentMethod: (state) => (method) => {
            return (
                state.selectedPaymentMethod &&
                state.selectedPaymentMethod.id == method.id
            );
        },
        isSelectedDelivery: (state) => (delivery) => {
            return (
                state.selectedDelivery &&
                state.selectedDelivery.id == delivery.id
            );
        },
        isSelectedDeliveryLocation: (state) => (location) => {
            return (
                state.selectedLocation &&
                state.selectedLocation.id == location.id
            );
        },
        getSelectedDelivery: (state) => {
            return state.selectedDelivery
                ? new Delivery(state.selectedDelivery)
                : null;
        },
        getSelectedPaymentMethod: (state) => {
            return state.selectedPaymentMethod
                ? new PaymentMethod(state.selectedPaymentMethod)
                : null;
        },
        getDeliveries: (state) => {
            return state.deliveries.map((item) => new Delivery(item));
        },
        getPaymentMethods: (state) => {
            return state.paymentMethods.map((item) => new PaymentMethod(item));
        },
        getDeliveryPointName: (state, getters) => (delivery) => {
            let name;

            if (getters.isSelectedDelivery(delivery)) {
                //multiple Locations
                if (state.selectedLocation) {
                    name = state.selectedLocation.name;
                }

                //Packeta
                if (
                    delivery.shippingProvider &&
                    delivery.shippingProvider.point
                ) {
                    name = delivery.shippingProvider.point.name;
                }
            }

            return name ? ' - ' + name : '';
        },
    },
};

export const useCartStore = defineStore('cart', cartStore);

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
