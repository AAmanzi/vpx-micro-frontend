import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import { api } from 'src/consts';
import { FileSystemItem } from 'src/types/file';

import style from './FileUpload.module.scss';
import { Props } from './types';

const FileUpload: FunctionComponent<Props> = ({
  label,
  description,
  acceptedExtensions,
  acceptFolders = true,
  onFilesSelected,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const getPathForFile = async (file: File): Promise<string | null> => {
    try {
      const path = await api.getPathForFile(file);
      if (typeof path === 'string' && path) {
        return path;
      }
    } catch (error) {}

    return null;
  };

  const getDirectoryTree = async (
    directoryPath: string,
  ): Promise<Array<FileSystemItem>> => {
    try {
      const items = await api.getDirectoryTree(directoryPath, acceptedExtensions);

      if (!Array.isArray(items)) {
        return [];
      }

      return items.filter(
        (item): item is FileSystemItem =>
          Boolean(item?.path) && Boolean(item?.name),
      );
    } catch (error) {
      return [];
    }
  };

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

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const newItems: Array<FileSystemItem> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = await getPathForFile(file);

      if (!path) continue;

      const item = e.dataTransfer.items?.[i];
      const entry = item?.webkitGetAsEntry?.();
      const isDirectory = Boolean(entry?.isDirectory);

      const isValid = isValidFile(file.name, isDirectory);
      if (isValid) {
        if (isDirectory) {
          const children = await getDirectoryTree(path);

          newItems.push({
            path,
            name: file.name,
            children,
          });

          continue;
        }

        newItems.push({
          path,
          name: file.name,
        });
      }
    }

    if (newItems.length > 0) {
      onFilesSelected(newItems);
    }
  };

  return (
    <div className={style.container}>
      <div
        className={classNames(style.dropZone, {
          [style.dragActive]: dragActive,
        })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}>
        <div className={style.label}>{label}</div>
        <div className={style.description}>{description}</div>
      </div>
    </div>
  );
};

export default FileUpload;
