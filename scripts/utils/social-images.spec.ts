import { describe, expect, test } from 'bun:test'
import { escapeXml, truncateText, sanitizeFilename, generateSocialImageSvg } from './social-images'

describe('escapeXml', () => {
    test('escapes ampersand', () => {
        expect(escapeXml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    test('escapes less than', () => {
        expect(escapeXml('a < b')).toBe('a &lt; b')
    })

    test('escapes greater than', () => {
        expect(escapeXml('a > b')).toBe('a &gt; b')
    })

    test('escapes double quotes', () => {
        expect(escapeXml('say "hello"')).toBe('say &quot;hello&quot;')
    })

    test('escapes single quotes', () => {
        expect(escapeXml("it's fine")).toBe('it&apos;s fine')
    })

    test('escapes all special characters together', () => {
        expect(escapeXml('<a href="link">Tom & Jerry\'s</a>')).toBe(
            '&lt;a href=&quot;link&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;'
        )
    })

    test('returns unchanged text if no special characters', () => {
        expect(escapeXml('Hello World')).toBe('Hello World')
    })

    test('handles empty string', () => {
        expect(escapeXml('')).toBe('')
    })
})

describe('truncateText', () => {
    test('returns original text if under max length', () => {
        expect(truncateText('Hello', 10)).toBe('Hello')
    })

    test('returns original text if exactly at max length', () => {
        expect(truncateText('Hello', 5)).toBe('Hello')
    })

    test('truncates text over max length with ellipsis', () => {
        expect(truncateText('Hello World', 8)).toBe('Hello...')
    })

    test('handles very short max length', () => {
        expect(truncateText('Hello', 4)).toBe('H...')
    })

    test('handles empty string', () => {
        expect(truncateText('', 10)).toBe('')
    })

    test('truncates to correct length', () => {
        const result = truncateText('This is a very long concept name that needs truncating', 20)
        expect(result.length).toBe(20)
        expect(result.endsWith('...')).toBe(true)
    })
})

describe('sanitizeFilename', () => {
    test('converts to lowercase', () => {
        expect(sanitizeFilename('HELLO')).toBe('hello')
    })

    test('replaces spaces with hyphens', () => {
        expect(sanitizeFilename('Hello World')).toBe('hello-world')
    })

    test('removes special characters', () => {
        expect(sanitizeFilename('Hello!@#$%World')).toBe('hello-world')
    })

    test('preserves hyphens', () => {
        expect(sanitizeFilename('hello-world')).toBe('hello-world')
    })

    test('preserves numbers', () => {
        expect(sanitizeFilename('Test123')).toBe('test123')
    })

    test('collapses multiple hyphens', () => {
        expect(sanitizeFilename('Hello---World')).toBe('hello-world')
    })

    test('removes leading and trailing hyphens', () => {
        expect(sanitizeFilename('-hello-world-')).toBe('hello-world')
    })

    test('handles mixed input', () => {
        expect(sanitizeFilename('  Hello, World! (2024)  ')).toBe('hello-world-2024')
    })

    test('handles empty string', () => {
        expect(sanitizeFilename('')).toBe('')
    })

    test('handles Unicode characters', () => {
        expect(sanitizeFilename('Héllo Wörld')).toBe('h-llo-w-rld')
    })
})

describe('generateSocialImageSvg', () => {
    const template = '<svg><text>TEXT_GOES_HERE</text></svg>'

    test('replaces placeholder with text', () => {
        expect(generateSocialImageSvg(template, 'Hello')).toBe('<svg><text>Hello</text></svg>')
    })

    test('escapes XML characters in text', () => {
        expect(generateSocialImageSvg(template, 'Tom & Jerry')).toBe(
            '<svg><text>Tom &amp; Jerry</text></svg>'
        )
    })

    test('truncates long text', () => {
        const longText = 'This is a very long concept name that should be truncated'
        const result = generateSocialImageSvg(template, longText, 20)
        expect(result).toContain('This is a very lo...')
    })

    test('uses default max length of 50', () => {
        const longText = 'A'.repeat(60)
        const result = generateSocialImageSvg(template, longText)
        expect(result).toContain('A'.repeat(47) + '...')
    })

    test('handles empty text', () => {
        expect(generateSocialImageSvg(template, '')).toBe('<svg><text></text></svg>')
    })

    test('handles text with special characters and truncation', () => {
        const text = 'Hello <World> & "Universe" is great'
        const result = generateSocialImageSvg(template, text, 25)
        expect(result).toContain('&lt;')
        expect(result).toContain('...')
    })
})
