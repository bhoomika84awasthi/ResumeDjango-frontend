const API_BASE_URL = 'http://localhost:8000/api';

export const getAuthHeaders = (token, extraHeaders = {}) => ({
  'Authorization': `Token ${token}`,
  ...extraHeaders,
});

export const API_ENDPOINTS = {
  RESUMES: `${API_BASE_URL}/resumes/`,
  JOBS: `${API_BASE_URL}/jobs/`,
  ANALYSES: `${API_BASE_URL}/analyses/`,
  ANALYZE: `${API_BASE_URL}/analyses/analyze/`,
};

export const get = async (url, token) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token, {
      'Content-Type': 'application/json',
    }),
  });
  return response.json();
};

export const post = async (url, data, token, isFormData = false) => {
  const headers = getAuthHeaders(token);

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
};

export const put = async (url, data, token) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(token, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteRequest = async (url, token) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return response.status === 204 ? { success: true } : response.json();
};
