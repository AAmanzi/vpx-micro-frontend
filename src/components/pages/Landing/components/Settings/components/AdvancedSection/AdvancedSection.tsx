import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import CheckboxSwitch from 'src/components/CheckboxSwitch';
import api from 'src/consts';
import { VPX_DEFAULT_LAUNCH_FLAGS } from 'src/consts/vpx';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';
import { LaunchFlags } from 'src/types/config';

import style from './AdvancedSection.module.scss';

const AdvancedSection: FunctionComponent = () => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();
  const [isOpen, setIsOpen] = useState(false);

  const launchFlags: LaunchFlags = {
    ...VPX_DEFAULT_LAUNCH_FLAGS,
    ...config?.launchFlags,
  };

  const isDefault =
    launchFlags.lessCpuThreads === VPX_DEFAULT_LAUNCH_FLAGS.lessCpuThreads &&
    launchFlags.extMinimized === VPX_DEFAULT_LAUNCH_FLAGS.extMinimized;

  const save = async (next: LaunchFlags) => {
    const result = await api.updateLaunchFlags(next);

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to update launch flags');
      return;
    }

    fetchConfig();
  };

  return (
    <div className={style.wrapper}>
      <button
        type='button'
        className={style.toggle}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}>
        <span className='primary-text-color body-md-semibold'>
          VPX launch flags
        </span>
        <span className='secondary-text-color body-xs-regular'>
          {isOpen ? 'Hide' : 'Show'}
        </span>
      </button>
      {isOpen && (
        <div className={style.content}>
          <p className='secondary-text-color body-xs-regular'>
            Advanced: the defaults work for most setups. Change these only if
            VPX fails to start or behaves unexpectedly. Individual tables can
            override these in their launch settings.
          </p>
          <div className={style.row}>
            <div>
              <p className='primary-text-color body-md-semibold'>
                Limit CPU threads
              </p>
              <p className='secondary-text-color body-xs-regular'>
                Passes -LessCPUthreads to VPX.
              </p>
            </div>
            <CheckboxSwitch
              checked={launchFlags.lessCpuThreads}
              onChange={() =>
                save({
                  ...launchFlags,
                  lessCpuThreads: !launchFlags.lessCpuThreads,
                })
              }
              color='green'
            />
          </div>
          <div className={style.row}>
            <div>
              <p className='primary-text-color body-md-semibold'>
                Legacy pause menu (-ExtMinimized)
              </p>
              <p className='secondary-text-color body-xs-regular'>
                Required for VPX 10.8.0 and earlier. Turn it off for VPX 10.8.1
                and newer, where it causes a launch error; the pause menu then
                opens with F12 by default.
              </p>
            </div>
            <CheckboxSwitch
              checked={launchFlags.extMinimized}
              onChange={() =>
                save({
                  ...launchFlags,
                  extMinimized: !launchFlags.extMinimized,
                })
              }
              color='green'
            />
          </div>
          {!isDefault && (
            <div className={style.footer}>
              <Button
                size={ButtonSize.small}
                type={ButtonType.transparent}
                label='Reset to defaults'
                onClick={() => save(VPX_DEFAULT_LAUNCH_FLAGS)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSection;
