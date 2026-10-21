const { execFile } = require('child_process');
const { promisify } = require('util');
const { signAsync } = require('@electron/osx-sign');

const execFileAsync = promisify(execFile);

module.exports = async (options) => {
  console.log(`Ad-hoc signing macOS app: ${options.app}`);

  await signAsync({
    ...options,
    identity: '-',
    identityValidation: false,
    preAutoEntitlements: false,
    preEmbedProvisioningProfile: false,
    strictVerify: undefined,
    optionsForFile: (filePath) => ({
      ...options.optionsForFile(filePath),
      timestamp: 'none',
    }),
  });

  await execFileAsync('/usr/bin/codesign', [
    '--verify',
    '--deep',
    '--strict',
    '--verbose=2',
    options.app,
  ]);
  console.log('macOS app signature integrity verified (ad-hoc; not notarized).');
};
