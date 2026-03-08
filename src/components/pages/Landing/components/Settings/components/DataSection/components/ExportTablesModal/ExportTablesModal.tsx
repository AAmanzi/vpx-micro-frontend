import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
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

  const numberOfTables = tables.length;

  const handleExport = async () => {
    if (!exportPath) {
      showErrorToast('Please select a destination path for the export.');
      return;
    }

    const result = await window.api.exportTables(exportPath);

    if (result.success) {
      if (result.warning) {
        showWarningToast(result.warning.message || 'Some tables failed to export');
      } else {
        showSuccessToast('Tables exported successfully!');
      }
      // TODO: offer to open the export folder
      close();
    } else {
      showErrorToast(
        `Failed to export tables: ${result.error.message || 'Unknown error'}`,
      );
    }
  };

  return (
    <Modal
      title='Export Tables'
      description='Create backup bundles with tables and ROMs'
      onExitClick={close}
      color='blue'>
      <div className={style.content}>
        {/* TODO: folder picker */}
        <Input
          label='Export Directory'
          value={exportPath}
          onChange={setExportPath}
          placeholder='e.g. C:/vpx-tables-export'
        />
        <p
          className={classNames(
            'secondary-text-color',
            'caption-small-regular',
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
            <h3 className='primary-text-color caption-medium-semibold'>
              Export Summary
            </h3>
            <p className='secondary-text-color caption-small-regular'>
              • {numberOfTables} Table{numberOfTables !== 1 ? 's' : ''} will be
              exported
            </p>
            <p className='secondary-text-color caption-small-regular'>
              • Each table + ROM will be in its own folder
            </p>
            <p className='secondary-text-color caption-small-regular'>
              • Original files will remain in your library
            </p>
          </div>
        </div>
        <p className='secondary-text-color caption-medium-bold uppercase'>
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
                <p className='primary-text-color caption-medium-semibold'>
                  {table.name}
                </p>
                <p className='secondary-text-color caption-small-regular'>
                  {table.vpxFile} {table.romFile ? `• ${table.romFile}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={style.footer}>
        <Button
          size={ButtonSize.small}
          type={ButtonType.transparent}
          label='Cancel'
          onClick={close}
        />
        <Button
          icon='folder-export'
          size={ButtonSize.small}
          label={`Export ${numberOfTables} Table${numberOfTables !== 1 ? 's' : ''}`}
          onClick={handleExport}
        />
      </div>
    </Modal>
  );
};

export default ExportTablesModal;
