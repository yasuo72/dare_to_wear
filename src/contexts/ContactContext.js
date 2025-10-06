import React, { createContext, useContext, useReducer } from 'react';
import { contactAPI } from '../services/api';

// Initial state
const initialState = {
  isLoading: false,
  error: null,
  success: false,
  message: null
};

// Action types
const CONTACT_ACTIONS = {
  SUBMIT_START: 'SUBMIT_START',
  SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
  SUBMIT_FAILURE: 'SUBMIT_FAILURE',
  SUBSCRIBE_START: 'SUBSCRIBE_START',
  SUBSCRIBE_SUCCESS: 'SUBSCRIBE_SUCCESS',
  SUBSCRIBE_FAILURE: 'SUBSCRIBE_FAILURE',
  CLEAR_MESSAGE: 'CLEAR_MESSAGE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const contactReducer = (state, action) => {
  switch (action.type) {
    case CONTACT_ACTIONS.SUBMIT_START:
    case CONTACT_ACTIONS.SUBSCRIBE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        message: null
      };

    case CONTACT_ACTIONS.SUBMIT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload,
        error: null
      };

    case CONTACT_ACTIONS.SUBSCRIBE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        message: action.payload,
        error: null
      };

    case CONTACT_ACTIONS.SUBMIT_FAILURE:
    case CONTACT_ACTIONS.SUBSCRIBE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        success: false,
        message: null
      };

    case CONTACT_ACTIONS.CLEAR_MESSAGE:
      return {
        ...state,
        message: null,
        success: false
      };

    case CONTACT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const ContactContext = createContext();

// Contact Provider component
export const ContactProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  // Submit contact form
  const submitContactForm = async (formData) => {
    dispatch({ type: CONTACT_ACTIONS.SUBMIT_START });
    
    try {
      const response = await contactAPI.submitContact(formData);
      
      dispatch({
        type: CONTACT_ACTIONS.SUBMIT_SUCCESS,
        payload: response.message || 'Thank you for your message! We will get back to you soon.'
      });

      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: CONTACT_ACTIONS.SUBMIT_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Subscribe to newsletter
  const subscribeNewsletter = async (email) => {
    dispatch({ type: CONTACT_ACTIONS.SUBSCRIBE_START });
    
    try {
      const response = await contactAPI.subscribeNewsletter(email);
      
      dispatch({
        type: CONTACT_ACTIONS.SUBSCRIBE_SUCCESS,
        payload: response.message || 'Thank you for subscribing to our newsletter!'
      });

      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: CONTACT_ACTIONS.SUBSCRIBE_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Clear success message
  const clearMessage = () => {
    dispatch({ type: CONTACT_ACTIONS.CLEAR_MESSAGE });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CONTACT_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    submitContactForm,
    subscribeNewsletter,
    clearMessage,
    clearError
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

// Custom hook to use contact context
export const useContact = () => {
  const context = useContext(ContactContext);
  
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  
  return context;
};

export default ContactContext;
