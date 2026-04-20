import type { ApiError, ApiResult, ApiWarning } from 'src/types/api';

export * from './config';
export * from './fileSystem';
export * from './tables';
export * from './android';

export const apiSuccess = <T>(data: T, warning?: ApiWarning): ApiResult<T> => ({
  success: true,
  data,
  warning,
});

const isApiError = (error: unknown): error is ApiError => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (
    !('code' in error) ||
    typeof (error as { code: unknown }).code !== 'string'
  ) {
    return false;
  }

  if (
    'message' in error &&
    (error as { message: unknown }).message !== undefined &&
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }

  return true;
};

export const apiFailure = <T>(
  error: ApiError | Error | unknown,
): ApiResult<T> => {
  if (isApiError(error)) {
    return {
      success: false,
      error,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN',
      message: 'Unexpected error',
    },
  };
};
