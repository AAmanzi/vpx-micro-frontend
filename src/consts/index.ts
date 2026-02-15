export const api: Record<string, any> | null =
  typeof window !== 'undefined' ? (window as any).api : null;
