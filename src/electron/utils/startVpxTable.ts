export const startVpxTable = async (
  tablePath: string,
  vpxPath: string,
  vpxExecutable: string,
): Promise<void> => {
  console.log(`
starting table: ${tablePath}
with VPX at: ${vpxPath}
using executable: ${vpxExecutable}`);
};
