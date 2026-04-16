import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import FilePicker, { Size as FilePickerSize } from 'src/components/FilePicker';
import Form from 'src/components/Form';
import Input from 'src/components/Input';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import api from 'src/consts';
import { VPX_DEFAULT_EXECUTABLE } from 'src/consts/vpx';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './EditTableExecutableModal.module.scss';

interface Props {
  id: string;
  currentExecutablePath?: string;
  close: () => void;
}

const EditTableExecutableModal: FunctionComponent<Props> = ({
  id,
  currentExecutablePath,
  close,
}) => {
  const { config } = useConfigContext();
  const { showErrorToast, showSuccessToast } = useToastContext();
  const [executablePath, setExecutablePath] = useState(
    currentExecutablePath || '',
  );
  const [isSaving, setIsSaving] = useState(false);

  const getExecutableName = (pathValue: string): string =>
    pathValue.split(/[/\\]/).pop() || pathValue;

  const getCurrentExecutable = () => {
    if (currentExecutablePath) {
      return getExecutableName(currentExecutablePath);
    }

    if (config?.vpxExecutablePath) {
      return getExecutableName(config.vpxExecutablePath);
    }

    return VPX_DEFAULT_EXECUTABLE;
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await api.updateTableVpxExecutablePath(
      id,
      executablePath.trim() || null,
    );

    setIsSaving(false);

    if (!result.success) {
      showErrorToast(
        result.error.message || 'Failed to update table executable',
      );
      return;
    }

    showSuccessToast('Table executable updated successfully');
    close();
  };

  return (
    <Modal
      title='Edit VPX Executable'
      description='Set a custom VPX executable path for this table. Leave empty to use the default executable.'
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.medium}
      color='green'>
      <Form submit={handleSave}>
        <div className={style.content}>
          <div className={style.currentExecutable}>
            <div
              className={classNames(
                'secondary-text-color',
                'body-xs-semibold',
                'uppercase',
                style.metaLabel,
              )}>
              Current executable
            </div>
            <p className='primary-text-color body-sm-regular'>
              {getCurrentExecutable()}
            </p>
          </div>
          <div className={style.inputWrapper}>
            <Input
              label='Executable path'
              value={executablePath}
              onChange={setExecutablePath}
              placeholder='e.g. C:/Visual Pinball/VPinballX64.exe'
            />
            <FilePicker
              acceptedExtensions={['.exe']}
              onSelect={setExecutablePath}
              onError={showErrorToast}
              size={FilePickerSize.medium}
              label='Browse'
            />
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
            size={ButtonSize.small}
            label='Save'
            isSubmit
            disabled={isSaving}
            type={ButtonType.success}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default EditTableExecutableModal;
