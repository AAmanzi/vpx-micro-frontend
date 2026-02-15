import { FunctionComponent } from 'react';
import { FiPlay, FiStar } from 'react-icons/fi';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';

import { Table } from 'src/types/table';

import style from './TableCard.module.scss';

type Props = Table;

const TableCard: FunctionComponent<Props> = ({
  id,
  isFavorite,
  name,
  romFile,
  vpxFile,
}) => {
  const handlePlay = () => {
    console.log('Play table:', id);
  };

  const handleToggleFavorite = () => {
    console.log('Toggle favorite for table:', id);
  };

  const openMenu = () => {
    console.log('Menu clicked for table:', id);
  };

  return (
    <div className={style.card}>
      <div className={style.playArea}>
        <button
          type='button'
          className={style.playButton}
          onClick={handlePlay}
          aria-label='Play table'>
          <FiPlay size={24} />
        </button>
      </div>

      <button
        type='button'
        className={style.favoriteButton}
        onClick={handleToggleFavorite}
        aria-label='Toggle favorite'>
        <FiStar size={20} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <div className={style.content}>
        <div className={style.header}>
          <h3 className={style.title}>{name}</h3>
          <button
            type='button'
            className={style.menuButton}
            onClick={openMenu}
            aria-label='More options'>
            <HiOutlineEllipsisVertical size={18} />
          </button>
        </div>

        <div className={style.meta}>
          <p className={style.file}>{vpxFile}</p>
          <p className={style.rom}>ROM: {romFile}</p>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
