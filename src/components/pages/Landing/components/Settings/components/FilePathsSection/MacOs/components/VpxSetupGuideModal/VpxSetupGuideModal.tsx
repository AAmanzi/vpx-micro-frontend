import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import Modal, { Size as ModalSize } from 'src/components/Modal';
import api from 'src/consts';
import { useConfigContext } from 'src/providers/config';
import { useToastContext } from 'src/providers/toast';

import style from './VpxSetupGuideModal.module.scss';
import ConfigureLibraryFolders from './components/ConfigureLibraryFolders';
import ConfigureRomSupport from './components/ConfigureRomSupport';
import ConfigureVpxExecutable from './components/ConfigureVpxExecutable';
import InstallVpx from './components/InstallVpx';

interface Props {
  onClose: () => void;
}

enum Step {
  installVpx = 'installVpx',
  configureVpxExecutable = 'configureVpxExecutable',
  configureLibraryFolders = 'configureLibraryFolders',
  configureRomSupport = 'configureRomSupport',
}

const stepOrder = [
  Step.installVpx,
  Step.configureVpxExecutable,
  Step.configureLibraryFolders,
  Step.configureRomSupport,
];

const VpxSetupGuideModal: FunctionComponent<Props> = ({ onClose }) => {
  const { fetchConfig } = useConfigContext();
  const { showErrorToast } = useToastContext();

  const [selectedStep, setSelectedStep] = useState(Step.installVpx);
  const selectedStepIndex = stepOrder.indexOf(selectedStep);

  const goNextFromInstallVpx = () => {
    setSelectedStep(Step.configureVpxExecutable);
  };

  const goNextFromConfigureVpxExecutable = async (vpxPath: string) => {
    const { error } = await api.updateVpxExecutablePath(vpxPath);

    if (error) {
      showErrorToast(error.message || 'Failed to update VPX executable path');

      return;
    }

    fetchConfig();
    setSelectedStep(Step.configureLibraryFolders);
  };

  const goBackFromConfigureVpxExecutable = () => {
    setSelectedStep(Step.installVpx);
  };

  const goNextFromConfigureLibraryFolders = async (
    variant: 'automatic' | 'custom',
    paths: {
      libraryFolder?: string;
      tablesFolder?: string;
      romsFolder?: string;
    },
  ) => {
    if (variant === 'custom') {
      const [tablesResult, romsResult] = await Promise.all([
        api.updateTablesDirectoryPath(paths.tablesFolder || ''),
        api.updateRomsDirectoryPath(paths.romsFolder || ''),
      ]);

      if (!tablesResult.success) {
        showErrorToast(
          tablesResult.error.message || 'Failed to update tables directory',
        );

        return;
      }

      if (!romsResult.success) {
        showErrorToast(
          romsResult.error.message || 'Failed to update ROMs directory',
        );

        return;
      }
    }

    if (variant === 'automatic') {
      const setupResult = await api.setupDefaultLibraryFolders(
        paths.libraryFolder || '',
      );

      if (!setupResult.success) {
        showErrorToast(
          setupResult.error.message ||
            'Failed to create default VPX library folders',
        );

        return;
      }
    }

    fetchConfig();
    setSelectedStep(Step.configureRomSupport);
  };

  const submit = () => {
    onClose();
  };

  const getTitle = () => {
    switch (selectedStep) {
      case Step.installVpx:
        return 'Step 1: Install VPX macOS Build';
      case Step.configureVpxExecutable:
        return 'Step 2: Configure VPX Executable Path';
      case Step.configureLibraryFolders:
        return 'Step 3: Configure Library Folders';
      case Step.configureRomSupport:
        return 'Step 4: Configure ROM Support';
    }
  };

  const getStep = () => {
    switch (selectedStep) {
      case Step.installVpx:
        return <InstallVpx goNext={goNextFromInstallVpx} />;
      case Step.configureVpxExecutable:
        return (
          <ConfigureVpxExecutable
            goNext={goNextFromConfigureVpxExecutable}
            goBack={goBackFromConfigureVpxExecutable}
          />
        );
      case Step.configureLibraryFolders:
        return (
          <ConfigureLibraryFolders goNext={goNextFromConfigureLibraryFolders} />
        );
      case Step.configureRomSupport:
        return <ConfigureRomSupport submit={submit} />;
    }
  };

  return (
    <Modal
      title={getTitle()}
      description='Setup Guide'
      onExitClick={onClose}
      color='green'
      size={ModalSize.large}>
      <div className={style.stepTrackerWrapper}>
        <p className='secondary-text-color body-xs-regular'>
          Step {selectedStepIndex + 1} of {stepOrder.length}
        </p>
        <div className={style.stepTracker} aria-hidden='true'>
          {stepOrder.map((step, index) => (
            <span
              key={step}
              className={classNames(style.stepSegment, {
                [style.stepSegmentActive]: index <= selectedStepIndex,
              })}
            />
          ))}
        </div>
      </div>
      {getStep()}
    </Modal>
  );
};

export default VpxSetupGuideModal;
