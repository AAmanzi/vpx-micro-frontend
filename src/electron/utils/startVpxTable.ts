import { spawn } from 'child_process';
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

  const vpxDir = path.dirname(vpxExecutablePath);
  const launchArgs = [
    '-DisableTrueFullScreen',
    '-primary',
    '-LessCPUthreads',
    '-minimized',
    '-play',
    tablePath,
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(vpxExecutablePath, launchArgs, {
      cwd: vpxDir,
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });

    child.once('error', (error) => {
      reject(new Error(`Failed to start VPX: ${error.message}`));
    });

    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
};
