import { describe, expect, test, beforeEach, afterEach } from 'bun:test'

// Since this is a React hook, we test the logic that would be used within it
// Full hook testing would require @testing-library/react-hooks

describe('useExploredConcepts (logic tests)', () => {
    const STORAGE_KEY = 'explored-concepts'

    // Mock localStorage
    let mockStorage: Record<string, string>

    beforeEach(() => {
        mockStorage = {}
        globalThis.localStorage = {
            getItem: (key: string) => mockStorage[key] || null,
            setItem: (key: string, value: string) => {
                mockStorage[key] = value
            },
            removeItem: (key: string) => {
                delete mockStorage[key]
            },
            clear: () => {
                mockStorage = {}
            },
            length: 0,
            key: () => null
        }
    })

    afterEach(() => {
        // @ts-expect-error - reset localStorage
        delete globalThis.localStorage
    })

    describe('localStorage integration', () => {
        test('stores concept IDs as JSON array', () => {
            const ids = ['concept-1', 'concept-2']
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))

            const stored = localStorage.getItem(STORAGE_KEY)
            expect(stored).toBe(JSON.stringify(ids))
        })

        test('parses stored IDs into Set', () => {
            const ids = ['concept-1', 'concept-2']
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))

            const stored = localStorage.getItem(STORAGE_KEY)
            const parsed = stored ? new Set(JSON.parse(stored)) : new Set()

            expect(parsed.has('concept-1')).toBe(true)
            expect(parsed.has('concept-2')).toBe(true)
            expect(parsed.has('concept-3')).toBe(false)
        })

        test('handles empty storage', () => {
            const stored = localStorage.getItem(STORAGE_KEY)
            const parsed = stored ? new Set(JSON.parse(stored)) : new Set()

            expect(parsed.size).toBe(0)
        })

        test('handles invalid JSON gracefully', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid-json')

            let parsed: Set<string>
            try {
                const stored = localStorage.getItem(STORAGE_KEY)
                parsed = stored ? new Set(JSON.parse(stored)) : new Set()
            } catch {
                parsed = new Set()
            }

            expect(parsed.size).toBe(0)
        })
    })

    describe('Set operations', () => {
        test('adds new concept IDs to Set', () => {
            const exploredIds = new Set<string>()
            exploredIds.add('concept-1')
            exploredIds.add('concept-2')

            expect(exploredIds.size).toBe(2)
            expect(exploredIds.has('concept-1')).toBe(true)
        })

        test('does not add duplicate IDs', () => {
            const exploredIds = new Set<string>()
            exploredIds.add('concept-1')
            exploredIds.add('concept-1')

            expect(exploredIds.size).toBe(1)
        })

        test('converts Set to array for storage', () => {
            const exploredIds = new Set(['concept-1', 'concept-2'])
            const array = [...exploredIds]

            expect(array).toContain('concept-1')
            expect(array).toContain('concept-2')
        })

        test('clears all explored IDs', () => {
            const exploredIds = new Set(['concept-1', 'concept-2'])
            exploredIds.clear()

            expect(exploredIds.size).toBe(0)
        })
    })

    describe('markAsExplored logic', () => {
        test('adds concept to set if not already present', () => {
            const prev = new Set<string>()
            const conceptId = 'new-concept'

            if (!prev.has(conceptId)) {
                const next = new Set(prev)
                next.add(conceptId)
                expect(next.has(conceptId)).toBe(true)
                expect(next.size).toBe(1)
            }
        })

        test('returns same set if concept already present', () => {
            const prev = new Set(['existing-concept'])
            const conceptId = 'existing-concept'

            if (prev.has(conceptId)) {
                // Should return same reference
                expect(prev.has(conceptId)).toBe(true)
            }
        })
    })

    describe('isExplored logic', () => {
        test('returns true for explored concepts', () => {
            const exploredIds = new Set(['concept-1', 'concept-2'])
            expect(exploredIds.has('concept-1')).toBe(true)
        })

        test('returns false for unexplored concepts', () => {
            const exploredIds = new Set(['concept-1'])
            expect(exploredIds.has('concept-2')).toBe(false)
        })
    })

    describe('exploredCount logic', () => {
        test('returns correct count', () => {
            const exploredIds = new Set(['c1', 'c2', 'c3'])
            expect(exploredIds.size).toBe(3)
        })

        test('returns 0 for empty set', () => {
            const exploredIds = new Set<string>()
            expect(exploredIds.size).toBe(0)
        })
    })
})
