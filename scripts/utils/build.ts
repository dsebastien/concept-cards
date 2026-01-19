#!/usr/bin/env bun
/**
 * Build script using Bun's native bundler
 * Replaces Vite for production builds
 */

import { $ } from 'bun'
import * as fs from 'fs'
import * as path from 'path'
import { mergeConceptFiles } from './merge-concepts'

const SRC_DIR = path.join(process.cwd(), 'src')
const DIST_DIR = path.join(process.cwd(), 'dist')
const PUBLIC_DIR = path.join(process.cwd(), 'public')

console.log('🚀 Building application with Bun...\n')

// Step 0: Merge concept files into concepts.json
console.log('📚 Merging concept files...')
const conceptCount = mergeConceptFiles()
console.log(`✅ Merged ${conceptCount} concepts\n`)

// Clean dist directory
console.log('📁 Cleaning dist directory...')
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true })
}
fs.mkdirSync(DIST_DIR, { recursive: true })

// Step 1: Build CSS with Tailwind
console.log('🎨 Building CSS with Tailwind...')
await $`bunx @tailwindcss/cli -i ${path.join(SRC_DIR, 'styles/index.css')} -o ${path.join(DIST_DIR, 'assets/index.css')} --minify`
console.log('✅ CSS built successfully\n')

// Step 2: Bundle JavaScript with Bun
console.log('📦 Bundling JavaScript with Bun...')
const result = await Bun.build({
    entrypoints: [path.join(SRC_DIR, 'main.tsx')],
    outdir: path.join(DIST_DIR, 'assets'),
    target: 'browser',
    format: 'esm',
    splitting: true,
    minify: true,
    sourcemap: 'external',
    naming: {
        entry: '[dir]/[name]-[hash].[ext]',
        chunk: '[name]-[hash].[ext]',
        asset: '[name]-[hash].[ext]'
    },
    loader: {
        '.md': 'text'
    }
})

if (!result.success) {
    console.error('❌ Build failed:')
    for (const log of result.logs) {
        console.error(log)
    }
    process.exit(1)
}

const mainOutput = result.outputs.find((o) => o.kind === 'entry-point')
if (!mainOutput) {
    throw new Error('No entry point output found')
}

const jsFilename = path.basename(mainOutput.path)
console.log(`✅ JavaScript bundled: ${jsFilename}\n`)

// Step 3: Process HTML
console.log('📄 Processing HTML...')
const htmlTemplate = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf-8')
const processedHtml = htmlTemplate
    .replace(
        '<script type="module" src="/main.tsx"></script>',
        `<script type="module" src="/assets/${jsFilename}"></script>`
    )
    .replace('</head>', `    <link rel="stylesheet" href="/assets/index.css" />\n    </head>`)
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), processedHtml)
console.log('✅ HTML processed\n')

// Step 4: Copy public directory
if (fs.existsSync(PUBLIC_DIR)) {
    console.log('📁 Copying public directory...')
    await $`cp -r ${PUBLIC_DIR}/* ${DIST_DIR}/`
    console.log('✅ Public files copied\n')
}

console.log('✨ Build completed successfully!')
