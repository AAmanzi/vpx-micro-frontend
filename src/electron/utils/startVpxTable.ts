export const startVpxTable = async (
  tablePath: string,
  vpxExecutablePath: string,
): Promise<void> => {
  console.log(`
  starting table: ${tablePath}
  with VPX at: ${vpxExecutablePath}`);
};
