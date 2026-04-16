import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const escapePowerShellSingleQuotedString = (value: string): string =>
  value.replace(/'/g, "''");

const escapeWindowsArgument = (value: string): string => {
  if (!/\s/.test(value)) {
    return value;
  }

  const escapedValue = value.replace(/"/g, '""');

  return `"${escapedValue}"`;
};

const startVpxAsAdmin = async (
  vpxExecutablePath: string,
  launchArgs: string[],
  vpxDir: string,
): Promise<void> => {
  const escapedExecutablePath = escapePowerShellSingleQuotedString(
    vpxExecutablePath,
  );
  const escapedWorkingDirectory = escapePowerShellSingleQuotedString(vpxDir);
  const escapedArgs = launchArgs
    .map((arg) => escapeWindowsArgument(arg))
    .map((arg) => `'${escapePowerShellSingleQuotedString(arg)}'`)
    .join(', ');
  const command =
    `Start-Process -FilePath '${escapedExecutablePath}' ` +
    `-ArgumentList ${escapedArgs} ` +
    `-WorkingDirectory '${escapedWorkingDirectory}' ` +
    '-Verb RunAs';

  await new Promise<void>((resolve, reject) => {
    const powerShell = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        command,
      ],
      {
        windowsHide: true,
        stdio: 'ignore',
      },
    );

    powerShell.once('error', (error) => {
      reject(new Error(`Failed to request elevated VPX start: ${error.message}`));
    });

    powerShell.once('exit', (code) => {
      if (code === 0) {
        resolve();

        return;
      }

      reject(
        new Error(
          'Failed to start VPX as administrator. Confirm the Windows UAC prompt and try again.',
        ),
      );
    });
  });
};

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
    '-ExtMinimized',
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

    child.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EACCES') {
        void (async () => {
          try {
            await startVpxAsAdmin(vpxExecutablePath, launchArgs, vpxDir);
            resolve();
          } catch (adminError) {
            reject(adminError);
          }
        })();

        return;
      }

      reject(new Error(`Failed to start VPX: ${error.message}`));
    });

    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
};
