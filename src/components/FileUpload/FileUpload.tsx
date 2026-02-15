import classNames from 'classnames';
import { FunctionComponent, useRef, useState } from 'react';

import { isElectron } from 'src/consts/platform';

import style from './FileUpload.module.scss';
import { FileSystemItem, Props } from './types';

const FileUpload: FunctionComponent<Props> = ({
  label,
  description,
  acceptedExtensions,
  acceptFolders = true,
  onFilesSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItems, setSelectedItems] = useState<FileSystemItem[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const isValidFile = (path: string, isDirectory: boolean): boolean => {
    if (isDirectory) {
      return acceptFolders;
    }

    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    return acceptedExtensions.some((e) => e.toLowerCase() === ext);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!isElectron()) {
      console.warn('FileUpload: Not running in Electron environment');
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const newItems: FileSystemItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = (file as any).path;

      if (!path) continue;

      const isValid = isValidFile(file.name, false);
      if (isValid) {
        newItems.push({
          path,
          isDirectory: false,
          name: file.name,
        });
      }
    }

    if (newItems.length > 0) {
      const combined = [...selectedItems, ...newItems];
      setSelectedItems(combined);
      onFilesSelected(combined);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const newItems: FileSystemItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = (file as any).path || file.name;

      const isValid = isValidFile(file.name, false);
      if (isValid) {
        newItems.push({
          path,
          isDirectory: false,
          name: file.name,
        });
      }
    }

    if (newItems.length > 0) {
      const combined = [...selectedItems, ...newItems];
      setSelectedItems(combined);
      onFilesSelected(combined);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updated = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(updated);
    onFilesSelected(updated);
  };

  const acceptAttr = acceptedExtensions
    .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`))
    .join(',');

  return (
    <div className={style.container}>
      <div
        className={classNames(style.dropZone, {
          [style.dragActive]: dragActive,
        })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}>
        <div className={style.label}>{label}</div>
        <div className={style.description}>{description}</div>
        <input
          ref={fileInputRef}
          type='file'
          multiple
          className={style.input}
          accept={acceptAttr}
          onChange={handleFileInputChange}
        />
      </div>

      {selectedItems.length > 0 && (
        <div className={style.selectedItems}>
          {selectedItems.map((item, idx) => (
            <div key={`${item.path}-${idx}`} className={style.selectedItem}>
              <span className={style.itemName}>{item.name}</span>
              <button
                type='button'
                className={style.removeButton}
                onClick={() => handleRemoveItem(idx)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
