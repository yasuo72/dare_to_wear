import React, { createContext, useContext, useReducer } from 'react';
import { blogAPI } from '../services/api';

// Initial state
const initialState = {
  posts: [],
  currentPost: null,
  featuredPosts: [],
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

// Action types
const BLOG_ACTIONS = {
  FETCH_POSTS_START: 'FETCH_POSTS_START',
  FETCH_POSTS_SUCCESS: 'FETCH_POSTS_SUCCESS',
  FETCH_POSTS_FAILURE: 'FETCH_POSTS_FAILURE',
  FETCH_POST_START: 'FETCH_POST_START',
  FETCH_POST_SUCCESS: 'FETCH_POST_SUCCESS',
  FETCH_POST_FAILURE: 'FETCH_POST_FAILURE',
  FETCH_FEATURED_POSTS_SUCCESS: 'FETCH_FEATURED_POSTS_SUCCESS',
  FETCH_CATEGORIES_SUCCESS: 'FETCH_CATEGORIES_SUCCESS',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const blogReducer = (state, action) => {
  switch (action.type) {
    case BLOG_ACTIONS.FETCH_POSTS_START:
    case BLOG_ACTIONS.FETCH_POST_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case BLOG_ACTIONS.FETCH_POSTS_SUCCESS:
      return {
        ...state,
        posts: action.payload.posts,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null
      };

    case BLOG_ACTIONS.FETCH_POST_SUCCESS:
      return {
        ...state,
        currentPost: action.payload,
        isLoading: false,
        error: null
      };

    case BLOG_ACTIONS.FETCH_FEATURED_POSTS_SUCCESS:
      return {
        ...state,
        featuredPosts: action.payload
      };

    case BLOG_ACTIONS.FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload
      };

    case BLOG_ACTIONS.FETCH_POSTS_FAILURE:
    case BLOG_ACTIONS.FETCH_POST_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case BLOG_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const BlogContext = createContext();

// Blog Provider component
export const BlogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  // Fetch blog posts
  const fetchPosts = async (params = {}) => {
    dispatch({ type: BLOG_ACTIONS.FETCH_POSTS_START });
    
    try {
      const response = await blogAPI.getPosts(params);
      
      dispatch({
        type: BLOG_ACTIONS.FETCH_POSTS_SUCCESS,
        payload: {
          posts: response.posts,
          pagination: {
            page: response.currentPage,
            totalPages: response.totalPages,
            totalPosts: response.totalPosts,
            hasNextPage: response.hasNextPage,
            hasPrevPage: response.hasPrevPage
          }
        }
      });

      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: BLOG_ACTIONS.FETCH_POSTS_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Fetch single blog post
  const fetchPost = async (id) => {
    dispatch({ type: BLOG_ACTIONS.FETCH_POST_START });
    
    try {
      const response = await blogAPI.getPost(id);
      
      dispatch({
        type: BLOG_ACTIONS.FETCH_POST_SUCCESS,
        payload: response.post
      });

      return { success: true, data: response.post };
    } catch (error) {
      dispatch({
        type: BLOG_ACTIONS.FETCH_POST_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Fetch featured posts
  const fetchFeaturedPosts = async () => {
    try {
      const response = await blogAPI.getFeaturedPosts();
      
      dispatch({
        type: BLOG_ACTIONS.FETCH_FEATURED_POSTS_SUCCESS,
        payload: response.posts
      });

      return { success: true, data: response.posts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fetch blog categories
  const fetchCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      
      dispatch({
        type: BLOG_ACTIONS.FETCH_CATEGORIES_SUCCESS,
        payload: response.categories
      });

      return { success: true, data: response.categories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Add comment to blog post
  const addComment = async (postId, commentData) => {
    try {
      const response = await blogAPI.addComment(postId, commentData);
      
      // Refresh the current post to get updated comments
      if (state.currentPost && state.currentPost._id === postId) {
        fetchPost(postId);
      }

      return { success: true, data: response.comment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Search blog posts
  const searchPosts = async (query, params = {}) => {
    dispatch({ type: BLOG_ACTIONS.FETCH_POSTS_START });
    
    try {
      const response = await blogAPI.searchPosts(query, params);
      
      dispatch({
        type: BLOG_ACTIONS.FETCH_POSTS_SUCCESS,
        payload: {
          posts: response.posts,
          pagination: {
            page: response.currentPage,
            totalPages: response.totalPages,
            totalPosts: response.totalPosts,
            hasNextPage: response.hasNextPage,
            hasPrevPage: response.hasPrevPage
          }
        }
      });

      return { success: true, data: response };
    } catch (error) {
      dispatch({
        type: BLOG_ACTIONS.FETCH_POSTS_FAILURE,
        payload: error.message
      });
      
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: BLOG_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    fetchPosts,
    fetchPost,
    fetchFeaturedPosts,
    fetchCategories,
    addComment,
    searchPosts,
    clearError
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

// Custom hook to use blog context
export const useBlog = () => {
  const context = useContext(BlogContext);
  
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  
  return context;
};

export default BlogContext;
