export const getDefaultRomsDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/VPinMAME/roms/`;
};

export const getDefaultTablesDirectory = (vpxRootPath: string): string => {
  return `${vpxRootPath}/Tables/`;
};

export const displayDateWithTime = (date: Date | number): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return d.toLocaleDateString(undefined, options);
};
