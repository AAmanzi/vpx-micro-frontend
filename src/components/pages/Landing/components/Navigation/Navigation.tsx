import { FunctionComponent, useState } from 'react';

import Button from 'src/components/Button';
import Modal from 'src/components/Modal';

import { View } from '../../types';
import style from './Navigation.module.scss';
import ImportTablesModal from './components/ImportTablesModal';

interface Props {
  view: View;
  setView: (view: View) => void;
}

const Navigation: FunctionComponent<Props> = ({ view, setView }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <>
      <div className={style.container}>
        <Button
          label='Import tables'
          onClick={() => setIsImportModalOpen(true)}
        />
        <button
          onClick={() => setView(View.allTables)}
          className={view === View.allTables ? style.active : ''}>
          Home
        </button>
        <button
          onClick={() => setView(View.settings)}
          className={view === View.settings ? style.active : ''}>
          Settings
        </button>
      </div>
      {isImportModalOpen && (
        <ImportTablesModal onClose={() => setIsImportModalOpen(false)} />
      )}
    </>
  );
};

export default Navigation;
