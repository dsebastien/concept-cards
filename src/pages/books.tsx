import { useMemo, useCallback, useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { FaBook, FaArrowLeft } from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, motion } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import ResourceCard from '@/components/resources/resource-card'
import ResourceDetailModal from '@/components/resources/resource-detail-modal'
import ResourceFilter from '@/components/resources/resource-filter'
import { conceptsData } from '@/data'
import { extractBooks } from '@/lib/extract-resources'
import type { ExtractedResource } from '@/types/extracted-resource.intf'

// Colors for resource cards
const cardColors = [
    'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50',
    'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/50',
    'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/50',
    'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
    'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50',
    'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-500/50',
    'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-500/50',
    'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/50',
    'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50'
]

const BooksPage: React.FC = () => {
    const { bookId } = useParams<{ bookId?: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedResource, setSelectedResource] = useState<ExtractedResource | null>(null)

    // Get search query from URL
    const searchQuery = searchParams.get('q') || ''

    // Extract all books from concepts
    const allBooks = useMemo(() => {
        return extractBooks(conceptsData.concepts)
    }, [])

    // Filter books based on search
    const filteredBooks = useMemo(() => {
        if (!searchQuery) return allBooks
        const query = searchQuery.toLowerCase()
        return allBooks.filter((book) => book.title.toLowerCase().includes(query))
    }, [allBooks, searchQuery])

    // Find selected resource from URL param
    useEffect(() => {
        if (bookId) {
            const book = allBooks.find((b) => b.id === bookId)
            if (book) {
                setSelectedResource(book)
            }
        } else {
            setSelectedResource(null)
        }
    }, [bookId, allBooks])

    // Update document title
    useEffect(() => {
        if (selectedResource) {
            document.title = `${selectedResource.title} - Books - Concepts`
        } else {
            document.title = 'Books - Concepts'
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
        window.history.pushState({}, '', `/books/${resource.id}`)
    }, [])

    const handleCloseDetails = useCallback(() => {
        setSelectedResource(null)
        window.history.pushState({}, '', '/books')
    }, [])

    const handleNavigateToResource = useCallback((resource: ExtractedResource) => {
        setSelectedResource(resource)
        window.history.replaceState({}, '', `/books/${resource.id}`)
    }, [])

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            if (window.location.pathname === '/books') {
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
                        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10'>
                            <FaBook className='h-7 w-7 text-amber-400' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Recommended Books
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Books referenced across all concepts
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
                            value={allBooks.length}
                            delay={0.3}
                            className='text-2xl font-bold text-amber-400'
                        />
                        <div className='text-primary/60 text-sm'>Total Books</div>
                    </div>
                    {searchQuery && (
                        <>
                            <div className='bg-primary/20 h-8 w-px' />
                            <div className='text-center'>
                                <AnimatedCounter
                                    value={filteredBooks.length}
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
                        placeholder='Search books...'
                    />
                </div>
            </Section>

            {/* Books Grid */}
            <Section fullWidth className='px-6 py-8 pb-16 sm:px-10 md:px-16'>
                <div className='mx-auto w-full max-w-[1800px]'>
                    {filteredBooks.length === 0 ? (
                        <div className='text-primary/60 py-12 text-center'>
                            No books found matching your search.
                        </div>
                    ) : (
                        <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                            {filteredBooks.map((book, index) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + index * 0.02 }}
                                >
                                    <ResourceCard
                                        resource={book}
                                        resourceType='book'
                                        onShowDetails={handleShowDetails}
                                        colorClass={`bg-gradient-to-br ${cardColors[index % cardColors.length]}`}
                                        icon={<FaBook className='h-5 w-5 text-amber-400' />}
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
                allResources={filteredBooks}
                isOpen={!!selectedResource}
                onClose={handleCloseDetails}
                onNavigateToResource={handleNavigateToResource}
                resourceType='book'
                icon={<FaBook className='h-7 w-7 text-amber-400' />}
                colorClass='bg-amber-500/20'
                basePath='/books'
            />
        </AnimatedPage>
    )
}

export default BooksPage
