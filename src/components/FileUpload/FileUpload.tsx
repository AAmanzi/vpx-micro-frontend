import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import { api } from 'src/consts';
import { FileSystemItem } from 'src/types/file';
import { normalizePath } from 'src/utils';

import Spinner from '../Spinner';
import style from './FileUpload.module.scss';
import { Props } from './types';

const FileUpload: FunctionComponent<Props> = ({
  label,
  description,
  acceptedExtensions,
  acceptFolders = true,
  loading = false,
  onFilesSelected,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const finalizeSelection = (items: Array<FileSystemItem>) => {
    const uniqueItems = items.filter(
      (item, index, allItems) =>
        allItems.findIndex((candidate) => candidate.path === item.path) ===
        index,
    );

    if (uniqueItems.length > 0) {
      onFilesSelected(uniqueItems);
    }
  };

  const getPathForFile = (file: File): string | null => {
    try {
      const { data: rawPath } = api.getPathForFile(file);
      if (typeof rawPath === 'string' && rawPath) {
        return normalizePath(rawPath);
      }
    } catch (error) {}

    return null;
  };

  const getDirectoryTree = async (
    directoryPath: string,
  ): Promise<Array<FileSystemItem>> => {
    try {
      const { data: items } = await api.getDirectoryTree(
        directoryPath,
        acceptedExtensions,
      );

      if (!Array.isArray(items)) {
        return [];
      }

      return items
        .filter(
          (item): item is FileSystemItem =>
            Boolean(item?.path) && Boolean(item?.name),
        )
        .map(item => ({
          ...item,
          path: normalizePath(item.path),
        }));
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

    if (loading) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setDragActive(false);

    const dropItems = Array.from(e.dataTransfer.items || []);
    const files = Array.from(e.dataTransfer.files || []);

    if (dropItems.length === 0 && files.length === 0) return;

    const resolvedItems = await Promise.all(
      (dropItems.length > 0
        ? dropItems
            .filter((item) => item.kind === 'file')
            .map(async (item) => {
              const file = item.getAsFile();
              if (!file) {
                return [] as Array<FileSystemItem>;
              }

              const filePath = getPathForFile(file);
              if (!filePath) {
                return [] as Array<FileSystemItem>;
              }

              const entry = item.webkitGetAsEntry?.();
              const isDirectory = Boolean(entry?.isDirectory);
              if (!isValidFile(filePath, isDirectory)) {
                return [] as Array<FileSystemItem>;
              }

              if (isDirectory) {
                return getDirectoryTree(filePath);
              }

              return [
                {
                  path: filePath,
                  name: file.name,
                },
              ];
            })
        : files.map(async (file) => {
            const filePath = getPathForFile(file);
            if (!filePath || !isValidFile(filePath, false)) {
              return [] as Array<FileSystemItem>;
            }

            return [
              {
                path: filePath,
                name: file.name,
              },
            ];
          })) as Array<Promise<Array<FileSystemItem>>>,
    );

    const newItems = resolvedItems.flat();
    finalizeSelection(newItems);
  };

  const handleOpenFilePicker = async () => {
    if (loading) {
      return;
    }

    try {
      const result = await api.openFilePicker(
        acceptedExtensions,
        acceptFolders,
      );

      if (!result.success || !Array.isArray(result.data)) {
        return;
      }

      const normalizedItems = result.data.map(item => ({
        ...item,
        path: normalizePath(item.path),
      }));

      finalizeSelection(normalizedItems);
    } catch {
      return;
    }
  };

  return (
    <div className={style.container}>
      <div
        className={classNames(style.dropZone, {
          [style.dragActive]: dragActive && !loading,
          [style.loading]: loading,
        })}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleOpenFilePicker}>
        {!loading ? (
          <>
            <div
              className={classNames(
                'primary-text-color',
                'heading-5-bold',
                style.label,
              )}>
              {label}
            </div>
            <div
              className={classNames(
                'secondary-text-color',
                'body-md-regular',
                style.description,
              )}>
              {description}
            </div>
          </>
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
};

export default FileUpload;
