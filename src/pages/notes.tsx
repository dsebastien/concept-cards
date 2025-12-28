import { useMemo, useCallback, useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { FaStickyNote, FaArrowLeft } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import ResourceCard from '@/components/resources/resource-card'
import ResourceDetailModal from '@/components/resources/resource-detail-modal'
import ResourceFilter from '@/components/resources/resource-filter'
import { conceptsData } from '@/data'
import { extractNotes } from '@/lib/extract-resources'
import type { ExtractedResource } from '@/types/extracted-resource.intf'

// Colors for resource cards
const cardColors = [
    'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-500/50',
    'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/50',
    'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
    'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50'
]

const NotesPage: React.FC = () => {
    const { noteId } = useParams<{ noteId?: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedResource, setSelectedResource] = useState<ExtractedResource | null>(null)

    // Get search query from URL
    const searchQuery = searchParams.get('q') || ''

    // Extract all notes from concepts
    const allNotes = useMemo(() => {
        return extractNotes(conceptsData.concepts)
    }, [])

    // Filter notes based on search
    const filteredNotes = useMemo(() => {
        if (!searchQuery) return allNotes
        const query = searchQuery.toLowerCase()
        return allNotes.filter((note) => note.title.toLowerCase().includes(query))
    }, [allNotes, searchQuery])

    // Find selected resource from URL param
    useEffect(() => {
        if (noteId) {
            const note = allNotes.find((n) => n.id === noteId)
            if (note) {
                setSelectedResource(note)
            }
        } else {
            setSelectedResource(null)
        }
    }, [noteId, allNotes])

    // Update document title
    useEffect(() => {
        if (selectedResource) {
            document.title = `${selectedResource.title} - Notes - Concepts`
        } else {
            document.title = 'Notes - Concepts'
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

    const handleShowDetails = useCallback((resource: ExtractedResource) => {
        setSelectedResource(resource)
        window.history.pushState({}, '', `/notes/${resource.id}`)
    }, [])

    const handleCloseDetails = useCallback(() => {
        setSelectedResource(null)
        window.history.pushState({}, '', '/notes')
    }, [])

    const handleNavigateToResource = useCallback((resource: ExtractedResource) => {
        setSelectedResource(resource)
        window.history.replaceState({}, '', `/notes/${resource.id}`)
    }, [])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname === '/notes') {
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
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10'>
                            <FaStickyNote className='h-7 w-7 text-yellow-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Related Notes
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Public notes linked from concepts
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
                            value={allNotes.length}
                            delay={0.3}
                            className='text-2xl font-bold text-yellow-400'
                        />
                        <div className='text-primary/60 text-sm'>Total Notes</div>
                    </div>
                    {searchQuery && (
                        <>
                            <div className='bg-primary/20 h-8 w-px' />
                            <div className='text-center'>
                                <AnimatedCounter
                                    value={filteredNotes.length}
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
                        placeholder='Search notes...'
                    />
                </div>
            </Section>

            {/* Notes Grid */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    {filteredNotes.length === 0 ? (
                        <div className='text-primary/60 py-12 text-center'>
                            No notes found matching your search.
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                            {filteredNotes.map((note, index) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.02 }}
                                >
                                    <ResourceCard
                                        resource={note}
                                        resourceType='note'
                                        onShowDetails={handleShowDetails}
                                        colorClass={`bg-gradient-to-br ${cardColors[index % cardColors.length]}`}
                                        icon={<FaStickyNote className='h-5 w-5 text-yellow-400' />}
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
                allResources={filteredNotes}
                isOpen={!!selectedResource}
                onClose={handleCloseDetails}
                onNavigateToResource={handleNavigateToResource}
                resourceType='note'
                icon={<FaStickyNote className='h-7 w-7 text-yellow-400' />}
                colorClass='bg-yellow-500/20'
                basePath='/notes'
            />
        </AnimatedPage>
    )
}

export default NotesPage
