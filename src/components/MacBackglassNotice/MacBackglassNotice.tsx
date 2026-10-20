import classNames from 'classnames';
import { FunctionComponent } from 'react';

import Icon from 'src/components/Icon';
import { useConfigContext } from 'src/providers/config';

import style from './MacBackglassNotice.module.scss';

interface Props {
  className?: string;
}

const MacBackglassNotice: FunctionComponent<Props> = ({ className }) => {
  const { platform } = useConfigContext();

  if (platform !== 'darwin') {
    return null;
  }

  return (
    <div
      role='note'
      className={classNames(style.notice, 'body-sm-regular', className)}>
      <Icon icon='circle-alert' width={20} height={20} className={style.icon} />
      <p>
        <strong>
          DirectB2S playback compatibility on macOS hasn&apos;t been verified by
          this project.
        </strong>{' '}
        You can import, assign, and export backglass files, but playback may
        require additional setup outside this app.
      </p>
    </div>
  );
};

export default MacBackglassNotice;
