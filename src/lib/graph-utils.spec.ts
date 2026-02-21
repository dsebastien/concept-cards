import { describe, expect, test } from 'bun:test'
import { buildGraphData, getNeighborhood, findConceptNodes } from './graph-utils'
import type { Concept } from '@/types/concept'

function makeConcept(overrides: Partial<Concept> & { id: string }): Concept {
    return {
        name: overrides.id,
        summary: '',
        explanation: '',
        tags: [],
        category: 'Concepts',
        featured: false,
        datePublished: '2024-01-01',
        dateModified: '2024-01-01',
        ...overrides
    }
}

const conceptA = makeConcept({
    id: 'a',
    name: 'Alpha',
    category: 'Methods',
    tags: ['psychology', 'learning'],
    featured: true,
    relatedConcepts: ['b', 'c']
})

const conceptB = makeConcept({
    id: 'b',
    name: 'Beta',
    category: 'Tools',
    tags: ['psychology'],
    featured: false,
    relatedConcepts: ['a']
})

const conceptC = makeConcept({
    id: 'c',
    name: 'Charlie',
    category: 'Methods',
    tags: ['learning', 'education'],
    featured: false,
    relatedConcepts: ['a', 'd']
})

const conceptD = makeConcept({
    id: 'd',
    name: 'Delta',
    category: 'Principles',
    tags: ['philosophy'],
    featured: true,
    relatedConcepts: ['c']
})

const conceptE = makeConcept({
    id: 'e',
    name: 'Echo',
    category: 'Tools',
    tags: [],
    featured: false,
    relatedConcepts: []
})

const allConcepts = [conceptA, conceptB, conceptC, conceptD, conceptE]

