import { memo, useCallback } from 'react'
import { FaStar, FaInfoCircle, FaCheckCircle } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { ConceptCardProps } from '@/types/concept-card-props.intf'

const ConceptCard: React.FC<ConceptCardProps> = memo(
    ({ concept, onShowDetails, onTagClick, onCategoryClick, viewMode, isExplored = false }) => {
        const handleCardClick = useCallback(() => {
            onShowDetails(concept)
        }, [onShowDetails, concept])

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onShowDetails(concept)
                }
            },
            [onShowDetails, concept]
        )

        const handleTagClick = useCallback(
            (e: React.MouseEvent, tag: string) => {
                e.stopPropagation()
                onTagClick(tag)
            },
            [onTagClick]
        )

        const handleCategoryClick = useCallback(
            (e: React.MouseEvent, category: string) => {
                e.stopPropagation()
                onCategoryClick(category)
            },
            [onCategoryClick]
        )

        if (viewMode === 'list') {
            return (
                <div
                    className={cn(
                        'bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/10',
                        concept.featured && 'ring-secondary/30 ring-1',
                        isExplored && 'border-green-500/20 bg-green-500/5'
                    )}
                    onClick={handleCardClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role='button'
                    aria-label={`View details for ${concept.name}`}
                >
                    {/* Icon */}
                    <div
                        className={cn(
                            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors',
                            isExplored
                                ? 'bg-green-500/20 group-hover:bg-green-500/30'
                                : 'bg-primary/10 group-hover:bg-primary/20'
                        )}
                    >
                        <ConceptIcon icon={concept.icon} category={concept.category} size='md' />
                        {isExplored && (
                            <FaCheckCircle className='absolute -right-1 -bottom-1 h-4 w-4 text-green-500' />
                        )}
                    </div>

                    {/* Content */}
                    <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-x-2 overflow-hidden'>
                            <h3 className='group-hover:text-secondary min-w-0 flex-1 truncate font-semibold transition-colors'>
                                {concept.name}
                            </h3>
                            {concept.featured && (
                                <FaStar className='text-secondary h-3 w-3 shrink-0' />
                            )}
                            {isExplored && (
                                <span className='hidden shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400 sm:inline'>
                                    Explored
                                </span>
                            )}
                            <button
                                onClick={(e) => handleCategoryClick(e, concept.category)}
                                className='bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary/70 max-w-[120px] shrink-0 cursor-pointer truncate rounded-full px-1.5 py-px text-[10px] transition-colors'
                            >
                                {concept.category}
                            </button>
                        </div>
                        <p className='text-primary/60 mt-1 overflow-hidden text-sm text-ellipsis whitespace-nowrap'>
                            {concept.summary}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className='hidden shrink-0 gap-1 md:flex'>
                        {concept.tags.slice(0, 3).map((tag) => (
                            <button
                                key={tag}
                                onClick={(e) => handleTagClick(e, tag)}
                                className='bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary/80 cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors'
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className='flex shrink-0 gap-2'>
                        <span
                            className='text-primary/60 hover:text-secondary rounded-lg p-2 transition-colors'
                            title='View details'
                        >
                            <FaInfoCircle className='h-4 w-4' />
                        </span>
                    </div>
                </div>
            )
        }

        // Grid view - using CSS hover instead of useState for better performance
        return (
            <div
                className={cn(
                    'bg-background/50 border-primary/10 hover:border-secondary/50 group relative flex cursor-pointer flex-col rounded-xl border p-3 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/10 sm:p-4',
                    'h-[192px] sm:h-[224px] md:h-[256px]',
                    'overflow-hidden', // Strictly enforce height - no overflow
                    concept.featured && 'ring-secondary/30 ring-1',
                    isExplored && 'border-green-500/20 bg-green-500/5'
                )}
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role='button'
                aria-label={`View details for ${concept.name}`}
            >
                {/* Header */}
                <div className='mb-2 flex shrink-0 items-start justify-between sm:mb-3'>
                    {/* Icon - hide on very narrow screens (< 280px) */}
                    <div
                        className={cn(
                            'relative hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors min-[280px]:flex sm:h-10 sm:w-10',
                            isExplored
                                ? 'bg-green-500/20 group-hover:bg-green-500/30'
                                : 'bg-primary/10 group-hover:bg-primary/20'
                        )}
                    >
                        <ConceptIcon icon={concept.icon} category={concept.category} size='md' />
                    </div>
                    <div className='flex min-w-0 flex-col items-end gap-1'>
                        {/* Featured/Explored badges - hide on narrow screens (< 320px) */}
                        {isExplored ? (
                            <span className='hidden shrink-0 items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400 min-[320px]:flex'>
                                <FaCheckCircle className='h-2.5 w-2.5' />
                                Explored
                            </span>
                        ) : concept.featured ? (
                            <span className='from-secondary to-secondary/80 hidden shrink-0 items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-xs font-medium text-white min-[320px]:flex'>
                                <FaStar className='h-2.5 w-2.5' />
                                Featured
                            </span>
                        ) : null}
                        {/* Category - hide on narrower screens (< 360px) */}
                        <button
                            onClick={(e) => handleCategoryClick(e, concept.category)}
                            className='bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary/70 hidden max-w-[100px] shrink-0 cursor-pointer truncate rounded-full px-1.5 py-px text-[10px] transition-colors min-[360px]:block'
                        >
                            {concept.category}
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className='mb-1 shrink-0'>
                    <h3 className='group-hover:text-secondary line-clamp-2 min-h-[2.5rem] text-sm font-semibold transition-colors sm:text-base'>
                        {concept.name}
                    </h3>
                </div>

                {/* Summary - multiple lines to use available space */}
                <p className='text-primary/70 mb-2 flex-1 overflow-hidden text-xs leading-relaxed sm:mb-3 sm:text-sm'>
                    {concept.summary}
                </p>

                {/* Action button - hide icon on narrowest screens (< 400px) */}
                <div className='mt-auto flex shrink-0 items-center gap-1.5'>
                    <span className='bg-secondary hover:bg-secondary/90 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-white transition-colors sm:py-2 sm:text-sm'>
                        <FaInfoCircle className='hidden h-3 w-3 min-[400px]:block' />
                        <span className='hidden sm:inline'>Learn More</span>
                        <span className='sm:hidden'>Details</span>
                    </span>
                </div>
            </div>
        )
    },
    (prevProps, nextProps) => {
        // Custom comparison for memoization - only re-render if these change
        return (
            prevProps.concept.id === nextProps.concept.id &&
            prevProps.viewMode === nextProps.viewMode &&
            prevProps.isExplored === nextProps.isExplored &&
            prevProps.onShowDetails === nextProps.onShowDetails &&
            prevProps.onTagClick === nextProps.onTagClick &&
            prevProps.onCategoryClick === nextProps.onCategoryClick
        )
    }
)

ConceptCard.displayName = 'ConceptCard'

export default ConceptCard
