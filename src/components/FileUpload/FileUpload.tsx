import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import { api } from 'src/consts';
import { FileSystemItem } from 'src/types/file';

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

  const getPathForFile = (file: File): string | null => {
    try {
      const { data: path } = api.getPathForFile(file);
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
      const { data: items } = await api.getDirectoryTree(
        directoryPath,
        acceptedExtensions,
      );

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

              const path = getPathForFile(file);
              if (!path) {
                return [] as Array<FileSystemItem>;
              }

              const entry = item.webkitGetAsEntry?.();
              const isDirectory = Boolean(entry?.isDirectory);
              if (!isValidFile(path, isDirectory)) {
                return [] as Array<FileSystemItem>;
              }

              if (isDirectory) {
                return getDirectoryTree(path);
              }

              return [
                {
                  path,
                  name: file.name,
                },
              ];
            })
        : files.map(async (file) => {
            const path = getPathForFile(file);
            if (!path || !isValidFile(path, false)) {
              return [] as Array<FileSystemItem>;
            }

            return [
              {
                path,
                name: file.name,
              },
            ];
          })) as Array<Promise<Array<FileSystemItem>>>,
    );

    const newItems = resolvedItems.flat();
    const uniqueItems = newItems.filter(
      (item, index, allItems) =>
        allItems.findIndex((candidate) => candidate.path === item.path) ===
        index,
    );

    if (uniqueItems.length > 0) {
      onFilesSelected(uniqueItems);
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
        onDrop={handleDrop}>
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
