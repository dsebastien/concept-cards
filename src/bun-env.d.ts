/**
 * Type declarations for Bun bundler features
 * Bun supports import.meta.glob similar to Vite
 */

declare module '*.md?raw' {
    const content: string
    export default content
}

interface ImportMetaGlobOptions<Eager extends boolean = false> {
    /**
     * Import type for the glob import.
     * @default 'default'
     */
    import?: string
    /**
     * Whether to import eagerly or lazily.
     * @default false
     */
    eager?: Eager
}

interface ImportMeta {
    /**
     * Glob import pattern matching (supported by Bun bundler)
     */
    glob<T = unknown>(
        pattern: string | string[],
        options?: ImportMetaGlobOptions<false>
    ): Record<string, () => Promise<T>>
    glob<T = unknown>(
        pattern: string | string[],
        options: ImportMetaGlobOptions<true>
    ): Record<string, T>
}
