// API utility functions
export const getBackendUrl = () => {
  // In production, use the same host as the frontend but with port 5200
  if (import.meta.env.PROD) {
    const frontendUrl = window.location.origin;
    const backendUrl = frontendUrl.replace(':3200', ':5200');
    return import.meta.env.VITE_BACKEND_URL || backendUrl;
  }
  // In development, use localhost
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5200';
};

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const backendUrl = getBackendUrl();
  const url = endpoint.startsWith('/') ? `${backendUrl}${endpoint}` : `${backendUrl}/${endpoint}`;
  
  return fetch(url, options);
};

export const getApiUrl = (endpoint: string) => {
  const backendUrl = getBackendUrl();
  return endpoint.startsWith('/') ? `${backendUrl}${endpoint}` : `${backendUrl}/${endpoint}`;
};
