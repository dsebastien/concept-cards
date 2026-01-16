import { describe, expect, test } from 'bun:test'
import { findMapping, manualMappings } from './concept-refs'

describe('manualMappings', () => {
    test('contains plural to singular mappings', () => {
        expect(manualMappings['burnouts']).toBe('burnout')
        expect(manualMappings['anxieties']).toBe('anxiety')
    })

    test('contains typo corrections', () => {
        expect(manualMappings['timeboxing']).toBe('time-boxing')
        expect(manualMappings['first-principles-thinking']).toBe('first-principles')
    })

    test('contains conceptual mappings', () => {
        expect(manualMappings['habits']).toBe('habit-loop')
        expect(manualMappings['meditation']).toBe('mindfulness-meditation')
    })

    test('contains empty string for concepts to remove', () => {
        expect(manualMappings['self-awareness']).toBe('')
        expect(manualMappings['ethics']).toBe('')
        expect(manualMappings['buddhism']).toBe('')
    })
})

describe('findMapping', () => {
    const allConceptIds = new Set([
        'burnout',
        'habit-loop',
        'time-boxing',
        'first-principles',
        'concept-test',
        'concepts-test',
        'category'
    ])

    test('returns null for concepts to be removed', () => {
        expect(findMapping('self-awareness', allConceptIds)).toBeNull()
        expect(findMapping('ethics', allConceptIds)).toBeNull()
    })

    test('returns mapped value from manual mappings', () => {
        expect(findMapping('burnouts', allConceptIds)).toBe('burnout')
        expect(findMapping('habits', allConceptIds)).toBe('habit-loop')
    })

    test('returns null if manual mapping target does not exist', () => {
        const limitedIds = new Set(['other-concept'])
        expect(findMapping('burnouts', limitedIds)).toBeNull()
    })

    test('tries removing trailing s for plural to singular', () => {
        expect(findMapping('categories', allConceptIds)).toBe('category')
    })

    test('tries ies to y transformation', () => {
        const ids = new Set(['category'])
        expect(findMapping('categories', ids)).toBe('category')
    })

    test('tries adding s for singular to plural', () => {
        const ids = new Set(['tests'])
        expect(findMapping('test', ids)).toBe('tests')
    })

    test('tries hyphenating camelCase', () => {
        const ids = new Set(['my-concept'])
        expect(findMapping('myConcept', ids)).toBe('my-concept')
    })

    test('returns null if no mapping found', () => {
        expect(findMapping('nonexistent', allConceptIds)).toBeNull()
    })

    test('prioritizes manual mappings over automatic transformations', () => {
        // burnouts has a manual mapping to 'burnout'
        expect(findMapping('burnouts', allConceptIds)).toBe('burnout')
    })
})
