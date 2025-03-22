import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'), // Path to your entry file
      name: 'MovieMatcher', // Global variable name when used in browser
      formats: ['es', 'umd'], // Output formats
      fileName: (format) => `movie-matcher.${format}.js`
    },
    rollupOptions: {
      // Mark dependencies as external so they aren't bundled
      external: ['react', 'react-dom'],
      output: {
        // Provide globals for UMD build
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});