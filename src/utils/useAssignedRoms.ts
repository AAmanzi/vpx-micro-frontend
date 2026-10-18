import { useMemo } from 'react';

import { useTablesContext } from 'src/providers/tables';
import { FileSystemItem } from 'src/types/file';

import { getAssignedRoms } from './index';

const useAssignedRoms = (): Array<FileSystemItem> => {
  const { tables } = useTablesContext();

  return useMemo(() => getAssignedRoms(tables), [tables]);
};

export default useAssignedRoms;
