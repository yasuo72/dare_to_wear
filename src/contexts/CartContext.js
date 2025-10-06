import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI, productsAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
  appliedCoupon: null,
  discount: 0
};

// Action types
const CART_ACTIONS = {
  FETCH_CART_START: 'FETCH_CART_START',
  FETCH_CART_SUCCESS: 'FETCH_CART_SUCCESS',
  FETCH_CART_FAILURE: 'FETCH_CART_FAILURE',
  ADD_TO_CART_START: 'ADD_TO_CART_START',
  ADD_TO_CART_SUCCESS: 'ADD_TO_CART_SUCCESS',
  ADD_TO_CART_FAILURE: 'ADD_TO_CART_FAILURE',
  UPDATE_CART_SUCCESS: 'UPDATE_CART_SUCCESS',
  REMOVE_FROM_CART_SUCCESS: 'REMOVE_FROM_CART_SUCCESS',
  CLEAR_CART_SUCCESS: 'CLEAR_CART_SUCCESS',
  APPLY_COUPON_SUCCESS: 'APPLY_COUPON_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.FETCH_CART_START:
    case CART_ACTIONS.ADD_TO_CART_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case CART_ACTIONS.FETCH_CART_SUCCESS:
    case CART_ACTIONS.ADD_TO_CART_SUCCESS:
    case CART_ACTIONS.UPDATE_CART_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        appliedCoupon: action.payload.appliedCoupon || null,
        discount: action.payload.discount || 0,
        isLoading: false,
        error: null
      };

    case CART_ACTIONS.REMOVE_FROM_CART_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null
      };

    case CART_ACTIONS.CLEAR_CART_SUCCESS:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        appliedCoupon: null,
        discount: 0,
        isLoading: false,
        error: null
      };

    case CART_ACTIONS.APPLY_COUPON_SUCCESS:
      return {
        ...state,
        appliedCoupon: action.payload.coupon,
        discount: action.payload.discount,
        totalPrice: action.payload.totalPrice,
        isLoading: false,
        error: null
      };

    case CART_ACTIONS.FETCH_CART_FAILURE:
    case CART_ACTIONS.ADD_TO_CART_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!isAuthenticated) {
      // If not authenticated, use local storage cart
      const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": [], "totalItems": 0, "totalPrice": 0}');
      dispatch({
        type: CART_ACTIONS.FETCH_CART_SUCCESS,
        payload: localCart
      });
      return;
    }

    dispatch({ type: CART_ACTIONS.FETCH_CART_START });
    
    try {
      const response = await cartAPI.getCart();
      
      dispatch({
        type: CART_ACTIONS.FETCH_CART_SUCCESS,
        payload: response.cart
      });

      return { success: true, data: response.cart };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.FETCH_CART_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    if (!isAuthenticated) {
      // Handle local cart for non-authenticated users
      dispatch({ type: CART_ACTIONS.ADD_TO_CART_START });
      
      try {
        const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": [], "totalItems": 0, "totalPrice": 0}');
        
        // Fetch product details from API (doesn't require auth)
        const productResponse = await productsAPI.getProduct(productId);
        const product = productResponse.product;
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        // Find existing item
        const existingItemIndex = localCart.items.findIndex(
          item => item.productID === productId && item.size === size && JSON.stringify(item.color) === JSON.stringify(color)
        );

        if (existingItemIndex > -1) {
          localCart.items[existingItemIndex].quantity += quantity;
          localCart.items[existingItemIndex].subtotal = localCart.items[existingItemIndex].quantity * localCart.items[existingItemIndex].productPrice;
        } else {
          // Add new item with full product details
          localCart.items.push({
            productID: product.productID,
            productName: product.productName,
            productPrice: product.productPrice,
            frontImg: product.frontImg,
            productReviews: product.productReviews,
            quantity,
            size,
            color,
            subtotal: quantity * product.productPrice
          });
        }

        // Recalculate totals
        localCart.totalItems = localCart.items.reduce((sum, item) => sum + item.quantity, 0);
        localCart.totalAmount = localCart.items.reduce((sum, item) => sum + item.subtotal, 0);

        localStorage.setItem('cart', JSON.stringify(localCart));
        
        dispatch({
          type: CART_ACTIONS.ADD_TO_CART_SUCCESS,
          payload: {
            items: localCart.items,
            totalItems: localCart.totalItems,
            totalPrice: localCart.totalAmount
          }
        });

        return { success: true, data: localCart };
      } catch (error) {
        dispatch({
          type: CART_ACTIONS.ADD_TO_CART_FAILURE,
          payload: error.message
        });
        return { success: false, error: error.message };
      }
    }

    dispatch({ type: CART_ACTIONS.ADD_TO_CART_START });
    
    try {
      const response = await cartAPI.addToCart(productId, quantity, size, color);
      
      dispatch({
        type: CART_ACTIONS.ADD_TO_CART_SUCCESS,
        payload: response.cart
      });

      return { success: true, data: response.cart };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.ADD_TO_CART_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity, size = null, color = null) => {
    try {
      const response = await cartAPI.updateCartItem(itemId, quantity, size, color);
      
      dispatch({
        type: CART_ACTIONS.UPDATE_CART_SUCCESS,
        payload: response.cart
      });

      return { success: true, data: response.cart };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await cartAPI.removeFromCart(itemId);
      
      dispatch({
        type: CART_ACTIONS.REMOVE_FROM_CART_SUCCESS,
        payload: response.cart
      });

      return { success: true, data: response.cart };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      localStorage.removeItem('cart');
      dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });
      return { success: true };
    }

    try {
      await cartAPI.clearCart();
      
      dispatch({ type: CART_ACTIONS.CLEAR_CART_SUCCESS });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    try {
      const response = await cartAPI.applyCoupon(couponCode);
      
      dispatch({
        type: CART_ACTIONS.APPLY_COUPON_SUCCESS,
        payload: {
          coupon: response.coupon,
          discount: response.discount,
          totalPrice: response.totalPrice
        }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  // Load cart on mount and when authentication changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Context value
  const value = {
    ...state,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export default CartContext;
