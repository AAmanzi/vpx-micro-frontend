import classNames from 'classnames';
import { FunctionComponent, useEffect, useRef, useState } from 'react';

import { api } from 'src/consts';
import { FileSystemItem } from 'src/types/file';

import Spinner from '../Spinner';
import style from './FileUploadOverlay.module.scss';
import { Props } from './types';

const FileUploadOverlay: FunctionComponent<Props> = ({
  label,
  description,
  acceptedExtensions,
  acceptFolders = true,
  loading = false,
  onFilesSelected,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

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

  const resolveDataTransferItems = async (
    dataTransfer: DataTransfer,
  ): Promise<Array<FileSystemItem>> => {
    const dropItems = Array.from(dataTransfer.items || []);
    const files = Array.from(dataTransfer.files || []);

    if (dropItems.length === 0 && files.length === 0) {
      return [];
    }

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

    return resolvedItems.flat();
  };

  useEffect(() => {
    const hasFilesInEvent = (event: globalThis.DragEvent) =>
      Array.from(event.dataTransfer?.types || []).includes('Files');

    const handleWindowDragEnter = (event: globalThis.DragEvent) => {
      if (loading || !hasFilesInEvent(event)) {
        return;
      }

      event.preventDefault();
      dragCounter.current += 1;
      setDragActive(true);
    };

    const handleWindowDragOver = (event: globalThis.DragEvent) => {
      if (loading || !hasFilesInEvent(event)) {
        return;
      }

      event.preventDefault();
    };

    const handleWindowDragLeave = (event: globalThis.DragEvent) => {
      if (loading || !hasFilesInEvent(event)) {
        return;
      }

      event.preventDefault();
      dragCounter.current = Math.max(0, dragCounter.current - 1);

      if (dragCounter.current === 0) {
        setDragActive(false);
      }
    };

    const handleWindowDrop = async (event: globalThis.DragEvent) => {
      if (loading || !hasFilesInEvent(event)) {
        return;
      }

      event.preventDefault();
      dragCounter.current = 0;
      setDragActive(false);

      if (!event.dataTransfer) {
        return;
      }

      const newItems = await resolveDataTransferItems(event.dataTransfer);
      finalizeSelection(newItems);
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
      dragCounter.current = 0;
    };
  }, [acceptedExtensions, acceptFolders, loading]);

  return (
    <div
      className={classNames(style.container, {
        [style.visible]: dragActive,
        [style.loading]: loading,
      })}>
      <div className={style.dropZone}>
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

export default FileUploadOverlay;
