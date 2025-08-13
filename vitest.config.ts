/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                'dist/',
                '**/*.test.*',
                '**/*.spec.*'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80
            }
        },
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['node_modules/', 'dist/', '.git/']
    }
})
