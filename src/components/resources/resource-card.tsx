import { memo, useCallback } from 'react'
import { FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa'
import type { ExtractedResource } from '@/types/extracted-resource.intf'

export type ResourceType = 'book' | 'article' | 'reference' | 'note'

interface ResourceCardProps {
    resource: ExtractedResource
    resourceType: ResourceType
    onShowDetails: (resource: ExtractedResource) => void
    colorClass: string
    icon: React.ReactNode
}

const typeLabels: Record<string, string> = {
    paper: 'Paper',
    website: 'Website',
    video: 'Video',
    podcast: 'Podcast',
    other: 'Other'
}

const ResourceCard: React.FC<ResourceCardProps> = memo(
    ({ resource, onShowDetails, colorClass, icon }) => {
        const handleCardClick = useCallback(() => {
            onShowDetails(resource)
        }, [onShowDetails, resource])

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onShowDetails(resource)
                }
            },
            [onShowDetails, resource]
        )

        const handleExternalClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation()
        }, [])

        return (
            <div
                className={`bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex h-full cursor-pointer flex-col rounded-xl border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/10`}
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role='button'
                aria-label={`View details for ${resource.title}`}
            >
                {/* Header */}
                <div className='mb-3 flex items-start justify-between'>
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
                    >
                        {icon}
                    </div>
                    <div className='flex items-center gap-2'>
                        {resource.type && (
                            <span className='bg-primary/10 text-primary/60 rounded-full px-2 py-0.5 text-xs'>
                                {typeLabels[resource.type] || resource.type}
                            </span>
                        )}
                        <a
                            href={resource.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={handleExternalClick}
                            className='text-primary/40 hover:text-secondary rounded-lg p-1 transition-colors'
                            title='Open in new tab'
                        >
                            <FaExternalLinkAlt className='h-3 w-3' />
                        </a>
                    </div>
                </div>

                {/* Title */}
                <h3 className='group-hover:text-secondary mb-2 line-clamp-2 font-semibold transition-colors'>
                    {resource.title}
                </h3>

                {/* Concept count */}
                <div className='mb-3 flex-1'>
                    <span className='text-primary/50 text-sm'>
                        Referenced by {resource.concepts.length} concept
                        {resource.concepts.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Action button */}
                <div className='mt-auto flex items-center gap-1.5'>
                    <span className='bg-secondary hover:bg-secondary/90 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-white transition-colors'>
                        <FaInfoCircle className='h-3 w-3' />
                        View Details
                    </span>
                </div>
            </div>
        )
    },
    (prevProps, nextProps) => {
        return (
            prevProps.resource.id === nextProps.resource.id &&
            prevProps.onShowDetails === nextProps.onShowDetails &&
            prevProps.colorClass === nextProps.colorClass
        )
    }
)

ResourceCard.displayName = 'ResourceCard'

export default ResourceCard
