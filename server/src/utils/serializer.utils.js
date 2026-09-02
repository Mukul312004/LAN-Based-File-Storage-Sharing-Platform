/**
 * Converts BigInt fields in an object or array to numbers (or strings if unsafe) for JSON serialization
 */
export function formatFileMetadata(file) {
  if (!file) return null;
  if (Array.isArray(file)) {
    return file.map(formatFileMetadata);
  }

  const { fileSize, ...rest } = file;
  return {
    ...rest,
    fileSize: typeof fileSize === 'bigint' ? Number(fileSize) : fileSize,
  };
}
