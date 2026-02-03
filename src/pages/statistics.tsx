import { useMemo } from 'react'
import { Link } from 'react-router'
import {
    FaChartBar,
    FaArrowLeft,
    FaBook,
    FaFileAlt,
    FaGlobe,
    FaVideo,
    FaPodcast,
    FaQuestion,
    FaNewspaper,
    FaGraduationCap,
    FaQuoteLeft
} from 'react-icons/fa'
import type { IconType } from 'react-icons'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, AnimatedSection, AnimatedStat } from '@/components/ui/animated'
import AnimatedCounter from '@/components/ui/animated-counter'
import { conceptsData } from '@/data'
import type { CategoryStat } from '@/types/category-stat.intf'
import type { TagStat } from '@/types/tag-stat.intf'
import type { ReferenceTypeStat } from '@/types/reference-type-stat.intf'

const StatisticsPage: React.FC = () => {
    const stats = useMemo(() => {
        const concepts = conceptsData.concepts

        // Basic counts
        const totalConcepts = concepts.length
        const featuredConcepts = concepts.filter((c) => c.featured).length
        const conceptsWithAliases = concepts.filter((c) => c.aliases && c.aliases.length > 0).length
        const conceptsWithRelatedConcepts = concepts.filter(
            (c) => c.relatedConcepts && c.relatedConcepts.length > 0
        ).length
        const conceptsWithRelatedNotes = concepts.filter(
            (c) => c.relatedNotes && c.relatedNotes.length > 0
        ).length
        const conceptsWithReferences = concepts.filter(
            (c) => c.references && c.references.length > 0
        ).length
        const conceptsWithArticles = concepts.filter(
            (c) => c.articles && c.articles.length > 0
        ).length
        const conceptsWithTutorials = concepts.filter(
            (c) => c.tutorials && c.tutorials.length > 0
        ).length
        const conceptsWithBooks = concepts.filter((c) => c.books && c.books.length > 0).length

        // Total books count
        const totalBooks = concepts.reduce((sum, c) => sum + (c.books?.length || 0), 0)

        // Category distribution
        const categoryCount: Record<string, number> = {}
        concepts.forEach((c) => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
        })
        const categoryStats: CategoryStat[] = Object.entries(categoryCount)
            .map(([name, count]) => ({
                name,
                count,
                percentage: (count / totalConcepts) * 100
            }))
            .sort((a, b) => b.count - a.count)

        // Tag statistics
        const tagCount: Record<string, number> = {}
        let totalTags = 0
        concepts.forEach((c) => {
            c.tags.forEach((tag) => {
                tagCount[tag] = (tagCount[tag] || 0) + 1
                totalTags++
            })
        })
        const uniqueTags = Object.keys(tagCount).length
        const avgTagsPerConcept = totalTags / totalConcepts

        const tagStats: TagStat[] = Object.entries(tagCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        const topTags = tagStats.slice(0, 20)

        // Reference type distribution (including books for complete picture)
        const referenceTypeCount: Record<string, number> = {}
        let totalReferences = 0
        concepts.forEach((c) => {
            const allRefs = [...(c.references || []), ...(c.articles || []), ...(c.tutorials || [])]
            allRefs.forEach((ref) => {
                referenceTypeCount[ref.type] = (referenceTypeCount[ref.type] || 0) + 1
                totalReferences++
            })
        })

        // Add books as a separate type for unified view
        const totalAllResources = totalReferences + totalBooks
        const referenceTypeStatsWithBooks: ReferenceTypeStat[] = [
            ...Object.entries(referenceTypeCount).map(([type, count]) => ({
                type,
                count,
                percentage: totalAllResources > 0 ? (count / totalAllResources) * 100 : 0
            })),
            ...(totalBooks > 0
                ? [
                      {
                          type: 'book',
                          count: totalBooks,
                          percentage:
                              totalAllResources > 0 ? (totalBooks / totalAllResources) * 100 : 0
                      }
                  ]
                : [])
        ].sort((a, b) => b.count - a.count)

        // Legacy stats without books (for backwards compatibility)
        const referenceTypeStats: ReferenceTypeStat[] = Object.entries(referenceTypeCount)
            .map(([type, count]) => ({
                type,
                count,
                percentage: totalReferences > 0 ? (count / totalReferences) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)

        // Source breakdown (references vs articles vs tutorials vs books)
        const totalReferencesBySource = concepts.reduce(
            (sum, c) => sum + (c.references?.length || 0),
            0
        )
        const totalArticles = concepts.reduce((sum, c) => sum + (c.articles?.length || 0), 0)
        const totalTutorials = concepts.reduce((sum, c) => sum + (c.tutorials?.length || 0), 0)

        const sourceBreakdown = [
            { source: 'books', count: totalBooks, label: 'Books' },
            { source: 'articles', count: totalArticles, label: 'Articles' },
            { source: 'references', count: totalReferencesBySource, label: 'References' },
            { source: 'tutorials', count: totalTutorials, label: 'Tutorials' }
        ].sort((a, b) => b.count - a.count)

        // Text statistics
        const explanationLengths = concepts.map((c) => c.explanation.length)
        const avgExplanationLength = Math.round(
            explanationLengths.reduce((a, b) => a + b, 0) / totalConcepts
        )
        const longestExplanation = Math.max(...explanationLengths)
        const shortestExplanation = Math.min(...explanationLengths)

        // Word counts
        const wordCounts = concepts.map(
            (c) => c.explanation.split(/\s+/).filter((w) => w.length > 0).length
        )
        const totalWords = wordCounts.reduce((a, b) => a + b, 0)
        const avgWordsPerConcept = Math.round(totalWords / totalConcepts)

        // Alias statistics
        const totalAliases = concepts.reduce((sum, c) => sum + (c.aliases?.length || 0), 0)
        const avgAliasesPerConcept =
            conceptsWithAliases > 0 ? (totalAliases / conceptsWithAliases).toFixed(1) : '0'

        // Related concepts statistics
        const totalRelatedConcepts = concepts.reduce(
            (sum, c) => sum + (c.relatedConcepts?.length || 0),
            0
        )

        return {
            totalConcepts,
            featuredConcepts,
            conceptsWithAliases,
            conceptsWithRelatedConcepts,
            conceptsWithRelatedNotes,
            conceptsWithReferences,
            conceptsWithArticles,
            conceptsWithTutorials,
            conceptsWithBooks,
            categoryStats,
            uniqueTags,
            avgTagsPerConcept,
            topTags,
            referenceTypeStats,
            referenceTypeStatsWithBooks,
            sourceBreakdown,
            totalReferences,
            totalAllResources,
            totalBooks,
            totalArticles,
            totalTutorials,
            avgExplanationLength,
            longestExplanation,
            shortestExplanation,
            totalWords,
            avgWordsPerConcept,
            totalAliases,
            avgAliasesPerConcept,
            totalRelatedConcepts
        }
    }, [])

    const maxCategoryCount = Math.max(...stats.categoryStats.map((c) => c.count))
    const maxTagCount = stats.topTags.length > 0 ? stats.topTags[0]!.count : 1

    // Colors for categories
    const categoryColors = [
        'bg-pink-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-cyan-500',
        'bg-red-500',
        'bg-indigo-500'
    ]

    // Reference type configuration
    const referenceTypeConfig: Record<
        string,
        { color: string; bgColor: string; label: string; icon: IconType }
    > = {
        book: { color: '#f59e0b', bgColor: 'bg-amber-500', label: 'Books', icon: FaBook },
        paper: { color: '#3b82f6', bgColor: 'bg-blue-500', label: 'Papers', icon: FaFileAlt },
        website: { color: '#22c55e', bgColor: 'bg-green-500', label: 'Websites', icon: FaGlobe },
        video: { color: '#ef4444', bgColor: 'bg-red-500', label: 'Videos', icon: FaVideo },
        podcast: { color: '#a855f7', bgColor: 'bg-purple-500', label: 'Podcasts', icon: FaPodcast },
        other: { color: '#6b7280', bgColor: 'bg-gray-500', label: 'Other', icon: FaQuestion }
    }

    // Source configuration
    const sourceConfig: Record<string, { color: string; bgColor: string; icon: IconType }> = {
        books: { color: '#f59e0b', bgColor: 'bg-amber-500', icon: FaBook },
        articles: { color: '#22c55e', bgColor: 'bg-green-500', icon: FaNewspaper },
        references: { color: '#3b82f6', bgColor: 'bg-blue-500', icon: FaQuoteLeft },
        tutorials: { color: '#ef4444', bgColor: 'bg-red-500', icon: FaGraduationCap }
    }

    const maxResourceCount =
        stats.referenceTypeStatsWithBooks.length > 0
            ? stats.referenceTypeStatsWithBooks[0]!.count
            : 1

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
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaChartBar className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Statistics
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Insights and analytics about the concepts collection
                            </p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* Overview Stats */}
            <Section className='py-8'>
                <div className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Overview</h2>
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                        <AnimatedStat delay={0.1}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.totalConcepts}
                                    delay={0.3}
                                    className='text-secondary text-3xl font-bold'
                                />
                                <div className='text-primary/60 text-sm'>Total Concepts</div>
                            </div>
                        </AnimatedStat>
                        <AnimatedStat delay={0.2}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.featuredConcepts}
                                    delay={0.4}
                                    className='text-3xl font-bold text-amber-400'
                                />
                                <div className='text-primary/60 text-sm'>Featured</div>
                            </div>
                        </AnimatedStat>
                        <AnimatedStat delay={0.3}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.categoryStats.length}
                                    delay={0.5}
                                    className='text-3xl font-bold text-blue-400'
                                />
                                <div className='text-primary/60 text-sm'>Categories</div>
                            </div>
                        </AnimatedStat>
                        <AnimatedStat delay={0.4}>
                            <div className='bg-primary/5 rounded-xl p-4 text-center'>
                                <AnimatedCounter
                                    value={stats.uniqueTags}
                                    delay={0.6}
                                    className='text-3xl font-bold text-green-400'
                                />
                                <div className='text-primary/60 text-sm'>Unique Tags</div>
                            </div>
                        </AnimatedStat>
                    </div>
                </div>
            </Section>

            {/* Category Distribution */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Category Distribution</h2>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='space-y-4'>
                            {stats.categoryStats.map((cat, index) => (
                                <div key={cat.name}>
                                    <div className='mb-1 flex items-center justify-between text-sm'>
                                        <span className='font-medium'>{cat.name}</span>
                                        <span className='text-primary/60'>
                                            {cat.count} ({cat.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className='bg-primary/10 h-6 overflow-hidden rounded-full'>
                                        <div
                                            className={`h-full rounded-full ${categoryColors[index % categoryColors.length]} transition-all duration-500`}
                                            style={{
                                                width: `${(cat.count / maxCategoryCount) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Content Completeness */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Content Completeness</h2>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <h3 className='text-primary/70 mb-4 text-sm font-medium'>
                                Concepts With...
                            </h3>
                            <div className='space-y-3'>
                                {[
                                    {
                                        label: 'Aliases',
                                        count: stats.conceptsWithAliases,
                                        color: 'bg-purple-500'
                                    },
                                    {
                                        label: 'Related Concepts',
                                        count: stats.conceptsWithRelatedConcepts,
                                        color: 'bg-blue-500'
                                    },
                                    {
                                        label: 'Related Notes',
                                        count: stats.conceptsWithRelatedNotes,
                                        color: 'bg-cyan-500'
                                    },
                                    {
                                        label: 'Books',
                                        count: stats.conceptsWithBooks,
                                        color: 'bg-amber-500'
                                    },
                                    {
                                        label: 'References',
                                        count: stats.conceptsWithReferences,
                                        color: 'bg-orange-500'
                                    },
                                    {
                                        label: 'Articles',
                                        count: stats.conceptsWithArticles,
                                        color: 'bg-green-500'
                                    },
                                    {
                                        label: 'Tutorials',
                                        count: stats.conceptsWithTutorials,
                                        color: 'bg-red-500'
                                    }
                                ].map((item) => (
                                    <div key={item.label} className='flex items-center gap-3'>
                                        <div className='bg-primary/10 h-2 flex-1 overflow-hidden rounded-full'>
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{
                                                    width: `${(item.count / stats.totalConcepts) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <div className='w-32 text-right text-sm'>
                                            <span className='font-medium'>{item.count}</span>
                                            <span className='text-primary/60'>
                                                {' '}
                                                (
                                                {((item.count / stats.totalConcepts) * 100).toFixed(
                                                    0
                                                )}
                                                %)
                                            </span>
                                        </div>
                                        <div className='text-primary/70 w-32 text-sm'>
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='bg-primary/5 rounded-xl p-6'>
                            <h3 className='text-primary/70 mb-4 text-sm font-medium'>
                                Quick Stats
                            </h3>
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>Total Aliases</span>
                                    <span className='font-medium'>{stats.totalAliases}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>
                                        Avg Aliases (where present)
                                    </span>
                                    <span className='font-medium'>
                                        {stats.avgAliasesPerConcept}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>
                                        Total Related Concept Links
                                    </span>
                                    <span className='font-medium'>
                                        {stats.totalRelatedConcepts}
                                    </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>Total Books</span>
                                    <span className='font-medium'>{stats.totalBooks}</span>
                                </div>
                                <div className='flex items-center justify-between'>
                                    <span className='text-primary/70 text-sm'>
                                        Total References
                                    </span>
                                    <span className='font-medium'>{stats.totalReferences}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* External Resources */}
            {stats.totalAllResources > 0 && (
                <Section className='py-8'>
                    <AnimatedSection className='mx-auto max-w-4xl'>
                        <h2 className='mb-2 text-xl font-semibold'>External Resources</h2>
                        <p className='text-primary/60 mb-6 text-sm'>
                            {stats.totalAllResources.toLocaleString()} resources across{' '}
                            {stats.referenceTypeStatsWithBooks.length} types
                        </p>

                        <div className='grid gap-6 lg:grid-cols-2'>
                            {/* By Type - Donut Chart + Bar Chart */}
                            <div className='bg-primary/5 rounded-xl p-6'>
                                <h3 className='text-primary/70 mb-4 text-sm font-medium tracking-wide uppercase'>
                                    By Type
                                </h3>

                                {/* Donut Chart */}
                                <div className='mb-6 flex items-center justify-center'>
                                    <div className='relative h-40 w-40'>
                                        <svg
                                            viewBox='0 0 100 100'
                                            className='h-full w-full -rotate-90'
                                        >
                                            {(() => {
                                                let cumulativePercent = 0
                                                return stats.referenceTypeStatsWithBooks.map(
                                                    (ref) => {
                                                        const startPercent = cumulativePercent
                                                        cumulativePercent += ref.percentage
                                                        const startAngle =
                                                            (startPercent / 100) * 360
                                                        const endAngle =
                                                            (cumulativePercent / 100) * 360
                                                        const largeArcFlag =
                                                            ref.percentage > 50 ? 1 : 0

                                                        // Donut dimensions
                                                        const outerRadius = 45
                                                        const innerRadius = 28

                                                        const startOuterX =
                                                            50 +
                                                            outerRadius *
                                                                Math.cos(
                                                                    (startAngle * Math.PI) / 180
                                                                )
                                                        const startOuterY =
                                                            50 +
                                                            outerRadius *
                                                                Math.sin(
                                                                    (startAngle * Math.PI) / 180
                                                                )
                                                        const endOuterX =
                                                            50 +
                                                            outerRadius *
                                                                Math.cos((endAngle * Math.PI) / 180)
                                                        const endOuterY =
                                                            50 +
                                                            outerRadius *
                                                                Math.sin((endAngle * Math.PI) / 180)
                                                        const startInnerX =
                                                            50 +
                                                            innerRadius *
                                                                Math.cos(
                                                                    (startAngle * Math.PI) / 180
                                                                )
                                                        const startInnerY =
                                                            50 +
                                                            innerRadius *
                                                                Math.sin(
                                                                    (startAngle * Math.PI) / 180
                                                                )
                                                        const endInnerX =
                                                            50 +
                                                            innerRadius *
                                                                Math.cos((endAngle * Math.PI) / 180)
                                                        const endInnerY =
                                                            50 +
                                                            innerRadius *
                                                                Math.sin((endAngle * Math.PI) / 180)

                                                        const config = referenceTypeConfig[
                                                            ref.type
                                                        ] || {
                                                            color: '#6b7280'
                                                        }

                                                        return (
                                                            <path
                                                                key={ref.type}
                                                                d={`M ${startOuterX} ${startOuterY} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY} L ${endInnerX} ${endInnerY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY} Z`}
                                                                fill={config.color}
                                                                stroke='rgb(55, 64, 76)'
                                                                strokeWidth='1'
                                                            />
                                                        )
                                                    }
                                                )
                                            })()}
                                        </svg>
                                        <div className='absolute inset-0 flex items-center justify-center'>
                                            <div className='text-center'>
                                                <div className='text-2xl font-bold'>
                                                    {stats.totalAllResources}
                                                </div>
                                                <div className='text-primary/60 text-xs'>Total</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bar Chart with Icons */}
                                <div className='space-y-3'>
                                    {stats.referenceTypeStatsWithBooks.map((ref) => {
                                        const config = referenceTypeConfig[ref.type] || {
                                            color: '#6b7280',
                                            bgColor: 'bg-gray-500',
                                            label: ref.type,
                                            icon: FaQuestion
                                        }
                                        const IconComponent = config.icon

                                        return (
                                            <div key={ref.type}>
                                                <div className='mb-1 flex items-center justify-between text-sm'>
                                                    <div className='flex items-center gap-2'>
                                                        <IconComponent
                                                            className='h-3.5 w-3.5'
                                                            style={{ color: config.color }}
                                                        />
                                                        <span className='font-medium'>
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <span className='text-primary/60'>
                                                        {ref.count} ({ref.percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className='bg-primary/10 h-2 overflow-hidden rounded-full'>
                                                    <div
                                                        className={`h-full rounded-full ${config.bgColor} transition-all duration-500`}
                                                        style={{
                                                            width: `${(ref.count / maxResourceCount) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* By Source + Stats */}
                            <div className='space-y-6'>
                                {/* By Source */}
                                <div className='bg-primary/5 rounded-xl p-6'>
                                    <h3 className='text-primary/70 mb-4 text-sm font-medium tracking-wide uppercase'>
                                        By Source
                                    </h3>
                                    <div className='grid grid-cols-2 gap-4'>
                                        {stats.sourceBreakdown.map((source) => {
                                            const config = sourceConfig[source.source] || {
                                                color: '#6b7280',
                                                bgColor: 'bg-gray-500',
                                                icon: FaQuestion
                                            }
                                            const IconComponent = config.icon

                                            return (
                                                <div
                                                    key={source.source}
                                                    className='bg-primary/5 flex items-center gap-3 rounded-lg p-3'
                                                >
                                                    <div
                                                        className='flex h-10 w-10 items-center justify-center rounded-lg'
                                                        style={{
                                                            backgroundColor: `${config.color}20`
                                                        }}
                                                    >
                                                        <IconComponent
                                                            className='h-5 w-5'
                                                            style={{ color: config.color }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className='text-xl font-bold'>
                                                            {source.count}
                                                        </div>
                                                        <div className='text-primary/60 text-xs'>
                                                            {source.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className='bg-primary/5 rounded-xl p-6'>
                                    <h3 className='text-primary/70 mb-4 text-sm font-medium tracking-wide uppercase'>
                                        Insights
                                    </h3>
                                    <div className='space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-primary/70 text-sm'>
                                                Avg resources per concept
                                            </span>
                                            <span className='font-medium'>
                                                {(
                                                    stats.totalAllResources / stats.totalConcepts
                                                ).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-primary/70 text-sm'>
                                                Most common type
                                            </span>
                                            <span className='flex items-center gap-2 font-medium'>
                                                {(() => {
                                                    const top = stats.referenceTypeStatsWithBooks[0]
                                                    if (!top) return 'N/A'
                                                    const config = referenceTypeConfig[top.type]
                                                    if (!config) return top.type
                                                    const IconComponent = config.icon
                                                    return (
                                                        <>
                                                            <IconComponent
                                                                className='h-3.5 w-3.5'
                                                                style={{ color: config.color }}
                                                            />
                                                            {config.label}
                                                        </>
                                                    )
                                                })()}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-primary/70 text-sm'>
                                                Concepts with resources
                                            </span>
                                            <span className='font-medium'>
                                                {stats.conceptsWithBooks +
                                                    stats.conceptsWithReferences +
                                                    stats.conceptsWithArticles +
                                                    stats.conceptsWithTutorials >
                                                stats.totalConcepts
                                                    ? stats.totalConcepts
                                                    : Math.max(
                                                          stats.conceptsWithBooks,
                                                          stats.conceptsWithReferences,
                                                          stats.conceptsWithArticles,
                                                          stats.conceptsWithTutorials
                                                      )}
                                                +
                                            </span>
                                        </div>
                                        {stats.referenceTypeStatsWithBooks.length > 1 && (
                                            <div className='flex items-center justify-between'>
                                                <span className='text-primary/70 text-sm'>
                                                    Type variety
                                                </span>
                                                <span className='font-medium'>
                                                    {stats.referenceTypeStatsWithBooks.length} types
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </Section>
            )}

            {/* Tags */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-2 text-xl font-semibold'>Top Tags</h2>
                    <p className='text-primary/60 mb-6 text-sm'>
                        Showing top 20 most used tags (avg {stats.avgTagsPerConcept.toFixed(1)} tags
                        per concept)
                    </p>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='flex flex-wrap gap-2'>
                            {stats.topTags.map((tag) => {
                                // Calculate size based on frequency (min 0.75rem, max 1.5rem)
                                const minSize = 0.75
                                const maxSize = 1.5
                                const size =
                                    minSize + (tag.count / maxTagCount) * (maxSize - minSize)
                                // Calculate opacity based on frequency
                                const opacity = 0.5 + (tag.count / maxTagCount) * 0.5

                                return (
                                    <Link
                                        key={tag.name}
                                        to={`/tag/${encodeURIComponent(tag.name)}`}
                                        className='hover:bg-secondary/20 hover:border-secondary/40 cursor-pointer rounded-full border border-white/10 bg-card-subtle px-3 py-1 transition-colors'
                                        style={{
                                            fontSize: `${size}rem`,
                                            opacity
                                        }}
                                    >
                                        {tag.name}
                                        <span className='text-primary/50 ml-1 text-xs'>
                                            ({tag.count})
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Text Statistics */}
            <Section className='py-8 pb-16'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <h2 className='mb-6 text-xl font-semibold'>Content Statistics</h2>
                    <div className='grid gap-4 sm:grid-cols-3'>
                        <div className='bg-primary/5 rounded-xl p-6 text-center'>
                            <AnimatedCounter
                                value={stats.totalWords}
                                delay={0.2}
                                className='text-secondary text-3xl font-bold'
                            />
                            <div className='text-primary/60 text-sm'>Total Words</div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-6 text-center'>
                            <AnimatedCounter
                                value={stats.avgWordsPerConcept}
                                delay={0.3}
                                className='text-3xl font-bold text-blue-400'
                            />
                            <div className='text-primary/60 text-sm'>Avg Words per Concept</div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-6 text-center'>
                            <AnimatedCounter
                                value={stats.avgTagsPerConcept}
                                delay={0.4}
                                className='text-3xl font-bold text-green-400'
                                formatValue={(v) => v.toFixed(1)}
                            />
                            <div className='text-primary/60 text-sm'>Avg Tags per Concept</div>
                        </div>
                    </div>
                    <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                        <div className='bg-primary/5 rounded-xl p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-primary/70 text-sm'>
                                    Shortest Explanation
                                </span>
                                <span className='font-medium'>
                                    {stats.shortestExplanation.toLocaleString()} chars
                                </span>
                            </div>
                        </div>
                        <div className='bg-primary/5 rounded-xl p-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-primary/70 text-sm'>Longest Explanation</span>
                                <span className='font-medium'>
                                    {stats.longestExplanation.toLocaleString()} chars
                                </span>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>
        </AnimatedPage>
    )
}

export default StatisticsPage
