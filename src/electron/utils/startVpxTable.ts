import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const startVpxTable = async (
  tablePath: string,
  vpxExecutablePath: string,
): Promise<void> => {
  if (!fs.existsSync(tablePath)) {
    throw new Error(`Table file not found: ${tablePath}`);
  }

  if (!fs.existsSync(vpxExecutablePath)) {
    throw new Error(`VPX executable not found: ${vpxExecutablePath}`);
  }

  try {
    const command = `start "" "${tablePath}"`;
    const vpxDir = path.dirname(vpxExecutablePath);

    exec(command, { cwd: vpxDir }, (error) => {
      if (error) {
        console.error(`Failed to start VPX: ${error.message}`);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (error) {
    throw new Error(`Failed to spawn VPX process: ${error}`);
  }
};
