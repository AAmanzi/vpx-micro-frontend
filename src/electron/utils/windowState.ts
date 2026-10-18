import { BrowserWindow, Rectangle, screen } from 'electron';
import Store from 'electron-store';

export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

type WindowStateStoreSchema = {
  windowState: WindowState;
};

const DEFAULT_WINDOW_STATE: WindowState = {
  width: 900,
  height: 600,
  isMaximized: false,
  isFullScreen: false,
};

const MIN_VISIBLE_AREA = 100;

const store = new Store<WindowStateStoreSchema>({
  name: 'window-state',
  defaults: { windowState: DEFAULT_WINDOW_STATE },
});

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isVisibleOnSomeDisplay = (bounds: Rectangle): boolean =>
  screen.getAllDisplays().some(({ workArea }) => {
    const overlapWidth =
      Math.min(bounds.x + bounds.width, workArea.x + workArea.width) -
      Math.max(bounds.x, workArea.x);
    const overlapHeight =
      Math.min(bounds.y + bounds.height, workArea.y + workArea.height) -
      Math.max(bounds.y, workArea.y);

    return (
      overlapWidth >= MIN_VISIBLE_AREA && overlapHeight >= MIN_VISIBLE_AREA
    );
  });

export const loadWindowState = (): WindowState => {
  const stored = store.get('windowState');
  const state: WindowState = {
    ...DEFAULT_WINDOW_STATE,
    isMaximized: Boolean(stored?.isMaximized),
    isFullScreen: Boolean(stored?.isFullScreen),
  };

  if (isFiniteNumber(stored?.width) && stored.width >= 400) {
    state.width = stored.width;
  }

  if (isFiniteNumber(stored?.height) && stored.height >= 300) {
    state.height = stored.height;
  }

  if (isFiniteNumber(stored?.x) && isFiniteNumber(stored?.y)) {
    const bounds = {
      x: stored.x,
      y: stored.y,
      width: state.width,
      height: state.height,
    };

    // Drop the position if the saved display is no longer available
    if (isVisibleOnSomeDisplay(bounds)) {
      state.x = bounds.x;
      state.y = bounds.y;
    }
  }

  return state;
};

export const FULL_SCREEN_CHANGED_EVENT = 'event:fullScreenChanged';

export const setupFullScreenControls = (win: BrowserWindow): void => {
  win.webContents.on('before-input-event', (event, input) => {
    const isF11 = input.key === 'F11';
    // Replaces the Ctrl+Cmd+F shortcut of the macOS menu removed in packaged builds
    const isMacShortcut =
      process.platform === 'darwin' &&
      input.control &&
      input.meta &&
      input.key.toLowerCase() === 'f';

    if (input.type === 'keyDown' && (isF11 || isMacShortcut)) {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });

  const notify = () => {
    if (!win.isDestroyed()) {
      win.webContents.send(FULL_SCREEN_CHANGED_EVENT, win.isFullScreen());
    }
  };

  win.on('enter-full-screen', notify);
  win.on('leave-full-screen', notify);
};

export const trackWindowState = (win: BrowserWindow): void => {
  // Normal (restored) bounds are kept while maximized/fullscreen so they survive restarts
  let normalBounds = win.getNormalBounds();

  // macOS leaves fullscreen while closing; ignore that so the state saved on close wins
  let isClosing = false;

  const saveState = () => {
    if (win.isDestroyed() || isClosing) {
      return;
    }

    if (!win.isMaximized() && !win.isFullScreen() && !win.isMinimized()) {
      normalBounds = win.getNormalBounds();
    }

    store.set('windowState', {
      ...normalBounds,
      isMaximized: win.isMaximized(),
      isFullScreen: win.isFullScreen(),
    });
  };

  let saveTimeout: NodeJS.Timeout | null = null;
  const scheduleSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(saveState, 300);
  };

  win.on('resize', scheduleSave);
  win.on('move', scheduleSave);
  win.on('maximize', saveState);
  win.on('unmaximize', saveState);
  win.on('enter-full-screen', saveState);
  win.on('leave-full-screen', saveState);
  win.on('close', () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveState();
    isClosing = true;
  });
};
