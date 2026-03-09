import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import FolderPicker from 'src/components/FolderPicker';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import Modal from 'src/components/Modal';
import { useConfigContext } from 'src/providers/config';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { getTableGradientVariant } from 'src/utils';

import style from './ExportTablesModal.module.scss';

interface Props {
  close: () => void;
}

const ExportTablesModal: FunctionComponent<Props> = ({ close }) => {
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToastContext();
  const { tables } = useTablesContext();
  const { config } = useConfigContext();

  const [exportPath, setExportPath] = useState(
    `${config?.vpxRootPath}/export` || '',
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);

  const numberOfTables = tables.length;

  const handleExport = async () => {
    if (!exportPath) {
      showErrorToast('Please select a destination path for the export.');
      return;
    }

    setIsExporting(true);

    const result = await window.api.exportTables(exportPath);

    setIsExporting(false);

    if (result.success) {
      setIsExportComplete(true);

      if (result.warning) {
        showWarningToast(
          result.warning.message || 'Some tables failed to export',
        );
      } else {
        showSuccessToast('Tables exported successfully!');
      }
    } else {
      showErrorToast(
        `Failed to export tables: ${result.error.message || 'Unknown error'}`,
      );
    }
  };

  const handleOpenExportPath = async () => {
    if (!exportPath) {
      showErrorToast('Export path is missing.');
      return;
    }

    const result = await window.api.openPath(exportPath);

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to open export location');
    }
  };

  return (
    <Modal
      title='Export Tables'
      description='Create backup bundles with tables and ROMs'
      onExitClick={close}
      color='blue'>
      <div className={style.content}>
        <div className={style.inputWrapper}>
          <Input
            label='Export Directory'
            value={exportPath}
            onChange={setExportPath}
            placeholder='e.g. C:/vpx-tables-export'
          />
          <FolderPicker
            onSelect={setExportPath}
            onError={showErrorToast}
            label='Browse'
          />
        </div>
        <p
          className={classNames(
            'secondary-text-color',
            'body-xs-regular',
            style.note,
          )}>
          Each table will be exported with its VPX file and ROM to a dedicated
          folder
        </p>
        <div className={style.summary}>
          <div className={style.iconWrapper}>
            <Icon icon='circle-checkmark' width={20} height={20} />
          </div>
          <div>
            <h3 className='primary-text-color body-sm-semibold'>
              Export Summary
            </h3>
            <p className='secondary-text-color body-xs-regular'>
              • {numberOfTables} Table{numberOfTables !== 1 ? 's' : ''} will be
              exported
            </p>
            <p className='secondary-text-color body-xs-regular'>
              • Each table + ROM will be in its own folder
            </p>
            <p className='secondary-text-color body-xs-regular'>
              • Original files will remain in your library
            </p>
          </div>
        </div>
        <p className='secondary-text-color body-sm-bold uppercase'>
          Tables to Export [{numberOfTables}]
        </p>
        <div className={style.tablesList}>
          {tables.map((table) => (
            <div key={table.id} className={style.tableItem}>
              <div
                className={classNames(
                  style.tableIcon,
                  getTableGradientVariant(table),
                )}
              />
              <div>
                <p className='primary-text-color body-sm-semibold'>
                  {table.name}
                </p>
                <p className='secondary-text-color body-xs-regular'>
                  {table.vpxFile} {table.romFile ? `• ${table.romFile}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={style.footer}>
        {isExportComplete ? (
          <>
            <Button
              size={ButtonSize.small}
              type={ButtonType.transparent}
              label='Done'
              onClick={close}
            />
            <Button
              icon='folder'
              size={ButtonSize.small}
              label='Open Export Folder'
              onClick={handleOpenExportPath}
            />
          </>
        ) : (
          <>
            <Button
              size={ButtonSize.small}
              type={ButtonType.transparent}
              label='Cancel'
              onClick={close}
            />
            <Button
              icon='folder-export'
              size={ButtonSize.small}
              disabled={numberOfTables === 0 || isExporting}
              label={`Export ${numberOfTables} Table${numberOfTables !== 1 ? 's' : ''}`}
              onClick={handleExport}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default ExportTablesModal;
