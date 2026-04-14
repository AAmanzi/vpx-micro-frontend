const fs = require('fs');
const path = require('path');
const { rcedit } = require('rcedit');

module.exports = async (context) => {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const appOutDir = context.appOutDir;
  const iconPath = path.join(context.packager.projectDir, 'public', 'icon.ico');

  if (!fs.existsSync(iconPath)) {
    throw new Error(`Icon file not found: ${iconPath}`);
  }

  const executableName = `${context.packager.config.win.executableName}.exe`;
  const executablePath = path.join(appOutDir, executableName);

  if (!fs.existsSync(executablePath)) {
    throw new Error(`Packaged executable not found: ${executablePath}`);
  }

  await rcedit(executablePath, {
    icon: iconPath,
  });
};