// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';

export default {
  input: 'src/index.ts',
  output: {
    format: 'cjs',
    file: 'dist/index.cjs',
    globals: {
      crypto: 'crypto',
    },
  },
  plugins: [
    json(),
    nodeResolve({
      customResolveOptions: {
        moduleDirectories: ['node_modules'],
      },
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs({
      ignore: ['./native'],
      ignoreDynamicRequires: true
    }),
    typescript({ sourceMap: false }),
  ],
  external: ['better-sqlite3', '@fastify/secure-session', builtins],
};
