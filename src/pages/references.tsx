import { useMemo, useCallback, useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { FaLink, FaArrowLeft } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import ResourceCard from '@/components/resources/resource-card'
import ResourceDetailModal from '@/components/resources/resource-detail-modal'
import ResourceFilter from '@/components/resources/resource-filter'
import { conceptsData } from '@/data'
import { extractReferences } from '@/lib/extract-resources'
import type { ExtractedResource } from '@/types/extracted-resource.intf'

// Colors for resource cards
const cardColors = [
    'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
    'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/50',
    'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
    'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50'
]

const ReferencesPage: React.FC = () => {
    const { referenceId } = useParams<{ referenceId?: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedResource, setSelectedResource] = useState<ExtractedResource | null>(null)

    // Get filters from URL
    const searchQuery = searchParams.get('q') || ''
    const selectedType = searchParams.get('type') || 'all'

    // Extract all references from concepts
    const allReferences = useMemo(() => {
        return extractReferences(conceptsData.concepts)
    }, [])

    // Filter references based on search and type
    const filteredReferences = useMemo(() => {
        let filtered = allReferences

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter((reference) => reference.title.toLowerCase().includes(query))
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter((reference) => reference.type === selectedType)
        }

        return filtered
    }, [allReferences, searchQuery, selectedType])

    // Find selected resource from URL param
    useEffect(() => {
        if (referenceId) {
            const reference = allReferences.find((r) => r.id === referenceId)
            if (reference) {
                setSelectedResource(reference)
            }
        } else {
            setSelectedResource(null)
        }
    }, [referenceId, allReferences])

    // Update document title
    useEffect(() => {
        if (selectedResource) {
            document.title = `${selectedResource.title} - References - Concepts`
        } else {
            document.title = 'References - Concepts'
        }
    }, [selectedResource])

    const handleSearchChange = useCallback(
        (query: string) => {
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

    const handleTypeChange = useCallback(
        (type: string) => {
            const newParams = new URLSearchParams(searchParams)
            if (type !== 'all') {
                newParams.set('type', type)
            } else {
                newParams.delete('type')
            }
            setSearchParams(newParams, { replace: true })
        },
        [searchParams, setSearchParams]
    )

    const handleShowDetails = useCallback((resource: ExtractedResource) => {
        setSelectedResource(resource)
        window.history.pushState({}, '', `/references/${resource.id}`)
    }, [])

    const handleCloseDetails = useCallback(() => {
        setSelectedResource(null)
        window.history.pushState({}, '', '/references')
    }, [])

    const handleNavigateToResource = useCallback((resource: ExtractedResource) => {
        setSelectedResource(resource)
        window.history.replaceState({}, '', `/references/${resource.id}`)
    }, [])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname === '/references') {
                setSelectedResource(null)
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
                        className='text-primary/70 hover:text-secondary mb-6 inline-flex items-center gap-2 text-sm transition-colors'
                    >
                        <FaArrowLeft className='h-3 w-3' />
                        Back to Concepts
                    </Link>
                    <div className='flex items-center gap-4'>
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10'>
                            <FaLink className='h-7 w-7 text-green-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                References
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                References and resources across all concepts
                            </p>
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
                            value={allReferences.length}
                            delay={0.3}
                            className='text-2xl font-bold text-green-400'
                        />
                        <div className='text-primary/60 text-sm'>Total References</div>
                    </div>
                    {(searchQuery || selectedType !== 'all') && (
                        <>
                            <div className='bg-primary/20 h-8 w-px' />
                            <div className='text-center'>
                                <AnimatedCounter
                                    value={filteredReferences.length}
                                    delay={0.4}
                                    className='text-secondary text-2xl font-bold'
                                />
                                <div className='text-primary/60 text-sm'>Matching</div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Filter */}
            <Section className='px-6 py-4 sm:px-10 md:px-16'>
                <div className='mx-auto max-w-4xl'>
                    <ResourceFilter
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        selectedType={selectedType}
                        onTypeChange={handleTypeChange}
                        showTypeFilter={true}
                        placeholder='Search references...'
                    />
                </div>
            </Section>

            {/* References Grid */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    {filteredReferences.length === 0 ? (
                        <div className='text-primary/60 py-12 text-center'>
                            No references found matching your filters.
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                            {filteredReferences.map((reference, index) => (
                                <motion.div
                                    key={reference.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.02 }}
                                >
                                    <ResourceCard
                                        resource={reference}
                                        resourceType='reference'
                                        onShowDetails={handleShowDetails}
                                        colorClass={`bg-gradient-to-br ${cardColors[index % cardColors.length]}`}
                                        icon={<FaLink className='h-5 w-5 text-green-400' />}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </Section>

            {/* Detail Modal */}
            <ResourceDetailModal
                resource={selectedResource}
                allResources={filteredReferences}
                isOpen={!!selectedResource}
                onClose={handleCloseDetails}
                onNavigateToResource={handleNavigateToResource}
                resourceType='reference'
                icon={<FaLink className='h-7 w-7 text-green-400' />}
                colorClass='bg-green-500/20'
                basePath='/references'
            />
        </AnimatedPage>
    )
}

export default ReferencesPage
