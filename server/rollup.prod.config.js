// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    globals: {
      crypto: 'crypto'
    }
  },
  plugins: [
    json(),
    resolve({
      customResolveOptions: {
        moduleDirectories: ['node_modules']
      },
      preferBuiltins: true,
      exportConditions: ["node"]
    }),
    commonjs({
      ignore: ['pg-native' , './native']
    }),
    typescript({sourceMap: false})
  ],
  external: builtins,
};
