import { describe, expect, it } from 'vitest';
import { buildIndex } from '../domain/buildIndex';
import { parseTreeJson } from '../domain/parseTree';
import { SAMPLE_TREE } from '../domain/sampleTree';

// Example files from the examples/ folder, as raw text.
const examples = import.meta.glob<string>('../../examples/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/**
 * Reads an example file.
 * @param name - File name in the examples/ folder.
 * @returns The file content.
 */
function example(name: string): string {
  const text = examples[`../../examples/${name}`];
  if (text === undefined) {
    throw new Error(`Example ${name} not found`);
  }
  return text;
}

describe('example files', () => {
  it('basic.json is the example from the task', () => {
    expect(parseTreeJson(example('basic.json'))).toEqual({ ok: true, tree: SAMPLE_TREE });
  });

  it('web-project.json is valid', () => {
    const result = parseTreeJson(example('web-project.json'));
    if (!result.ok) throw new Error(result.error.message);
    const index = buildIndex(result.tree);
    expect(index.nodes.has('src/i18n/zażółć gęślą jaźń.txt')).toBe(true);
    expect(index.nodes.get('src/utils')).toMatchObject({ type: 'folder', size: 0 });
  });

  it.each([
    ['invalid-missing-size.json', /"size"/, '$.children[0].children[1]'],
    ['invalid-duplicate-name.json', /powtarza/, '$.children[1]'],
    ['invalid-syntax.json', /Niepoprawny JSON/, undefined],
  ])('%s gives the expected error', (name, message, location) => {
    const result = parseTreeJson(example(name));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(message);
      expect(result.error.location).toBe(location);
    }
  });
});
