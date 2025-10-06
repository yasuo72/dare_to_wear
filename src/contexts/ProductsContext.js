import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { productsAPI } from '../services/api';

// Initial state
const initialState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    category: '',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// Action types
const PRODUCTS_ACTIONS = {
  FETCH_PRODUCTS_START: 'FETCH_PRODUCTS_START',
  FETCH_PRODUCTS_SUCCESS: 'FETCH_PRODUCTS_SUCCESS',
  FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE',
  FETCH_PRODUCT_START: 'FETCH_PRODUCT_START',
  FETCH_PRODUCT_SUCCESS: 'FETCH_PRODUCT_SUCCESS',
  FETCH_PRODUCT_FAILURE: 'FETCH_PRODUCT_FAILURE',
  FETCH_FEATURED_PRODUCTS_SUCCESS: 'FETCH_FEATURED_PRODUCTS_SUCCESS',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const productsReducer = (state, action) => {
  switch (action.type) {
    case PRODUCTS_ACTIONS.FETCH_PRODUCTS_START:
    case PRODUCTS_ACTIONS.FETCH_PRODUCT_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case PRODUCTS_ACTIONS.FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        products: action.payload.products,
        pagination: {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
          hasNextPage: action.payload.hasNextPage,
          hasPrevPage: action.payload.hasPrevPage
        },
        isLoading: false,
        error: null
      };

    case PRODUCTS_ACTIONS.FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        currentProduct: action.payload,
        isLoading: false,
        error: null
      };

    case PRODUCTS_ACTIONS.FETCH_FEATURED_PRODUCTS_SUCCESS:
      return {
        ...state,
        featuredProducts: action.payload,
        isLoading: false,
        error: null
      };

    case PRODUCTS_ACTIONS.FETCH_PRODUCTS_FAILURE:
    case PRODUCTS_ACTIONS.FETCH_PRODUCT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case PRODUCTS_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case PRODUCTS_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case PRODUCTS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const ProductsContext = createContext();

// Products Provider component
export const ProductsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  // Fetch products with filters and pagination
  const fetchProducts = async (params = {}) => {
    dispatch({ type: PRODUCTS_ACTIONS.FETCH_PRODUCTS_START });
    
    try {
      const response = await productsAPI.getProducts(params);
      
      dispatch({
        type: PRODUCTS_ACTIONS.FETCH_PRODUCTS_SUCCESS,
        payload: response
      });

      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: PRODUCTS_ACTIONS.FETCH_PRODUCTS_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Fetch single product
  const fetchProduct = async (id) => {
    dispatch({ type: PRODUCTS_ACTIONS.FETCH_PRODUCT_START });
    
    try {
      const response = await productsAPI.getProduct(id);
      
      dispatch({
        type: PRODUCTS_ACTIONS.FETCH_PRODUCT_SUCCESS,
        payload: response.product
      });

      return { success: true, data: response.product };
    } catch (error) {
      dispatch({
        type: PRODUCTS_ACTIONS.FETCH_PRODUCT_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getFeaturedProducts();
      
      dispatch({
        type: PRODUCTS_ACTIONS.FETCH_FEATURED_PRODUCTS_SUCCESS,
        payload: response.products
      });

      return { success: true, data: response.products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({
      type: PRODUCTS_ACTIONS.SET_FILTERS,
      payload: filters
    });
  };

  // Set pagination
  const setPagination = (pagination) => {
    dispatch({
      type: PRODUCTS_ACTIONS.SET_PAGINATION,
      payload: pagination
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: PRODUCTS_ACTIONS.CLEAR_ERROR });
  };

  // Add product review
  const addProductReview = async (productId, reviewData) => {
    try {
      const response = await productsAPI.addReview(productId, reviewData);
      
      // Refresh the current product to show new review
      if (state.currentProduct && state.currentProduct._id === productId) {
        await fetchProduct(productId);
      }

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Load initial products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Context value
  const value = {
    ...state,
    fetchProducts,
    fetchProduct,
    fetchFeaturedProducts,
    setFilters,
    setPagination,
    clearError,
    addProductReview
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

// Custom hook to use products context
export const useProducts = () => {
  const context = useContext(ProductsContext);
  
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  
  return context;
};

export default ProductsContext;
