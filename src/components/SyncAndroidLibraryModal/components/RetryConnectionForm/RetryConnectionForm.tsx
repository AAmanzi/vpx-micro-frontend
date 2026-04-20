import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Form from 'src/components/Form/Form';
import Input from 'src/components/Input';
import { api } from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './RetryConnectionForm.module.scss';

interface Props {
  close: () => void;
  handleRetry: () => Promise<void>;
  isRetrying: boolean;
}

const RetryConnectionForm: FunctionComponent<Props> = ({
  close,
  handleRetry,
  isRetrying,
}) => {
  const { config, fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const [_androidWebServerUrl, setAndroidWebServerUrl] = useState('');

  const androidWebServerUrl =
    _androidWebServerUrl || config?.androidWebServerUrl || '';

  const handleSaveAndroidWebServerUrl = async () => {
    const trimmedValue = androidWebServerUrl.trim();

    const { error } = await api.updateAndroidWebServerUrl(trimmedValue);

    if (error) {
      showErrorToast(error.message || 'Failed to update Android server URL');
      return;
    }

    fetchConfig();
  };

  const handleSubmit = async () => {
    await handleSaveAndroidWebServerUrl();
    await handleRetry();
  };

  return (
    <Form submit={handleSubmit}>
      <div className={style.container}>
        <Input
          label='Android Web Server URL'
          value={androidWebServerUrl}
          onChange={setAndroidWebServerUrl}
          onBlur={handleSaveAndroidWebServerUrl}
          placeholder='192.168.0.0:2112'
        />
        <div className={style.actions}>
          <Button
            label='Close'
            type={ButtonType.transparent}
            size={ButtonSize.small}
            onClick={close}
          />
          <Button
            label='Try Again'
            type={ButtonType.primaryAlt}
            size={ButtonSize.small}
            loading={isRetrying}
            isSubmit
          />
        </div>
      </div>
    </Form>
  );
};

export default RetryConnectionForm;
