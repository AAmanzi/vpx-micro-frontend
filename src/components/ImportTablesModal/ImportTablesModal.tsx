import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import FileUpload from 'src/components/FileUpload';
import Icon from 'src/components/Icon';
import MacBackglassNotice from 'src/components/MacBackglassNotice';
import Modal from 'src/components/Modal';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { FileSystemItem, TableFile } from 'src/types/file';
import { mergeRoms, normalizePathForComparison } from 'src/utils';
import useAssignedRoms from 'src/utils/useAssignedRoms';

import Button, { Size as ButtonSize, Type as ButtonType } from '../Button';
import CheckboxSwitch from '../CheckboxSwitch';
import Form from '../Form';
import style from './ImportTablesModal.module.scss';
import TableEntry from './components/TableEntry';
import UnassignedRomEntry from './components/UnassignedRomEntry';
import { Props } from './types';
import {
  buildImportSelectionResult,
  filterExistingBackglassAssignments,
  filterExistingFiles,
  matchTableInis,
} from './utils';

const ImportTablesModal: FunctionComponent<Props> = ({
  onClose,
  initialFiles,
}) => {
  const { tables } = useTablesContext();
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast, showWarningToast, showSuccessToast } =
    useToastContext();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [tablesToImport, setTablesToImport] = useState<Array<TableFile>>([]);
  const [unassignedRoms, setUnassignedRoms] = useState<Array<FileSystemItem>>(
    [],
  );
  const [unassignedBackglasses, setUnassignedBackglasses] = useState<
    Array<FileSystemItem>
  >([]);
  const [unmatchedInis, setUnmatchedInis] = useState<Array<FileSystemItem>>([]);
  const [existingTableBackglasses, setExistingTableBackglasses] = useState<
    Array<{
      tableId: string;
      tableName: string;
      vpxFileName: string;
      backglass: FileSystemItem;
    }>
  >([]);
  const assignedRoms = useAssignedRoms();
  const manuallyImportedRoms = mergeRoms(
    unassignedRoms,
    tablesToImport
      .map((table) => table.rom)
      .filter(
        (rom): rom is FileSystemItem =>
          rom !== undefined &&
          !assignedRoms.some(
            (assignedRom) =>
              normalizePathForComparison(assignedRom.path) ===
              normalizePathForComparison(rom.path),
          ),
      ),
  );
  const assignedRomPaths = new Set(
    assignedRoms.map((rom) => normalizePathForComparison(rom.path)),
  );
  const libraryBackglasses = tables.flatMap((table) =>
    table.backglassFilePath && table.backglassFile
      ? [{ path: table.backglassFilePath, name: table.backglassFile }]
      : [],
  );
  const availableBackglasses = mergeRoms(
    unassignedBackglasses,
    tablesToImport
      .map((table) => table.backglass)
      .filter((backglass): backglass is FileSystemItem => Boolean(backglass)),
    existingTableBackglasses.map((item) => item.backglass),
  );

  const releaseRom = (
    rom: FileSystemItem | undefined,
    otherTables: Array<TableFile>,
  ) => {
    if (
      !rom ||
      assignedRomPaths.has(normalizePathForComparison(rom.path)) ||
      otherTables.some((item) => item.rom?.path === rom.path)
    ) {
      return;
    }

    setUnassignedRoms((prev) =>
      prev.some((item) => item.path === rom.path) ? prev : [...prev, rom],
    );
  };
  const [deleteAfterImport, setDeleteAfterImport] = useState(false);
  const initialFilesHandledRef = useRef(false);

  useEffect(() => {
    if (config) {
      setDeleteAfterImport(config.deleteFilesAfterImport);
    }
  }, [config]);

  const handleFilesSelected = async (files: Array<FileSystemItem>) => {
    setIsLoading(true);

    const filteredFiles = filterExistingFiles({ tables, files });
    const skippedExistingFilesCount = files.length - filteredFiles.length;

    if (skippedExistingFilesCount > 0) {
      showWarningToast(
        `${skippedExistingFilesCount} file${skippedExistingFilesCount === 1 ? '' : 's'} skipped because ${skippedExistingFilesCount === 1 ? 'it already exists' : 'they already exist'} in your library`,
      );
    }

    try {
      const result = await buildImportSelectionResult({
        currentTables: tablesToImport,
        currentUnassignedRoms: unassignedRoms,
        currentUnassignedBackglasses: unassignedBackglasses,
        currentExistingTableBackglasses: existingTableBackglasses,
        currentUnmatchedInis: unmatchedInis,
        incomingFiles: filteredFiles,
        libraryRoms: assignedRoms,
        existingTables: tables,
      });

      setTablesToImport(result.tablesToImport);
      setUnassignedRoms(result.unassignedRoms);
      setUnassignedBackglasses(result.unassignedBackglasses);
      setExistingTableBackglasses(result.existingTableBackglasses);
      setUnmatchedInis(result.unmatchedInis);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialFilesHandledRef.current) {
      return;
    }

    if (!initialFiles || initialFiles.length === 0) {
      return;
    }

    initialFilesHandledRef.current = true;
    handleFilesSelected(initialFiles);
  }, [initialFiles]);

  const handleRemoveRomFile = (rom: FileSystemItem) => {
    setUnassignedRoms((prev) => prev.filter((r) => r.path !== rom.path));
  };

  const handleRemoveBackglassFile = (backglass: FileSystemItem) => {
    setUnassignedBackglasses((prev) =>
      prev.filter(
        (item) =>
          normalizePathForComparison(item.path) !==
          normalizePathForComparison(backglass.path),
      ),
    );
  };

  const releaseBackglass = (
    backglass: FileSystemItem | undefined,
    otherTables: Array<TableFile>,
    otherExistingAssignments: typeof existingTableBackglasses,
  ) => {
    if (
      !backglass ||
      libraryBackglasses.some(
        (item) =>
          normalizePathForComparison(item.path) ===
          normalizePathForComparison(backglass.path),
      ) ||
      otherTables.some(
        (item) =>
          normalizePathForComparison(item.backglass?.path) ===
          normalizePathForComparison(backglass.path),
      ) ||
      otherExistingAssignments.some(
        (item) =>
          normalizePathForComparison(item.backglass.path) ===
          normalizePathForComparison(backglass.path),
      )
    ) {
      return;
    }

    setUnassignedBackglasses((prev) =>
      prev.some(
        (item) =>
          normalizePathForComparison(item.path) ===
          normalizePathForComparison(backglass.path),
      )
        ? prev
        : [...prev, backglass],
    );
  };

  const handleRemoveTableFile = (table: TableFile) => {
    const remainingTables = tablesToImport.filter(
      (item) => item.filePath !== table.filePath,
    );

    releaseRom(table.rom, remainingTables);
    releaseBackglass(
      table.backglass,
      remainingTables,
      existingTableBackglasses,
    );
    const result = matchTableInis(remainingTables, [
      ...unmatchedInis,
      ...tablesToImport.flatMap((item) => (item.ini ? [item.ini] : [])),
    ]);
    setTablesToImport(result.tablesToImport);
    setUnmatchedInis(result.unmatchedInis);
  };

  const handleAssignRom = (table: TableFile, rom: FileSystemItem) => {
    const otherTables = tablesToImport.filter(
      (item) => item.filePath !== table.filePath,
    );

    setTablesToImport((prev) =>
      prev.map((t) => (t.filePath === table.filePath ? { ...t, rom: rom } : t)),
    );
    setUnassignedRoms((prev) => prev.filter((item) => item.path !== rom.path));

    if (table.rom?.path !== rom.path) {
      releaseRom(table.rom, otherTables);
    }
  };

  const handleRemoveRomFromTable = (table: TableFile) => {
    releaseRom(
      table.rom,
      tablesToImport.filter((item) => item.filePath !== table.filePath),
    );

    setTablesToImport((prev) =>
      prev.map((t) =>
        t.filePath === table.filePath ? { ...t, rom: undefined } : t,
      ),
    );
  };

  const handleAssignBackglass = (
    table: TableFile,
    backglass: FileSystemItem,
  ) => {
    const otherTables = tablesToImport.filter(
      (item) => item.filePath !== table.filePath,
    );

    const nextTables = tablesToImport.map((item) =>
      item.filePath === table.filePath ? { ...item, backglass } : item,
    );
    setTablesToImport(nextTables);
    setExistingTableBackglasses((prev) =>
      filterExistingBackglassAssignments(nextTables, prev),
    );
    setUnassignedBackglasses((prev) =>
      prev.filter(
        (item) =>
          normalizePathForComparison(item.path) !==
          normalizePathForComparison(backglass.path),
      ),
    );

    if (
      normalizePathForComparison(table.backglass?.path) !==
      normalizePathForComparison(backglass.path)
    ) {
      releaseBackglass(table.backglass, otherTables, existingTableBackglasses);
    }
  };

  const handleRemoveBackglassFromTable = (table: TableFile) => {
    releaseBackglass(
      table.backglass,
      tablesToImport.filter((item) => item.filePath !== table.filePath),
      existingTableBackglasses,
    );
    setTablesToImport((prev) =>
      prev.map((item) =>
        item.filePath === table.filePath
          ? { ...item, backglass: undefined }
          : item,
      ),
    );
  };

  const handleRemoveExistingBackglassAssignment = (
    tableId: string,
    backglass: FileSystemItem,
  ) => {
    const remainingAssignments = existingTableBackglasses.filter(
      (item) => item.tableId !== tableId,
    );
    setExistingTableBackglasses(remainingAssignments);
    releaseBackglass(backglass, tablesToImport, remainingAssignments);
  };

  const handleTableNameChange = (table: TableFile, newName: string) => {
    setTablesToImport((prev) =>
      prev.map((t) =>
        t.filePath === table.filePath ? { ...t, name: newName } : t,
      ),
    );
  };

  const toggleDeleteAfterImport = () => {
    setDeleteAfterImport((prev) => !prev);
  };

  const handleValidate = () => {
    if (isLoading) {
      showWarningToast(
        'Please wait until the selected files finish processing',
      );
      return false;
    }

    if (tablesToImport.length === 0) {
      showErrorToast(
        'Import at least one VPX table to import or assign backglasses',
      );
      return false;
    }

    if (tablesToImport.some((table) => table.name.trim() === '')) {
      showErrorToast('Table names cannot be empty');

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current || !handleValidate()) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const { error: importTablesError, warning: importTablesWarning } =
        await api.importTables(
          tablesToImport,
          deleteAfterImport,
          existingTableBackglasses,
        );

      if (importTablesError) {
        showErrorToast(importTablesError.message || 'Failed to import tables');

        return;
      }

      if (importTablesWarning) {
        showWarningToast(
          importTablesWarning.message ||
            'Some tables failed to import because source files were missing',
        );
      }

      const { error: updateDeleteAfterImportError } =
        await api.updateDeleteFilesAfterImport(deleteAfterImport);

      if (updateDeleteAfterImportError) {
        showErrorToast(
          updateDeleteAfterImportError.message ||
            'Failed to update import setting',
        );

        return;
      }

      fetchConfig();

      if (!importTablesWarning) {
        showSuccessToast('Tables imported successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Failed to complete table import:', error);
      showErrorToast('Failed to complete table import');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      onExitClick={onClose}
      title='Import Tables, ROMs & Backglasses'
      description='Add at least one .vpx table. Matching INIs and DirectB2S files can be included.'
      color='blue'>
      <Form submit={handleSubmit} validate={handleValidate}>
        <div className={style.content}>
          <FileUpload
            label='Select Tables, ROMs & Backglasses'
            description='Drag and drop .vpx files, .zip ROMs, .directb2s files, .ini files, or folders here'
            acceptedExtensions={['.vpx', '.zip', '.directb2s', '.ini']}
            acceptFolders
            onFilesSelected={handleFilesSelected}
            loading={isLoading}
          />
          {availableBackglasses.length > 0 && (
            <MacBackglassNotice className={style.section} />
          )}
          {tablesToImport.length > 0 && (
            <div className={style.section}>
              <div className={style.sectionHeader}>
                <h4 className='secondary-text-color body-md-semibold uppercase'>
                  Tables to import
                </h4>
                <span className='secondary-text-color body-sm-regular'>
                  {tablesToImport.length} Detected
                </span>
              </div>
              <div className={style.tableFiles}>
                {tablesToImport.map((table) => (
                  <TableEntry
                    key={table.filePath}
                    table={table}
                    manuallyImportedRoms={manuallyImportedRoms}
                    libraryRoms={assignedRoms}
                    availableBackglasses={availableBackglasses}
                    libraryBackglasses={libraryBackglasses}
                    onAssignRom={handleAssignRom}
                    onAssignBackglass={handleAssignBackglass}
                    onRemoveTable={handleRemoveTableFile}
                    onRemoveRom={handleRemoveRomFromTable}
                    onRemoveBackglass={handleRemoveBackglassFromTable}
                    onTableNameChange={handleTableNameChange}
                  />
                ))}
              </div>
            </div>
          )}
          {existingTableBackglasses.length > 0 && (
            <div className={style.section}>
              <div className={style.sectionHeader}>
                <h4 className='secondary-text-color body-md-semibold uppercase'>
                  Backglasses matched to library tables
                </h4>
                <span className='secondary-text-color body-sm-regular'>
                  {existingTableBackglasses.length} Matched
                </span>
              </div>
              <div className={style.unassignedRomFiles}>
                {existingTableBackglasses.map((item) => (
                  <div className={style.unmatchedBackglass} key={item.tableId}>
                    <div className={style.backglassMatchDetails}>
                      <div className='primary-text-color body-sm-semibold'>
                        {item.tableName}
                      </div>
                      <div className='secondary-text-color body-xs-regular'>
                        {item.backglass.name} to {item.vpxFileName}
                      </div>
                    </div>
                    <button
                      type='button'
                      className={style.removeBackglassMatch}
                      aria-label={`Remove backglass match for ${item.tableName}`}
                      onClick={() =>
                        handleRemoveExistingBackglassAssignment(
                          item.tableId,
                          item.backglass,
                        )
                      }>
                      <Icon
                        className='secondary-text-color'
                        icon='cross'
                        width={14}
                        height={14}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {unassignedRoms.length > 0 && (
            <div className={style.section}>
              <div className={style.sectionHeader}>
                <h4 className='secondary-text-color body-md-semibold uppercase'>
                  Unassigned ROMs
                </h4>
                <span className='secondary-text-color body-sm-regular'>
                  {unassignedRoms.length} Files
                </span>
              </div>
              <div className={style.unassignedRomFiles}>
                {unassignedRoms.map((rom) => (
                  <UnassignedRomEntry
                    key={rom.path}
                    rom={rom}
                    onRemove={handleRemoveRomFile}
                  />
                ))}
              </div>
            </div>
          )}
          {unassignedBackglasses.length > 0 && (
            <div className={style.section}>
              <div className={style.sectionHeader}>
                <h4 className='secondary-text-color body-md-semibold uppercase'>
                  Unmatched Backglasses
                </h4>
                <span className='secondary-text-color body-sm-regular'>
                  {unassignedBackglasses.length} Files
                </span>
              </div>
              <div className={style.unassignedRomFiles}>
                {unassignedBackglasses.map((backglass) => (
                  <UnassignedRomEntry
                    key={backglass.path}
                    rom={backglass}
                    icon='wallpaper'
                    onRemove={handleRemoveBackglassFile}
                  />
                ))}
              </div>
            </div>
          )}
          {unmatchedInis.length > 0 && (
            <div className={style.section}>
              <div className={style.sectionHeader}>
                <h4 className='secondary-text-color body-md-semibold uppercase'>
                  Unmatched INIs
                </h4>
                <span className='secondary-text-color body-sm-regular'>
                  {unmatchedInis.length} Files
                </span>
              </div>
              <p className='secondary-text-color body-sm-regular'>
                No unique table match was found. These files will not be
                imported or deleted.
              </p>
              <div className={style.unassignedRomFiles}>
                {unmatchedInis.map((ini) => (
                  <div key={ini.path} title={ini.path}>
                    <span className='primary-text-color body-sm-regular'>
                      {ini.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={style.footer}>
          <div className={style.metaAndOptions}>
            <div>
              <div
                className={classNames(
                  'secondary-text-color',
                  'body-xs-semibold',
                  'uppercase',
                  style.metaLabel,
                )}>
                Detected
              </div>
              <div className='primary-text-color body-sm-bold'>
                {tablesToImport.length} Tables
              </div>
            </div>
            <div className={style.deleteAfterImport}>
              <div>
                <div
                  className={classNames(
                    'secondary-text-color',
                    'body-xs-semibold',
                    'uppercase',
                  )}>
                  Source management
                </div>
                <div className='primary-text-color body-sm-bold'>
                  Delete original files after import
                </div>
              </div>
              <CheckboxSwitch
                checked={deleteAfterImport}
                onChange={toggleDeleteAfterImport}
              />
            </div>
          </div>
          <div className={style.actions}>
            <Button
              label='Cancel'
              onClick={onClose}
              type={ButtonType.transparent}
              size={ButtonSize.small}
            />
            <Button
              label='Import Tables'
              isSubmit
              size={ButtonSize.small}
              disabled={isLoading}
              loading={isSubmitting}
            />
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ImportTablesModal;
