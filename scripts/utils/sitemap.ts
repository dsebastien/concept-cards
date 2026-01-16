/**
 * Sitemap generation utilities
 */

export interface SitemapUrl {
    loc: string
    lastmod: string
    changefreq: string
    priority: string
}

/**
 * Generate a stable, URL-safe ID from a URL string
 */
export function generateResourceId(url: string): string {
    let hash = 0
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Build sitemap XML from URLs
 */
export function buildSitemapXml(urls: SitemapUrl[]): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>
`
    return xml
}

/**
 * Create a sitemap URL entry
 */
export function createSitemapUrl(
    baseUrl: string,
    path: string,
    options: {
        lastmod?: string
        changefreq?: string
        priority?: string
    } = {}
): SitemapUrl {
    const { lastmod = getTodayDate(), changefreq = 'monthly', priority = '0.5' } = options

    return {
        loc: path ? `${baseUrl}/${path}` : baseUrl,
        lastmod,
        changefreq,
        priority
    }
}
