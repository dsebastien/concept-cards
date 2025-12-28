import type { Concept } from './concept.intf'

export interface ExtractedResource {
    id: string
    title: string
    url: string
    type?: string
    concepts: Concept[]
}
