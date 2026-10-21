import { PATH_SEPARATOR } from './paths';
import type { FolderNode, TreeNode } from './types';

/** Validation error with the location of the invalid node. */
export interface TreeParseError {
  /** Message for the user. */
  message: string;
  /** JSON path of the invalid node, for example "$.children[0]". Missing for syntax errors. */
  location?: string;
}

/** Result of parsing and validating the input. */
export type ParseTreeResult = { ok: true; tree: FolderNode } | { ok: false; error: TreeParseError };

/** One node waiting for validation. */
interface PendingNode {
  value: unknown;
  location: string;
  /** Array that receives the validated node. Null for the root. */
  target: TreeNode[] | null;
  index: number;
  /** Names already used by siblings, to detect duplicates. Null for the root. */
  siblingNames: Set<string> | null;
}

/**
 * Parses JSON text and validates it as a directory tree.
 * @param text - JSON text from the user.
 * @returns The validated tree, or the first error found.
 */
export function parseTreeJson(text: string): ParseTreeResult {
  if (text.trim() === '') {
    return failure('Pole jest puste. Wklej JSON albo wgraj plik.');
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return failure(`Niepoprawny JSON: ${detail}`);
  }
  return validateTree(data);
}

/**
 * Validates parsed JSON as a directory tree and returns a clean copy with only known fields.
 * Uses an explicit stack, so any nesting depth works.
 * @param data - Value returned by JSON.parse.
 * @returns The validated tree, or the first error found.
 */
export function validateTree(data: unknown): ParseTreeResult {
  if (isRecord(data) && data.type === 'file') {
    return failure('Korzeń drzewa musi być folderem (type: "folder").', '$');
  }

  let root: FolderNode | null = null;
  const stack: PendingNode[] = [
    { value: data, location: '$', target: null, index: 0, siblingNames: null },
  ];

  while (stack.length > 0) {
    const { value, location, target, index, siblingNames } = stack.pop()!;

    if (!isRecord(value)) {
      return failure('Węzeł musi być obiektem.', location);
    }
    const { name, type } = value;
    if (typeof name !== 'string' || name.trim() === '') {
      return failure('Pole "name" musi być niepustym tekstem.', location);
    }
    if (name.includes(PATH_SEPARATOR)) {
      return failure(`Nazwa "${name}" nie może zawierać znaku "${PATH_SEPARATOR}".`, location);
    }
    if (siblingNames) {
      // The browser treats "." and ".." in a URL as directory steps, so such a node
      // could not be opened. The root name is not part of the path, so it may be ".".
      if (name === '.' || name === '..') {
        return failure(`Nazwa "${name}" jest niedozwolona.`, location);
      }
      if (siblingNames.has(name)) {
        return failure(`Nazwa "${name}" powtarza się w tym samym folderze.`, location);
      }
      siblingNames.add(name);
    }

    let node: TreeNode;
    if (type === 'file') {
      const { size } = value;
      if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) {
        return failure(
          `Plik "${name}": pole "size" musi być liczbą większą lub równą 0.`,
          location,
        );
      }
      if ('children' in value) {
        return failure(`Plik "${name}" nie może mieć pola "children".`, location);
      }
      node = { name, type, size };
    } else if (type === 'folder') {
      const { children } = value;
      if (!Array.isArray(children)) {
        return failure(`Folder "${name}": pole "children" musi być tablicą.`, location);
      }
      const folder: FolderNode = { name, type, children: new Array<TreeNode>(children.length) };
      const names = new Set<string>();
      // Push in reverse order, so children are validated first-to-last.
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push({
          value: children[i],
          location: `${location}.children[${i}]`,
          target: folder.children,
          index: i,
          siblingNames: names,
        });
      }
      node = folder;
    } else {
      return failure(
        `Węzeł "${name}": pole "type" musi mieć wartość "file" albo "folder".`,
        location,
      );
    }

    if (target) {
      target[index] = node;
    } else {
      root = node as FolderNode;
    }
  }

  return { ok: true, tree: root! };
}

/**
 * Checks if a value is a plain object (not null, not an array).
 * @param value - Value to check.
 * @returns True for a plain object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Creates a failed parse result.
 * @param message - Message for the user.
 * @param location - JSON path of the invalid node.
 * @returns The failed result.
 */
function failure(message: string, location?: string): ParseTreeResult {
  return { ok: false, error: location === undefined ? { message } : { message, location } };
}
