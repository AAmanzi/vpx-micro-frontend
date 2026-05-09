import { FunctionComponent, useMemo, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import ImportTablesModal from 'src/components/ImportTablesModal';
import ScanLibraryModal from 'src/components/ScanLibraryModal';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';

import style from './ConfigureRomSupport.module.scss';

interface Props {
  submit: () => void;
}

const getPinmamePathFromRomsPath = (romsPath?: string): string => {
  if (!romsPath) {
    return '';
  }

  const normalizedPath = romsPath.replace(/\\/g, '/').replace(/\/$/, '');
  const lastSeparatorIndex = normalizedPath.lastIndexOf('/');

  if (lastSeparatorIndex === -1) {
    return normalizedPath;
  }

  return normalizedPath.slice(0, lastSeparatorIndex);
};

const ConfigureRomSupport: FunctionComponent<Props> = ({ submit }) => {
  const { config } = useConfigContext();
  const { tables, fetchTables } = useTablesContext();
  const { showErrorToast, showSuccessToast } = useToastContext();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isLaunchingVpx, setIsLaunchingVpx] = useState(false);
  const [visibleScreenshot, setVisibleScreenshot] = useState<string | null>(
    null,
  );

  const pinmamePath = useMemo(
    () => getPinmamePathFromRomsPath(config?.romsDirectory),
    [config?.romsDirectory],
  );

  const hasTables = tables.length > 0;

  const toggleScreenshot = (id: string) => {
    setVisibleScreenshot((current) => (current === id ? null : id));
  };

  const handleCopyPinmamePath = async () => {
    if (!pinmamePath) {
      showErrorToast('ROMs directory is not configured yet');

      return;
    }

    try {
      await navigator.clipboard.writeText(pinmamePath);
      showSuccessToast('PinMAME path copied');
    } catch {
      showErrorToast('Failed to copy PinMAME path');
    }
  };

  const handleLaunchVpx = async () => {
    if (!hasTables || isLaunchingVpx) {
      return;
    }

    setIsLaunchingVpx(true);

    try {
      const result = await api.startRandomTable(tables);

      if (!result.success) {
        showErrorToast(result.error.message || 'Failed to launch VPX');

        return;
      }

      fetchTables();
    } finally {
      setIsLaunchingVpx(false);
    }
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    fetchTables();
  };

  const handleCloseScanModal = () => {
    setIsScanModalOpen(false);
    fetchTables();
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.content}>
          <div className={style.titleSection}>
            <h3 className={`${style.title} primary-text-color body-md-bold`}>
              Configure PinMAME in VPX
            </h3>
            <p className='secondary-text-color body-sm-regular'>
              Add a table, launch VPX, then set the PinMAME path for ROM based
              tables.
            </p>
          </div>

          <div className={style.stepsSection}>
            <div className={style.stepsHeader}>
              <div className={style.topActions}>
                {!hasTables && (
                  <>
                    <Button
                      label='Import Tables'
                      icon='plus'
                      onClick={() => setIsImportModalOpen(true)}
                      type={ButtonType.primary}
                      size={ButtonSize.small}
                    />
                    <Button
                      label='Scan Library'
                      icon='scan-search'
                      onClick={() => setIsScanModalOpen(true)}
                      type={ButtonType.primaryAlt}
                      size={ButtonSize.small}
                    />
                  </>
                )}
                {hasTables && (
                  <Button
                    label='Launch VPX'
                    icon='play'
                    onClick={handleLaunchVpx}
                    loading={isLaunchingVpx}
                    type={ButtonType.secondary}
                    size={ButtonSize.small}
                  />
                )}
              </div>
            </div>
            <ol className={style.stepsList}>
              <li className='body-sm-regular'>
                Add at least one table to your library.
              </li>
              <li className='body-sm-regular'>Click Launch VPX above.</li>
              <li className='body-sm-regular'>
                In VPX, press <span className={style.keyHint}>F12</span> to open
                pause menu.
              </li>
              <li className='body-sm-regular'>
                Open Plugin settings, then PinMAME.
              </li>
              <li className='body-sm-regular'>
                Set the PinMAME path to:
                <div className={style.pathCard}>
                  <code className={style.pathValue}>
                    {pinmamePath || 'Unavailable'}
                  </code>
                  <Button
                    label='Copy Path'
                    onClick={handleCopyPinmamePath}
                    type={ButtonType.secondary}
                    size={ButtonSize.small}
                  />
                </div>
              </li>
              <li className='body-sm-regular'>
                Use <span className={style.keyHint}>ESC</span> to exit VPX.
              </li>
            </ol>
          </div>

          <div className={style.screenshotsSection}>
            <button
              className={style.screenshotToggle}
              onClick={() => toggleScreenshot('settings')}
              type='button'>
              <span>{visibleScreenshot === 'settings' ? '▼' : '▶'}</span>
              <span className='body-sm-regular'>VPX settings</span>
            </button>
            {visibleScreenshot === 'settings' && (
              <img
                src='/mac-setup/vpx-settings.png'
                alt='VPX settings view'
                className={style.screenshot}
              />
            )}
          </div>

          <div className={style.screenshotsSection}>
            <button
              className={style.screenshotToggle}
              onClick={() => toggleScreenshot('plugins')}
              type='button'>
              <span>{visibleScreenshot === 'plugins' ? '▼' : '▶'}</span>
              <span className='body-sm-regular'>VPX plugins</span>
            </button>
            {visibleScreenshot === 'plugins' && (
              <img
                src='/mac-setup/vpx-plugins.png'
                alt='VPX plugins screen'
                className={style.screenshot}
              />
            )}
          </div>

          <div className={style.screenshotsSection}>
            <button
              className={style.screenshotToggle}
              onClick={() => toggleScreenshot('pinmame')}
              type='button'>
              <span>{visibleScreenshot === 'pinmame' ? '▼' : '▶'}</span>
              <span className='body-sm-regular'>PinMAME settings</span>
            </button>
            {visibleScreenshot === 'pinmame' && (
              <img
                src='/mac-setup/vpx-pinmame.png'
                alt='PinMAME settings in VPX'
                className={style.screenshot}
              />
            )}
          </div>
        </div>

        <div className={style.footer}>
          <div className={style.rightActions}>
            <Button label='Finish' onClick={submit} type={ButtonType.primary} />
          </div>
        </div>
      </div>

      {isImportModalOpen && (
        <ImportTablesModal onClose={handleCloseImportModal} />
      )}
      {isScanModalOpen && <ScanLibraryModal close={handleCloseScanModal} />}
    </>
  );
};

export default ConfigureRomSupport;
