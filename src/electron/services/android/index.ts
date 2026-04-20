import http from 'http';
import https from 'https';

import type { ApiError } from 'src/types/api';

const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

const createAndroidError = (code: string, message: string): ApiError => ({
  code,
  message,
});

export interface AndroidRemoteFile {
  name: string;
  ext: string;
  isDir: boolean;
  size: number;
}

const normalizeAndroidServerUrl = (rawUrl: string): URL => {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    throw Error('Android web server URL is empty.');
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmedUrl)
    ? trimmedUrl
    : `http://${trimmedUrl}`;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(withProtocol);
  } catch {
    throw Error('Android web server URL is invalid.');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw Error('Android web server URL must start with http:// or https://.');
  }

  parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');

  if (!parsedUrl.pathname) {
    parsedUrl.pathname = '/';
  }

  return parsedUrl;
};

type HttpMethod = 'GET' | 'POST' | 'DELETE';

const androidApiRequest = async (
  url: URL,
  method: HttpMethod = 'GET',
  body?: Buffer,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<string> => {
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const chunks: Buffer[] = [];

    const resolveOnce = (responseBody: string) => {
      if (!settled) {
        settled = true;
        resolve(responseBody);
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
        method,
        headers: body ? { 'Content-Length': body.length } : undefined,
      },
      (response) => {
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on('end', () => {
          const statusCode = response.statusCode || 0;
          const responseBody = Buffer.concat(chunks).toString('utf8');

          if (statusCode >= 200 && statusCode < 300) {
            resolveOnce(responseBody);
            return;
          }

          rejectOnce(
            createAndroidError(
              'ANDROID_LIST_FAILED',
              `Android server responded with HTTP ${statusCode}.`,
            ),
          );
        });
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

    if (body) {
      request.write(body);
    }

    request.end();
  });
};

export const getAndroidFiles = async (
  serverUrl: string,
  query: string = '.',
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<AndroidRemoteFile[]> => {
  const normalizedUrl = normalizeAndroidServerUrl(serverUrl);
  const filesUrl = new URL(
    `${normalizedUrl.toString().replace(/\/?$/, '/')}files`,
  );
  filesUrl.searchParams.set('q', query);

  const responseBody = await androidApiRequest(
    filesUrl,
    'GET',
    undefined,
    timeoutMs,
  );

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseBody);
  } catch {
    throw createAndroidError(
      'ANDROID_INVALID_RESPONSE',
      'Expected JSON array from /files endpoint.',
    );
  }

  if (!Array.isArray(parsed)) {
    throw createAndroidError(
      'ANDROID_INVALID_RESPONSE',
      'Expected JSON array from /files endpoint.',
    );
  }

  return (parsed as unknown[]).map((item, index) => {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof (item as Record<string, unknown>).name !== 'string' ||
      typeof (item as Record<string, unknown>).ext !== 'string' ||
      typeof (item as Record<string, unknown>).isDir !== 'boolean' ||
      typeof (item as Record<string, unknown>).size !== 'number'
    ) {
      throw createAndroidError(
        'ANDROID_INVALID_RESPONSE',
        `Item at index ${index} has unexpected shape.`,
      );
    }

    const f = item as Record<string, unknown>;

    return {
      name: f.name as string,
      ext: f.ext as string,
      isDir: f.isDir as boolean,
      size: f.size as number,
    };
  });
};

export const deleteAndroidFile = async (
  serverUrl: string,
  remotePath: string,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<void> => {
  const normalizedUrl = normalizeAndroidServerUrl(serverUrl);
  const deleteUrl = new URL(
    `${normalizedUrl.toString().replace(/\/?$/, '/')}delete`,
  );
  deleteUrl.searchParams.set('q', remotePath);

  await androidApiRequest(deleteUrl, 'DELETE', undefined, timeoutMs);
};

export const uploadAndroidFile = async (
  serverUrl: string,
  remotePath: string,
  fileData: Buffer | Uint8Array,
  offset: number = 0,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<void> => {
  const normalizedUrl = normalizeAndroidServerUrl(serverUrl);
  const uploadUrl = new URL(
    `${normalizedUrl.toString().replace(/\/?$/, '/')}upload`,
  );
  uploadUrl.searchParams.set('q', remotePath);
  uploadUrl.searchParams.set('offset', String(Math.floor(offset)));

  const body = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);

  await androidApiRequest(uploadUrl, 'POST', body, timeoutMs);
};

export const pingAndroidServer = async (
  serverUrl: string,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<void> => {
  await getAndroidFiles(serverUrl, '.', timeoutMs);
};
