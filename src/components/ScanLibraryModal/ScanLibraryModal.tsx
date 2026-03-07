import classNames from 'classnames';
import { FunctionComponent, useEffect, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Icon from 'src/components/Icon';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import Spinner from 'src/components/Spinner';
import { api } from 'src/consts';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { ScanResult } from 'src/types/table';

import style from './ScanLibraryModal.module.scss';
import Collapsible from './components/Collapsible';
import MissingFilesSection from './components/MissingFilesSection';
import NewTablesSection from './components/NewTablesSection';
import UnmatchedRomsSection from './components/UnmatchedRomsSection';

interface Props {
  close: () => void;
}

const ScanLibraryModal: FunctionComponent<Props> = ({ close }) => {
  const { fetchTables } = useTablesContext();
  const { showErrorToast, showSuccessToast } = useToastContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);

  const [isNewTablesOpen, setIsNewTablesOpen] = useState(false);
  const [isUnmatchedRomsOpen, setIsUnmatchedRomsOpen] = useState(false);
  const [isMissingFilesOpen, setIsMissingFilesOpen] = useState(false);

  const [newTables, setNewTables] = useState<ScanResult['newTables']>([]);
  const [unmatchedRoms, setUnmatchedRoms] = useState<
    ScanResult['unmatchedRoms']
  >([]);
  const [tablesWithMissingFiles, setTablesWithMissingFiles] = useState<
    ScanResult['tablesWithMissingFiles']
  >([]);

  const [includedNewTablesByPath, setIncludedNewTablesByPath] = useState<
    Record<string, boolean>
  >({});
  const [includedUnmatchedRomsByPath, setIncludedUnmatchedRomsByPath] =
    useState<Record<string, boolean>>({});
  const [includedMissingFilesByTableId, setIncludedMissingFilesByTableId] =
    useState<Record<string, boolean>>({});

  const modalTitle = isLoading ? 'Scanning VPX Library' : 'Scan Results';
  const modalDescription = isLoading
    ? 'Comparing database with disk files...'
    : 'Review the results of the scan and apply changes to your library.';

  const isLibraryInSync =
    !isLoading &&
    !scanErrorMessage &&
    scanResult &&
    newTables.length === 0 &&
    unmatchedRoms.length === 0 &&
    tablesWithMissingFiles.length === 0;

  const selectedNewTablesCount = newTables.filter(
    (table) => includedNewTablesByPath[table.filePath] ?? true,
  ).length;
  const selectedUnmatchedRomsCount = unmatchedRoms.filter(
    (rom) => includedUnmatchedRomsByPath[rom.path] ?? false,
  ).length;
  const selectedTablesToRemoveCount = tablesWithMissingFiles.filter(
    (item) =>
      (includedMissingFilesByTableId[item.table.id] ?? true) &&
      item.missingVpxFile,
  ).length;
  const selectedRomLinksToClearCount = tablesWithMissingFiles.filter(
    (item) =>
      (includedMissingFilesByTableId[item.table.id] ?? true) &&
      !item.missingVpxFile &&
      item.missingRomFile,
  ).length;

  const handleScanLibrary = () => {
    setIsLoading(true);
    setScanErrorMessage(null);
    setScanResult(null);

    setIsNewTablesOpen(false);
    setIsUnmatchedRomsOpen(false);
    setIsMissingFilesOpen(false);

    setNewTables([]);
    setUnmatchedRoms([]);
    setTablesWithMissingFiles([]);

    setIncludedNewTablesByPath({});
    setIncludedUnmatchedRomsByPath({});
    setIncludedMissingFilesByTableId({});

    api.scanVpxLibrary().then((result) => {
      if (result.success) {
        setScanResult(result.data);

        setNewTables(result.data.newTables);
        setUnmatchedRoms(result.data.unmatchedRoms);
        setTablesWithMissingFiles(result.data.tablesWithMissingFiles);

        setIncludedNewTablesByPath(
          result.data.newTables.reduce<Record<string, boolean>>(
            (acc, table) => ({
              ...acc,
              [table.filePath]: true,
            }),
            {},
          ),
        );

        setIncludedUnmatchedRomsByPath(
          result.data.unmatchedRoms.reduce<Record<string, boolean>>(
            (acc, rom) => ({
              ...acc,
              [rom.path]: false,
            }),
            {},
          ),
        );

        setIncludedMissingFilesByTableId(
          result.data.tablesWithMissingFiles.reduce<Record<string, boolean>>(
            (acc, item) => ({
              ...acc,
              [item.table.id]: true,
            }),
            {},
          ),
        );
      } else {
        setScanErrorMessage(result.error.message || 'Scan failed');
        showErrorToast(result.error.message || 'Failed to scan VPX library');
      }

      setIsLoading(false);
    });
  };

  useEffect(() => {
    handleScanLibrary();
  }, []);

  const toggleNewTableInclude = (filePath: string) => {
    setIncludedNewTablesByPath((prev) => ({
      ...prev,
      [filePath]: !(prev[filePath] ?? true),
    }));
  };

  const toggleUnmatchedRomInclude = (romPath: string) => {
    setIncludedUnmatchedRomsByPath((prev) => ({
      ...prev,
      [romPath]: !(prev[romPath] ?? false),
    }));
  };

  const toggleMissingFileInclude = (tableId: string) => {
    setIncludedMissingFilesByTableId((prev) => ({
      ...prev,
      [tableId]: !(prev[tableId] ?? true),
    }));
  };

  const selectAllNewTables = () => {
    setIncludedNewTablesByPath(
      newTables.reduce<Record<string, boolean>>(
        (acc, table) => ({
          ...acc,
          [table.filePath]: true,
        }),
        {},
      ),
    );
  };

  const deselectAllNewTables = () => {
    setIncludedNewTablesByPath(
      newTables.reduce<Record<string, boolean>>(
        (acc, table) => ({
          ...acc,
          [table.filePath]: false,
        }),
        {},
      ),
    );
  };

  const selectAllUnmatchedRoms = () => {
    setIncludedUnmatchedRomsByPath(
      unmatchedRoms.reduce<Record<string, boolean>>(
        (acc, rom) => ({
          ...acc,
          [rom.path]: true,
        }),
        {},
      ),
    );
  };

  const deselectAllUnmatchedRoms = () => {
    setIncludedUnmatchedRomsByPath(
      unmatchedRoms.reduce<Record<string, boolean>>(
        (acc, rom) => ({
          ...acc,
          [rom.path]: false,
        }),
        {},
      ),
    );
  };

  const selectAllMissingFiles = () => {
    setIncludedMissingFilesByTableId(
      tablesWithMissingFiles.reduce<Record<string, boolean>>(
        (acc, item) => ({
          ...acc,
          [item.table.id]: true,
        }),
        {},
      ),
    );
  };

  const deselectAllMissingFiles = () => {
    setIncludedMissingFilesByTableId(
      tablesWithMissingFiles.reduce<Record<string, boolean>>(
        (acc, item) => ({
          ...acc,
          [item.table.id]: false,
        }),
        {},
      ),
    );
  };

  const handleTableNameChange = (filePath: string, value: string) => {
    setNewTables((prev) =>
      prev.map((table) =>
        table.filePath === filePath ? { ...table, name: value } : table,
      ),
    );
  };

  const handleTableRomChange = (filePath: string, romPath: string) => {
    const selectedRom = unmatchedRoms.find((rom) => rom.path === romPath);
    const previouslyAssignedRom =
      newTables.find((table) => table.filePath === filePath)?.rom ?? undefined;

    setNewTables((prev) =>
      prev.map((table) =>
        table.filePath === filePath
          ? {
              ...table,
              rom: selectedRom ?? undefined,
            }
          : table,
      ),
    );

    setUnmatchedRoms((prevRoms) => {
      let nextRoms = prevRoms;

      if (selectedRom) {
        nextRoms = nextRoms.filter((rom) => rom.path !== selectedRom.path);
      }

      if (
        previouslyAssignedRom &&
        previouslyAssignedRom.path !== selectedRom?.path &&
        !nextRoms.some((rom) => rom.path === previouslyAssignedRom.path)
      ) {
        nextRoms = [...nextRoms, previouslyAssignedRom];
      }

      return nextRoms;
    });
  };

  const handleApply = async () => {
    if (isApplying) {
      return;
    }

    setIsApplying(true);

    const payload: ScanResult = {
      newTables: newTables.filter(
        (table) => includedNewTablesByPath[table.filePath] ?? true,
      ),
      unmatchedRoms: unmatchedRoms.filter(
        (rom) => includedUnmatchedRomsByPath[rom.path] ?? false,
      ),
      tablesWithMissingFiles: tablesWithMissingFiles.filter(
        (item) => includedMissingFilesByTableId[item.table.id] ?? true,
      ),
    };

    const result = await api.applyScanResult(payload);

    setIsApplying(false);

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to apply scan changes');
      return;
    }

    fetchTables();
    showSuccessToast('Scan changes applied');
    close();
  };

  return (
    <Modal
      title={modalTitle}
      description={modalDescription}
      onExitClick={close}
      size={ModalSize.large}
      headerClassName={style.header}>
      <div className={style.content}>
        {!isLoading && scanErrorMessage && (
          <div className={style.errorWrapper}>
            <p className='accent-error-text-color caption-medium-regular'>
              {scanErrorMessage}
            </p>
          </div>
        )}

        {!isLoading && scanResult && !scanErrorMessage && (
          <div className={style.resultsWrapper}>
            {isLibraryInSync && (
              <div className={style.emptyStateWrapper}>
                <Icon
                  className={style.shieldIcon}
                  icon='shield-checkmark'
                  width={36}
                  height={36}
                />
                <p className='primary-text-color caption-big-semibold'>
                  Library is in sync
                </p>
                <p className='secondary-text-color caption-medium-regular'>
                  Database and files are already aligned. No changes to apply.
                </p>
              </div>
            )}

            {newTables.length > 0 && (
              <Collapsible
                title='New Tables Found'
                description='These Tables will be added to your library when you apply changes.'
                icon='plus'
                color='blue'
                count={newTables.length}
                isOpen={isNewTablesOpen}
                onToggle={() => setIsNewTablesOpen((prev) => !prev)}>
                <NewTablesSection
                  tables={newTables}
                  availableRoms={unmatchedRoms}
                  includedByPath={includedNewTablesByPath}
                  onToggleInclude={toggleNewTableInclude}
                  onSelectAll={selectAllNewTables}
                  onDeselectAll={deselectAllNewTables}
                  onNameChange={handleTableNameChange}
                  onRomChange={handleTableRomChange}
                />
              </Collapsible>
            )}

            {unmatchedRoms.length > 0 && (
              <Collapsible
                title='Unmatched ROMs'
                description='These ROM files will be deleted when you apply changes.'
                icon='triangle-alert'
                color='yellow'
                count={unmatchedRoms.length}
                isOpen={isUnmatchedRomsOpen}
                onToggle={() => setIsUnmatchedRomsOpen((prev) => !prev)}>
                <UnmatchedRomsSection
                  roms={unmatchedRoms}
                  includedByPath={includedUnmatchedRomsByPath}
                  onToggleInclude={toggleUnmatchedRomInclude}
                  onSelectAll={selectAllUnmatchedRoms}
                  onDeselectAll={deselectAllUnmatchedRoms}
                />
              </Collapsible>
            )}

            {tablesWithMissingFiles.length > 0 && (
              <Collapsible
                title='Tables With Missing Files'
                description='These Tables will be adjusted accordingly or deleted from your library when you apply changes.'
                icon='circle-alert'
                color='red'
                count={tablesWithMissingFiles.length}
                isOpen={isMissingFilesOpen}
                onToggle={() => setIsMissingFilesOpen((prev) => !prev)}>
                <MissingFilesSection
                  items={tablesWithMissingFiles}
                  includedByTableId={includedMissingFilesByTableId}
                  onToggleInclude={toggleMissingFileInclude}
                  onSelectAll={selectAllMissingFiles}
                  onDeselectAll={deselectAllMissingFiles}
                />
              </Collapsible>
            )}

            {!isLibraryInSync && (
              <p
                className={classNames(
                  'secondary-text-color',
                  'caption-small-regular',
                  style.footerMeta,
                )}>
                {selectedNewTablesCount} Tables to import •{' '}
                {selectedUnmatchedRomsCount} ROM files to delete •{' '}
                {selectedTablesToRemoveCount} Tables to remove •{' '}
                {selectedRomLinksToClearCount} ROM links to clear
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
                  onClick={handleScanLibrary}
                  disabled={isApplying || isLoading}
                  icon='scan-search'
                />
                {!isLibraryInSync && (
                  <Button
                    label={isApplying ? 'Applying...' : 'Apply Changes'}
                    type={ButtonType.primaryAlt}
                    onClick={handleApply}
                    disabled={isApplying}
                    size={ButtonSize.small}
                    icon='circle-checkmark'
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className={style.loadingWrapper}>
            <Spinner />
            <p
              className={classNames(
                'primary-text-color',
                'title-h4-bold',
                style.loadingTitle,
              )}>
              Scanning VPX library
            </p>
            <p className='secondary-text-color caption-medium-regular'>
              Analyzing tables and ROMs...
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ScanLibraryModal;
