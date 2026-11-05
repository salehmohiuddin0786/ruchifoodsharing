const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function apiRequest(endpoint, method = 'GET', body = null, customHeaders = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ruchi_partner_token') : null;

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

  const token = typeof window !== 'undefined' ? localStorage.getItem('ruchi_partner_token') : null;
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

export const partnerApi = {
  getDashboard: () => apiRequest('/partners/dashboard'),
  getPosts: () => apiRequest('/partners/posts'),
  createPost: (postData) => apiRequest('/partners/posts', 'POST', postData),
  togglePostPause: (postId) => apiRequest(`/partners/posts/${postId}/toggle-pause`, 'PUT'),
  getPreorders: () => apiRequest('/partners/preorders'),
  updateOrderStatus: (orderId, status) => apiRequest(`/partners/preorders/${orderId}/status`, 'PUT', { status }),
  getDonations: () => apiRequest('/partners/donations'),
  createDonation: (donData) => apiRequest('/partners/donations', 'POST', donData),
  getDonationClaims: () => apiRequest('/partners/donation-claims'),
  updateClaimStatus: (claimId, status) => apiRequest(`/partners/donation-claims/${claimId}/status`, 'PUT', { status }),
  getProfile: () => apiRequest('/partners/profile'),
  updateProfile: (profileData) => apiRequest('/partners/profile', 'PUT', profileData),
  getNotifications: (userId) => apiRequest(`/notifications/${userId}`),
};

export const curryRiceApi = {
  getItems: () => apiRequest('/curry-rice/partner/items'),
  createItem: (data) => apiRequest('/curry-rice/partner/items', 'POST', data),
  updateItem: (id, data) => apiRequest(`/curry-rice/partner/items/${id}`, 'PUT', data),
  deleteItem: (id) => apiRequest(`/curry-rice/partner/items/${id}`, 'DELETE'),
  getOrders: () => apiRequest('/curry-rice/partner/orders'),
  updateOrderStatus: (id, status, rejectionReason = '') =>
    apiRequest(`/curry-rice/partner/orders/${id}/status`, 'PUT', { status, rejectionReason }),
};

export const pollPartnerApi = {
  getMyPolls: () => apiRequest('/polls/cook/my-polls'),
  createPoll: (data) => apiRequest('/polls/cook', 'POST', data),
  publishPoll: (id) => apiRequest(`/polls/cook/${id}/publish`, 'POST'),
  cancelPoll: (id, reason) => apiRequest(`/polls/cook/${id}/cancel`, 'POST', { reason }),
  tieBreak: (id, data) => apiRequest(`/polls/cook/${id}/tie-break`, 'POST', data),
  createPreorder: (id, data) => apiRequest(`/polls/cook/${id}/create-preorder`, 'POST', data),
};
