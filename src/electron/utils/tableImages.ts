import fs from 'fs/promises';
import path from 'path';

const VPS_PRIMARY_URL =
  'https://virtualpinballspreadsheet.github.io/vps-db/db/vpsdb.json';
const VPS_FALLBACK_URL = 'https://aamanzi.github.io/vps-db/db/vpsdb.json';
const DEV_DB_PATH = path.resolve(process.cwd(), 'gitignore', 'db.json');
const LOOKUP_TIMEOUT_MS = 5000;

type VpsFileRecord = {
  imgUrl?: string;
  name?: string;
  title?: string;
  fileName?: string;
  fileUrl?: string;
  url?: string;
};

type VpsRomRecord = {
  version?: string;
  name?: string;
  fileName?: string;
  fileUrl?: string;
  url?: string;
};

type VpsGameRecord = {
  name?: string;
  imgUrl?: string;
  tableFiles?: Array<VpsFileRecord>;
  romFiles?: Array<VpsRomRecord>;
};

type IndexedImageEntry = {
  imgUrl: string;
  tableKeys: Array<string>;
  romKeys: Array<string>;
};

type ImageIndex = {
  exactTableMatches: Map<string, string>;
  exactRomMatches: Map<string, string>;
  entries: Array<IndexedImageEntry>;
};

let imageIndexPromise: Promise<ImageIndex | null> | null = null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const sanitizeImageUrl = (value: unknown): string | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith('http')) {
    return null;
  }

  if (trimmedValue.includes('/undefined_')) {
    return null;
  }

  return trimmedValue;
};

const stripExtension = (value: string): string =>
  value.replace(/\.(vpx|zip|rom|directb2s|png|jpg|jpeg|webp)$/i, '');

const stripTrailingMetadata = (value: string): string =>
  value.replace(/\s*\([^)]*\)\s*$/g, '').trim();

