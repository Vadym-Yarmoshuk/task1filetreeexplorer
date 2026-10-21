/**
 * Builds JSON text for a chain of nested folders with one file at the bottom.
 * Builds the string directly, because JSON.stringify overflows the stack on very deep trees.
 * @param depth - Number of nested folders below the root.
 * @returns JSON text of the tree.
 */
export function deepTreeJson(depth: number): string {
  const open = '{"name":"d","type":"folder","children":[';
  const leaf = '{"name":"leaf.txt","type":"file","size":7}';
  return (
    '{"name":"root","type":"folder","children":[' +
    open.repeat(depth) +
    leaf +
    ']}'.repeat(depth + 1)
  );
}
