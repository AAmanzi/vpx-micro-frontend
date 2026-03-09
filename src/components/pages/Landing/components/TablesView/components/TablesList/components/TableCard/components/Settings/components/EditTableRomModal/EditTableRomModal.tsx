import classNames from 'classnames';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import FileUpload from 'src/components/FileUpload';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import RomPicker from 'src/components/RomPicker';
import api from 'src/consts';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { FileSystemItem } from 'src/types/file';
import { normalizePathForComparison } from 'src/utils';

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
  const { tables } = useTablesContext();
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useToastContext();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [unmatchedRoms, setUnmatchedRoms] = useState<Array<FileSystemItem>>([]);
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

  const getFileName = (value?: string): string => {
    if (!value) {
      return '';
    }

    const segments = value.split(/[/\\]/);
    return segments[segments.length - 1] || '';
  };

  const isRomAlreadyAssigned = (rom: FileSystemItem): boolean => {
    const normalizedSelectedPath = normalizePathForComparison(rom.path);
    const normalizedSelectedName = normalizePathForComparison(
      getFileName(rom.name),
    );

    return tables.some((table) => {
      const normalizedTableRomPath = normalizePathForComparison(
        table.romFilePath,
      );
      const normalizedTableRomName = normalizePathForComparison(
        getFileName(table.romFile),
      );
      const normalizedTableRomPathName = normalizePathForComparison(
        getFileName(table.romFilePath),
      );

      return (
        normalizedTableRomPath === normalizedSelectedPath ||
        normalizedTableRomName === normalizedSelectedName ||
        normalizedTableRomPathName === normalizedSelectedName
      );
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoadingData(true);

        const [unmatchedResult, expectedResult] = await Promise.all([
          api.getUnmatchedRoms(),
          api.getExpectedRomName(vpxFilePath),
        ]);

        if (!isMounted) {
          return;
        }

        if (!unmatchedResult.success) {
          showErrorToast(
            unmatchedResult.error.message ||
              'Failed to load unmatched ROM files',
          );
        } else {
          setUnmatchedRoms(unmatchedResult.data || []);
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
          setIsLoadingData(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const options = useMemo(() => {
    const currentRomOption =
      currentRomName && currentRomPath
        ? [{ name: currentRomName, path: currentRomPath }]
        : [];
    const merged = [...currentRomOption, ...unmatchedRoms, ...uploadedRoms];

    return merged.filter((item, index, allItems) => {
      return (
        allItems.findIndex(
          (candidate) =>
            normalizePathForComparison(candidate.path) ===
            normalizePathForComparison(item.path),
        ) === index
      );
    });
  }, [currentRomName, currentRomPath, unmatchedRoms, uploadedRoms]);

  const handleFilesSelected = (files: Array<FileSystemItem>) => {
    const zipFiles = files.filter((item) => isZipFile(item.name));

    if (zipFiles.length === 0) {
      showErrorToast('Only .zip ROM files are supported');

      return;
    }

    const nextRom = zipFiles[0];

    if (isRomAlreadyAssigned(nextRom)) {
      showErrorToast('This ROM is already assigned to another table');

      return;
    }

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
      description='Attach a ROM by uploading a .zip file or selecting an unmatched ROM from your library.'
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.medium}
      color='blue'>
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
            options={options}
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
          onClick={handleSave}
          disabled={isSaving || isLoadingData}
        />
      </div>
    </Modal>
  );
};

export default EditTableRomModal;
