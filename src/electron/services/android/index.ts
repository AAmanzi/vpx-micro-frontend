import http from 'http';
import https from 'https';

import type { ApiError } from 'src/types/api';

const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

const createAndroidError = (code: string, message: string): ApiError => ({
  code,
  message,
});

export const normalizeAndroidServerUrl = (rawUrl: string): URL => {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    throw createAndroidError(
      'ANDROID_INVALID_URL',
      'Android web server URL is empty.',
    );
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmedUrl)
    ? trimmedUrl
    : `http://${trimmedUrl}`;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(withProtocol);
  } catch {
    throw createAndroidError(
      'ANDROID_INVALID_URL',
      'Android web server URL is invalid.',
    );
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw createAndroidError(
      'ANDROID_INVALID_URL',
      'Android web server URL must start with http:// or https://.',
    );
  }

  parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');

  if (!parsedUrl.pathname) {
    parsedUrl.pathname = '/';
  }

  return parsedUrl;
};

const buildFilesEndpointUrl = (serverUrl: URL): URL => {
  const baseUrl = new URL(serverUrl.toString());
  baseUrl.pathname = `${baseUrl.pathname.replace(/\/?$/, '')}/`;

  const filesUrl = new URL('files', baseUrl);
  filesUrl.searchParams.set('q', '.');

  return filesUrl;
};

const pingServerUrl = async (url: URL, timeoutMs: number): Promise<void> => {
  const transport = url.protocol === 'https:' ? https : http;

  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const resolveOnce = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    const rejectOnce = (error: ApiError) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    const request = transport.request(
      url,
      {
        method: 'GET',
      },
      (response) => {
        response.resume();

        const statusCode = response.statusCode || 0;

        if (statusCode >= 200 && statusCode < 300) {
          resolveOnce();
          return;
        }

        rejectOnce(
          createAndroidError(
            'ANDROID_LIST_FAILED',
            `Android server responded with HTTP ${statusCode}.`,
          ),
        );
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy();
      rejectOnce(
        createAndroidError(
          'ANDROID_REQUEST_TIMEOUT',
          'Android server request timed out.',
        ),
      );
    });

    request.on('error', (error) => {
      rejectOnce(
        createAndroidError(
          'ANDROID_LIST_FAILED',
          error.message || 'Failed to reach Android server.',
        ),
      );
    });

    request.end();
  });
};

export const pingAndroidServer = async (
  serverUrl: string,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<void> => {
  const normalizedUrl = normalizeAndroidServerUrl(serverUrl);
  const filesEndpointUrl = buildFilesEndpointUrl(normalizedUrl);

  await pingServerUrl(filesEndpointUrl, timeoutMs);
};