describe('buildGraphData', () => {
    describe('no filters', () => {
        test('includes all concepts as nodes', () => {
            const result = buildGraphData(allConcepts)
            expect(result.nodes.length).toBe(5)
        })

        test('deduplicates bidirectional links', () => {
            // a->b and b->a should produce only one link
            const result = buildGraphData(allConcepts)
            const abLinks = result.links.filter(
                (l) =>
                    (l.source === 'a' && l.target === 'b') || (l.source === 'b' && l.target === 'a')
            )
            expect(abLinks.length).toBe(1)
        })

        test('builds correct number of links', () => {
            // Unique edges: a-b, a-c, c-d (a->b, a->c, c->d are the unique pairs)
            const result = buildGraphData(allConcepts)
            expect(result.links.length).toBe(3)
        })

        test('sets connectionCount on nodes', () => {
            const result = buildGraphData(allConcepts)
            const nodeA = result.nodes.find((n) => n.id === 'a')
            expect(nodeA?.connectionCount).toBe(2) // relatedConcepts: ['b', 'c']
        })

        test('sets featured on nodes', () => {
            const result = buildGraphData(allConcepts)
            const nodeA = result.nodes.find((n) => n.id === 'a')
            const nodeB = result.nodes.find((n) => n.id === 'b')
            expect(nodeA?.featured).toBe(true)
            expect(nodeB?.featured).toBe(false)
        })
    })

    describe('visibleCategories filter', () => {
        test('filters by visible categories', () => {
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set(['Methods'])
            })
            expect(result.nodes.length).toBe(2) // a, c
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'c'])
        })

        test('excludes links to filtered-out nodes', () => {
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set(['Methods'])
            })
            // Only a-c link should remain (b is filtered out)
            expect(result.links.length).toBe(1)
            const link = result.links[0]!
            expect([link.source, link.target].sort()).toEqual(['a', 'c'])
        })

        test('returns empty for no visible categories', () => {
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set()
            })
            expect(result.nodes.length).toBe(0)
            expect(result.links.length).toBe(0)
        })
    })

    describe('selectedTags filter (AND logic)', () => {
        test('filters concepts that have the selected tag', () => {
            const result = buildGraphData(allConcepts, {
                selectedTags: new Set(['psychology'])
            })
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'b'])
        })

        test('applies AND logic for multiple tags', () => {
            const result = buildGraphData(allConcepts, {
                selectedTags: new Set(['psychology', 'learning'])
            })
            // Only concept A has both tags
            expect(result.nodes.length).toBe(1)
            expect(result.nodes[0]!.id).toBe('a')
        })

        test('returns empty when no concepts match all tags', () => {
            const result = buildGraphData(allConcepts, {
                selectedTags: new Set(['psychology', 'philosophy'])
            })
            expect(result.nodes.length).toBe(0)
        })

        test('handles concepts with no tags', () => {
            const result = buildGraphData(allConcepts, {
                selectedTags: new Set(['nonexistent'])
            })
            expect(result.nodes.length).toBe(0)
        })
    })

    describe('featuredOnly filter', () => {
        test('filters to featured concepts only', () => {
            const result = buildGraphData(allConcepts, { featuredOnly: true })
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'd'])
        })

        test('does not filter when featuredOnly is false', () => {
            const result = buildGraphData(allConcepts, { featuredOnly: false })
            expect(result.nodes.length).toBe(5)
        })
    })

    describe('minConnections filter', () => {
        test('filters by minimum connection count', () => {
            // a has 2 relatedConcepts, b has 1, c has 2, d has 1, e has 0
            const result = buildGraphData(allConcepts, { minConnections: 2 })
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'c'])
        })

        test('includes concepts with exactly the minimum', () => {
            const result = buildGraphData(allConcepts, { minConnections: 1 })
            // a(2), b(1), c(2), d(1) — e(0) excluded
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'b', 'c', 'd'])
        })

        test('returns all when minConnections is 0', () => {
            const result = buildGraphData(allConcepts, { minConnections: 0 })
            expect(result.nodes.length).toBe(5)
        })

        test('returns empty when threshold is too high', () => {
            const result = buildGraphData(allConcepts, { minConnections: 100 })
            expect(result.nodes.length).toBe(0)
        })
    })

    describe('exploredFilter', () => {
        const exploredIds = new Set(['a', 'c'])

        test('shows all when filter is all', () => {
            const result = buildGraphData(allConcepts, {
                exploredFilter: 'all',
                exploredIds
            })
            expect(result.nodes.length).toBe(5)
        })

        test('shows only explored concepts', () => {
            const result = buildGraphData(allConcepts, {
                exploredFilter: 'explored',
                exploredIds
            })
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'c'])
        })

        test('shows only not-explored concepts', () => {
            const result = buildGraphData(allConcepts, {
                exploredFilter: 'not-explored',
                exploredIds
            })
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['b', 'd', 'e'])
        })

        test('does not filter when exploredIds is undefined', () => {
            const result = buildGraphData(allConcepts, {
                exploredFilter: 'explored'
            })
            expect(result.nodes.length).toBe(5)
        })

        test('explored with empty exploredIds returns no nodes', () => {
            const result = buildGraphData(allConcepts, {
                exploredFilter: 'explored',
                exploredIds: new Set()
            })
            expect(result.nodes.length).toBe(0)
        })

        test('not-explored with empty exploredIds returns all nodes', () => {
            const result = buildGraphData(allConcepts, {
                exploredFilter: 'not-explored',
                exploredIds: new Set()
            })
            expect(result.nodes.length).toBe(5)
        })
    })

    describe('combined filters', () => {
        test('category + tags', () => {
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set(['Methods', 'Tools']),
                selectedTags: new Set(['psychology'])
            })
            // Methods+Tools: a, b, c; then psychology: a, b
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'b'])
        })

        test('featured + category', () => {
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set(['Methods']),
                featuredOnly: true
            })
            // Methods: a, c; featured: a
            expect(result.nodes.length).toBe(1)
            expect(result.nodes[0]!.id).toBe('a')
        })

        test('tags + minConnections', () => {
            const result = buildGraphData(allConcepts, {
                selectedTags: new Set(['learning']),
                minConnections: 2
            })
            // learning: a, c; minConnections>=2: a(2), c(2)
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'c'])
        })

        test('all filters combined', () => {
            const exploredIds = new Set(['a', 'b', 'c'])
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set(['Methods', 'Tools', 'Principles']),
                selectedTags: new Set(['learning']),
                featuredOnly: false,
                minConnections: 1,
                exploredFilter: 'explored',
                exploredIds
            })
            // visible: a,b,c,d; tags(learning): a,c; minConnections>=1: a(2),c(2); explored: a,c
            expect(result.nodes.map((n) => n.id).sort()).toEqual(['a', 'c'])
        })

        test('explored + featured', () => {
            const exploredIds = new Set(['a', 'b'])
            const result = buildGraphData(allConcepts, {
                featuredOnly: true,
                exploredFilter: 'explored',
                exploredIds
            })
            // featured: a, d; explored: a, b → intersection: a
            expect(result.nodes.length).toBe(1)
            expect(result.nodes[0]!.id).toBe('a')
        })

        test('not-explored + category', () => {
            const exploredIds = new Set(['a'])
            const result = buildGraphData(allConcepts, {
                visibleCategories: new Set(['Methods']),
                exploredFilter: 'not-explored',
                exploredIds
            })
            // Methods: a, c; not-explored: c (a is explored)
            expect(result.nodes.length).toBe(1)
            expect(result.nodes[0]!.id).toBe('c')
        })
    })
})

