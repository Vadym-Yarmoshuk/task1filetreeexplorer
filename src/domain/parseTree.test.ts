import { describe, expect, it } from 'vitest';
import { deepTreeJson } from '../test/fixtures';
import { parseTreeJson, validateTree } from './parseTree';
import { SAMPLE_TREE } from './sampleTree';

/**
 * Parses JSON text and returns the error, failing the test if parsing succeeds.
 * @param text - JSON text.
 * @returns The parse error.
 */
function errorOf(text: string) {
  const result = parseTreeJson(text);
  if (result.ok) {
    throw new Error('Expected a parse error');
  }
  return result.error;
}

describe('parseTreeJson', () => {
  it('accepts the example from the task', () => {
    expect(parseTreeJson(JSON.stringify(SAMPLE_TREE))).toEqual({ ok: true, tree: SAMPLE_TREE });
  });

  it('accepts an empty root folder', () => {
    const result = parseTreeJson('{"name":"root","type":"folder","children":[]}');
    expect(result.ok).toBe(true);
  });

  it('drops unknown fields', () => {
    const result = parseTreeJson(
      '{"name":"r","type":"folder","extra":1,"children":[{"name":"a","type":"file","size":1,"x":2}]}',
    );
    expect(result).toEqual({
      ok: true,
      tree: { name: 'r', type: 'folder', children: [{ name: 'a', type: 'file', size: 1 }] },
    });
  });

  it('keeps the input order of children', () => {
    const result = parseTreeJson(
      '{"name":"r","type":"folder","children":[{"name":"b","type":"file","size":1},{"name":"a","type":"file","size":2}]}',
    );
    expect(result.ok && result.tree.children.map((c) => c.name)).toEqual(['b', 'a']);
  });

  it('accepts a tree nested 100 000 levels deep', () => {
    const result = parseTreeJson(deepTreeJson(100_000));
    expect(result.ok).toBe(true);
  });

  it.each(['', '   \n '])('rejects empty input %j', (text) => {
    expect(errorOf(text).message).toMatch(/puste/);
  });

  it('rejects invalid JSON syntax', () => {
    const error = errorOf('{"name": ');
    expect(error.message).toMatch(/Niepoprawny JSON/);
    expect(error.location).toBeUndefined();
  });

  it.each([
    ['null', '$', /obiektem/],
    ['[]', '$', /obiektem/],
    ['{"name":"r","type":"file","size":1}', '$', /Korzeń/],
    ['{"type":"folder","children":[]}', '$', /"name"/],
    ['{"name":"  ","type":"folder","children":[]}', '$', /"name"/],
    ['{"name":"r","type":"dir","children":[]}', '$', /"type"/],
    ['{"name":"r","type":"folder"}', '$', /"children"/],
    ['{"name":"r","type":"folder","children":{}}', '$', /"children"/],
    ['{"name":"r","type":"folder","children":[1]}', '$.children[0]', /obiektem/],
    [
      '{"name":"r","type":"folder","children":[{"name":"a","type":"file"}]}',
      '$.children[0]',
      /"size"/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"a","type":"file","size":-1}]}',
      '$.children[0]',
      /"size"/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"a","type":"file","size":"1"}]}',
      '$.children[0]',
      /"size"/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"a","type":"file","size":1,"children":[]}]}',
      '$.children[0]',
      /"children"/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"a/b","type":"file","size":1}]}',
      '$.children[0]',
      /"\/"/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"a","type":"file","size":1},{"name":"a","type":"folder","children":[]}]}',
      '$.children[1]',
      /powtarza/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":".","type":"file","size":1}]}',
      '$.children[0]',
      /niedozwolona/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"..","type":"file","size":1}]}',
      '$.children[0]',
      /niedozwolona/,
    ],
    [
      '{"name":"r","type":"folder","children":[{"name":"s","type":"folder","children":[{"name":"x","type":"file","size":1},{"name":"y","type":"file"}]}]}',
      '$.children[0].children[1]',
      /"size"/,
    ],
  ])('rejects %s at %s', (text, location, message) => {
    const error = errorOf(text);
    expect(error.location).toBe(location);
    expect(error.message).toMatch(message);
  });

  it('allows "." as the root name, because the root is not part of any path', () => {
    expect(parseTreeJson('{"name":".","type":"folder","children":[]}').ok).toBe(true);
  });

  it('allows the same name in different folders', () => {
    const result = parseTreeJson(
      '{"name":"r","type":"folder","children":[{"name":"a","type":"folder","children":[{"name":"x","type":"file","size":1}]},{"name":"b","type":"folder","children":[{"name":"x","type":"file","size":1}]}]}',
    );
    expect(result.ok).toBe(true);
  });
});

describe('validateTree', () => {
  it('returns a copy, not the input object', () => {
    const result = validateTree(SAMPLE_TREE);
    expect(result.ok && result.tree).not.toBe(SAMPLE_TREE);
  });
});
