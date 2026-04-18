import {
  FunctionComponent,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DEFAULT_NEXT_TABLE_KEY,
  DEFAULT_PREVIOUS_TABLE_KEY,
  DEFAULT_START_TABLE_KEY,
} from 'src/consts/config';

export type SelectionType = 'table' | 'action';

interface SelectionValue {
  type: SelectionType;
  id: string;
}

interface SelectionItem {
  key: string;
  value: SelectionValue;
  order: number;
  onAction?: () => void;
  getElement?: () => HTMLElement | null;
}

interface SelectionScrollConfig {
  getTopOffset?: () => number;
  paddingPx?: number;
  behavior?: ScrollBehavior;
}

interface SelectionContextType {
  isSelectionActive: boolean;
  selected: SelectionValue | null;
  selectedKey: string | null;
  selectKey: (key: string | null, active?: boolean) => void;
  registerItem: (item: SelectionItem) => () => void;
}

interface UseSelectableOptions {
  key: string;
  type: SelectionType;
  id: string;
  order: number;
  onAction?: () => void;
  getElement?: () => HTMLElement | null;
  enabled?: boolean;
}

interface UseSelectableResult {
  isSelected: boolean;
  select: () => void;
  selectableKey: string;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined,
);

const NEXT_SELECTION_KEY = DEFAULT_NEXT_TABLE_KEY;
const PREVIOUS_SELECTION_KEY = DEFAULT_PREVIOUS_TABLE_KEY;
const TRIGGER_SELECTION_KEY = DEFAULT_START_TABLE_KEY;

export const useSelection = () => {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }

  return context;
};

export const useSelectable = ({
  key,
  type,
  id,
  order,
  onAction,
  getElement,
  enabled = true,
}: UseSelectableOptions): UseSelectableResult => {
  const { isSelectionActive, selectedKey, selectKey, registerItem } =
    useSelection();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return registerItem({
      key,
      value: { type, id },
      order,
      onAction,
      getElement,
    });
  }, [enabled, getElement, id, key, onAction, order, registerItem, type]);

  const select = useCallback(() => {
    if (!enabled) {
      return;
    }

    selectKey(key, true);
  }, [enabled, key, selectKey]);

  return {
    isSelected: enabled && isSelectionActive && selectedKey === key,
    select,
    selectableKey: key,
  };
};

export const SelectionProvider: FunctionComponent<{
  children: ReactNode;
  scrollConfig?: SelectionScrollConfig;
}> = ({ children, scrollConfig }) => {
  const itemsByKeyRef = useRef<Map<string, SelectionItem>>(new Map());
  const [orderedKeys, setOrderedKeys] = useState<Array<string>>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isSelectionActive, setIsSelectionActive] = useState(false);

  const scrollPaddingPx = scrollConfig?.paddingPx ?? 16;
  const scrollBehavior = scrollConfig?.behavior ?? 'smooth';
  const getTopOffset = scrollConfig?.getTopOffset;

  const selected = useMemo(() => {
    if (!selectedKey) {
      return null;
    }

    return itemsByKeyRef.current.get(selectedKey)?.value ?? null;
  }, [selectedKey, orderedKeys]);

  const refreshOrderedKeys = useCallback(() => {
    const sorted = [...itemsByKeyRef.current.values()]
      .sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }

        return a.key.localeCompare(b.key);
      })
      .map((item) => item.key);

    setOrderedKeys(sorted);
  }, []);

  const selectKey = useCallback((nextKey: string | null, active = true) => {
    setSelectedKey(nextKey);
    setIsSelectionActive(Boolean(nextKey) && active);
  }, []);

  const registerItem = useCallback(
    (item: SelectionItem) => {
      itemsByKeyRef.current.set(item.key, item);
      refreshOrderedKeys();

      return () => {
        itemsByKeyRef.current.delete(item.key);
        refreshOrderedKeys();
      };
    },
    [refreshOrderedKeys],
  );

  useEffect(() => {
    if (!selectedKey) {
      return;
    }

    const hasSelectedItem = orderedKeys.includes(selectedKey);

    if (!hasSelectedItem) {
      selectKey(null, false);
    }
  }, [orderedKeys, selectKey, selectedKey]);

  const moveSelection = useCallback(
    (direction: 'next' | 'previous') => {
      if (orderedKeys.length === 0) {
        return;
      }

      setIsSelectionActive(true);

      setSelectedKey((currentKey) => {
        const currentIndex = currentKey ? orderedKeys.indexOf(currentKey) : -1;

        if (currentIndex === -1) {
          const firstTableKey = orderedKeys.find(
            (key) => itemsByKeyRef.current.get(key)?.value.type === 'table',
          );

          return firstTableKey ?? orderedKeys[0];
        }

        const nextIndex =
          direction === 'next'
            ? Math.min(currentIndex + 1, orderedKeys.length - 1)
            : Math.max(currentIndex - 1, 0);

        return orderedKeys[nextIndex];
      });
    },
    [orderedKeys],
  );

  const triggerSelectedAction = useCallback(() => {
    if (!selectedKey) {
      return;
    }

    const selectedItem = itemsByKeyRef.current.get(selectedKey);
    selectedItem?.onAction?.();
  }, [selectedKey]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        target?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      if (event.key === NEXT_SELECTION_KEY) {
        event.preventDefault();
        moveSelection('next');

        return;
      }

      if (event.key === PREVIOUS_SELECTION_KEY) {
        event.preventDefault();
        moveSelection('previous');

        return;
      }

      if (event.key === TRIGGER_SELECTION_KEY && selectedKey) {
        event.preventDefault();
        triggerSelectedAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveSelection, selectedKey, triggerSelectedAction]);

  useEffect(() => {
    if (!isSelectionActive) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (target?.closest('[data-selectable-key]')) {
        return;
      }

      setIsSelectionActive(false);
    };

    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isSelectionActive]);

  useEffect(() => {
    if (!isSelectionActive || !selectedKey) {
      return;
    }

    const selectedItem = itemsByKeyRef.current.get(selectedKey);
    const selectedElement = selectedItem?.getElement?.();

    if (!selectedElement) {
      return;
    }

    const selectedRect = selectedElement.getBoundingClientRect();
    const topBoundary = (getTopOffset?.() ?? 0) + scrollPaddingPx;
    const bottomBoundary = window.innerHeight - scrollPaddingPx;

    if (selectedRect.top < topBoundary) {
      window.scrollBy({
        top: selectedRect.top - topBoundary,
        behavior: scrollBehavior,
      });

      return;
    }

    if (selectedRect.bottom > bottomBoundary) {
      window.scrollBy({
        top: selectedRect.bottom - bottomBoundary,
        behavior: scrollBehavior,
      });
    }
  }, [
    getTopOffset,
    isSelectionActive,
    scrollBehavior,
    scrollPaddingPx,
    selectedKey,
  ]);

  return (
    <SelectionContext.Provider
      value={{
        isSelectionActive,
        selected,
        selectedKey,
        selectKey,
        registerItem,
      }}>
      {children}
    </SelectionContext.Provider>
  );
};
