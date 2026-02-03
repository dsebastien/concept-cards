import { useMemo, useCallback, useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { FaTag, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import TagDetailModal, { type TagData } from '@/components/tags/tag-detail-modal'
import { conceptsData } from '@/data'

// Colors for tag cards
const cardColors = [
    'from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-500/50',
    'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/50',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
    'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
    'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50'
]

const iconColors = [
    'text-rose-400',
    'text-pink-400',
    'text-blue-400',
    'text-green-400',
    'text-amber-400',
    'text-purple-400',
    'text-cyan-400',
    'text-red-400',
    'text-indigo-400',
    'text-teal-400',
    'text-orange-400'
]

// Helper function to generate tag ID from name
function generateTagId(tagName: string): string {
    return tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const TagsPage: React.FC = () => {
    const { tagId } = useParams<{ tagId?: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedTag, setSelectedTag] = useState<TagData | null>(null)

    // Get search query from URL
    const searchQuery = searchParams.get('q') || ''

    // Build tag data with concepts
    const tagData = useMemo(() => {
        const concepts = conceptsData.concepts
        const totalConcepts = concepts.length

        // Build tag map with concepts
        const tagMap = new Map<string, TagData>()
        concepts.forEach((concept) => {
            concept.tags.forEach((tag) => {
                if (!tagMap.has(tag)) {
                    tagMap.set(tag, {
                        name: tag,
                        count: 0,
                        percentage: 0,
                        concepts: []
                    })
                }
                const tagEntry = tagMap.get(tag)!
                tagEntry.count++
                tagEntry.concepts.push(concept)
            })
        })

        // Calculate percentages and convert to array
        const allTags: TagData[] = Array.from(tagMap.values()).map((t) => ({
            ...t,
            percentage: (t.count / totalConcepts) * 100
        }))

        // Sort by count descending
        allTags.sort((a, b) => b.count - a.count)

        return {
            allTags,
            totalConcepts,
            totalTags: allTags.length
        }
    }, [])

    // Filter tags based on search
    const filteredTags = useMemo(() => {
        if (!searchQuery) return tagData.allTags
        const query = searchQuery.toLowerCase()
        return tagData.allTags.filter((tag) => tag.name.toLowerCase().includes(query))
    }, [tagData.allTags, searchQuery])

    // Find selected tag from URL param
    useEffect(() => {
        if (tagId) {
            const tag = tagData.allTags.find((t) => generateTagId(t.name) === tagId)
            if (tag) {
                setSelectedTag(tag)
            }
        } else {
            setSelectedTag(null)
        }
    }, [tagId, tagData.allTags])

    // Update document title
    useEffect(() => {
        if (selectedTag) {
            document.title = `${selectedTag.name} - Tags - Concepts`
        } else {
            document.title = 'Tags - Concepts'
        }
    }, [selectedTag])

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const query = e.target.value
            const newParams = new URLSearchParams(searchParams)
            if (query) {
                newParams.set('q', query)
            } else {
                newParams.delete('q')
            }
            setSearchParams(newParams, { replace: true })
        },
        [searchParams, setSearchParams]
    )

    const handleShowDetails = useCallback((tag: TagData) => {
        setSelectedTag(tag)
        window.history.pushState({}, '', `/tags/${generateTagId(tag.name)}`)
    }, [])

    const handleCloseDetails = useCallback(() => {
        setSelectedTag(null)
        window.history.pushState({}, '', '/tags')
    }, [])

    const handleNavigateToTag = useCallback((tag: TagData) => {
        setSelectedTag(tag)
        window.history.replaceState({}, '', `/tags/${generateTagId(tag.name)}`)
    }, [])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname === '/tags') {
                setSelectedTag(null)
            }
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    return (
        <AnimatedPage>
            {/* Header */}
            <Section className='pt-16 pb-8 sm:pt-24 sm:pb-12'>
                <AnimatedHero className='mx-auto max-w-4xl'>
                    <Link
                        to='/'
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex cursor-pointer items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Concepts
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10'>
                            <FaTag className='h-7 w-7 text-rose-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Tags</h1>
                            <p className='text-primary/70 mt-1'>Browse concepts by tag</p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mx-auto max-w-4xl px-6 py-4 sm:px-10 md:px-16 lg:px-20 xl:px-32'
            >
                <div className='bg-primary/5 flex items-center justify-center gap-8 rounded-xl p-4'>
                    <div className='text-center'>
                        <AnimatedCounter
                            value={tagData.totalTags}
                            delay={0.3}
                            className='text-2xl font-bold text-rose-400'
                        />
                        <div className='text-primary/60 text-sm'>Total Tags</div>
                    </div>
                    <div className='bg-primary/20 h-8 w-px' />
                    <div className='text-center'>
                        <AnimatedCounter
                            value={tagData.totalConcepts}
                            delay={0.4}
                            className='text-secondary text-2xl font-bold'
                        />
                        <div className='text-primary/60 text-sm'>Total Concepts</div>
                    </div>
                    {searchQuery && (
                        <>
                            <div className='bg-primary/20 h-8 w-px' />
                            <div className='text-center'>
                                <AnimatedCounter
                                    value={filteredTags.length}
                                    delay={0.5}
                                    className='text-2xl font-bold text-blue-400'
                                />
                                <div className='text-primary/60 text-sm'>Matching</div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Search Filter */}
            <Section className='px-6 py-4 sm:px-10 md:px-16'>
                <div className='mx-auto max-w-4xl'>
                    <div className='relative'>
                        <input
                            type='text'
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder='Search tags...'
                            className='bg-primary/5 border-primary/10 focus:border-secondary/50 focus:ring-secondary/20 w-full rounded-lg border px-4 py-3 pl-10 transition-colors focus:ring-2 focus:outline-none'
                        />
                        <FaTag className='text-primary/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    </div>
                </div>
            </Section>

            {/* Tags Grid */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    {filteredTags.length === 0 ? (
                        <div className='text-primary/60 py-12 text-center'>
                            No tags found matching your search.
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                            {filteredTags.map((tag, index) => (
                                <motion.button
                                    key={tag.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.02 }}
                                    onClick={() => handleShowDetails(tag)}
                                    className={`group relative cursor-pointer rounded-xl border bg-gradient-to-br p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${cardColors[index % cardColors.length]}`}
                                >
                                    <div className='mb-4 flex items-center justify-between'>
                                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-card-subtle-hover'>
                                            <FaTag
                                                className={`h-6 w-6 ${iconColors[index % iconColors.length]}`}
                                            />
                                        </div>
                                        <FaArrowRight className='text-primary/40 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-primary/70' />
                                    </div>
                                    <h3 className='mb-1 text-lg font-semibold'>{tag.name}</h3>
                                    <p className='text-primary/60 text-sm'>
                                        {tag.count} concept{tag.count !== 1 ? 's' : ''}
                                        <span className='text-primary/40 ml-1'>
                                            ({tag.percentage.toFixed(1)}%)
                                        </span>
                                    </p>
                                    {/* Progress bar */}
                                    <div className='mt-4 h-1 overflow-hidden rounded-full bg-card-subtle-hover'>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min(tag.percentage * 2, 100)}%`
                                            }}
                                            transition={{
                                                delay: 0.3 + index * 0.02,
                                                duration: 0.5
                                            }}
                                            className='h-full rounded-full bg-primary/20'
                                        />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {/* Detail Modal */}
            <TagDetailModal
                tag={selectedTag}
                allTags={filteredTags}
                isOpen={!!selectedTag}
                onClose={handleCloseDetails}
                onNavigateToTag={handleNavigateToTag}
                basePath='/tags'
            />
        </AnimatedPage>
    )
}

export default TagsPage
