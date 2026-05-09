import { FunctionComponent } from 'react';

import { useConfigContext } from 'src/providers/config';

import MacOsFilePathsSection from './MacOs';
import WindowsFilePathsSection from './Windows';

const FilePathsSection: FunctionComponent = () => {
  const { platform } = useConfigContext();

  if (platform === 'darwin') {
    return <MacOsFilePathsSection />;
  }

  return <WindowsFilePathsSection />;
};

export default FilePathsSection;
