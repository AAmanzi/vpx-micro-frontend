import { gt, prerelease, valid } from 'semver';

import type { AvailableUpdate } from '../../types/updates';

export const UPDATE_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
export const RELEASE_API_URL =
  'https://api.github.com/repos/AAmanzi/vpx-micro-frontend/releases/latest';
const RELEASE_PAGE_PREFIX =
  'https://github.com/AAmanzi/vpx-micro-frontend/releases/tag/';

interface UpdateCheckerOptions {
  installedVersion: string;
  getDismissedAt: () => number | undefined;
  saveDismissedAt: (timestamp: number) => void;
  fetchRelease: typeof fetch;
  now?: () => number;
}

export function parseAvailableUpdate(
  release: unknown,
  installedVersion: string,
): AvailableUpdate | null {
  if (
    !release ||
    typeof release !== 'object' ||
    !('draft' in release) ||
    !('prerelease' in release) ||
    !('tag_name' in release) ||
    !('html_url' in release) ||
    typeof release.draft !== 'boolean' ||
    typeof release.prerelease !== 'boolean' ||
    typeof release.tag_name !== 'string' ||
    typeof release.html_url !== 'string'
  ) {
    throw new Error('Invalid GitHub release data');
  }

  if (release.draft || release.prerelease) {
    return null;
  }

  const version = valid(release.tag_name);
  if (!version || !valid(installedVersion)) {
    throw new Error('Invalid release or installed app version');
  }

  const url = new URL(release.html_url);
  if (
    !url.href.startsWith(RELEASE_PAGE_PREFIX) ||
    !url.pathname.slice('/AAmanzi/vpx-micro-frontend/releases/tag/'.length) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('Invalid GitHub release URL');
  }

  if (prerelease(version) || !gt(version, installedVersion)) {
    return null;
  }

  return {
    version,
    currentVersion: installedVersion,
    releaseUrl: url.href,
  };
}

export function createUpdateChecker({
  installedVersion,
  getDismissedAt,
  saveDismissedAt,
  fetchRelease,
  now = Date.now,
}: UpdateCheckerOptions) {
  let startupCheck: Promise<AvailableUpdate | null> | undefined;

  async function fetchUpdate(): Promise<AvailableUpdate | null> {
    const dismissedAt = getDismissedAt();
    if (dismissedAt !== undefined) {
      if (!Number.isFinite(dismissedAt) || dismissedAt < 0) {
        throw new Error('Invalid update dismissal timestamp');
      }
      if (now() - dismissedAt < UPDATE_SNOOZE_MS) {
        return null;
      }
    }

    const response = await fetchRelease(RELEASE_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'VPX-Micro-Frontend',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (!response.ok) {
      throw new Error(`GitHub release check failed: HTTP ${response.status}`);
    }

    return parseAvailableUpdate(await response.json(), installedVersion);
  }

  return {
    check(): Promise<AvailableUpdate | null> {
      // Share the startup result across renderer reloads and macOS window recreation.
      startupCheck ??= fetchUpdate();
      return startupCheck;
    },
    dismiss(): void {
      saveDismissedAt(now());
      startupCheck = Promise.resolve(null);
    },
  };
}
