import { useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import {
    FaTimes,
    FaProjectDiagram,
    FaExternalLinkAlt,
    FaCheckCircle,
    FaStar,
    FaLink
} from 'react-icons/fa'
import { CATEGORY_COLORS } from '@/lib/graph-utils'
import ConceptIcon from '@/components/concepts/concept-icon'
import type { Concept } from '@/types/concept'

interface GraphSidePanelProps {
    concept: Concept | null
    isOpen: boolean
    isExplored: (conceptId: string) => boolean
    conceptMap: Map<string, Concept>
    onClose: () => void
    onExploreNeighbors: (conceptId: string) => void
    onNavigateToConcept: (conceptId: string) => void
}

const GraphSidePanel: React.FC<GraphSidePanelProps> = ({
    concept,
    isOpen,
    isExplored,
    conceptMap,
    onClose,
    onExploreNeighbors,
    onNavigateToConcept
}) => {
    const navigate = useNavigate()

    if (!concept || !isOpen) return null

    const categoryColor = CATEGORY_COLORS[concept.category] || '#94a3b8'
    const explored = isExplored(concept.id)

    const handleCategoryClick = (category: string) => {
        navigate(`/category/${encodeURIComponent(category)}`)
    }

    const handleTagClick = (tag: string) => {
        navigate(`/tag/${encodeURIComponent(tag)}`)
    }

    return (
        <>
            {/* Mobile: bottom sheet */}
            <div
                className='border-primary/10 bg-surface/95 absolute right-0 bottom-0 left-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl backdrop-blur-md sm:hidden'
                style={{ maxHeight: '45vh' }}
            >
                {/* Drag handle */}
                <div className='flex justify-center pt-2 pb-1'>
                    <div className='bg-primary/20 h-1 w-8 rounded-full' />
                </div>
                <PanelContent
                    concept={concept}
                    categoryColor={categoryColor}
                    explored={explored}
                    isExplored={isExplored}
                    conceptMap={conceptMap}
                    onClose={onClose}
                    onExploreNeighbors={onExploreNeighbors}
                    onNavigateToConcept={onNavigateToConcept}
                    onCategoryClick={handleCategoryClick}
                    onTagClick={handleTagClick}
                />
            </div>

            {/* Desktop: right panel */}
            <div className='border-primary/10 bg-surface/95 absolute top-0 right-0 z-20 hidden h-full w-80 flex-col border-l shadow-2xl backdrop-blur-md sm:flex lg:w-96'>
                <PanelContent
                    concept={concept}
                    categoryColor={categoryColor}
                    explored={explored}
                    isExplored={isExplored}
                    conceptMap={conceptMap}
                    onClose={onClose}
                    onExploreNeighbors={onExploreNeighbors}
                    onNavigateToConcept={onNavigateToConcept}
                    onCategoryClick={handleCategoryClick}
                    onTagClick={handleTagClick}
                />
            </div>
        </>
    )
}

function PanelContent({
    concept,
    categoryColor,
    explored,
    isExplored,
    conceptMap,
    onClose,
    onExploreNeighbors,
    onNavigateToConcept,
    onCategoryClick,
    onTagClick
}: {
    concept: Concept
    categoryColor: string
    explored: boolean
    isExplored: (conceptId: string) => boolean
    conceptMap: Map<string, Concept>
    onClose: () => void
    onExploreNeighbors: (conceptId: string) => void
    onNavigateToConcept: (conceptId: string) => void
    onCategoryClick: (category: string) => void
    onTagClick: (tag: string) => void
}) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [concept.id])

    return (
        <>
            {/* Header */}
            <div
                className={`flex items-start justify-between gap-2 p-3 pb-1 sm:p-4 sm:pb-2 ${
                    explored ? 'bg-success-subtle' : ''
                }`}
            >
                <div className='flex items-center gap-2 sm:gap-3'>
                    <div
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${
                            explored ? 'bg-success' : 'bg-primary/10'
                        }`}
                    >
                        <ConceptIcon icon={concept.icon} category={concept.category} size='lg' />
                        {explored && (
                            <FaCheckCircle className='text-success-muted absolute -right-1 -bottom-1 h-4 w-4' />
                        )}
                    </div>
                    <div>
                        <div className='flex items-center gap-1.5'>
                            <h2 className='text-base leading-tight font-bold'>{concept.name}</h2>
                            {explored && (
                                <span className='bg-success text-success flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]'>
                                    <FaCheckCircle className='h-2 w-2' />
                                    Explored
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => onCategoryClick(concept.category)}
                            className='mt-0.5 inline-block cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80'
                            style={{ backgroundColor: categoryColor }}
                        >
                            {concept.category}
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className='bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors'
                    aria-label='Close panel'
                >
                    <FaTimes className='h-3.5 w-3.5' />
                </button>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className='flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4'>
                {/* Summary */}
                <p className='text-primary/70 mt-2 text-sm leading-relaxed'>{concept.summary}</p>

                {/* Metadata badges */}
                <div className='mt-3 flex flex-wrap items-center gap-2'>
                    {concept.featured && (
                        <span className='flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400'>
                            <FaStar className='h-2.5 w-2.5' />
                            Featured
                        </span>
                    )}
                    <span className='text-primary/50 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'>
                        <FaLink className='h-2.5 w-2.5' />
                        {concept.relatedConcepts?.length || 0} connections
                    </span>
                </div>

                {/* Tags */}
                {concept.tags && concept.tags.length > 0 && (
                    <div className='mt-3'>
                        <div className='flex flex-wrap gap-1.5'>
                            {concept.tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => onTagClick(tag)}
                                    className='bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary/80 cursor-pointer rounded-full px-2 py-0.5 text-xs transition-colors'
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related concepts */}
                {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
                    <div className='mt-4'>
                        <h3 className='text-primary/50 mb-2 text-xs font-semibold tracking-wider uppercase'>
                            Related Concepts
                        </h3>
                        <div className='flex flex-wrap gap-1.5'>
                            {concept.relatedConcepts.map((relId) => {
                                const relConcept = conceptMap.get(relId)
                                const relExplored = isExplored(relId)
                                return (
                                    <button
                                        key={relId}
                                        onClick={() => onNavigateToConcept(relId)}
                                        className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                            relExplored
                                                ? 'border-success bg-success text-success bg-success-hover'
                                                : 'border-secondary/20 bg-secondary/10 text-secondary-text hover:bg-secondary/20'
                                        }`}
                                    >
                                        {relConcept?.name || relId}
                                        {relExplored && (
                                            <FaCheckCircle className='text-success-muted h-2.5 w-2.5' />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className='mt-4 flex flex-col gap-2'>
                    <button
                        onClick={() => onExploreNeighbors(concept.id)}
                        className='flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20'
                    >
                        <FaProjectDiagram className='h-3.5 w-3.5' />
                        Explore Neighbors
                    </button>
                    <Link
                        to={`/concept/${concept.id}`}
                        className='bg-secondary/10 text-secondary-text hover:bg-secondary/20 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                    >
                        <FaExternalLinkAlt className='h-3 w-3' />
                        View Full Details
                    </Link>
                </div>
            </div>
        </>
    )
}

export default GraphSidePanel
