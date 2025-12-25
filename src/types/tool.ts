export type ToolStatus = 'active' | 'beta' | 'inactive' | 'on-hold' | 'archived' | 'retired'

export interface Tool {
    id: string
    name: string
    description: string
    labels: string[]
    category: string
    url: string
    free: boolean
    license?: string
    sourceCodeUrl?: string
    technologies: string[]
    featured: boolean
    status: ToolStatus
    coverImage?: string
    docsUrl?: string
    icon?: string // React-icon name (e.g., "SiObsidian", "FaCalendar") or URL to an image
}

export interface StatusConfig {
    label: string
    color: string
    description: string
}

export interface ToolsData {
    tools: Tool[]
    categories: string[]
    statuses: Record<ToolStatus, StatusConfig>
}
