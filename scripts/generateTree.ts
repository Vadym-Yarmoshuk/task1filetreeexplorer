/**
 * Generates a large example tree as a JSON file.
 *
 * Usage:
 *   npm run generate:tree -- [--depth 4] [--folders 10] [--files 4] [--out examples/generated/large.json]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { countGeneratedNodes, generateTree } from '../src/domain/generateTree';

const { values } = parseArgs({
  options: {
    depth: { type: 'string', default: '4' },
    folders: { type: 'string', default: '10' },
    files: { type: 'string', default: '4' },
    out: { type: 'string', default: 'examples/generated/large.json' },
  },
});

const options = {
  depth: Number(values.depth),
  foldersPerFolder: Number(values.folders),
  filesPerFolder: Number(values.files),
};

if (Object.values(options).some((value) => !Number.isInteger(value) || value < 0)) {
  console.error('--depth, --folders and --files must be integers, zero or greater.');
  process.exit(1);
}

const nodeCount = countGeneratedNodes(options);
console.log(`Generating ${nodeCount.toLocaleString('en-US')} nodes...`);

mkdirSync(dirname(values.out), { recursive: true });
writeFileSync(values.out, JSON.stringify(generateTree(options)));
console.log(`Saved to ${values.out}`);
