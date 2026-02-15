const getRealApi = (): Record<string, any> | null =>
  typeof window !== 'undefined' ? (window as any).api : null;

const waitForApi = (
  prop?: string,
  timeout = 5000,
): Promise<Record<string, any> | null> => {
  const start = Date.now();
  return new Promise((resolve) => {
    const t = setInterval(() => {
      const a = getRealApi();
      if (a && (!prop || typeof a[prop] !== 'undefined')) {
        clearInterval(t);
        resolve(a);
      } else if (Date.now() - start > timeout) {
        clearInterval(t);
        resolve(null);
      }
    }, 50);
  });
};

export const api: Record<string, any> = new Proxy(
  {},
  {
    get(_, prop: string) {
      return (...args: any[]) => {
        const real = getRealApi();
        if (real && typeof real[prop] === 'function') {
          return real[prop](...args);
        }
        return waitForApi(prop).then((r) => {
          if (!r) return Promise.reject(new Error('window.api not available'));
          const fn = r[prop];
          if (typeof fn !== 'function')
            return Promise.reject(new Error('api property is not callable'));
          return fn(...args);
        });
      };
    },
  },
);

export default api;
