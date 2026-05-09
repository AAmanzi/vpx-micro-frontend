import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, { Type as ButtonType } from 'src/components/Button';
import FolderPicker from 'src/components/FolderPicker';
import Input from 'src/components/Input';
import { useToastContext } from 'src/providers/toast';

import style from './ConfigureLibraryFolders.module.scss';

type Variant = 'automatic' | 'custom';

interface Props {
  goNext: (
    variant: Variant,
    paths: {
      libraryFolder?: string;
      tablesFolder?: string;
      romsFolder?: string;
    },
  ) => void;
}

const ConfigureLibraryFolders: FunctionComponent<Props> = ({ goNext }) => {
  const { showErrorToast } = useToastContext();
  const [variant, setVariant] = useState<Variant>('automatic');
  const [libraryFolder, setLibraryFolder] = useState('');
  const [tablesFolder, setTablesFolder] = useState('');
  const [romsFolder, setRomsFolder] = useState('');

  const handleContinue = () => {
    if (variant === 'automatic' && !libraryFolder.trim()) {
      showErrorToast('Please select a library folder');
      return;
    }
    if (variant === 'custom' && (!tablesFolder.trim() || !romsFolder.trim())) {
      showErrorToast('Please select both tables and ROMs folders');
      return;
    }
    goNext(variant, {
      libraryFolder: variant === 'automatic' ? libraryFolder : undefined,
      tablesFolder: variant === 'custom' ? tablesFolder : undefined,
      romsFolder: variant === 'custom' ? romsFolder : undefined,
    });
  };

  return (
    <div className={style.container}>
      <div className={style.content}>
        <div className={style.titleSection}>
          <h3 className={`${style.title} primary-text-color body-md-bold`}>
            Configure your library folders
          </h3>
          <p className='secondary-text-color body-sm-regular'>
            Choose how you want to organize your tables and ROMs.
          </p>
        </div>

        <div className={style.variantSection}>
          <button
            className={`${style.variantButton} ${variant === 'automatic' ? style.variantButtonActive : ''}`}
            onClick={() => setVariant('automatic')}
            type='button'>
            Automatic (recommended)
          </button>
          <button
            className={`${style.variantButton} ${variant === 'custom' ? style.variantButtonActive : ''}`}
            onClick={() => setVariant('custom')}
            type='button'>
            Custom
          </button>
        </div>

        {variant === 'automatic' && (
          <div className={style.variantContent}>
            <p
              className={classNames(
                'secondary-text-color body-sm-regular',
                style.variantDescription,
              )}>
              The frontend will create and manage the recommended folder
              structure for you.
            </p>
            <div className={style.inputGroup}>
              <Input
                label='Visual Pinball Library Folder'
                placeholder='~/Documents/Visual Pinball'
                value={libraryFolder}
                onChange={setLibraryFolder}
              />
              <FolderPicker
                onSelect={setLibraryFolder}
                onError={showErrorToast}
                label='Browse'
              />
            </div>
          </div>
        )}

        {variant === 'custom' && (
          <div className={style.variantContent}>
            <p
              className={classNames(
                'secondary-text-color body-sm-regular',
                style.variantDescription,
              )}>
              Use your own existing folder structure.
            </p>
            <div className={style.inputGroup}>
              <Input
                label='Tables Folder'
                placeholder='~/Documents/Visual Pinball/Tables'
                value={tablesFolder}
                onChange={setTablesFolder}
              />
              <FolderPicker
                onSelect={setTablesFolder}
                onError={showErrorToast}
                label='Browse'
              />
            </div>
            <div className={style.inputGroup}>
              <Input
                label='ROMs Folder'
                placeholder='~/Documents/Visual Pinball/VPinMAME/roms'
                value={romsFolder}
                onChange={setRomsFolder}
              />
              <FolderPicker
                onSelect={setRomsFolder}
                onError={showErrorToast}
                label='Browse'
              />
            </div>
            <div className={style.folderStructureHint}>
              <span className='body-xs-regular secondary-text-color'>
                Suggested structure:
              </span>
              <code className={style.code}>
                Visual Pinball/
                <br />
                &nbsp;&nbsp;Tables/
                <br />
                &nbsp;&nbsp;VPinMAME/
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;roms/
              </code>
            </div>
          </div>
        )}
      </div>

      <div className={style.footer}>
        <Button
          label={variant === 'automatic' ? 'Create folders' : 'Continue'}
          onClick={handleContinue}
          type={ButtonType.primary}
        />
      </div>
    </div>
  );
};

export default ConfigureLibraryFolders;
