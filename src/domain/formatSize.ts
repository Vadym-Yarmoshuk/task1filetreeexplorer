const KB = 1024;
const MB = KB * 1024;

/**
 * Formats a size in bytes as a human-readable string (B / KB / MB).
 * @param bytes - Size in bytes. Must be a finite number, zero or greater.
 * @returns Formatted size with at most one decimal place, for example "1.5 KB".
 * @throws {RangeError} If bytes is negative or not finite.
 */
export function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new RangeError(`Invalid size: ${bytes}`);
  }
  if (bytes < KB) {
    return `${round(bytes)} B`;
  }
  const kilobytes = round(bytes / KB);
  // Rounding can push a value just below 1 MB up to "1024 KB"; show it as MB instead.
  if (kilobytes < 1024) {
    return `${kilobytes} KB`;
  }
  return `${round(bytes / MB)} MB`;
}

/**
 * Rounds a number to one decimal place and drops a trailing ".0".
 * @param value - Number to round.
 * @returns The rounded number.
 */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}
