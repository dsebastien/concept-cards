/**
 * Concept data loader module.
 *
 * Loads concepts from a single JSON file for compatibility with Bun's bundler.
 * Categories are stored separately in src/data/categories.json
 */

import type { Concept, ConceptsData } from '@/types/concept'
import categories from './categories.json'
import conceptsFile from './concepts.json'

// Extract concepts from the JSON file (already sorted by name)
const concepts = conceptsFile.concepts as Concept[]

// Export the combined data structure matching ConceptsData interface
export const conceptsData: ConceptsData = {
    concepts,
    categories: categories as string[]
}

// Export individual parts for flexibility
export { concepts, categories }

// Default export for backwards compatibility
export default conceptsData
