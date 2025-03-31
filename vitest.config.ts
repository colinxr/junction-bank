import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths'; // Optional: if you use path aliases

export default defineConfig({
  plugins: [tsconfigPaths()], // Optional
  test: {
    globals: true, // Optional: if you want Vitest globals like describe, it, expect
    environment: 'node', // Explicitly set the environment
    // Point to your global setup file
    globalSetup: ['./test/setup/globalSetup.ts'],
    // Optional: define teardown file if you create one
    // globalTeardown: ['./test/setup/globalTeardown.ts'], // Assuming you rename or create a separate teardown file

    // It's good practice to set NODE_ENV for testing
    env: {
      NODE_ENV: 'test',
    },

    // Ensure setup/teardown timeouts are sufficient if migrations take time
    setupFiles: ['./test/setup/setup.ts'],
    testTimeout: 20000, // Default is 5000ms, increase if needed
    hookTimeout: 20000, // Increase timeout for hooks (like globalSetup) if migrations are slow

    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.git'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/setup/',
      ],
    },
  },
}); 