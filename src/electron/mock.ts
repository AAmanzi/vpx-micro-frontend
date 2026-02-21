import type { Table } from 'src/types/table';

export const Tables: Table[] = [
  {
    id: 'table-1',
    name: 'Medieval Madness',
    vpxFile: 'medieval madness v600.vpx',
    romFile: 'mm_109c.rom',
    isFavorite: true,
  },
  {
    id: 'table-2',
    name: 'Addams Family',
    vpxFile: 'addams family v600.vpx',
    romFile: 'taf_l7.rom',
    isFavorite: false,
  },
  {
    id: 'table-3',
    name: 'Monster Bash',
    vpxFile: 'monster bash v600.vpx',
    romFile: 'mb_106.rom',
    isFavorite: false,
  },
  {
    id: 'table-4',
    name: 'Space Cadet',
    vpxFile: 'space cadet v600.vpx',
    isFavorite: false,
  },
];

export default Tables;
