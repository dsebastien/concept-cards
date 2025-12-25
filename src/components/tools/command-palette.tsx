import { useState, useEffect, useRef, useMemo } from 'react'
import {
    FaSearch,
    FaExternalLinkAlt,
    FaTh,
    FaList,
    FaFilter,
    FaTimes,
    FaKeyboard
} from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ToolIcon from '@/components/tools/tool-icon'
import type { Tool } from '@/types/tool'

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    tools: Tool[]
    onShowDetails: (tool: Tool) => void
    onSetViewMode: (mode: 'grid' | 'list') => void
    onSetCategory: (category: string) => void
    categories: string[]
}

type CommandType = 'tool' | 'action' | 'category'

interface Command {
    id: string
    type: CommandType
    title: string
    subtitle?: string
    icon: React.ReactNode
    action: () => void
    tool?: Tool
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    tools,
    onShowDetails,
    onSetViewMode,
    onSetCategory,
    categories
}) => {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Build commands list
    const commands = useMemo<Command[]>(() => {
        const cmds: Command[] = []

        // Add tools
        tools.forEach((tool) => {
            cmds.push({
                id: `tool-${tool.id}`,
                type: 'tool',
                title: tool.name,
                subtitle: tool.description,
                icon: <ToolIcon icon={tool.icon} category={tool.category} size='sm' />,
                action: () => {
                    window.open(tool.url, '_blank', 'noopener,noreferrer')
                    onClose()
                },
                tool
            })
        })

        // Add view mode actions
        cmds.push({
            id: 'action-grid',
            type: 'action',
            title: 'Switch to Grid View',
            subtitle: 'Display tools in a grid layout',
            icon: <FaTh className='text-secondary h-4 w-4' />,
            action: () => {
                onSetViewMode('grid')
                onClose()
            }
        })

        cmds.push({
            id: 'action-list',
            type: 'action',
            title: 'Switch to List View',
            subtitle: 'Display tools in a list layout',
            icon: <FaList className='text-secondary h-4 w-4' />,
            action: () => {
                onSetViewMode('list')
                onClose()
            }
        })

        // Add category filters
        categories.forEach((category) => {
            cmds.push({
                id: `category-${category}`,
                type: 'category',
                title: `Filter: ${category}`,
                subtitle: `Show only ${category === 'All' ? 'all tools' : `${category} tools`}`,
                icon: <FaFilter className='text-secondary h-4 w-4' />,
                action: () => {
                    onSetCategory(category)
                    onClose()
                }
            })
        })

        return cmds
    }, [tools, categories, onSetViewMode, onSetCategory, onClose])

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) {
            return commands
        }

        const lowerQuery = query.toLowerCase()
        return commands.filter((cmd) => {
            const titleMatch = cmd.title.toLowerCase().includes(lowerQuery)
            const subtitleMatch = cmd.subtitle?.toLowerCase().includes(lowerQuery)
            const toolLabels = cmd.tool?.labels.some((l) => l.toLowerCase().includes(lowerQuery))
            const toolTech = cmd.tool?.technologies.some((t) =>
                t.toLowerCase().includes(lowerQuery)
            )
            return titleMatch || subtitleMatch || toolLabels || toolTech
        })
    }, [commands, query])

    // Reset selection when filtered results change
    useEffect(() => {
        setSelectedIndex(0)
    }, [filteredCommands])

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => {
                inputRef.current?.focus()
            }, 50)
        }
    }, [isOpen])

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex((prev) =>
                        prev < filteredCommands.length - 1 ? prev + 1 : prev
                    )
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
                    break
                case 'Enter':
                    e.preventDefault()
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action()
                    }
                    break
                case 'Escape':
                    e.preventDefault()
                    onClose()
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, filteredCommands, selectedIndex, onClose])

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    }, [selectedIndex])

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    // Group commands by type for display
    const toolCommands = filteredCommands.filter((c) => c.type === 'tool')
    const actionCommands = filteredCommands.filter((c) => c.type === 'action')
    const categoryCommands = filteredCommands.filter((c) => c.type === 'category')

    let globalIndex = 0
    const getGlobalIndex = () => globalIndex++

    return (
        <div
            className='fixed inset-0 z-[100] flex items-start justify-center bg-black/70 pt-[15vh] backdrop-blur-sm'
            onClick={handleBackdropClick}
            role='dialog'
            aria-modal='true'
            aria-label='Command palette'
        >
            <div className='bg-background border-primary/10 w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl'>
                {/* Search Input */}
                <div className='border-primary/10 flex items-center gap-3 border-b px-4 py-3'>
                    <FaSearch className='text-primary/40 h-5 w-5' />
                    <input
                        ref={inputRef}
                        type='text'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type to search tools, actions, or press 'Esc' to close..."
                        className='placeholder:text-primary/40 flex-1 bg-transparent text-lg outline-none'
                    />
                    <button
                        onClick={onClose}
                        className='text-primary/40 hover:text-primary rounded p-1 transition-colors'
                        aria-label='Close command palette'
                    >
                        <FaTimes className='h-4 w-4' />
                    </button>
                </div>

                {/* Results */}
                <div ref={listRef} className='max-h-[60vh] overflow-auto p-2'>
                    {filteredCommands.length === 0 ? (
                        <div className='text-primary/40 py-8 text-center'>
                            No results found for "{query}"
                        </div>
                    ) : (
                        <>
                            {/* Tools */}
                            {toolCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Tools
                                    </div>
                                    {toolCommands.map((cmd) => {
                                        const idx = getGlobalIndex()
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                                onShowDetails={
                                                    cmd.tool
                                                        ? () => {
                                                              onShowDetails(cmd.tool!)
                                                              onClose()
                                                          }
                                                        : undefined
                                                }
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Actions */}
                            {actionCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Actions
                                    </div>
                                    {actionCommands.map((cmd) => {
                                        const idx = getGlobalIndex()
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Categories */}
                            {categoryCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Filter by Category
                                    </div>
                                    {categoryCommands.map((cmd) => {
                                        const idx = getGlobalIndex()
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className='border-primary/10 text-primary/40 flex items-center gap-4 border-t px-4 py-2 text-xs'>
                    <span className='flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            ↑↓
                        </kbd>
                        Navigate
                    </span>
                    <span className='flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            Enter
                        </kbd>
                        Select
                    </span>
                    <span className='flex items-center gap-1'>
                        <kbd className='border-primary/20 bg-primary/5 rounded border px-1.5 py-0.5'>
                            Esc
                        </kbd>
                        Close
                    </span>
                </div>
            </div>
        </div>
    )
}

interface CommandItemProps {
    command: Command
    isSelected: boolean
    onSelect: () => void
    onClick: () => void
    onShowDetails?: () => void
}

const CommandItem: React.FC<CommandItemProps> = ({
    command,
    isSelected,
    onSelect,
    onClick,
    onShowDetails
}) => {
    return (
        <div
            className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                isSelected ? 'bg-secondary/20' : 'hover:bg-primary/5'
            )}
            onMouseEnter={onSelect}
            onClick={onClick}
            role='option'
            aria-selected={isSelected}
        >
            <div className='bg-primary/5 group-hover:bg-secondary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors'>
                {command.icon}
            </div>
            <div className='min-w-0 flex-1'>
                <div className='truncate font-medium'>{command.title}</div>
                {command.subtitle && (
                    <div className='text-primary/50 truncate text-sm'>{command.subtitle}</div>
                )}
            </div>
            {command.type === 'tool' && (
                <div className='flex shrink-0 items-center gap-2'>
                    {onShowDetails && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onShowDetails()
                            }}
                            className='text-primary/40 hover:text-secondary rounded p-1.5 transition-colors'
                            title='View details'
                        >
                            <FaKeyboard className='h-4 w-4' />
                        </button>
                    )}
                    <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                </div>
            )}
        </div>
    )
}

export default CommandPalette
