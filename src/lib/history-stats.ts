import type { Concept } from '@/types/concept'

export interface ConceptsByDate {
    date: string
    formattedDate: string
    concepts: Concept[]
}

export interface HistoryStats {
    conceptsByDate: ConceptsByDate[]
    totalConcepts: number
    uniqueDates: number
    avgPerDay: number
}

/**
 * Calculate history statistics from a list of concepts
 */
export function calculateHistoryStats(concepts: Concept[]): HistoryStats {
    const totalConcepts = concepts.length

    // Group concepts by datePublished
    const conceptsByDateMap = new Map<string, Concept[]>()

    concepts.forEach((concept) => {
        const date = concept.datePublished
        if (!conceptsByDateMap.has(date)) {
            conceptsByDateMap.set(date, [])
        }
        conceptsByDateMap.get(date)!.push(concept)
    })

    // Sort dates newest first and create array
    const sortedDates = Array.from(conceptsByDateMap.keys()).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )

    // Format dates and sort concepts within each date alphabetically
    const conceptsByDate: ConceptsByDate[] = sortedDates.map((date) => {
        const dateObj = new Date(date + 'T00:00:00')
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        const dateConcepts = conceptsByDateMap.get(date)!
        dateConcepts.sort((a, b) => a.name.localeCompare(b.name))

        return {
            date,
            formattedDate,
            concepts: dateConcepts
        }
    })

    // Count unique dates
    const uniqueDates = conceptsByDate.length

    // Calculate average concepts per day
    let avgPerDay = 0
    if (sortedDates.length > 0) {
        const earliestDate = sortedDates[sortedDates.length - 1]!
        const latestDate = sortedDates[0]!
        const daySpan =
            Math.ceil(
                (new Date(latestDate).getTime() - new Date(earliestDate).getTime()) /
                    (1000 * 60 * 60 * 24)
            ) + 1 // +1 to include both start and end dates
        avgPerDay = daySpan > 0 ? totalConcepts / daySpan : 0
    }

    return {
        conceptsByDate,
        totalConcepts,
        uniqueDates,
        avgPerDay
    }
}
