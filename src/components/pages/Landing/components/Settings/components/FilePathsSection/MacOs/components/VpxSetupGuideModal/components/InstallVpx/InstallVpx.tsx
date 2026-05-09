import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Button, { Type as ButtonType } from 'src/components/Button';
import Icon from 'src/components/Icon';
import api from 'src/consts';
import { useToastContext } from 'src/providers/toast';

import style from './InstallVpx.module.scss';

interface Props {
  goNext: () => void;
}

const InstallVpx: FunctionComponent<Props> = ({ goNext }) => {
  const { showErrorToast } = useToastContext();
  const [showActionsScreenshot, setShowActionsScreenshot] = useState(false);
  const [showArtifactsScreenshot, setShowArtifactsScreenshot] = useState(false);

  const handleOpenRepository = async () => {
    const { error } = await api.openExternalUrl(
      'https://github.com/vpinball/vpinball',
    );
    if (error) {
      showErrorToast(error.message || 'Failed to open browser');
    }
  };

  const handleOpenActions = async () => {
    const { error } = await api.openExternalUrl(
      'https://github.com/vpinball/vpinball/actions',
    );
    if (error) {
      showErrorToast(error.message || 'Failed to open browser');
    }
  };

  const handleOpenWorkflow = async () => {
    const { error } = await api.openExternalUrl(
      'https://github.com/vpinball/vpinball/actions/workflows/vpinball.yml',
    );
    if (error) {
      showErrorToast(error.message || 'Failed to open browser');
    }
  };

  return (
    <div className={style.container}>
      <div className={style.content}>
        <div className={style.titleSection}>
          <h2 className={`${style.title} primary-text-color body-md-bold`}>
            Download VPX macOS Build
          </h2>
          <p className='secondary-text-color body-sm-regular'>
            Follow the steps below to download the latest VPX build from the
            GitHub repository.
          </p>
        </div>

        <div className={style.note}>
          <p
            className={`${style.noteText} secondary-text-color body-sm-regular`}>
            💡 <strong>Prefer BGFX builds</strong> over OpenGL builds for best
            compatibility and rendering.
          </p>
        </div>
        <div className={style.stepsSection}>
          <div className={style.stepsLabelRow}>
            <h3
              className={classNames(
                style.stepsTitle,
                'primary-text-color',
                'body-md-bold',
              )}>
              From VPinball Github follow these steps:
            </h3>
            <button
              className={style.headerExternalLinkButton}
              onClick={handleOpenRepository}
              type='button'>
              <Icon icon='external-link' width={14} height={14} />
              <span>Open Github</span>
            </button>
          </div>
          <ol className={style.stepsList}>
            <li className='body-sm-regular'>
              Open the{' '}
              <button
                className={style.linkButton}
                onClick={handleOpenActions}
                type='button'>
                Actions tab
              </button>
            </li>
            <li className='body-sm-regular'>
              Find the{' '}
              <button
                className={style.linkButton}
                onClick={handleOpenWorkflow}
                type='button'>
                workflow that builds VPinball
              </button>
            </li>
            <li className='body-sm-regular'>Open a successful workflow run</li>
            <li className='body-sm-regular'>Scroll to Artifacts</li>
            <li className='body-sm-regular'>
              Download and install:
              <ul className={style.buildsList}>
                <li>
                  <strong>VPinball_BGFX-macos-arm64</strong> (Apple Silicon,
                  most modern Macs)
                </li>
                <li>
                  <strong>OR VPinball_BGFX-macos-x64</strong> (Intel Mac)
                </li>
              </ul>
            </li>
          </ol>
        </div>

        <div className={style.screenshotsSection}>
          <button
            className={style.screenshotToggle}
            onClick={() => setShowActionsScreenshot(!showActionsScreenshot)}
            type='button'>
            <span>{showActionsScreenshot ? '▼' : '▶'}</span>
            <span className='body-sm-regular'>GitHub Actions Tab</span>
          </button>
          {showActionsScreenshot && (
            <img
              src='/mac-setup/github-actions.png'
              alt='GitHub Actions tab with VPinball workflow'
              className={style.screenshot}
            />
          )}
        </div>

        <div className={style.screenshotsSection}>
          <button
            className={style.screenshotToggle}
            onClick={() => setShowArtifactsScreenshot(!showArtifactsScreenshot)}
            type='button'>
            <span>{showArtifactsScreenshot ? '▼' : '▶'}</span>
            <span className='body-sm-regular'>Artifacts</span>
          </button>
          {showArtifactsScreenshot && (
            <img
              src='/mac-setup/mac-artifacts.png'
              alt='Artifacts with macOS releases highlighted'
              className={style.screenshot}
            />
          )}
        </div>
      </div>

      <div className={style.footer}>
        <Button label='Continue' onClick={goNext} type={ButtonType.primary} />
      </div>
    </div>
  );
};

export default InstallVpx;
