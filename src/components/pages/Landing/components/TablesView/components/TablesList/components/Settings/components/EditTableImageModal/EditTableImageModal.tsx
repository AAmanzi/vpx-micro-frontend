import classNames from 'classnames';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';

import Button, {
  Size as ButtonSize,
  Type as ButtonType,
} from 'src/components/Button';
import Modal, { Size as ModalSize } from 'src/components/Modal';
import api from 'src/consts';
import { useToastContext } from 'src/providers/toast';
import type { Table } from 'src/types/table';

import style from './EditTableImageModal.module.scss';

interface Props {
  id: string;
  name: string;
  currentImgUrl?: string;
  currentImagePreference?: Table['imagePreference'];
  gradientClassName: string;
  close: () => void;
}

const dedupeImageUrls = (imgUrls: Array<string>): Array<string> => {
  return imgUrls.filter((imgUrl, index) => imgUrls.indexOf(imgUrl) === index);
};

const EditTableImageModal: FunctionComponent<Props> = ({
  id,
  name,
  currentImgUrl,
  currentImagePreference,
  close,
  gradientClassName,
}) => {
  const { showErrorToast, showSuccessToast } = useToastContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [candidateImgUrls, setCandidateImgUrls] = useState<Array<string>>([]);

  const currentSelection =
    currentImagePreference === 'none' ? null : currentImgUrl || undefined;
  const [selectedImgUrl, setSelectedImgUrl] = useState<
    string | null | undefined
  >(currentSelection);

  useEffect(() => {
    let isMounted = true;

    const loadCandidateImgUrls = async () => {
      setIsLoading(true);

      const result = await api.getTableImageCandidates(id);

      if (!isMounted) {
        return;
      }

      if (!result.success) {
        showErrorToast(
          result.error.message || 'Failed to load image candidates',
        );
        setCandidateImgUrls(currentImgUrl ? [currentImgUrl] : []);
        setIsLoading(false);

        return;
      }

      setCandidateImgUrls(
        dedupeImageUrls([
          ...(currentImgUrl ? [currentImgUrl] : []),
          ...(result.data || []),
        ]),
      );
      setIsLoading(false);
    };

    loadCandidateImgUrls();

    return () => {
      isMounted = false;
    };
  }, [id, currentImgUrl, showErrorToast]);

  const hasSelectionChanged = selectedImgUrl !== currentSelection;
  const hasCandidates = useMemo(
    () => candidateImgUrls.length > 0,
    [candidateImgUrls],
  );

  const handleSave = async () => {
    if (!hasSelectionChanged || selectedImgUrl === undefined) {
      return;
    }

    setIsSaving(true);

    const result =
      selectedImgUrl === null
        ? await api.clearTableImage(id)
        : await api.updateTableImage(id, selectedImgUrl);

    if (!result.success) {
      showErrorToast(result.error.message || 'Failed to update table image');
      setIsSaving(false);

      return;
    }

    showSuccessToast(
      selectedImgUrl === null
        ? 'Table image cleared'
        : 'Table image updated successfully',
    );
    setIsSaving(false);
    close();
  };

  return (
    <Modal
      title='Table Image'
      description='Pick a different VPS image for this table or clear the image entirely.'
      modalClassName={style.modal}
      onExitClick={close}
      size={ModalSize.medium}
      color='blue'>
      <div className={style.content}>
        <p className={classNames('secondary-text-color', 'body-sm-regular')}>
          Showing possible matches for{' '}
          <span className='primary-text-color'>{name}</span>
        </p>

        <div className={style.optionsGrid}>
          <div
            className={classNames(style.option, {
              [style.selected]: selectedImgUrl === null,
            })}>
            <button
              type='button'
              className={style.optionButton}
              onClick={() => setSelectedImgUrl(null)}>
              <div
                className={classNames(style.emptyPreview, gradientClassName)}>
                <span
                  className={classNames(
                    'body-xs-semibold',
                    'uppercase',
                    style.emptyPreviewLabel,
                  )}>
                  No image
                </span>
              </div>
            </button>
          </div>

          {candidateImgUrls.map((candidateImgUrl) => (
            <div
              key={candidateImgUrl}
              className={classNames(style.option, {
                [style.selected]: selectedImgUrl === candidateImgUrl,
              })}>
              <button
                type='button'
                className={style.optionButton}
                onClick={() => setSelectedImgUrl(candidateImgUrl)}>
                <div
                  className={style.preview}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.2) 100%), url("${candidateImgUrl}")`,
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={style.footer}>
        <Button
          size={ButtonSize.small}
          type={ButtonType.transparent}
          label='Cancel'
          onClick={close}
        />
        <Button
          size={ButtonSize.small}
          label='Save'
          onClick={handleSave}
          loading={isSaving}
          disabled={
            isLoading || !hasSelectionChanged || selectedImgUrl === undefined
          }
        />
      </div>
    </Modal>
  );
};

export default EditTableImageModal;
