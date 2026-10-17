import classNames from 'classnames';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import FileUpload from 'src/components/FileUpload';
import Form from 'src/components/Form';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import RomPicker from 'src/components/RomPicker';
import api from 'src/consts';
import { useToastContext } from 'src/providers/toast';
import { FileSystemItem } from 'src/types/file';
import { normalizePathForComparison } from 'src/utils';
import useAssignedRoms from 'src/utils/useAssignedRoms';

import style from './EditTableRomModal.module.scss';

interface Props {
  id: string;
  vpxFilePath: string;
  currentRomName?: string;
  currentRomPath?: string;
  close: () => void;
}

const isZipFile = (name: string): boolean =>
  name.trim().toLowerCase().endsWith('.zip');

const EditTableRomModal: FunctionComponent<Props> = ({
  id,
  vpxFilePath,
  currentRomName,
  currentRomPath,
  close,
}) => {
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToastContext();
  const assignedRoms = useAssignedRoms();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExpectedRom, setIsLoadingExpectedRom] = useState(false);
  const isLoadingData = isLoadingExpectedRom;
  const [uploadedRoms, setUploadedRoms] = useState<Array<FileSystemItem>>([]);
  const [expectedRomName, setExpectedRomName] = useState<string | null>(null);
  const [selectedRom, setSelectedRom] = useState<FileSystemItem | null>(
    currentRomName && currentRomPath
      ? {
          name: currentRomName,
          path: currentRomPath,
        }
      : null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoadingExpectedRom(true);

        const expectedResult = await api.getExpectedRomName(vpxFilePath);

        if (!isMounted) {
          return;
        }

        if (!expectedResult.success) {
          showWarningToast(
            expectedResult.error.message ||
              'Could not determine expected ROM name for this table',
          );
        } else {
          setExpectedRomName(expectedResult.data || null);
        }
      } catch {
        if (isMounted) {
          showErrorToast('Failed to load ROM data');
        }
      } finally {
        if (isMounted) {
          setIsLoadingExpectedRom(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const libraryRoms = useMemo(() => {
    const currentRomOption =
      currentRomName && currentRomPath
        ? [{ name: currentRomName, path: currentRomPath }]
        : [];

    return [...currentRomOption, ...assignedRoms];
  }, [currentRomName, currentRomPath, assignedRoms]);

  const handleFilesSelected = (files: Array<FileSystemItem>) => {
    const zipFiles = files.filter((item) => isZipFile(item.name));

    if (zipFiles.length === 0) {
      showErrorToast('Only .zip ROM files are supported');

      return;
    }

    const nextRom = zipFiles[0];

    if (zipFiles.length > 1) {
      showWarningToast('Multiple ROM files detected. Using the first one.');
    }

    setUploadedRoms((previous) => {
      if (
        previous.some(
          (item) =>
            normalizePathForComparison(item.path) ===
            normalizePathForComparison(nextRom.path),
        )
      ) {
        return previous;
      }

      return [nextRom, ...previous];
    });

    setSelectedRom(nextRom);
  };

  const handleRomSelect = (rom: FileSystemItem) => {
    setSelectedRom(rom);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const result = await api.updateTableRom(id, selectedRom);

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to update table ROM');
      setIsSaving(false);

      return;
    }

    setIsSaving(false);
    showSuccessToast('Table ROM updated successfully');
    close();
  };

  return (
    <Modal
      title='Edit Table ROM'
      description='Attach a ROM by uploading a .zip file or selecting a ROM from your library.'
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.medium}
      color='blue'>
      <Form submit={handleSave}>
        <div className={style.content}>
          <FileUpload
            label='Drop ROM file'
            description='Drag and drop a .zip ROM file here'
            acceptedExtensions={['.zip']}
            acceptFolders={false}
            loading={isLoadingData}
            onFilesSelected={handleFilesSelected}
          />
          <div className={style.romPickerWrapper}>
            <div
              className={classNames(
                'secondary-text-color',
                'body-xs-semibold',
                'uppercase',
                style.metaLabel,
              )}>
              ROM Assignment
            </div>
            <RomPicker
              selectedRom={selectedRom}
              manuallyImportedRoms={uploadedRoms}
              scannedRoms={[]}
              libraryRoms={libraryRoms}
              expectedRomName={expectedRomName}
              onRemoveRom={() => setSelectedRom(null)}
              onSelect={handleRomSelect}
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
            disabled={isSaving || isLoadingData}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default EditTableRomModal;
