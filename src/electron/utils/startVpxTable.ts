import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const startVpxTable = async (
  tablePath: string,
  vpxExecutablePath: string,
): Promise<void> => {
  if (process.platform !== 'win32') {
    throw new Error(
      'Starting Visual Pinball tables is only supported on Windows.',
    );
  }

  if (!fs.existsSync(tablePath)) {
    throw new Error(`Table file not found: ${tablePath}`);
  }

  if (!fs.existsSync(vpxExecutablePath)) {
    throw new Error(`VPX executable not found: ${vpxExecutablePath}`);
  }

  const command = `start "" "${tablePath}"`;
  const vpxDir = path.dirname(vpxExecutablePath);

  await new Promise<void>((resolve, reject) => {
    exec(command, { cwd: vpxDir }, (error) => {
      if (error) {
        reject(new Error(`Failed to start VPX: ${error.message}`));

        return;
      }

      resolve();
    });
  });
};
