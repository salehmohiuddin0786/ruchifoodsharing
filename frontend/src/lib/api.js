const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchPreorders(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/preorders?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch preorders');
    return await res.json();
  } catch (error) {
    console.warn('API fetchPreorders fallback:', error.message);
    return { success: false, error: error.message };
  }
}

export async function fetchDonations(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/donations?${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch donations');
    return await res.json();
  } catch (error) {
    console.warn('API fetchDonations fallback:', error.message);
    return { success: false, error: error.message };
  }
}

export async function bookPreOrderApi(postId, bookingData) {
  try {
    const res = await fetch(`${API_BASE}/preorders/${postId}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createPreOrderApi(postData) {
  try {
    const res = await fetch(`${API_BASE}/preorders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function reserveDonationApi(donationId, claimData) {
  try {
    const res = await fetch(`${API_BASE}/donations/${donationId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createDonationApi(donationData) {
  try {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchCustomerOrdersApi(customerId) {
  try {
    const res = await fetch(`${API_BASE}/preorders/orders/customer/${customerId}`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchCookOrdersApi(cookId) {
  try {
    const res = await fetch(`${API_BASE}/preorders/orders/cook/${cookId}`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusApi(orderId, status) {
  try {
    const res = await fetch(`${API_BASE}/preorders/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function cancelOrderApi(orderId) {
  try {
    const res = await fetch(`${API_BASE}/preorders/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchNotificationsApi(userId) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${userId}`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchAdminMetricsApi() {
  try {
    const res = await fetch(`${API_BASE}/admin/metrics`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchAdminReportsApi() {
  try {
    const res = await fetch(`${API_BASE}/admin/reports`, { cache: 'no-store' });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function submitReportApi(reportData) {
  try {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function togglePostPauseApi(postId) {
  try {
    const res = await fetch(`${API_BASE}/admin/preorders/${postId}/toggle-pause`, {
      method: 'PUT',
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}
