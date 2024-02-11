#!/usr/bin/env node
import { build, context } from 'esbuild';
import { chmodSync } from 'fs';

const watch = process.argv.slice(-1)[0] === '--watch';

const sharedBuildOptions = {
  bundle: true,
  loader: {
    '.rq': 'text',
    '.yaml': 'text',
    '.jsonld': 'json',
  },
  format: 'esm',
  lineLimit: 120,
  outdir: 'dist',
  logLevel: 'info'
};

const server = {
  ...sharedBuildOptions,
  entryPoints: ['src/server/server.js'],
  platform: 'node',
  packages: 'external',
  banner: {
    'js': '#!/usr/bin/env node'
  }
};

const serviceWorker = {
  ...sharedBuildOptions,
  entryPoints: ['src/service-worker/sw.js', 'src/service-worker/sw-loader.js'],
  platform: 'browser',
  minify: true,
  sourcemap: 'linked',
  banner: {
    'js': `const SPARQL_ENDPOINT = '${process.env.SPARQL_ENDPOINT ?? 'https://lod.humanatlas.io/sparql'}'; globalThis.global = globalThis; globalThis.window = globalThis;`
  }
};


const library = {
  ...sharedBuildOptions,
  entryPoints: ['src/library/index.js'],
  outdir: 'dist',
  platform: 'node',
  packages: 'external',
};

const all = [server, serviceWorker, library];

let ops;
if (watch) {
  ops = all.map(async (options) => (await context(options)).watch());
} else {
  ops = all.map(build);
}

await Promise.all(ops);
chmodSync('dist/server.js', '755');
