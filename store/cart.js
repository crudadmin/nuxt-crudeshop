import CrudAdmin from '../crudadmin.js';
import CartItem from '../models/CartItem.js';
import Discount from '../models/Discount.js';
import Delivery from '../models/Delivery.js';
import PaymentMethod from '../models/PaymentMethod.js';
import Model from '../models/Model.js';
import _ from 'lodash';

const getIdentifierFromObject = (object) => {
    return CrudAdmin.identifiers[object.identifier || 'products'];
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

    mutations: {
        setCart(state, cart) {
            state.data = cart;

            //We can mutate this variable from outside
            for (var key in cart) {
                if (key in state) {
                    state[key] = cart[key];
                }
            }

            state.initialized = true;
        },
        setClientData(state, clientData) {
            state.clientData = clientData;
        },
        setNewItem(state, item) {
            state.newItem = item;
        },
    },

    actions: {
        cartError({}, response) {
            console.error('error', this);
            throw response;
        },
        async addToCart({ commit, dispatch }, object) {
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

                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@addItem'),
                    obj
                );

                commit('setCart', data);

                dispatch('sendItemEvent', {
                    event: 'addToCart',
                    cartItem: object,
                    quantity: object.quantity,
                });

                dispatch('showNewItem', data.addedItems[0]);
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async toggleCartItems({ commit, dispatch }, array) {
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

                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@toggleItems'),
                    { items }
                );

                commit('setCart', data);
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        toggleItem({ commit, state, getters, dispatch }, object) {
            let cartItem = getters.getCartItemFromObject(object);

            if (!cartItem) {
                dispatch('addToCart', {
                    ...object,
                    quantity: object.quantity || 1,
                });
            } else {
                dispatch('removeItem', cartItem);
            }
        },
        showNewItem({ commit, state, getters }, object) {
            var timeOutSeconds = 10,
                newItem = getters.getCartItemFromObject(object);

            if (this.newItemTimeout) {
                clearTimeout(this.newItemTimeout);
            }

            commit('setNewItem', newItem);

            this.newItemTimeout = setTimeout(() => {
                commit('setNewItem', null);
            }, timeOutSeconds * 1000);
        },
        async updateQuantity({ commit, dispatch, state }, obj) {
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
                dispatch('sendItemEvent', {
                    event: 'addToCart',
                    cartItem: item,
                    quantity: quantity - item.quantity,
                });
            } else {
                dispatch('sendItemEvent', {
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

                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@updateQuantity'),
                    request
                );

                commit('setCart', data);
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async removeItem({ commit, state, dispatch }, cartItem) {
            try {
                //We need dispatch event before item will be remove from cart list, because we need retrieve product into.
                dispatch('sendItemEvent', {
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

                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@removeItem'),
                    obj
                );

                commit('setCart', data);
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        sendItemEvent({ state, getters }, { event, cartItem, quantity }) {
            cartItem = cartItem
                ? getters.getCartItemFromObject(cartItem)
                : null;

            this.$bus.$emit('tracking/' + event, {
                cartItem,
                quantity,
            });
        },
        async setDelivery({ commit, dispatch, state }, object) {
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
                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@setDelivery'),
                    obj
                );

                commit('setCart', data);

                dispatch('sendItemEvent', { event: 'setDelivery' });
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async setDeliveryLocation({ commit, dispatch, state }, locationId) {
            var obj = {
                id: locationId,
            };

            try {
                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@setDeliveryLocation'),
                    obj
                );

                commit('setCart', data);

                dispatch('sendItemEvent', { event: 'setDelivery' });
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async setPaymentMethod({ commit, state, dispatch }, id) {
            if (_.isObject(id)) {
                id = id.id;
            }

            try {
                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@setPaymentMethod'),
                    {
                        payment_method_id: id,
                    }
                );

                commit('setCart', data);

                dispatch('sendItemEvent', { event: 'setPaymentMethod' });
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async setCountry({ commit, state }, id) {
            if (_.isObject(id)) {
                id = id.id;
            }

            try {
                var { data } = await this.$axios.$post(
                    this.$action('Cart\\CartController@setCountry'),
                    {
                        country_id: id,
                    }
                );

                commit('setCart', data);
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async fetchFullSummary({ commit }) {
            var { data } = await this.$axios.$get(
                this.$action('Cart\\CartController@getFullSummary')
            );

            commit('setCart', data);
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

export default cartStore;
