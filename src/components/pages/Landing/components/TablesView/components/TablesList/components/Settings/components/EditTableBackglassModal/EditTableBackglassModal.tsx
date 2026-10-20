import classNames from 'classnames';
import { FunctionComponent, useMemo, useState } from 'react';

import BackglassPicker from 'src/components/BackglassPicker';
import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import FileUpload from 'src/components/FileUpload';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import api from 'src/consts';
import { useTablesContext } from 'src/providers/tables';
import { useToastContext } from 'src/providers/toast';
import { FileSystemItem } from 'src/types/file';
import { normalizePathForComparison } from 'src/utils';

import style from './EditTableBackglassModal.module.scss';

interface Props {
  id: string;
  currentBackglassName?: string;
  currentBackglassPath?: string;
  close: () => void;
}

const EditTableBackglassModal: FunctionComponent<Props> = ({
  id,
  currentBackglassName,
  currentBackglassPath,
  close,
}) => {
  const { tables } = useTablesContext();
  const { showErrorToast, showSuccessToast } = useToastContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [uploadedBackglasses, setUploadedBackglasses] = useState<
    Array<FileSystemItem>
  >([]);
  const [selectedBackglass, setSelectedBackglass] =
    useState<FileSystemItem | null>(
      currentBackglassName && currentBackglassPath
        ? { name: currentBackglassName, path: currentBackglassPath }
        : null,
    );

  const libraryBackglasses = useMemo(() => {
    const seenPaths = new Set<string>();

    return tables.reduce<Array<FileSystemItem>>((backglasses, table) => {
      if (!table.backglassFile || !table.backglassFilePath) {
        return backglasses;
      }

      const normalizedPath = normalizePathForComparison(
        table.backglassFilePath,
      );

      if (!seenPaths.has(normalizedPath)) {
        seenPaths.add(normalizedPath);
        backglasses.push({
          name: table.backglassFile,
          path: table.backglassFilePath,
        });
      }

      return backglasses;
    }, []);
  }, [tables]);
  const isBackglassUnchanged =
    !!currentBackglassPath &&
    !!selectedBackglass &&
    normalizePathForComparison(currentBackglassPath) ===
      normalizePathForComparison(selectedBackglass.path);

  const handleFilesSelected = (files: Array<FileSystemItem>) => {
    const directB2sFiles = files.filter((file) =>
      file.name.toLowerCase().endsWith('.directb2s'),
    );

    if (directB2sFiles.length === 0) {
      showErrorToast('Only .directb2s backglass files are supported');
      return;
    }

    if (directB2sFiles.length > 1) {
      showErrorToast('Select one backglass file at a time');
      return;
    }

    const backglass = directB2sFiles[0];
    setUploadedBackglasses((previous) => {
      const withoutDuplicate = previous.filter(
        (item) =>
          normalizePathForComparison(item.path) !==
          normalizePathForComparison(backglass.path),
      );

      return [backglass, ...withoutDuplicate];
    });
    setSelectedBackglass(backglass);
  };

  const handleSave = async () => {
    if (!selectedBackglass) {
      return;
    }

    setIsSaving(true);
    const result = await api.updateTableBackglass(id, selectedBackglass);

    if (!result.success) {
      showErrorToast(
        result.error.message || 'Failed to update table backglass',
      );
      setIsSaving(false);
      return;
    }

    showSuccessToast(
      currentBackglassPath
        ? 'Table backglass replaced successfully'
        : 'Table backglass added successfully',
    );
    close();
  };

  const handleRemove = async () => {
    setIsSaving(true);
    const result = await api.updateTableBackglass(id, null);

    if (!result.success) {
      showErrorToast(
        result.error.message || 'Failed to remove table backglass',
      );
      setIsSaving(false);
      return;
    }

    showSuccessToast('Table backglass removed successfully');
    close();
  };

  return (
    <Modal
      title={isConfirmingRemove ? 'Remove Backglass?' : 'Edit Backglass'}
      description={
        isConfirmingRemove
          ? `This permanently deletes ${currentBackglassName} from disk and removes it from this table.`
          : undefined
      }
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.medium}
      color={isConfirmingRemove ? 'red' : 'blue'}>
      {isConfirmingRemove ? (
        <div className={style.footer}>
          <Button
            size={ButtonSize.small}
            type={ButtonType.transparent}
            label='Cancel'
            disabled={isSaving}
            onClick={() => setIsConfirmingRemove(false)}
          />
          <Button
            size={ButtonSize.small}
            type={ButtonType.danger}
            label='Remove Backglass'
            disabled={isSaving}
            onClick={handleRemove}
          />
        </div>
      ) : (
        <>
          <div className={style.content}>
            <FileUpload
              label='Choose backglass'
              description='Drag and drop a .directb2s file here'
              acceptedExtensions={['.directb2s']}
              acceptFolders={false}
              onFilesSelected={handleFilesSelected}
            />
            <div className={style.backglassPickerWrapper}>
              <div
                className={classNames(
                  'secondary-text-color',
                  'body-xs-semibold',
                  'uppercase',
                  style.metaLabel,
                )}>
                Backglass Assignment
              </div>
              <BackglassPicker
                selectedBackglass={selectedBackglass}
                availableBackglasses={uploadedBackglasses}
                libraryBackglasses={libraryBackglasses}
                onRemove={() => setSelectedBackglass(null)}
                onSelect={setSelectedBackglass}
              />
            </div>
          </div>
          <div className={style.footer}>
            {currentBackglassName && (
              <Button
                size={ButtonSize.small}
                type={ButtonType.danger}
                label='Remove Backglass'
                disabled={isSaving}
                onClick={() => setIsConfirmingRemove(true)}
              />
            )}
            <Button
              size={ButtonSize.small}
              type={ButtonType.transparent}
              label='Cancel'
              disabled={isSaving}
              onClick={close}
            />
            <Button
              size={ButtonSize.small}
              label={
                currentBackglassName ? 'Replace Backglass' : 'Add Backglass'
              }
              disabled={isSaving || !selectedBackglass || isBackglassUnchanged}
              onClick={handleSave}
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default EditTableBackglassModal;
