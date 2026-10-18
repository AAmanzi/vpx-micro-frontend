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
import Select from 'src/components/Select';
import api from 'src/consts';
import {
  VPX_DEFAULT_EXECUTABLE,
  VPX_DEFAULT_LAUNCH_FLAGS,
} from 'src/consts/vpx';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';
import { LaunchFlags } from 'src/types/config';

import style from './EditTableExecutableModal.module.scss';

interface Props {
  id: string;
  currentExecutablePath?: string;
  currentLaunchFlags?: Partial<LaunchFlags>;
  close: () => void;
}

const EditTableExecutableModal: FunctionComponent<Props> = ({
  id,
  currentExecutablePath,
  currentLaunchFlags,
  close,
}) => {
  const { config, platform } = useConfigContext();
  const { showErrorToast, showSuccessToast } = useToastContext();
  const [executablePath, setExecutablePath] = useState(
    currentExecutablePath || '',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [launchFlags, setLaunchFlags] = useState<Partial<LaunchFlags>>(
    currentLaunchFlags || {},
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    Boolean(currentLaunchFlags && Object.keys(currentLaunchFlags).length),
  );

  const globalFlags: LaunchFlags = {
    ...VPX_DEFAULT_LAUNCH_FLAGS,
    ...config?.launchFlags,
  };

  const flagOptions: Array<{
    key: keyof LaunchFlags;
    label: string;
    hint: string;
  }> = [
    {
      key: 'lessCpuThreads',
      label: 'Limit CPU threads (-LessCPUthreads)',
      hint: '',
    },
    {
      key: 'extMinimized',
      label: 'Legacy pause menu (-ExtMinimized)',
      hint: 'Needed for VPX 10.8.0 and earlier. Causes a launch error on 10.8.1+.',
    },
  ];

  const setFlag = (key: keyof LaunchFlags, value: string) => {
    setLaunchFlags((current) => {
      const next = { ...current };

      if (value === 'default') {
        delete next[key];
      } else {
        next[key] = value === 'on';
      }

      return next;
    });
  };

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

    const flagsResult = result.success
      ? await api.updateTableLaunchFlags(id, launchFlags)
      : result;

    setIsSaving(false);

    if (!flagsResult.success) {
      showErrorToast(
        flagsResult.error.message || 'Failed to update table launch settings',
      );
      return;
    }

    showSuccessToast('Table launch settings updated successfully');
    close();
  };

  return (
    <Modal
      title='Edit Launch Settings'
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
          {platform === 'win32' && (
            <div className={style.advanced}>
              <button
                type='button'
                className={style.advancedToggle}
                aria-expanded={isAdvancedOpen}
                onClick={() => setIsAdvancedOpen((open) => !open)}>
                <span className='primary-text-color body-sm-semibold'>
                  Launch flags (advanced)
                </span>
                <span className='secondary-text-color body-xs-regular'>
                  {isAdvancedOpen ? 'Hide' : 'Show'}
                </span>
              </button>
              {isAdvancedOpen && (
                <div className={style.advancedContent}>
                  <p className='secondary-text-color body-xs-regular'>
                    Advanced: leave on "Use default" unless this table needs
                    different behavior.
                  </p>
                  {flagOptions.map(({ key, label, hint }) => (
                    <div key={key} className={style.flagRow}>
                      <div>
                        <p className='primary-text-color body-sm-semibold'>
                          {label}
                        </p>
                        {hint && (
                          <p className='secondary-text-color body-xs-regular'>
                            {hint}
                          </p>
                        )}
                      </div>
                      <Select
                        ariaLabel={label}
                        value={
                          launchFlags[key] === undefined
                            ? 'default'
                            : launchFlags[key]
                              ? 'on'
                              : 'off'
                        }
                        onChange={(value) => setFlag(key, value)}
                        options={[
                          {
                            value: 'default',
                            label: `Use default (${globalFlags[key] ? 'on' : 'off'})`,
                          },
                          { value: 'on', label: 'On' },
                          { value: 'off', label: 'Off' },
                        ]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
