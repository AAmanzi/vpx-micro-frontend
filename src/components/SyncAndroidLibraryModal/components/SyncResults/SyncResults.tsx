import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Form from 'src/components/Form';
import Icon from 'src/components/Icon';
import { api } from 'src/consts';
import { useToastContext } from 'src/providers/toast';
import {
  AndroidScanResult,
  AndroidSyncApplyPayload,
  AndroidSyncProgressEvent,
} from 'src/types/android';

import style from './SyncResults.module.scss';
import Collapsible from './components/Collapsible';
import FilesToDeleteSection from './components/FilesToDeleteSection';
import TablesInSyncSection from './components/TablesInSyncSection';
import TablesToUploadSection from './components/TablesToUploadSection';
import UnsyncedRomsToUploadSection from './components/UnsyncedRomsToUploadSection';

interface Props {
  close: () => void;
  scanResult: AndroidScanResult;
  onRescan: () => Promise<void>;
  isRescanning: boolean;
}

const SyncResults: FunctionComponent<Props> = ({
  close,
  scanResult,
  onRescan,
  isRescanning,
}) => {
  const { showErrorToast, showSuccessToast } = useToastContext();

  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] =
    useState<AndroidSyncProgressEvent | null>(null);

  const [isTablesToUploadOpen, setIsTablesToUploadOpen] = useState(false);
  const [isUnsyncedRomsOpen, setIsUnsyncedRomsOpen] = useState(false);
  const [isFilesToDeleteOpen, setIsFilesToDeleteOpen] = useState(false);
  const [isTablesInSyncOpen, setIsTablesInSyncOpen] = useState(false);

  const [includedTablesToUploadByPath, setIncludedTablesToUploadByPath] =
    useState<Record<string, boolean>>({});
  const [includedUnsyncedRomsByPath, setIncludedUnsyncedRomsByPath] = useState<
    Record<string, boolean>
  >({});
  const [includedFilesToDeleteByPath, setIncludedFilesToDeleteByPath] =
    useState<Record<string, boolean>>({});

  const { tablesToUpload, unsyncedRomsToUpload, filesToDelete, tablesInSync } =
    scanResult;

  useEffect(() => {
    setIsTablesToUploadOpen(false);
    setIsUnsyncedRomsOpen(false);
    setIsFilesToDeleteOpen(false);
    setIsTablesInSyncOpen(false);

    setIncludedTablesToUploadByPath(
      tablesToUpload.reduce<Record<string, boolean>>(
        (acc, table) => ({
          ...acc,
          [table.filePath]: true,
        }),
        {},
      ),
    );

    setIncludedUnsyncedRomsByPath(
      unsyncedRomsToUpload.reduce<Record<string, boolean>>(
        (acc, rom) => ({
          ...acc,
          [rom.path]: true,
        }),
        {},
      ),
    );

    setIncludedFilesToDeleteByPath(
      filesToDelete.reduce<Record<string, boolean>>(
        (acc, file) => ({
          ...acc,
          [file.path]: false,
        }),
        {},
      ),
    );
  }, [tablesToUpload, unsyncedRomsToUpload, filesToDelete]);

  const isLibraryInSync =
    tablesToUpload.length === 0 &&
    unsyncedRomsToUpload.length === 0 &&
    filesToDelete.length === 0;

  const selectedTablesToUploadCount = tablesToUpload.filter(
    (table) => includedTablesToUploadByPath[table.filePath] ?? true,
  ).length;
  const selectedUnsyncedRomsToUploadCount = unsyncedRomsToUpload.filter(
    (rom) => includedUnsyncedRomsByPath[rom.path] ?? true,
  ).length;
  const selectedFilesToDeleteCount = filesToDelete.filter(
    (file) => includedFilesToDeleteByPath[file.path] ?? false,
  ).length;

  const toggleTableToUploadInclude = (filePath: string) => {
    setIncludedTablesToUploadByPath((prev) => ({
      ...prev,
      [filePath]: !(prev[filePath] ?? true),
    }));
  };

  const toggleUnsyncedRomInclude = (romPath: string) => {
    setIncludedUnsyncedRomsByPath((prev) => ({
      ...prev,
      [romPath]: !(prev[romPath] ?? true),
    }));
  };

  const toggleFileToDeleteInclude = (filePath: string) => {
    setIncludedFilesToDeleteByPath((prev) => ({
      ...prev,
      [filePath]: !(prev[filePath] ?? false),
    }));
  };

  const selectAllTablesToUpload = () => {
    setIncludedTablesToUploadByPath(
      tablesToUpload.reduce<Record<string, boolean>>(
        (acc, table) => ({
          ...acc,
          [table.filePath]: true,
        }),
        {},
      ),
    );
  };

  const deselectAllTablesToUpload = () => {
    setIncludedTablesToUploadByPath(
      tablesToUpload.reduce<Record<string, boolean>>(
        (acc, table) => ({
          ...acc,
          [table.filePath]: false,
        }),
        {},
      ),
    );
  };

  const selectAllUnsyncedRoms = () => {
    setIncludedUnsyncedRomsByPath(
      unsyncedRomsToUpload.reduce<Record<string, boolean>>(
        (acc, rom) => ({
          ...acc,
          [rom.path]: true,
        }),
        {},
      ),
    );
  };

  const deselectAllUnsyncedRoms = () => {
    setIncludedUnsyncedRomsByPath(
      unsyncedRomsToUpload.reduce<Record<string, boolean>>(
        (acc, rom) => ({
          ...acc,
          [rom.path]: false,
        }),
        {},
      ),
    );
  };

  const selectAllFilesToDelete = () => {
    setIncludedFilesToDeleteByPath(
      filesToDelete.reduce<Record<string, boolean>>(
        (acc, file) => ({
          ...acc,
          [file.path]: true,
        }),
        {},
      ),
    );
  };

  const deselectAllFilesToDelete = () => {
    setIncludedFilesToDeleteByPath(
      filesToDelete.reduce<Record<string, boolean>>(
        (acc, file) => ({
          ...acc,
          [file.path]: false,
        }),
        {},
      ),
    );
  };

  const handleApply = async () => {
    if (isApplying) {
      return;
    }

    setIsApplying(true);
    setApplyProgress(null);

    const removeProgressListener = api.onAndroidSyncProgress((event) =>
      setApplyProgress(event),
    );

    const payload: AndroidSyncApplyPayload = {
      tablesToUpload: tablesToUpload.filter(
        (table) => includedTablesToUploadByPath[table.filePath] ?? true,
      ),
      unsyncedRomsToUpload: unsyncedRomsToUpload.filter(
        (rom) => includedUnsyncedRomsByPath[rom.path] ?? true,
      ),
      filesToDelete: filesToDelete.filter(
        (file) => includedFilesToDeleteByPath[file.path] ?? false,
      ),
    };

    const result = await api.applyAndroidSync(payload);

    removeProgressListener();
    setIsApplying(false);
    setApplyProgress(null);

    if (!result.success) {
      showErrorToast(
        result.error.message || 'Failed to apply Android sync changes',
      );
      return;
    }

    showSuccessToast('Android sync changes applied');
    close();
  };
  return (
    <Form submit={handleApply}>
      <div className={style.resultsWrapper}>
        {isLibraryInSync && (
          <div className={style.emptyStateWrapper}>
            <Icon
              className={style.shieldIcon}
              icon='shield-checkmark'
              width={36}
              height={36}
            />
            <p className='primary-text-color body-md-semibold'>
              Android library is in sync
            </p>
            <p className='secondary-text-color body-sm-regular'>
              No upload or deletion changes were found.
            </p>
          </div>
        )}

        {tablesToUpload.length > 0 && (
          <Collapsible
            title='Tables To Upload'
            description='These tables will be uploaded to Android when you apply changes.'
            icon='plus'
            color='blue'
            count={tablesToUpload.length}
            isOpen={isTablesToUploadOpen}
            onToggle={() => setIsTablesToUploadOpen((prev) => !prev)}>
            <TablesToUploadSection
              tables={tablesToUpload}
              includedByPath={includedTablesToUploadByPath}
              onToggleInclude={toggleTableToUploadInclude}
              onSelectAll={selectAllTablesToUpload}
              onDeselectAll={deselectAllTablesToUpload}
            />
          </Collapsible>
        )}

        {unsyncedRomsToUpload.length > 0 && (
          <Collapsible
            title='Unsynced ROMs To Upload'
            description='These ROM files are missing on Android and can be uploaded.'
            icon='package'
            color='yellow'
            count={unsyncedRomsToUpload.length}
            isOpen={isUnsyncedRomsOpen}
            onToggle={() => setIsUnsyncedRomsOpen((prev) => !prev)}>
            <UnsyncedRomsToUploadSection
              roms={unsyncedRomsToUpload}
              includedByPath={includedUnsyncedRomsByPath}
              onToggleInclude={toggleUnsyncedRomInclude}
              onSelectAll={selectAllUnsyncedRoms}
              onDeselectAll={deselectAllUnsyncedRoms}
            />
          </Collapsible>
        )}

        {filesToDelete.length > 0 && (
          <Collapsible
            title='Files To Delete'
            description='These files exist on Android but are not part of your local library selection.'
            icon='trash'
            color='red'
            count={filesToDelete.length}
            isOpen={isFilesToDeleteOpen}
            onToggle={() => setIsFilesToDeleteOpen((prev) => !prev)}>
            <FilesToDeleteSection
              files={filesToDelete}
              includedByPath={includedFilesToDeleteByPath}
              onToggleInclude={toggleFileToDeleteInclude}
              onSelectAll={selectAllFilesToDelete}
              onDeselectAll={deselectAllFilesToDelete}
            />
          </Collapsible>
        )}

        {tablesInSync.length > 0 && (
          <Collapsible
            title='Tables In Sync'
            description='These tables already exist on Android and are shown for preview only.'
            icon='shield-checkmark'
            color='blue'
            count={tablesInSync.length}
            isOpen={isTablesInSyncOpen}
            onToggle={() => setIsTablesInSyncOpen((prev) => !prev)}>
            <TablesInSyncSection tables={tablesInSync} />
          </Collapsible>
        )}

        {isApplying && applyProgress && (
          <div className={style.progressWrapper}>
            <div className={style.progressLabel}>
              <span className='secondary-text-color body-xs-regular'>
                {applyProgress.label}
              </span>
              <span className='secondary-text-color body-xs-regular'>
                {applyProgress.step} / {applyProgress.totalSteps}
              </span>
            </div>
            <div className={style.progressBar}>
              <div
                className={style.progressBarFill}
                style={{
                  width: `${Math.round(
                    (applyProgress.step / applyProgress.totalSteps) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {!isLibraryInSync && !isApplying && (
          <p
            className={classNames(
              'secondary-text-color',
              'body-xs-regular',
              style.footerMeta,
            )}>
            {selectedTablesToUploadCount} tables to upload •{' '}
            {selectedUnsyncedRomsToUploadCount} ROM files to upload •{' '}
            {selectedFilesToDeleteCount} files to delete
          </p>
        )}

        <div className={style.actions}>
          <div className={style.actionsButtons}>
            <Button
              label={isLibraryInSync ? 'Close' : 'Cancel'}
              onClick={close}
              type={ButtonType.transparent}
              size={ButtonSize.small}
            />
            <Button
              label='Rescan'
              type={ButtonType.primaryAltTransparent}
              size={ButtonSize.small}
              onClick={onRescan}
              disabled={isApplying || isRescanning}
              icon='scan-search'
            />
            {!isLibraryInSync && (
              <Button
                label={isApplying ? 'Applying...' : 'Apply Changes'}
                type={ButtonType.primaryAlt}
                isSubmit
                disabled={isApplying}
                size={ButtonSize.small}
                icon='circle-checkmark'
              />
            )}
          </div>
        </div>
      </div>
    </Form>
  );
};

export default SyncResults;
