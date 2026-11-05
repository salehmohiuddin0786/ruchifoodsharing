const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function apiRequest(endpoint, method = 'GET', body = null, customHeaders = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ruchi_admin_token') : null;

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

export const adminApi = {
  getMetrics: () => apiRequest('/admin/metrics'),
  getCustomers: () => apiRequest('/admin/users/customers'),
  getCooks: () => apiRequest('/admin/users/cooks'),
  verifyCook: (cookId, verificationStatus) => apiRequest(`/admin/users/cooks/${cookId}/verify`, 'PUT', { verificationStatus }),
  getDonors: () => apiRequest('/admin/users/donors'),
  getAdmins: () => apiRequest('/admin/users/admins'),
  createAdmin: (adminData) => apiRequest('/admin/users/create-admin', 'POST', adminData),
  toggleUserStatus: (userId) => apiRequest(`/admin/users/${userId}/toggle-status`, 'PUT'),
  getFoodPosts: () => apiRequest('/admin/food/posts'),
  togglePostPause: (postId) => apiRequest(`/admin/food/posts/${postId}/toggle-pause`, 'PUT'),
  getFoodDonations: () => apiRequest('/admin/food/donations'),
  getOrders: () => apiRequest('/admin/orders'),
  getReports: () => apiRequest('/admin/reports'),
  resolveReport: (reportId, adminNotes) => apiRequest(`/admin/reports/${reportId}/resolve`, 'PUT', { adminNotes }),
  getAuditLogs: () => apiRequest('/admin/audit-logs'),
  getNotifications: (userId) => apiRequest(`/notifications/${userId}`),
  getCurryRiceItems: () => apiRequest('/curry-rice/admin/items'),
  updateCurryRiceItemStatus: (id, status, isSoldOut) =>
    apiRequest(`/curry-rice/admin/items/${id}/status`, 'PUT', { status, isSoldOut }),
  getCurryRiceOrders: () => apiRequest('/curry-rice/admin/orders'),
  getCurryRiceAnalytics: () => apiRequest('/curry-rice/admin/analytics'),
};

export const pollAdminApi = {
  getAllPolls: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/polls/admin/all?${q}`);
  },
  getAuditLogs: (pollId) => apiRequest(`/polls/admin/${pollId}/audit-logs`),
  moderatePoll: (id, data) => apiRequest(`/polls/admin/${id}/moderate`, 'PUT', data),
  suspendPoll: (id, reason) => apiRequest(`/polls/admin/${id}/suspend`, 'POST', { reason }),
  getStats: () => apiRequest('/polls/admin/stats'),
};
