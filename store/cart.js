const CrudAdmin = require('../crudadmin.js');
const CartItem = require('../models/CartItem.js');
const Discount = require('../models/Discount.js');
const _ = require('lodash');

var cartStore = {
    namespaced: true,

    state() {
        return {
            items: [],
            discounts: [],
            summary: {},
            summary_without_mutators: {},
            deliveries: [],
            paymentMethods: [],
            selectedDelivery: null,
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
            //We can mutate this variable from outside
            for (var key in cart) {
                if (key in state) {
                    state[key] = cart[key];
                }
            }
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
                var response = await this.$axios.$post(
                    this.$action('Cart\\CartController@addItem'),
                    {
                        product_id: object.product_id,
                        variant_id: object.variant_id,
                        quantity: object.quantity,
                    }
                );

                commit('setCart', response);

                dispatch('sendItemEvent', {
                    event: 'addToCart',
                    cartItem: object,
                    quantity: object.quantity,
                });

                dispatch('showNewItem', response.addedItems[0]);
            } catch (e) {
                dispatch('cartError', e);
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
            if (obj.quantity < 1) {
                obj.quantity = 1;
            }

            //If no change
            if (obj.item.quantity == obj.quantity) {
                return;
            }

            //If user increases quantity
            if (obj.item.quantity < obj.quantity) {
                dispatch('sendItemEvent', {
                    event: 'addToCart',
                    cartItem: obj.item,
                    quantity: obj.quantity - obj.item.quantity,
                });
            } else {
                dispatch('sendItemEvent', {
                    event: 'removeFromCart',
                    cartItem: obj.item,
                    quantity: obj.item.quantity - obj.quantity,
                });
            }

            try {
                let request = {
                    product_id: obj.item.product.id,
                    variant_id: (obj.item.variant || {}).id,
                    quantity: obj.quantity,
                };

                //If cart item is assigned to another cart item, we want send this data as well
                if (new CartItem(obj.item).hasParentCartItem()) {
                    request.cart_item = obj.item.parentIdentifier.data;
                }

                var response = await this.$axios.$post(
                    this.$action('Cart\\CartController@updateQuantity'),
                    request
                );

                commit('setCart', response);
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

                var response = await this.$axios.$post(
                    this.$action('Cart\\CartController@removeItem'),
                    {
                        product_id: cartItem.product.id,
                        variant_id: (cartItem.variant || {}).id,
                    }
                );

                commit('setCart', response);
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
            let location_id, id;

            //If object is
            if (object && typeof object === 'object') {
                id = object.id;
                location_id = object.location_id;
            } else {
                id = object;
            }

            var obj = {
                delivery_id: id || null,
                location_id: location_id || null,
            };

            try {
                var data = await this.$axios.$post(
                    this.$action('Cart\\CartController@setDelivery'),
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
                var data = await this.$axios.$post(
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
                var response = await this.$axios.$post(
                    this.$action('Cart\\CartController@setCountry'),
                    {
                        country_id: id,
                    }
                );

                commit('setCart', response);
            } catch (e) {
                dispatch('cartError', e);
            }
        },
        async fetchFullSummary({ commit }) {
            var response = await this.$axios.$get(
                this.$action('Cart\\CartController@getFullSummary')
            );

            commit('setCart', response);
        },
    },

    getters: {
        getCartItems: state => (options = {}) => {
            let items = state.items.map(item => new CartItem(item));

            if (options.withAssignedChildItems === false) {
                items = items.filter(item => {
                    return item.hasParentCartItem() == false;
                });
            }

            return items;
        },
        getDiscounts: state => {
            return state.discounts.map(item => new Discount(item));
        },
        getItemsQuantityCount: state => {
            return _.sum(state.items.map(item => item.quantity));
        },
        getCartItemFromObject: state => object => {
            var search = {
                id: parseInt(object.product_id) || parseInt(object.id),
                ...(object.variant_id
                    ? {
                          variant_id: parseInt(object.variant_id),
                      }
                    : {}),
            };

            return _.find(state.items, search);
        },
        getIndicatedDeliveries: state => {
            return state.deliveries
                .filter(delivery => delivery.free_indicator)
                .sort((a, b) => a.free_from - b.free_from);
        },
        getDiscountCode: state => {
            let item = _.find(state.discounts, { key: 'DiscountCode' });
            if (item) {
                return new Discount(item);
            }
        },
        isSelectedPaymentMethod: state => method => {
            return (
                state.selectedPaymentMethod &&
                state.selectedPaymentMethod.id == method.id
            );
        },
        isSelectedDelivery: state => delivery => {
            return (
                state.selectedDelivery &&
                state.selectedDelivery.id == delivery.id
            );
        },
    },
};

module.exports = cartStore;
