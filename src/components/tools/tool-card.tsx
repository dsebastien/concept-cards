import { useState } from 'react'
import { FaExternalLinkAlt, FaGithub, FaBook, FaStar, FaLock, FaUnlock } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ToolIcon from '@/components/tools/tool-icon'
import type { Tool, ToolStatus, StatusConfig } from '@/types/tool'

interface ToolCardProps {
    tool: Tool
    statuses: Record<ToolStatus, StatusConfig>
    onShowDetails: (tool: Tool) => void
    viewMode: 'grid' | 'list'
}

const statusColors: Record<string, string> = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, statuses, onShowDetails, viewMode }) => {
    const [isHovered, setIsHovered] = useState(false)
    const statusConfig = statuses[tool.status]

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent opening details when clicking on links
        if ((e.target as HTMLElement).closest('a')) {
            return
        }
        onShowDetails(tool)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onShowDetails(tool)
        }
    }

    if (viewMode === 'list') {
        return (
            <div
                className={cn(
                    'bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/10',
                    tool.featured && 'ring-secondary/30 ring-1'
                )}
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                tabIndex={0}
                role='button'
                aria-label={`View details for ${tool.name}`}
            >
                {/* Icon */}
                <div className='bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors'>
                    <ToolIcon icon={tool.icon} category={tool.category} size='md' />
                </div>

                {/* Content */}
                <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                        <h3 className='group-hover:text-secondary truncate font-semibold transition-colors'>
                            {tool.name}
                        </h3>
                        {tool.featured && <FaStar className='text-secondary h-3 w-3 shrink-0' />}
                        <span
                            className={cn(
                                'shrink-0 rounded-full border px-2 py-0.5 text-xs',
                                statusColors[statusConfig.color]
                            )}
                        >
                            {statusConfig.label}
                        </span>
                        {tool.free ? (
                            <FaUnlock className='h-3 w-3 shrink-0 text-green-400' title='Free' />
                        ) : (
                            <FaLock className='text-secondary h-3 w-3 shrink-0' title='Paid' />
                        )}
                    </div>
                    <p className='text-primary/60 mt-1 line-clamp-1 text-sm'>{tool.description}</p>
                </div>

                {/* Labels */}
                <div className='hidden shrink-0 gap-1 md:flex'>
                    {tool.labels.slice(0, 3).map((label) => (
                        <span
                            key={label}
                            className='bg-primary/5 text-primary/60 rounded-full px-2 py-0.5 text-xs'
                        >
                            {label}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className='flex shrink-0 gap-2'>
                    <a
                        href={tool.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary/60 hover:text-secondary rounded-lg p-2 transition-colors'
                        title='Open tool'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaExternalLinkAlt className='h-4 w-4' />
                    </a>
                    {tool.sourceCodeUrl && (
                        <a
                            href={tool.sourceCodeUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary/60 hover:text-secondary rounded-lg p-2 transition-colors'
                            title='View source code'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FaGithub className='h-4 w-4' />
                        </a>
                    )}
                </div>
            </div>
        )
    }

    // Grid view
    return (
        <div
            className={cn(
                'bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex h-full cursor-pointer flex-col rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/10',
                tool.featured && 'ring-secondary/30 ring-1',
                isHovered && 'scale-[1.01]'
            )}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            tabIndex={0}
            role='button'
            aria-label={`View details for ${tool.name}`}
        >
            {/* Featured badge */}
            {tool.featured && (
                <div className='from-secondary to-secondary/80 absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-xs font-medium text-white shadow-md'>
                    <FaStar className='h-2.5 w-2.5' />
                    Featured
                </div>
            )}

            {/* Header */}
            <div className='mb-3 flex items-start justify-between'>
                <div className='bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg transition-colors'>
                    <ToolIcon icon={tool.icon} category={tool.category} size='md' />
                </div>
                <div className='flex items-center gap-1.5'>
                    {tool.free ? (
                        <span className='flex items-center gap-1 rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400'>
                            <FaUnlock className='h-2.5 w-2.5' />
                            Free
                        </span>
                    ) : (
                        <span className='from-secondary/20 to-secondary/10 text-secondary flex items-center gap-1 rounded-full bg-gradient-to-r px-1.5 py-0.5 text-xs'>
                            <FaLock className='h-2.5 w-2.5' />
                            Paid
                        </span>
                    )}
                </div>
            </div>

            {/* Title & Status */}
            <div className='mb-1 flex items-center gap-2'>
                <h3 className='group-hover:text-secondary font-semibold transition-colors'>
                    {tool.name}
                </h3>
            </div>
            <span
                className={cn(
                    'mb-2 w-fit rounded-full border px-1.5 py-0.5 text-xs',
                    statusColors[statusConfig.color]
                )}
            >
                {statusConfig.label}
            </span>

            {/* Description */}
            <p className='text-primary/70 mb-3 line-clamp-2 flex-1 text-sm'>{tool.description}</p>

            {/* Labels */}
            <div className='mb-2 flex flex-wrap gap-1'>
                {tool.labels.slice(0, 3).map((label) => (
                    <span
                        key={label}
                        className='bg-primary/5 text-primary/70 rounded-full px-2 py-0.5 text-xs'
                    >
                        {label}
                    </span>
                ))}
                {tool.labels.length > 3 && (
                    <span className='text-primary/50 px-1 py-0.5 text-xs'>
                        +{tool.labels.length - 3}
                    </span>
                )}
            </div>

            {/* Technologies */}
            {tool.technologies.length > 0 && (
                <div className='border-primary/10 mb-3 border-t pt-2'>
                    <div className='flex flex-wrap gap-1'>
                        {tool.technologies.slice(0, 3).map((tech) => (
                            <span
                                key={tech}
                                className='border-secondary/30 text-secondary/80 rounded border px-1.5 py-0.5 text-xs'
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className='mt-auto flex items-center gap-1.5'>
                <a
                    href={tool.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-secondary hover:bg-secondary/90 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-white transition-colors'
                    onClick={(e) => e.stopPropagation()}
                >
                    <FaExternalLinkAlt className='h-3 w-3' />
                    Open
                </a>
                {tool.sourceCodeUrl && (
                    <a
                        href={tool.sourceCodeUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-primary/10 hover:bg-primary/20 text-primary/80 flex items-center justify-center rounded-lg p-2 transition-colors'
                        title='View source code'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaGithub className='h-3.5 w-3.5' />
                    </a>
                )}
                {tool.docsUrl && (
                    <a
                        href={tool.docsUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-primary/10 hover:bg-primary/20 text-primary/80 flex items-center justify-center rounded-lg p-2 transition-colors'
                        title='View documentation'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FaBook className='h-3.5 w-3.5' />
                    </a>
                )}
            </div>
        </div>
    )
}

export default ToolCard
