import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import FileUpload from 'src/components/FileUpload';
import Modal from 'src/components/Modal';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { FileSystemItem, TableFile } from 'src/types/file';

import Button, { Size as ButtonSize, Type as ButtonType } from '../Button';
import CheckboxSwitch from '../CheckboxSwitch';
import Form from '../Form';
import style from './ImportTablesModal.module.scss';
import TableEntry from './components/TableEntry';
import UnassignedRomEntry from './components/UnassignedRomEntry';
import { Props } from './types';
import { buildImportSelectionResult, filterExistingFiles } from './utils';

const ImportTablesModal: FunctionComponent<Props> = ({
  onClose,
  initialFiles,
}) => {
  const { tables } = useTablesContext();
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast, showWarningToast, showSuccessToast } =
    useToastContext();

  const [isLoading, setIsLoading] = useState(false);
  const [tablesToImport, setTablesToImport] = useState<Array<TableFile>>([]);
  const [unassignedRoms, setUnassignedRoms] = useState<Array<FileSystemItem>>(
    [],
  );
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
        incomingFiles: filteredFiles,
      });

      setTablesToImport(result.tablesToImport);
      setUnassignedRoms(result.unassignedRoms);
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

  const handleRemoveTableFile = (table: TableFile) => {
    if (table.rom) {
      setUnassignedRoms((prev) => [...prev, table.rom!]);
    }

    setTablesToImport((prev) =>
      prev.filter((t) => t.filePath !== table.filePath),
    );
  };

  const handleAssignRom = (table: TableFile, rom: FileSystemItem) => {
    setTablesToImport((prev) =>
      prev.map((t) => (t.filePath === table.filePath ? { ...t, rom: rom } : t)),
    );
    setUnassignedRoms((prev) => prev.filter((r) => r.path !== rom.path));
  };

  const handleRemoveRomFromTable = (table: TableFile) => {
    setUnassignedRoms((prev) => [...prev, table.rom!]);
    setTablesToImport((prev) =>
      prev.map((t) =>
        t.filePath === table.filePath ? { ...t, rom: undefined } : t,
      ),
    );
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
    if (tablesToImport.length === 0) {
      showErrorToast('Please select at least one table to import');

      return false;
    }

    if (tablesToImport.some((table) => table.name.trim() === '')) {
      showErrorToast('Table names cannot be empty');

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const { error: importTablesError, warning: importTablesWarning } =
      await api.importTables(tablesToImport, deleteAfterImport);

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
  };

  return (
    <Modal
      onExitClick={onClose}
      title='Import Tables & ROMs'
      description='Drag folders or individual .vpx and .zip files'
      color='blue'>
      <Form submit={handleSubmit} validate={handleValidate}>
        <div className={style.content}>
          <FileUpload
            label='Select Tables & ROMs'
            description='Drag and drop .vpx files, .zip ROMs, or folders here'
            acceptedExtensions={['.vpx', '.zip']}
            acceptFolders
            onFilesSelected={handleFilesSelected}
            loading={isLoading}
          />
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
                    unassignedRoms={unassignedRoms}
                    onAssignRom={handleAssignRom}
                    onRemoveTable={handleRemoveTableFile}
                    onRemoveRom={handleRemoveRomFromTable}
                    onTableNameChange={handleTableNameChange}
                  />
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
            <Button label='Import Tables' isSubmit size={ButtonSize.small} />
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default ImportTablesModal;
