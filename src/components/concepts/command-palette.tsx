import { useState, useEffect, useRef, useMemo } from 'react'
import {
    FaSearch,
    FaTh,
    FaList,
    FaFilter,
    FaTimes,
    FaInfoCircle,
    FaCheckCircle
} from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { CommandPaletteProps } from '@/types/command-palette-props.intf'
import type { Command } from '@/types/command.intf'

const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    concepts,
    onShowDetails,
    onSetViewMode,
    onSetCategory,
    categories,
    isExplored
}) => {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    // Build commands list
    const commands = useMemo<Command[]>(() => {
        const cmds: Command[] = []

        // Add concepts
        concepts.forEach((concept) => {
            cmds.push({
                id: `concept-${concept.id}`,
                type: 'concept',
                title: concept.name,
                subtitle: concept.summary,
                icon: <ConceptIcon icon={concept.icon} category={concept.category} size='sm' />,
                action: () => {
                    onShowDetails(concept)
                    onClose()
                },
                concept
            })
        })

        // Add view mode actions
        cmds.push({
            id: 'action-grid',
            type: 'action',
            title: 'Switch to Grid View',
            subtitle: 'Display concepts in a grid layout',
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
            subtitle: 'Display concepts in a list layout',
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
                subtitle: `Show only ${category === 'All' ? 'all concepts' : `${category} concepts`}`,
                icon: <FaFilter className='text-secondary h-4 w-4' />,
                action: () => {
                    onSetCategory(category)
                    onClose()
                }
            })
        })

        return cmds
    }, [concepts, categories, onShowDetails, onSetViewMode, onSetCategory, onClose])

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!query.trim()) {
            return commands
        }

        const lowerQuery = query.toLowerCase()
        return commands.filter((cmd) => {
            const titleMatch = cmd.title.toLowerCase().includes(lowerQuery)
            const subtitleMatch = cmd.subtitle?.toLowerCase().includes(lowerQuery)
            const conceptTags = cmd.concept?.tags.some((t) => t.toLowerCase().includes(lowerQuery))
            const conceptAliases = cmd.concept?.aliases?.some((a) =>
                a.toLowerCase().includes(lowerQuery)
            )
            return titleMatch || subtitleMatch || conceptTags || conceptAliases
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
    const conceptCommands = filteredCommands.filter((c) => c.type === 'concept')
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
                        placeholder="Type to search concepts, actions, or press 'Esc' to close..."
                        className='placeholder:text-primary/40 flex-1 bg-transparent text-lg outline-none'
                    />
                    <button
                        onClick={onClose}
                        className='text-primary/40 hover:text-primary cursor-pointer rounded p-1 transition-colors'
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
                            {/* Concepts */}
                            {conceptCommands.length > 0 && (
                                <div className='mb-2'>
                                    <div className='text-primary/40 px-3 py-1.5 text-xs font-medium tracking-wider uppercase'>
                                        Concepts
                                    </div>
                                    {conceptCommands.map((cmd) => {
                                        const idx = getGlobalIndex()
                                        return (
                                            <CommandItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                isExplored={
                                                    cmd.concept ? isExplored(cmd.concept.id) : false
                                                }
                                                onSelect={() => setSelectedIndex(idx)}
                                                onClick={() => cmd.action()}
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
    isExplored?: boolean
    onSelect: () => void
    onClick: () => void
}

const CommandItem: React.FC<CommandItemProps> = ({
    command,
    isSelected,
    isExplored = false,
    onSelect,
    onClick
}) => {
    return (
        <div
            className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                isSelected ? 'bg-secondary/20' : 'hover:bg-primary/5',
                isExplored && 'bg-green-500/5'
            )}
            onMouseEnter={onSelect}
            onClick={onClick}
            role='option'
            aria-selected={isSelected}
        >
            <div
                className={cn(
                    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isExplored
                        ? 'bg-green-500/20 group-hover:bg-green-500/30'
                        : 'bg-primary/5 group-hover:bg-secondary/10'
                )}
            >
                {command.icon}
                {isExplored && (
                    <FaCheckCircle className='absolute -right-1 -bottom-1 h-3.5 w-3.5 text-green-500' />
                )}
            </div>
            <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                    <span className='truncate font-medium'>{command.title}</span>
                    {isExplored && (
                        <span className='shrink-0 rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400'>
                            Explored
                        </span>
                    )}
                </div>
                {command.subtitle && (
                    <div className='text-primary/50 truncate text-sm'>{command.subtitle}</div>
                )}
            </div>
            {command.type === 'concept' && (
                <div className='flex shrink-0 items-center gap-2'>
                    <FaInfoCircle className='text-primary/40 h-3 w-3' />
                </div>
            )}
        </div>
    )
}

export default CommandPalette
