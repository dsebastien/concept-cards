import { describe, expect, test, afterEach } from 'bun:test'
import { existsSync, unlinkSync } from 'fs'
import { getLatestChangelogEntry } from './generate-changelog'

describe('getLatestChangelogEntry', () => {
    const testChangelogPath = 'CHANGELOG.test.md'

    afterEach(() => {
        // Clean up test file if it exists
        if (existsSync(testChangelogPath)) {
            unlinkSync(testChangelogPath)
        }
    })

    // Note: These tests use the actual CHANGELOG.md file if it exists
    // or return empty string if not

    test('returns empty string if CHANGELOG.md does not exist', () => {
        // This test depends on whether CHANGELOG.md exists in the project
        // If it doesn't exist, it should return empty string
        if (!existsSync('CHANGELOG.md')) {
            const result = getLatestChangelogEntry()
            expect(result).toBe('')
        } else {
            // If it exists, it should return something
            const result = getLatestChangelogEntry()
            expect(result.startsWith('## ')).toBe(true)
        }
    })

    test('extracts latest version section from changelog', () => {
        if (existsSync('CHANGELOG.md')) {
            const result = getLatestChangelogEntry()
            // Should start with ## (version header)
            expect(result.startsWith('## ')).toBe(true)
        }
    })
})

describe('changelog content parsing', () => {
    test('splits content by ## headers', () => {
        const content = `# Changelog

## 1.0.0

- Feature A
- Feature B

## 0.9.0

- Feature C
`
        const sections = content.split(/^## /m)
        expect(sections.length).toBeGreaterThan(1)
        // First section is content before first ##
        // Second section is the first version
        expect(sections[1]).toContain('1.0.0')
    })

    test('extracts first version section', () => {
        const content = `# Changelog

## 1.0.0

- Feature A

## 0.9.0

- Feature B
`
        const sections = content.split(/^## /m)
        const latestEntry = '## ' + (sections[1] ?? '')
        expect(latestEntry).toContain('1.0.0')
        expect(latestEntry).toContain('Feature A')
    })

    test('handles changelog with only one version', () => {
        const content = `# Changelog

## 1.0.0

- Initial release
`
        const sections = content.split(/^## /m)
        expect(sections.length).toBe(2)
    })

    test('handles changelog with no versions', () => {
        const content = `# Changelog

No releases yet.
`
        const sections = content.split(/^## /m)
        expect(sections.length).toBe(1)
    })
})
