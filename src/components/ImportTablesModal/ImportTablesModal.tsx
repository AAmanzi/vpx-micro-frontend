import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import FileUpload from 'src/components/FileUpload';
import Modal from 'src/components/Modal';
import { FileSystemItem } from 'src/types/file';
import { Table } from 'src/types/table';

import Button, { Size as ButtonSize, Type as ButtonType } from '../Button';
import CheckboxSwitch from '../CheckboxSwitch';
import Form from '../Form';
import style from './ImportTablesModal.module.scss';
import TableEntry from './components/TableEntry';
import UnassignedRomEntry from './components/UnassignedRomEntry';

interface Props {
  onClose: () => void;
}

const ImportTablesModal: FunctionComponent<Props> = ({ onClose }) => {
  const [tablesToImport, setTablesToImport] = useState<Array<Table>>([]);
  const [unassignedRoms, setUnassignedRoms] = useState<Array<FileSystemItem>>(
    [],
  );
  const [deleteAfterImport, setDeleteAfterImport] = useState(false); // TODO: From config

  const handleFilesSelected = (files: Array<FileSystemItem>) => {
    const tableFiles = files.filter((file) => {
      return file.name.endsWith('.vpx');
    });
    const romFiles = files.filter((file) => {
      return file.name.endsWith('.zip');
    });

    const newTables = tableFiles.map((file) => ({
      id: '',
      name: file.name.replace('.vpx', '').trim(),
      vpxFile: file.name,
      isFavorite: false,
    }));

    setTablesToImport((prev) => [...prev, ...newTables]);
    setUnassignedRoms((prev) => [...prev, ...romFiles]);
  };

  const handleRemoveRomFile = (rom: FileSystemItem) => {};

  const handleRemoveTableFile = (table: Table) => {};

  const handleAssignRom = (table: Table, rom: FileSystemItem) => {};

  const handleRemoveRomFromTable = (table: Table) => {};

  const handleTableNameChange = (table: Table, newName: string) => {};

  const toggleDeleteAfterImport = () => {
    setDeleteAfterImport((prev) => !prev);
  };

  const handleSubmit = () => {
    // TODO: API
  };

  return (
    <Modal
      onExitClick={onClose}
      title='Import Tables & ROMs'
      description='Drag folders or individual .vpx and .zip files'>
      <Form submit={handleSubmit}>
        <div className={style.content}>
          <FileUpload
            label='Select Tables & ROMs'
            description='Drag and drop .vpx files, .zip ROMs, or folders here'
            acceptedExtensions={['.vpx', '.zip']}
            acceptFolders={true}
            onFilesSelected={handleFilesSelected}
          />
          {tablesToImport.length > 0 && (
            <div className={style.section}>
              <div className={style.sectionHeader}>
                <h4 className='secondary-text-color caption-big-semibold uppercase'>
                  Tables to import
                </h4>
                <span className='secondary-text-color caption-medium-regular'>
                  {tablesToImport.length} Detected
                </span>
              </div>
              <div className={style.tableFiles}>
                {tablesToImport.map((table) => (
                  <TableEntry
                    key={table.vpxFile}
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
                <h4 className='secondary-text-color caption-big-semibold uppercase'>
                  Unassigned ROMs
                </h4>
                <span className='secondary-text-color caption-medium-regular'>
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
                  'caption-small-semibold',
                  'uppercase',
                  style.metaLabel,
                )}>
                Detected
              </div>
              <div className='primary-text-color caption-medium-bold'>
                {tablesToImport.length} Tables
              </div>
            </div>
            <div className={style.deleteAfterImport}>
              <div>
                <div
                  className={classNames(
                    'secondary-text-color',
                    'caption-small-semibold',
                    'uppercase',
                  )}>
                  Source management
                </div>
                <div className='primary-text-color caption-medium-bold'>
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
