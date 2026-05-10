import { FunctionComponent, useState } from 'react';

import Button, { Type as ButtonType } from 'src/components/Button';
import FilePicker from 'src/components/FilePicker/FilePicker';
import Input from 'src/components/Input';
import { useToastContext } from 'src/providers/toast';

import style from './ConfigureVpxExecutable.module.scss';

interface Props {
  goNext: (vpxExecutablePath: string) => void;
  goBack: () => void;
}

const ConfigureVpxExecutable: FunctionComponent<Props> = ({
  goNext,
  goBack,
}) => {
  const { showErrorToast } = useToastContext();
  const [vpxExecutablePath, setVpxExecutablePath] = useState('');

  const handleContinue = () => {
    if (!vpxExecutablePath.trim()) {
      showErrorToast('Please select a VPX executable path');
      return;
    }
    goNext(vpxExecutablePath);
  };

  return (
    <div className={style.container}>
      <div className={style.content}>
        <div className={style.titleSection}>
          <h3 className={`${style.title} primary-text-color body-md-bold`}>
            Locate your VPX executable
          </h3>
          <p className='secondary-text-color body-sm-regular'>
            Browse to your VPinballX app. This is typically in your Applications
            folder.
          </p>
        </div>

        <div className={style.inputGroup}>
          <Input
            label='VPX Executable'
            placeholder='/Applications/VPinballX_BGFX.app'
            value={vpxExecutablePath}
            onChange={setVpxExecutablePath}
          />
          <FilePicker
            onSelect={setVpxExecutablePath}
            onError={showErrorToast}
            acceptedExtensions={['.app']}
            label='Browse'
          />
        </div>
      </div>

      <div className={style.footer}>
        <Button label='Back' onClick={goBack} type={ButtonType.secondary} />
        <Button
          label='Continue'
          onClick={handleContinue}
          type={ButtonType.primary}
        />
      </div>
    </div>
  );
};

export default ConfigureVpxExecutable;
