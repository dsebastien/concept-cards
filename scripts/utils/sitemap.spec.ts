import { describe, expect, test } from 'bun:test'
import {
    generateResourceId,
    getTodayDate,
    buildSitemapXml,
    createSitemapUrl,
    type SitemapUrl
} from './sitemap'

describe('generateResourceId', () => {
    test('generates consistent ID for same URL', () => {
        const url = 'https://example.com/resource'
        expect(generateResourceId(url)).toBe(generateResourceId(url))
    })

    test('generates different IDs for different URLs', () => {
        const id1 = generateResourceId('https://example.com/a')
        const id2 = generateResourceId('https://example.com/b')
        expect(id1).not.toBe(id2)
    })

    test('generates base-36 string', () => {
        const id = generateResourceId('https://example.com')
        expect(id).toMatch(/^[0-9a-z]+$/)
    })

    test('handles empty string', () => {
        const id = generateResourceId('')
        expect(id).toBe('0')
    })

    test('handles special characters', () => {
        const id = generateResourceId('https://example.com/path?query=value&foo=bar#hash')
        expect(id).toMatch(/^[0-9a-z]+$/)
    })
})

describe('getTodayDate', () => {
    test('returns date in YYYY-MM-DD format', () => {
        const date = getTodayDate()
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    test('returns current date', () => {
        const date = getTodayDate()
        const expected = new Date().toISOString().split('T')[0]
        expect(date).toBe(expected)
    })
})

describe('buildSitemapXml', () => {
    test('generates valid XML structure', () => {
        const urls: SitemapUrl[] = [
            {
                loc: 'https://example.com',
                lastmod: '2024-01-01',
                changefreq: 'weekly',
                priority: '1.0'
            }
        ]

        const xml = buildSitemapXml(urls)
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
        expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
        expect(xml).toContain('</urlset>')
    })

    test('includes all URL elements', () => {
        const urls: SitemapUrl[] = [
            {
                loc: 'https://example.com/page',
                lastmod: '2024-01-15',
                changefreq: 'monthly',
                priority: '0.8'
            }
        ]

        const xml = buildSitemapXml(urls)
        expect(xml).toContain('<loc>https://example.com/page</loc>')
        expect(xml).toContain('<lastmod>2024-01-15</lastmod>')
        expect(xml).toContain('<changefreq>monthly</changefreq>')
        expect(xml).toContain('<priority>0.8</priority>')
    })

    test('handles multiple URLs', () => {
        const urls: SitemapUrl[] = [
            {
                loc: 'https://example.com/a',
                lastmod: '2024-01-01',
                changefreq: 'weekly',
                priority: '1.0'
            },
            {
                loc: 'https://example.com/b',
                lastmod: '2024-01-02',
                changefreq: 'monthly',
                priority: '0.5'
            }
        ]

        const xml = buildSitemapXml(urls)
        expect(xml).toContain('<loc>https://example.com/a</loc>')
        expect(xml).toContain('<loc>https://example.com/b</loc>')
        expect(xml.match(/<url>/g)?.length).toBe(2)
    })

    test('handles empty URL array', () => {
        const xml = buildSitemapXml([])
        expect(xml).toContain('<urlset')
        expect(xml).toContain('</urlset>')
        expect(xml).not.toContain('<url>')
    })
})

describe('createSitemapUrl', () => {
    test('creates URL with path', () => {
        const url = createSitemapUrl('https://example.com', 'page')
        expect(url.loc).toBe('https://example.com/page')
    })

    test('creates URL without path', () => {
        const url = createSitemapUrl('https://example.com', '')
        expect(url.loc).toBe('https://example.com')
    })

    test('uses default values', () => {
        const url = createSitemapUrl('https://example.com', 'page')
        expect(url.changefreq).toBe('monthly')
        expect(url.priority).toBe('0.5')
    })

    test('allows custom lastmod', () => {
        const url = createSitemapUrl('https://example.com', 'page', {
            lastmod: '2024-06-15'
        })
        expect(url.lastmod).toBe('2024-06-15')
    })

    test('allows custom changefreq', () => {
        const url = createSitemapUrl('https://example.com', 'page', {
            changefreq: 'weekly'
        })
        expect(url.changefreq).toBe('weekly')
    })

    test('allows custom priority', () => {
        const url = createSitemapUrl('https://example.com', 'page', {
            priority: '1.0'
        })
        expect(url.priority).toBe('1.0')
    })

    test('combines all custom options', () => {
        const url = createSitemapUrl('https://example.com', 'page', {
            lastmod: '2024-12-01',
            changefreq: 'daily',
            priority: '0.9'
        })
        expect(url.loc).toBe('https://example.com/page')
        expect(url.lastmod).toBe('2024-12-01')
        expect(url.changefreq).toBe('daily')
        expect(url.priority).toBe('0.9')
    })
})
