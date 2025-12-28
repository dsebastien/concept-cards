import type { ReactNode } from 'react'
import type { CommandType } from './command-type.intf'
import type { Concept } from './concept.intf'

export interface Command {
    id: string
    type: CommandType
    title: string
    subtitle?: string
    icon: ReactNode
    action: () => void
    concept?: Concept
}
