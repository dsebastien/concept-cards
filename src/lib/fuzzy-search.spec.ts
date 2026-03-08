import { describe, expect, test } from 'bun:test'
import { fuzzyMatch, simpleFuzzySearch } from './fuzzy-search'

// ---------------------------------------------------------------------------
// fuzzyMatch – non-regression tests
// ---------------------------------------------------------------------------
describe('fuzzyMatch', () => {
    // -- basic matching --
    test('empty query matches everything', () => {
        expect(fuzzyMatch('', 'anything')).toBe(true)
        expect(fuzzyMatch('  ', 'anything')).toBe(true)
    })

    test('exact match', () => {
        expect(fuzzyMatch('Zettelkasten', 'Zettelkasten')).toBe(true)
    })

    test('case-insensitive match', () => {
        expect(fuzzyMatch('zettelkasten', 'Zettelkasten')).toBe(true)
        expect(fuzzyMatch('ZETTELKASTEN', 'Zettelkasten')).toBe(true)
        expect(fuzzyMatch('ZeTtElKaStEn', 'zettelkasten')).toBe(true)
    })

    test('substring at start', () => {
        expect(fuzzyMatch('zettel', 'Zettelkasten Method')).toBe(true)
    })

    test('substring in middle', () => {
        expect(fuzzyMatch('kasten', 'Zettelkasten')).toBe(true)
    })

    test('substring at end', () => {
        expect(fuzzyMatch('method', 'Zettelkasten Method')).toBe(true)
    })

    test('multi-word substring', () => {
        expect(fuzzyMatch('brain dump', 'A brain dump is a technique')).toBe(true)
    })

    test('trims whitespace from query', () => {
        expect(fuzzyMatch('  brain  ', 'brain dump')).toBe(true)
    })

    // -- non-matching cases (regression: these MUST NOT match) --
    test('does not match unrelated text', () => {
        expect(fuzzyMatch('zettelkasten', 'Personal Knowledge Management')).toBe(false)
    })

    test('does not match scattered characters (no subsequence matching)', () => {
        // "abc" letters exist scattered in the target, but not as a substring
        expect(fuzzyMatch('abc', 'a big cat')).toBe(false)
    })

    test('does not match transposed characters', () => {
        expect(fuzzyMatch('teh', 'the quick brown fox')).toBe(false)
    })

    test('does not match with characters spread across words', () => {
        // Old fuzzy: "brd" would match via subsequence in "brain dump reading"
        expect(fuzzyMatch('brd', 'brain dump reading')).toBe(false)
    })

    test('short query does not match everything via explanation text', () => {
        const longExplanation =
            'The Zettelkasten method is a personal knowledge management system. ' +
            'It was developed by Niklas Luhmann, a German sociologist who used it ' +
            'to write over 70 books and nearly 400 scholarly articles. The system ' +
            'relies on atomic notes connected through links, enabling emergent thinking.'
        // "xy" should NOT match just because x and y exist somewhere
        expect(fuzzyMatch('xy', longExplanation)).toBe(false)
        // "zl" should NOT match (z in Zettelkasten, l in Luhmann)
        expect(fuzzyMatch('zl', longExplanation)).toBe(false)
    })

    test('partial word match works', () => {
        expect(fuzzyMatch('prod', 'Productivity Systems')).toBe(true)
        expect(fuzzyMatch('sys', 'Productivity Systems')).toBe(true)
    })

    test('does not match reversed substring', () => {
        expect(fuzzyMatch('niarb', 'brain')).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// simpleFuzzySearch – non-regression tests
// ---------------------------------------------------------------------------
describe('simpleFuzzySearch', () => {
    interface Item {
        title: string
    }
    const items: Item[] = [
        { title: 'Zettelkasten' },
        { title: 'Personal Knowledge Management' },
        { title: 'Brain Dump' },
        { title: 'Spaced Repetition' },
        { title: 'Mind Mapping' },
        { title: 'Atomic Notes' },
        { title: 'Slip Box Method' },
        { title: 'Knowledge Graph' }
    ]
    const getText = (item: Item) => item.title

    test('empty query returns empty array', () => {
        expect(simpleFuzzySearch(items, '', getText)).toEqual([])
        expect(simpleFuzzySearch(items, '   ', getText)).toEqual([])
    })

    test('filters to matching items only', () => {
        const results = simpleFuzzySearch(items, 'knowledge', getText)
        expect(results).toHaveLength(2)
        expect(results.map((r) => r.title)).toEqual([
            'Personal Knowledge Management',
            'Knowledge Graph'
        ])
    })

    test('single match', () => {
        const results = simpleFuzzySearch(items, 'zettel', getText)
        expect(results).toHaveLength(1)
        expect(results[0]!.title).toBe('Zettelkasten')
    })

    test('no matches returns empty array', () => {
        expect(simpleFuzzySearch(items, 'quantum', getText)).toEqual([])
    })

    test('case-insensitive', () => {
        const results = simpleFuzzySearch(items, 'BRAIN', getText)
        expect(results).toHaveLength(1)
        expect(results[0]!.title).toBe('Brain Dump')
    })

    test('does not match scattered characters', () => {
        // "bsm" has chars in Brain, Spaced, Mind but shouldn't match anything
        expect(simpleFuzzySearch(items, 'bsm', getText)).toEqual([])
    })

    test('preserves original order', () => {
        const results = simpleFuzzySearch(items, 'a', getText)
        const indices = results.map((r) => items.indexOf(r))
        // indices should be sorted ascending (original order preserved)
        for (let i = 1; i < indices.length; i++) {
            expect(indices[i]!).toBeGreaterThan(indices[i - 1]!)
        }
    })

    test('limit option caps results', () => {
        const results = simpleFuzzySearch(items, 'a', getText, { limit: 2 })
        expect(results.length).toBeLessThanOrEqual(2)
    })

    test('limit of 0 returns all matches', () => {
        const allResults = simpleFuzzySearch(items, 'a', getText)
        const limitedResults = simpleFuzzySearch(items, 'a', getText, { limit: 0 })
        expect(limitedResults).toEqual(allResults)
    })
})

// ---------------------------------------------------------------------------
// Performance tests
// ---------------------------------------------------------------------------
describe('performance', () => {
    // Generate a realistic dataset similar to production (3000+ concepts)
    function generateConcepts(count: number) {
        const categories = [
            'Methods',
            'Systems',
            'Tools',
            'Principles',
            'Techniques',
            'Frameworks',
            'Psychology & Mental Models',
            'Philosophy & Wisdom',
            'Software Development',
            'AI'
        ]
        const words = [
            'knowledge',
            'management',
            'personal',
            'system',
            'thinking',
            'method',
            'brain',
            'learning',
            'memory',
            'note',
            'atomic',
            'network',
            'graph',
            'spaced',
            'repetition',
            'creative',
            'cognitive',
            'bias',
            'heuristic',
            'framework',
            'model',
            'principle',
            'strategy',
            'technique',
            'productivity',
            'focus',
            'attention',
            'decision',
            'information',
            'connection'
        ]

        return Array.from({ length: count }, (_, i) => {
            const w1 = words[i % words.length]!
            const w2 = words[(i * 7 + 3) % words.length]!
            const w3 = words[(i * 13 + 5) % words.length]!
            const cat = categories[i % categories.length]!
            return {
                id: `concept-${i}`,
                name: `${w1.charAt(0).toUpperCase() + w1.slice(1)} ${w2.charAt(0).toUpperCase() + w2.slice(1)} ${i}`,
                summary: `A ${w1} approach to ${w2} using ${w3} principles`,
                explanation:
                    `The ${w1} ${w2} concept is a foundational idea in ${cat}. ` +
                    `It involves applying ${w3} thinking to solve complex problems. ` +
                    `This approach was developed through decades of research in cognitive science ` +
                    `and has been validated across multiple domains including education, business, ` +
                    `and personal development. The key insight is that ${w1} combined with ${w2} ` +
                    `creates a powerful synergy that enhances understanding and retention. ` +
                    `Practitioners often use this alongside techniques like spaced repetition ` +
                    `and deliberate practice to achieve mastery.`,
                tags: [w1, w2, w3, 'concepts'],
                aliases: [`${w1}-${w2}`, `${w2} ${w1}`],
                category: cat,
                featured: i % 20 === 0
            }
        })
    }

    const concepts3000 = generateConcepts(3000)
    const concepts10000 = generateConcepts(10000)

    // Helper: simulate homepage filtering (same logic as home.tsx lines 200-210)
    function filterConcepts(concepts: typeof concepts3000, query: string): typeof concepts3000 {
        return concepts.filter((concept) => {
            const matchesSearch =
                fuzzyMatch(query, concept.name) ||
                fuzzyMatch(query, concept.summary) ||
                fuzzyMatch(query, concept.explanation) ||
                concept.tags.some((t) => fuzzyMatch(query, t)) ||
                concept.aliases.some((a) => fuzzyMatch(query, a))
            return matchesSearch
        })
    }

    test('fuzzyMatch: 100k calls under 50ms', () => {
        const target =
            'The Zettelkasten method is a personal knowledge management system developed by Niklas Luhmann'
        const queries = ['zettel', 'knowledge', 'xyz', 'method', 'personal', 'luhmann']

        const start = performance.now()
        for (let i = 0; i < 100_000; i++) {
            fuzzyMatch(queries[i % queries.length]!, target)
        }
        const elapsed = performance.now() - start

        expect(elapsed).toBeLessThan(50)
    })

    test('homepage filter: 3000 concepts under 10ms', () => {
        const start = performance.now()
        const results = filterConcepts(concepts3000, 'knowledge')
        const elapsed = performance.now() - start

        expect(results.length).toBeGreaterThan(0)
        expect(results.length).toBeLessThan(concepts3000.length)
        expect(elapsed).toBeLessThan(10)
    })

    test('homepage filter: 3000 concepts, short query under 10ms', () => {
        const start = performance.now()
        const results = filterConcepts(concepts3000, 'br')
        const elapsed = performance.now() - start

        expect(results.length).toBeGreaterThan(0)
        expect(elapsed).toBeLessThan(10)
    })

    test('homepage filter: 3000 concepts, no-match query under 10ms', () => {
        const start = performance.now()
        const results = filterConcepts(concepts3000, 'xyzzyplugh')
        const elapsed = performance.now() - start

        expect(results).toHaveLength(0)
        expect(elapsed).toBeLessThan(10)
    })

    test('homepage filter: 10k concepts under 30ms', () => {
        const start = performance.now()
        const results = filterConcepts(concepts10000, 'cognitive')
        const elapsed = performance.now() - start

        expect(results.length).toBeGreaterThan(0)
        expect(elapsed).toBeLessThan(30)
    })

    test('simpleFuzzySearch: 3000 items under 5ms', () => {
        const items = concepts3000.map((c) => ({ title: c.name }))

        const start = performance.now()
        const results = simpleFuzzySearch(items, 'knowledge', (item) => item.title)
        const elapsed = performance.now() - start

        expect(results.length).toBeGreaterThan(0)
        expect(elapsed).toBeLessThan(5)
    })

    test('simpleFuzzySearch: 10k items under 10ms', () => {
        const items = concepts10000.map((c) => ({ title: c.name }))

        const start = performance.now()
        const results = simpleFuzzySearch(items, 'brain', (item) => item.title)
        const elapsed = performance.now() - start

        expect(results.length).toBeGreaterThan(0)
        expect(elapsed).toBeLessThan(10)
    })

    test('rapid sequential searches (simulating typing) under 50ms total', () => {
        // Simulate user typing "knowledge" one character at a time
        const partials = [
            'k',
            'kn',
            'kno',
            'know',
            'knowl',
            'knowle',
            'knowled',
            'knowledg',
            'knowledge'
        ]

        const start = performance.now()
        for (const partial of partials) {
            filterConcepts(concepts3000, partial)
        }
        const elapsed = performance.now() - start

        expect(elapsed).toBeLessThan(50)
    })

    test('search correctly filters, not just fast', () => {
        // Ensure correctness alongside performance
        const results = filterConcepts(concepts3000, 'knowledge')

        // Every result must actually contain "knowledge" somewhere
        for (const concept of results) {
            const haystack = [
                concept.name,
                concept.summary,
                concept.explanation,
                ...concept.tags,
                ...concept.aliases
            ]
                .join(' ')
                .toLowerCase()
            expect(haystack).toContain('knowledge')
        }

        // No concept containing "knowledge" should be missing
        const missed = concepts3000.filter((c) => {
            const haystack = [c.name, c.summary, c.explanation, ...c.tags, ...c.aliases]
                .join(' ')
                .toLowerCase()
            return haystack.includes('knowledge') && !results.includes(c)
        })
        expect(missed).toHaveLength(0)
    })
})
