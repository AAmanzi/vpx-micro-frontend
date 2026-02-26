import { Api } from 'src/types/api';

const missingApiError = new Error('window.api not available');

const unavailableApi = new Proxy({} as Api, {
  get() {
    return () => Promise.reject(missingApiError);
  },
});

export const api: Api =
  typeof window !== 'undefined' && window.api ? window.api : unavailableApi;

export default api;
