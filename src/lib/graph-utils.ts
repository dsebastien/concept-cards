import type { Concept } from '@/types/concept'

export interface GraphNode {
    id: string
    name: string
    category: string
    color: string
    size: number
    aliases?: string[]
    summary?: string
    tags?: string[]
    icon?: string
}

export interface GraphLink {
    source: string
    target: string
}

export interface GraphData {
    nodes: GraphNode[]
    links: GraphLink[]
}

/**
 * Color palette for categories. Each category gets a distinct, visually
 * distinguishable color that works well on both dark and light backgrounds.
 */
export const CATEGORY_COLORS: Record<string, string> = {
    'Methods': '#3b82f6', // blue-500
    'Systems': '#8b5cf6', // violet-500
    'Tools': '#6366f1', // indigo-500
    'Principles': '#f59e0b', // amber-500
    'Techniques': '#10b981', // emerald-500
    'Frameworks': '#06b6d4', // cyan-500
    'Cognitive Biases': '#ef4444', // red-500
    'Psychology & Mental Models': '#ec4899', // pink-500
    'Philosophy & Wisdom': '#a855f7', // purple-500
    'Well-Being & Happiness': '#22c55e', // green-500
    'Decision Science': '#f97316', // orange-500
    'Business & Economics': '#14b8a6', // teal-500
    'Leadership & Management': '#0ea5e9', // sky-500
    'Learning & Education': '#eab308', // yellow-500
    'Writing & Content Creation': '#d946ef', // fuchsia-500
    'Attention & Focus': '#f43f5e', // rose-500
    'Communication': '#84cc16', // lime-500
    'Thinking': '#a78bfa', // violet-400
    'Software Development': '#2dd4bf', // teal-400
    'Productivity': '#fb923c', // orange-400
    'AI': '#818cf8', // indigo-400
    'Journaling': '#fbbf24', // amber-400
    'Concepts': '#94a3b8' // slate-400
}

const DEFAULT_COLOR = '#94a3b8'

/**
 * Builds graph data from an array of concepts.
 * Deduplicates bidirectional edges and sizes nodes by degree.
 */
export function buildGraphData(concepts: Concept[], visibleCategories?: Set<string>): GraphData {
    const conceptMap = new Map<string, Concept>()
    for (const c of concepts) {
        conceptMap.set(c.id, c)
    }

    // Filter by visible categories
    const filtered = visibleCategories
        ? concepts.filter((c) => visibleCategories.has(c.category))
        : concepts

    const filteredIds = new Set(filtered.map((c) => c.id))

    // Build links, deduplicating bidirectional edges
    const linkSet = new Set<string>()
    const links: GraphLink[] = []

    for (const concept of filtered) {
        if (!concept.relatedConcepts) continue
        for (const targetId of concept.relatedConcepts) {
            if (!filteredIds.has(targetId)) continue
            // Create canonical key to deduplicate A->B and B->A
            const key =
                concept.id < targetId ? `${concept.id}|${targetId}` : `${targetId}|${concept.id}`
            if (!linkSet.has(key)) {
                linkSet.add(key)
                links.push({ source: concept.id, target: targetId })
            }
        }
    }

    // Count degree for sizing
    const degree = new Map<string, number>()
    for (const link of links) {
        degree.set(link.source, (degree.get(link.source) || 0) + 1)
        degree.set(link.target, (degree.get(link.target) || 0) + 1)
    }

    const nodes: GraphNode[] = filtered.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        color: CATEGORY_COLORS[c.category] || DEFAULT_COLOR,
        size: Math.max(2, Math.min(12, 2 + (degree.get(c.id) || 0) * 0.5)),
        aliases: c.aliases,
        summary: c.summary,
        tags: c.tags,
        icon: c.icon
    }))

    return { nodes, links }
}

/**
 * BFS to extract a local subgraph around a concept.
 */
export function getNeighborhood(
    graphData: GraphData,
    conceptId: string,
    hops: number = 2
): GraphData {
    // Build adjacency from the full graph
    const adj = new Map<string, Set<string>>()
    for (const link of graphData.links) {
        const src = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
        const tgt = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
        if (!adj.has(src)) adj.set(src, new Set())
        if (!adj.has(tgt)) adj.set(tgt, new Set())
        adj.get(src)!.add(tgt)
        adj.get(tgt)!.add(src)
    }

    // BFS
    const visited = new Set<string>()
    const queue: { id: string; depth: number }[] = [{ id: conceptId, depth: 0 }]
    visited.add(conceptId)

    while (queue.length > 0) {
        const current = queue.shift()!
        if (current.depth >= hops) continue
        const neighbors = adj.get(current.id)
        if (!neighbors) continue
        for (const n of neighbors) {
            if (!visited.has(n)) {
                visited.add(n)
                queue.push({ id: n, depth: current.depth + 1 })
            }
        }
    }

    const nodeMap = new Map<string, GraphNode>()
    for (const node of graphData.nodes) {
        if (visited.has(node.id)) {
            nodeMap.set(node.id, node)
        }
    }

    const links = graphData.links.filter((link) => {
        const src = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
        const tgt = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
        return visited.has(src) && visited.has(tgt)
    })

    return { nodes: Array.from(nodeMap.values()), links }
}

/**
 * Search nodes by name or aliases.
 */
export function findConceptNodes(nodes: GraphNode[], query: string): GraphNode[] {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return nodes.filter(
        (n) =>
            n.name.toLowerCase().includes(lower) ||
            n.aliases?.some((a) => a.toLowerCase().includes(lower))
    )
}
