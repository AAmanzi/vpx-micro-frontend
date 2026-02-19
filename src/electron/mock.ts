import type { Table } from 'src/types/table';

export const Tables: Table[] = [
  {
    id: 'table-1',
    name: 'Medieval Madness',
    vpxFile: '/path/to/medieval.vpx',
    romFile: 'mm_109c.rom',
    isFavorite: true,
  },
  {
    id: 'table-2',
    name: 'Addams Family',
    vpxFile: '/path/to/addams.vpx',
    romFile: 'taf_l7.rom',
    isFavorite: false,
  },
  {
    id: 'table-3',
    name: 'Monster Bash',
    vpxFile: '/path/to/monsterbash.vpx',
    romFile: 'mb_106.rom',
    isFavorite: false,
  },
  {
    id: 'table-4',
    name: 'Space Cadet',
    vpxFile: '/path/to/spacecadet.vpx',
    isFavorite: false,
  },
];

export default Tables;
