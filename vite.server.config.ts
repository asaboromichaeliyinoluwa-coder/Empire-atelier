// Bundles the Node server (and the Anthropic SDK it uses) into one file for the portable
// Windows build, so it runs on the bundled node.exe with no node_modules folder.
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  ssr: { noExternal: true, target: 'node' },
  build: {
    ssr: 'server/index.ts',
    outDir: 'server-dist',
    emptyOutDir: true,
    target: 'node22',
    rollupOptions: { output: { entryFileNames: 'server.mjs', inlineDynamicImports: true } },
  },
});
