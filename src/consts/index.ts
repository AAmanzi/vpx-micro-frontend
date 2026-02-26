export const api: Record<string, any> =
  typeof window !== 'undefined' ? (window as any).api : {};

export default api;
