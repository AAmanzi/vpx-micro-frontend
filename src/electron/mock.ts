import type { Table } from 'src/types/table'

export const Tables: Table[] = [
  {
    id: 'table-1',
    name: 'Medieval Madness',
    vpxFile: '/path/to/medieval.vpx',
    romFile: 'medieval.rom',
    isFavorite: true
  },
  {
    id: 'table-2',
    name: 'Addams Family',
    vpxFile: '/path/to/addams.vpx',
    romFile: 'addams.rom',
    isFavorite: false
  },
  {
    id: 'table-3',
    name: 'Star Trek',
    vpxFile: '/path/to/startrek.vpx',
    romFile: 'startrek.rom',
    isFavorite: false
  }
]

export default Tables
