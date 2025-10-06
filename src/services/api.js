// API Configuration and Service Layer
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Client with error handling
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Register user
  register: async (name, email, password) => {
    const response = await apiClient.post('/auth/register', { name, email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  // Get user profile
  getProfile: async () => {
    return apiClient.get('/auth/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return apiClient.put('/auth/profile', userData);
  }
};

// Products API
export const productsAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get single product
  getProduct: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return apiClient.get('/products/featured');
  },

  // Get related products
  getRelatedProducts: async (id) => {
    return apiClient.get(`/products/${id}/related`);
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    return apiClient.post(`/products/${productId}/reviews`, reviewData);
  }
};

// Cart API
export const cartAPI = {
  // Get user cart
  getCart: async () => {
    return apiClient.get('/cart');
  },

  // Add item to cart
  addToCart: async (productID, quantity, size, color) => {
    return apiClient.post('/cart/add', { productID, quantity, size, color });
  },

  // Update cart item
  updateCartItem: async (itemId, quantity, size, color) => {
    return apiClient.put('/cart/update', { productID: itemId, quantity, size, color });
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    return apiClient.delete(`/cart/remove/${itemId}`);
  },

  // Clear cart
  clearCart: async () => {
    return apiClient.delete('/cart/clear');
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    return apiClient.post('/cart/coupon', { couponCode });
  }
};

// Orders API
export const ordersAPI = {
  // Create order
  createOrder: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  // Get user orders
  getOrders: async () => {
    return apiClient.get('/orders');
  },

  // Get single order
  getOrder: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  // Cancel order
  cancelOrder: async (id) => {
    return apiClient.put(`/orders/${id}/cancel`);
  }
};

// Blog API
export const blogAPI = {
  // Get all blog posts
  getBlogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/blog${queryString ? `?${queryString}` : ''}`);
  },

  // Get single blog post
  getBlog: async (id) => {
    return apiClient.get(`/blog/${id}`);
  },

  // Get featured blogs
  getFeaturedBlogs: async () => {
    return apiClient.get('/blog/featured');
  },

  // Add blog comment
  addComment: async (blogId, comment) => {
    return apiClient.post(`/blog/${blogId}/comments`, { comment });
  },

  // Like blog post
  likeBlog: async (blogId) => {
    return apiClient.post(`/blog/${blogId}/like`);
  }
};

// Contact API
export const contactAPI = {
  // Submit contact form
  submitContact: async (contactData) => {
    return apiClient.post('/contact', contactData);
  },

  // Subscribe to newsletter
  subscribeNewsletter: async (email) => {
    return apiClient.post('/contact/newsletter', { email });
  }
};

// Payment API
export const paymentAPI = {
  // Create payment intent
  createPaymentIntent: async (amount, currency = 'usd') => {
    return apiClient.post('/payments/create-payment-intent', { amount, currency });
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    return apiClient.post('/payments/confirm-payment', { paymentIntentId, paymentMethodId });
  }
};

// File Upload API
export const uploadAPI = {
  // Upload product image
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.request('/upload/product-image', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  },

  // Upload user avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return apiClient.request('/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }
};

export default apiClient;