const normalizeLookupKey = (value: string): string =>
  stripExtension(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const toCompactKey = (value: string): string =>
  normalizeLookupKey(value).replace(/\s+/g, '');

const basenameWithoutQuery = (value: string): string => {
  const normalizedValue = value.split('?')[0].split('#')[0];
  return path.basename(normalizedValue);
};

const addKey = (target: Set<string>, value: unknown): void => {
  if (!isNonEmptyString(value)) {
    return;
  }

  const normalized = toCompactKey(value);

  if (normalized) {
    target.add(normalized);
  }

  const stripped = toCompactKey(stripTrailingMetadata(value));

  if (stripped) {
    target.add(stripped);
  }
};

const pickImageUrl = (game: VpsGameRecord): string | null => {
  const directImageUrl = sanitizeImageUrl(game.imgUrl);

  if (directImageUrl) {
    return directImageUrl;
  }

  for (const tableFile of game.tableFiles ?? []) {
    const tableFileImageUrl = sanitizeImageUrl(tableFile.imgUrl);

    if (tableFileImageUrl) {
      return tableFileImageUrl;
    }
  }

  return null;
};

const indexGame = (game: VpsGameRecord): IndexedImageEntry | null => {
  const imgUrl = pickImageUrl(game);

  if (!imgUrl) {
    return null;
  }

  const tableKeys = new Set<string>();
  const romKeys = new Set<string>();

  addKey(tableKeys, game.name);

  for (const tableFile of game.tableFiles ?? []) {
    addKey(tableKeys, tableFile.name);
    addKey(tableKeys, tableFile.title);
    addKey(tableKeys, tableFile.fileName);

    if (isNonEmptyString(tableFile.fileUrl)) {
      addKey(tableKeys, basenameWithoutQuery(tableFile.fileUrl));
    }

    if (isNonEmptyString(tableFile.url)) {
      addKey(tableKeys, basenameWithoutQuery(tableFile.url));
    }
  }

  for (const romFile of game.romFiles ?? []) {
    addKey(romKeys, romFile.version);
    addKey(romKeys, romFile.name);
    addKey(romKeys, romFile.fileName);

    if (isNonEmptyString(romFile.fileUrl)) {
      addKey(romKeys, basenameWithoutQuery(romFile.fileUrl));
    }

    if (isNonEmptyString(romFile.url)) {
      addKey(romKeys, basenameWithoutQuery(romFile.url));
    }
  }

  if (tableKeys.size === 0 && romKeys.size === 0) {
    return null;
  }

  return {
    imgUrl,
    tableKeys: Array.from(tableKeys),
    romKeys: Array.from(romKeys),
  };
};

const normalizeDatabasePayload = (payload: unknown): Array<VpsGameRecord> => {
  if (Array.isArray(payload)) {
    return payload as Array<VpsGameRecord>;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'games' in payload &&
    Array.isArray((payload as { games?: unknown }).games)
  ) {
    return (payload as { games: Array<VpsGameRecord> }).games;
  }

  return [];
};

const createImageIndex = (games: Array<VpsGameRecord>): ImageIndex => {
  const exactTableMatches = new Map<string, string>();
  const exactRomMatches = new Map<string, string>();
  const entries = games
    .map(indexGame)
    .filter((entry): entry is IndexedImageEntry => Boolean(entry));

  for (const entry of entries) {
    for (const tableKey of entry.tableKeys) {
      if (!exactTableMatches.has(tableKey)) {
        exactTableMatches.set(tableKey, entry.imgUrl);
      }
    }

    for (const romKey of entry.romKeys) {
      if (!exactRomMatches.has(romKey)) {
        exactRomMatches.set(romKey, entry.imgUrl);
      }
    }
  }

  return {
    exactTableMatches,
    exactRomMatches,
    entries,
  };
};

const fetchJsonWithTimeout = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const loadDevelopmentDatabase = async (): Promise<Array<VpsGameRecord> | null> => {
  try {
    const fileContents = await fs.readFile(DEV_DB_PATH, 'utf8');
    return normalizeDatabasePayload(JSON.parse(fileContents));
  } catch {
    return null;
  }
};

const loadRemoteDatabase = async (): Promise<Array<VpsGameRecord> | null> => {
  for (const url of [VPS_PRIMARY_URL, VPS_FALLBACK_URL]) {
    try {
      const payload = await fetchJsonWithTimeout(url);
      const games = normalizeDatabasePayload(payload);

      if (games.length > 0) {
        return games;
      }
    } catch (error) {
      console.warn(`Failed to load VPS database from ${url}:`, error);
    }
  }

  return null;
};

const loadImageIndex = async (): Promise<ImageIndex | null> => {
  const developmentGames = await loadDevelopmentDatabase();

  if (developmentGames && developmentGames.length > 0) {
    return createImageIndex(developmentGames);
  }

  const remoteGames = await loadRemoteDatabase();

  if (!remoteGames || remoteGames.length === 0) {
    return null;
  }

  return createImageIndex(remoteGames);
};

const getImageIndex = async (): Promise<ImageIndex | null> => {
  if (!imageIndexPromise) {
    imageIndexPromise = loadImageIndex();
  }

  return imageIndexPromise;
};

const hasLooseMatch = (
  candidateKeys: Array<string>,
  availableKeys: Array<string>,
): boolean => {
  for (const candidateKey of candidateKeys) {
    if (candidateKey.length < 5) {
      continue;
    }

    for (const availableKey of availableKeys) {
      if (
        availableKey === candidateKey ||
        availableKey.includes(candidateKey) ||
        candidateKey.includes(availableKey)
      ) {
        return true;
      }
    }
  }

  return false;
};

export const lookupTableImageUrl = async ({
  tableName,
  vpxFileName,
  romFileName,
}: {
  tableName: string;
  vpxFileName?: string;
  romFileName?: string;
}): Promise<string | undefined> => {
  const imageIndex = await getImageIndex();

  if (!imageIndex) {
    return undefined;
  }

  const exactTableKeys = [tableName, stripTrailingMetadata(tableName), vpxFileName]
    .filter(isNonEmptyString)
    .map((value) => toCompactKey(value));
  const exactRomKeys = [romFileName]
    .filter(isNonEmptyString)
    .map((value) => toCompactKey(value));

  for (const exactRomKey of exactRomKeys) {
    const exactRomMatch = imageIndex.exactRomMatches.get(exactRomKey);

    if (exactRomMatch) {
      return exactRomMatch;
    }
  }

  for (const exactTableKey of exactTableKeys) {
    const exactTableMatch = imageIndex.exactTableMatches.get(exactTableKey);

    if (exactTableMatch) {
      return exactTableMatch;
    }
  }

  const fuzzyTableKeys = exactTableKeys.filter(Boolean);

  for (const entry of imageIndex.entries) {
    if (hasLooseMatch(fuzzyTableKeys, entry.tableKeys)) {
      return entry.imgUrl;
    }
  }

  for (const entry of imageIndex.entries) {
    if (hasLooseMatch(exactRomKeys, entry.romKeys)) {
      return entry.imgUrl;
    }
  }

  return undefined;
};
