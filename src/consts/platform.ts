export const isElectron = (): boolean => {
  return process.env.WEB_MODE !== '1';
};
