import type { ExploredFilter } from '@/types/explored-filter.intf'

export interface ExploreFilterState {
    query: string
    hiddenCategories: string[]
    selectedTags: string[]
    featuredOnly: boolean
    minConnections: number
    exploredFilter: ExploredFilter
}

/**
 * Build URLSearchParams from explore filter state.
 * Only includes params that differ from defaults.
 */
export function buildExploreSearchParams(
    state: ExploreFilterState,
    allCategories: string[]
): URLSearchParams {
    const params = new URLSearchParams()
    const q = state.query.trim()
    if (q) params.set('q', q)

    // Only store hidden categories if some are hidden
    if (state.hiddenCategories.length > 0 && state.hiddenCategories.length < allCategories.length) {
        params.set('hide', state.hiddenCategories.join(','))
    }
    // If ALL are hidden, still store it
    if (state.hiddenCategories.length === allCategories.length) {
        params.set('hide', state.hiddenCategories.join(','))
    }

    if (state.selectedTags.length > 0) params.set('tags', state.selectedTags.join(','))
    if (state.featuredOnly) params.set('featured', '1')
    if (state.minConnections > 0) params.set('minDeg', String(state.minConnections))
    if (state.exploredFilter === 'explored') params.set('explored', '1')
    else if (state.exploredFilter === 'not-explored') params.set('explored', '0')

    return params
}

/**
 * Parse URLSearchParams into explore filter state.
 */
export function parseExploreSearchParams(
    searchParams: URLSearchParams,
    allCategories: string[]
): ExploreFilterState {
    const query = searchParams.get('q') || ''

    const hideParam = searchParams.get('hide')
    let hiddenCategories: string[] = []
    if (hideParam) {
        hiddenCategories = hideParam.split(',').filter((c) => allCategories.includes(c))
    }

    const tagsParam = searchParams.get('tags')
    const selectedTags = tagsParam ? tagsParam.split(',').filter(Boolean) : []

    const featuredOnly = searchParams.get('featured') === '1'

    const minDegParam = searchParams.get('minDeg')
    const minConnections = minDegParam ? parseInt(minDegParam, 10) || 0 : 0

    const exploredParam = searchParams.get('explored')
    let exploredFilter: ExploredFilter = 'all'
    if (exploredParam === '1') exploredFilter = 'explored'
    else if (exploredParam === '0') exploredFilter = 'not-explored'

    return {
        query,
        hiddenCategories,
        selectedTags,
        featuredOnly,
        minConnections,
        exploredFilter
    }
}
