/**
 * Converts the size in bytes to a string in short notation.
 * For example, 1 -> 1 B, 1024 -> 1 KB, etc.
 * Supported sizes: B, KB, MB, GB
 * @param size the size in bytes
 */
export function convertSizeToShortNotation(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${parseFloat((size / 1024).toFixed(2))} KB`;
  if (size < 1024 * 1024 * 1024) {
    return `${parseFloat((size / (1024 * 1024)).toFixed(2))} MB`;
  }
  return `${parseFloat((size / (1024 * 1024 * 1024)).toFixed(2))} GB`;
}
