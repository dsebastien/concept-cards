import { describe, expect, test } from 'bun:test'
import { buildExploreSearchParams, parseExploreSearchParams } from './explore-params'
import type { ExploreFilterState } from './explore-params'

const ALL_CATEGORIES = ['Methods', 'Systems', 'Tools', 'Principles', 'Techniques']

const DEFAULT_STATE: ExploreFilterState = {
    query: '',
    hiddenCategories: [],
    selectedTags: [],
    featuredOnly: false,
    minConnections: 0,
    exploredFilter: 'all'
}

describe('buildExploreSearchParams', () => {
    test('returns empty params for default state', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        expect(params.toString()).toBe('')
    })

    test('sets q param for search query', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, query: 'test query' },
            ALL_CATEGORIES
        )
        expect(params.get('q')).toBe('test query')
    })

    test('trims whitespace from query', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, query: '  hello  ' },
            ALL_CATEGORIES
        )
        expect(params.get('q')).toBe('hello')
    })

    test('omits q param for empty/whitespace query', () => {
        const params = buildExploreSearchParams({ ...DEFAULT_STATE, query: '   ' }, ALL_CATEGORIES)
        expect(params.has('q')).toBe(false)
    })

    test('sets hide param for hidden categories', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, hiddenCategories: ['Methods', 'Tools'] },
            ALL_CATEGORIES
        )
        expect(params.get('hide')).toBe('Methods,Tools')
    })

    test('sets hide param when all categories hidden', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, hiddenCategories: [...ALL_CATEGORIES] },
            ALL_CATEGORIES
        )
        expect(params.get('hide')).toBe(ALL_CATEGORIES.join(','))
    })

    test('omits hide param when no categories hidden', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        expect(params.has('hide')).toBe(false)
    })

    test('sets tags param for selected tags', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, selectedTags: ['psychology', 'learning'] },
            ALL_CATEGORIES
        )
        expect(params.get('tags')).toBe('psychology,learning')
    })

    test('omits tags param when no tags selected', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        expect(params.has('tags')).toBe(false)
    })

    test('sets featured param when featured only', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, featuredOnly: true },
            ALL_CATEGORIES
        )
        expect(params.get('featured')).toBe('1')
    })

    test('omits featured param when not featured only', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        expect(params.has('featured')).toBe(false)
    })

    test('sets minDeg param for min connections', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, minConnections: 5 },
            ALL_CATEGORIES
        )
        expect(params.get('minDeg')).toBe('5')
    })

    test('omits minDeg param when 0', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        expect(params.has('minDeg')).toBe(false)
    })

    test('sets explored=1 for explored filter', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, exploredFilter: 'explored' },
            ALL_CATEGORIES
        )
        expect(params.get('explored')).toBe('1')
    })

    test('sets explored=0 for not-explored filter', () => {
        const params = buildExploreSearchParams(
            { ...DEFAULT_STATE, exploredFilter: 'not-explored' },
            ALL_CATEGORIES
        )
        expect(params.get('explored')).toBe('0')
    })

    test('omits explored param for all filter', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        expect(params.has('explored')).toBe(false)
    })

    test('sets multiple params together', () => {
        const params = buildExploreSearchParams(
            {
                query: 'search',
                hiddenCategories: ['Methods'],
                selectedTags: ['psychology'],
                featuredOnly: true,
                minConnections: 3,
                exploredFilter: 'not-explored'
            },
            ALL_CATEGORIES
        )
        expect(params.get('q')).toBe('search')
        expect(params.get('hide')).toBe('Methods')
        expect(params.get('tags')).toBe('psychology')
        expect(params.get('featured')).toBe('1')
        expect(params.get('minDeg')).toBe('3')
        expect(params.get('explored')).toBe('0')
    })
})

describe('parseExploreSearchParams', () => {
    test('returns defaults for empty params', () => {
        const params = new URLSearchParams()
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state).toEqual(DEFAULT_STATE)
    })

    test('parses q param', () => {
        const params = new URLSearchParams('q=test+query')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.query).toBe('test query')
    })

    test('parses hide param', () => {
        const params = new URLSearchParams('hide=Methods,Tools')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.hiddenCategories).toEqual(['Methods', 'Tools'])
    })

    test('filters out invalid categories from hide param', () => {
        const params = new URLSearchParams('hide=Methods,InvalidCategory')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.hiddenCategories).toEqual(['Methods'])
    })

    test('parses tags param', () => {
        const params = new URLSearchParams('tags=psychology,learning')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.selectedTags).toEqual(['psychology', 'learning'])
    })

    test('filters empty tags', () => {
        const params = new URLSearchParams('tags=psychology,,learning,')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.selectedTags).toEqual(['psychology', 'learning'])
    })

    test('parses featured param', () => {
        const params = new URLSearchParams('featured=1')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.featuredOnly).toBe(true)
    })

    test('featured defaults to false for non-1 values', () => {
        const params = new URLSearchParams('featured=yes')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.featuredOnly).toBe(false)
    })

    test('parses minDeg param', () => {
        const params = new URLSearchParams('minDeg=5')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.minConnections).toBe(5)
    })

    test('defaults minDeg to 0 for invalid values', () => {
        const params = new URLSearchParams('minDeg=abc')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.minConnections).toBe(0)
    })

    test('parses explored=1 as explored', () => {
        const params = new URLSearchParams('explored=1')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.exploredFilter).toBe('explored')
    })

    test('parses explored=0 as not-explored', () => {
        const params = new URLSearchParams('explored=0')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.exploredFilter).toBe('not-explored')
    })

    test('defaults explored to all for unknown values', () => {
        const params = new URLSearchParams('explored=maybe')
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state.exploredFilter).toBe('all')
    })

    test('parses all params together', () => {
        const params = new URLSearchParams(
            'q=search&hide=Methods&tags=psychology&featured=1&minDeg=3&explored=0'
        )
        const state = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(state).toEqual({
            query: 'search',
            hiddenCategories: ['Methods'],
            selectedTags: ['psychology'],
            featuredOnly: true,
            minConnections: 3,
            exploredFilter: 'not-explored'
        })
    })
})

describe('roundtrip: build then parse', () => {
    test('roundtrips default state', () => {
        const params = buildExploreSearchParams(DEFAULT_STATE, ALL_CATEGORIES)
        const parsed = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(parsed).toEqual(DEFAULT_STATE)
    })

    test('roundtrips complex state', () => {
        const state: ExploreFilterState = {
            query: 'test',
            hiddenCategories: ['Methods', 'Tools'],
            selectedTags: ['psychology', 'learning'],
            featuredOnly: true,
            minConnections: 5,
            exploredFilter: 'not-explored'
        }
        const params = buildExploreSearchParams(state, ALL_CATEGORIES)
        const parsed = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(parsed).toEqual(state)
    })

    test('roundtrips explored filter', () => {
        const state: ExploreFilterState = {
            ...DEFAULT_STATE,
            exploredFilter: 'explored'
        }
        const params = buildExploreSearchParams(state, ALL_CATEGORIES)
        const parsed = parseExploreSearchParams(params, ALL_CATEGORIES)
        expect(parsed.exploredFilter).toBe('explored')
    })
})