describe('getNeighborhood', () => {
    const graphData = buildGraphData(allConcepts)

    test('returns center node', () => {
        const result = getNeighborhood(graphData, 'a', 1)
        expect(result.nodes.some((n) => n.id === 'a')).toBe(true)
    })

    test('returns 1-hop neighbors', () => {
        const result = getNeighborhood(graphData, 'a', 1)
        const ids = result.nodes.map((n) => n.id).sort()
        // a is connected to b and c
        expect(ids).toContain('b')
        expect(ids).toContain('c')
    })

    test('returns 2-hop neighbors', () => {
        const result = getNeighborhood(graphData, 'a', 2)
        const ids = result.nodes.map((n) => n.id).sort()
        // a->b, a->c, c->d
        expect(ids).toContain('d')
    })

    test('does not include unconnected nodes', () => {
        const result = getNeighborhood(graphData, 'a', 1)
        const ids = result.nodes.map((n) => n.id)
        // e is not connected to a
        expect(ids).not.toContain('e')
    })

    test('returns empty for nonexistent node', () => {
        const result = getNeighborhood(graphData, 'nonexistent', 2)
        expect(result.nodes.length).toBe(0)
        expect(result.links.length).toBe(0)
    })
})

describe('findConceptNodes', () => {
    const graphData = buildGraphData(allConcepts)
    const { nodes } = graphData

    test('finds nodes by name', () => {
        const results = findConceptNodes(nodes, 'Alpha')
        expect(results.length).toBe(1)
        expect(results[0]!.id).toBe('a')
    })

    test('finds nodes case-insensitively', () => {
        const results = findConceptNodes(nodes, 'alpha')
        expect(results.length).toBe(1)
        expect(results[0]!.id).toBe('a')
    })

    test('finds nodes by partial name', () => {
        const results = findConceptNodes(nodes, 'ha')
        // Alpha and Charlie both contain 'ha'
        const ids = results.map((n) => n.id).sort()
        expect(ids).toEqual(['a', 'c'])
    })

    test('finds nodes by alias', () => {
        const conceptWithAlias = makeConcept({
            id: 'f',
            name: 'Foxtrot',
            aliases: ['Fox', 'F-trot']
        })
        const data = buildGraphData([...allConcepts, conceptWithAlias])
        const results = findConceptNodes(data.nodes, 'Fox')
        expect(results.some((n) => n.id === 'f')).toBe(true)
    })

    test('returns empty for empty query', () => {
        const results = findConceptNodes(nodes, '')
        expect(results.length).toBe(0)
    })

    test('returns empty for whitespace query', () => {
        const results = findConceptNodes(nodes, '   ')
        expect(results.length).toBe(0)
    })

    test('returns empty for no matches', () => {
        const results = findConceptNodes(nodes, 'zzzznonexistent')
        expect(results.length).toBe(0)
    })
})
