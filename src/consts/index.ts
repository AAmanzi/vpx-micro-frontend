import { Api } from 'src/types/api';

const missingApiError = new Error('window.api not available');
const missingApiResult = {
  success: false as const,
  error: {
    code: 'API_UNAVAILABLE',
    message: missingApiError.message,
  },
};

const unavailableApi = new Proxy({} as Api, {
  get(_target, property) {
    return () => {
      if (property === 'getPathForFile') {
        return missingApiResult;
      }

      return Promise.resolve(missingApiResult);
    };
  },
});

export const api: Api =
  typeof window !== 'undefined' && window.api ? window.api : unavailableApi;

export default api;
