import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './', // Root domain or subfolder, without rewriting asset URLs.
  build: { target: 'es2022' },
});
