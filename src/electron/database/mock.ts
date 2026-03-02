import type { Table } from 'src/types/table';

export const Tables: Table[] = [
  {
    id: 'table-1',
    name: 'Medieval Madness',
    vpxFile: 'medieval madness v600.vpx',
    romFile: 'mm_109c.rom',
    isFavorite: true,
    lastPlayedTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    dateAddedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
    vpxFilePath: 'C:\\VisualPinball\\Tables\\medieval madness v600.vpx',
    romFilePath: 'C:\\VisualPinball\\Roms\\mm_109c.rom',
  },
  {
    id: 'table-2',
    name: 'Addams Family',
    vpxFile: 'addams family v600.vpx',
    romFile: 'taf_l7.rom',
    isFavorite: false,
    lastPlayedTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    dateAddedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
    vpxFilePath: 'C:\\VisualPinball\\Tables\\addams family v600.vpx',
    romFilePath: 'C:\\VisualPinball\\Roms\\taf_l7.rom',
  },
  {
    id: 'table-3',
    name: 'Monster Bash',
    vpxFile: 'monster bash v600.vpx',
    romFile: 'mb_106.rom',
    isFavorite: false,
    lastPlayedTimestamp: Date.now() - 1000 * 60 * 60 * 24,
    dateAddedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
    vpxFilePath: 'C:\\VisualPinball\\Tables\\monster bash v600.vpx',
    romFilePath: 'C:\\VisualPinball\\Roms\\mb_106.rom',
  },
  {
    id: 'table-4',
    name: 'Space Cadet',
    vpxFile: 'space cadet v600.vpx',
    dateAddedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    isFavorite: false,
    vpxFilePath: 'C:\\VisualPinball\\Tables\\space cadet v600.vpx',
  },
];

export default Tables;
