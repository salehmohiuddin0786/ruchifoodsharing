const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

export async function apiRequest(endpoint, method = 'GET', body = null, customHeaders = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ruchi_customer_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }

  return data;
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('ruchi_customer_token') : null;
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Image upload failed');
  }

  return data.imageUrl || data.url;
}

export const customerApi = {
  getFoodPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/customers/food-posts?${query}`);
  },
  getFoodPostById: (id) => apiRequest(`/customers/food-posts/${id}`),
  getDonations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/customers/donations?${query}`);
  },
  placeOrder: (orderData) => apiRequest('/customers/orders', 'POST', orderData),
  getOrders: () => apiRequest('/customers/orders'),
  claimDonation: (claimData) => apiRequest('/customers/reservations', 'POST', claimData),
  getReservations: () => apiRequest('/customers/reservations'),
  getFavourites: () => apiRequest('/customers/favourites'),
  toggleFavourite: (cookId) => apiRequest('/customers/favourites/toggle', 'POST', { cookId }),
  getProfile: () => apiRequest('/customers/profile'),
  updateProfile: (profileData) => apiRequest('/customers/profile', 'PUT', profileData),
  getNotifications: (userId) => apiRequest(`/notifications/${userId}`),
};

export const curryRiceCustomerApi = {
  getItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/curry-rice/items?${query}`);
  },
  getItemById: (id) => apiRequest(`/curry-rice/items/${id}`),
  placeOrder: (orderData) => apiRequest('/curry-rice/orders', 'POST', orderData),
  getMyOrders: () => apiRequest('/curry-rice/orders/my-orders'),
  getOrderById: (id) => apiRequest(`/curry-rice/orders/${id}`),
};

export const pollCustomerApi = {
  getActivePolls: () => apiRequest('/polls/active'),
  getPollHistory: () => apiRequest('/polls/history'),
  getPollById: (id) => apiRequest(`/polls/${id}`),
  vote: (pollId, optionId) => apiRequest(`/polls/${pollId}/vote`, 'POST', { optionId }),
};
