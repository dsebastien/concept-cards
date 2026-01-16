#!/usr/bin/env bun
/**
 * Development server using Bun
 * Replaces Vite's dev server
 */

import { $ } from 'bun'
import * as path from 'path'
import * as fs from 'fs'

const SRC_DIR = path.join(process.cwd(), 'src')
const PUBLIC_DIR = path.join(process.cwd(), 'public')
const PORT = 5173

console.log('🚀 Starting development server...\n')

// Create .dev directory for compiled CSS
const devDir = path.join(SRC_DIR, '.dev')
if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true })
}

// Build CSS initially
console.log('🎨 Building CSS...')
await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${path.join(devDir, 'index.css')}`

console.log(`\n✨ Development server running at http://localhost:${PORT}\n`)

Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url)
        let filePath = url.pathname

        // Default to index.html for root and routes (SPA)
        if (filePath === '/' || !filePath.includes('.')) {
            filePath = '/index.html'
        }

        // Serve from public directory first
        const publicPath = path.join(PUBLIC_DIR, filePath)
        if (fs.existsSync(publicPath)) {
            return new Response(Bun.file(publicPath))
        }

        // Serve built CSS
        if (filePath === '/.dev/index.css') {
            return new Response(Bun.file(path.join(devDir, 'index.css')), {
                headers: { 'Content-Type': 'text/css' }
            })
        }

        // Handle main.tsx - build on demand
        if (filePath === '/main.tsx') {
            const result = await Bun.build({
                entrypoints: [path.join(SRC_DIR, 'main.tsx')],
                target: 'browser',
                format: 'esm',
                sourcemap: 'inline',
                minify: false,
                define: {
                    'process.env.NODE_ENV': '"development"'
                },
                loader: {
                    '.md': 'text'
                }
            })

            if (!result.success) {
                console.error('Build failed:', result.logs)
                return new Response('Build failed', { status: 500 })
            }

            return new Response(await result.outputs[0].text(), {
                headers: { 'Content-Type': 'application/javascript' }
            })
        }

        // Serve index.html with injected CSS link
        if (filePath === '/index.html') {
            const html = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf-8')
            const modifiedHtml = html.replace(
                '</head>',
                '    <link rel="stylesheet" href="/.dev/index.css" />\n    </head>'
            )
            return new Response(modifiedHtml, {
                headers: { 'Content-Type': 'text/html' }
            })
        }

        // Serve from src directory
        const srcPath = path.join(SRC_DIR, filePath)
        if (fs.existsSync(srcPath)) {
            return new Response(Bun.file(srcPath))
        }

        return new Response('Not found', { status: 404 })
    }
})

// Watch for CSS changes
const cssWatcher = fs.watch(
    path.join(SRC_DIR, 'styles'),
    { recursive: true },
    async (event, filename) => {
        if (filename?.endsWith('.css')) {
            console.log('🎨 CSS changed, rebuilding...')
            await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${path.join(devDir, 'index.css')}`
            console.log('✅ CSS rebuilt')
        }
    }
)

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down dev server...')
    cssWatcher.close()
    process.exit(0)
})
