import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],

    // Set root to src so index.html can live there
    root: 'src',

    build: {
        // Output to dist in root (../dist from src)
        outDir: '../dist',
        // Empty dist before building
        emptyOutDir: true
    },

    // Path aliases
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },

    // Public dir is relative to root (src), so it's at ../public
    publicDir: '../public'
})
