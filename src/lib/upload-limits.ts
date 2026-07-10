/** Batch limits — tune per plan later */
export const LIMITS = {
  compress: {
    maxFiles: 20,
    maxFileBytes: 50 * 1024 * 1024,
    maxTotalBytes: 200 * 1024 * 1024,
  },
  share: {
    maxFiles: 20,
    maxFileBytes: 500 * 1024 * 1024,
    maxTotalBytes: 2 * 1024 * 1024 * 1024,
  },
  pdf: {
    maxFiles: 10,
    maxFileBytes: 50 * 1024 * 1024,
    maxTotalBytes: 150 * 1024 * 1024,
    maxPages: 200,
  },
} as const;
