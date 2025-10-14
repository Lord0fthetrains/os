// API utility functions
export const getBackendUrl = () => {
  // Use environment variable if set, otherwise use relative URLs (nginx will proxy to backend)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Use relative URLs - nginx will proxy /api/* to backend:5200
  return '';
};

export const apiCall = async (endpoint: string, options?: RequestInit) => {
  // Use relative URLs - nginx will proxy /api/* to backend:5200
  return fetch(endpoint, options);
};

export const getApiUrl = (endpoint: string) => {
  // Use relative URLs - nginx will proxy /api/* to backend:5200
  return endpoint;
};
