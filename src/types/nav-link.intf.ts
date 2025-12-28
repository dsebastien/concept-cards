import type { ReactNode } from 'react'

export interface NavLink {
    to: string
    label: string
    icon: ReactNode
    color?: string
    external?: boolean
}
