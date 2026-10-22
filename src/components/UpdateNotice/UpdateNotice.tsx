import { useEffect, useState } from 'react';

import Button from 'src/components/Button';
import { Size, Type } from 'src/components/Button/types';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';
import type { AvailableUpdate } from 'src/types/updates';

import style from './UpdateNotice.module.scss';

export default function UpdateNotice() {
  const [update, setUpdate] = useState<AvailableUpdate | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);
  const { fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  useEffect(() => {
    let active = true;
    api
      .getAvailableUpdate()
      .then((result) => {
        if (active && result.success) {
          setUpdate(result.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!update) {
    return null;
  }

  const viewRelease = async () => {
    try {
      const result = await api.openExternalUrl(update.releaseUrl);
      if (!result.success) {
        showErrorToast(result.error.message || 'Failed to open release page');
      }
    } catch (error) {
      showErrorToast('Failed to open release page');
    }
  };

  const dismiss = async () => {
    setIsDismissing(true);
    try {
      const result = await api.dismissUpdateNotice();
      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to dismiss update notice',
        );
        return;
      }
      setUpdate(null);
      fetchConfig();
    } catch (error) {
      showErrorToast('Failed to dismiss update notice');
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <aside
      className={style.notice}
      role='status'
      aria-label='App update available'>
      <p className='body-sm-regular'>
        <strong>Version {update.version} is available.</strong> You&apos;re
        currently using {update.currentVersion}.
      </p>
      <div className={style.actions}>
        <Button label='View release' size={Size.small} onClick={viewRelease} />
        <Button
          label='Dismiss'
          size={Size.small}
          type={Type.secondary}
          loading={isDismissing}
          onClick={dismiss}
        />
      </div>
    </aside>
  );
}
