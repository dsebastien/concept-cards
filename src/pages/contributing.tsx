import { Link } from 'react-router'
import {
    FaArrowLeft,
    FaGithub,
    FaCodeBranch,
    FaBug,
    FaLightbulb,
    FaComments,
    FaExternalLinkAlt,
    FaBook
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, AnimatedSection } from '@/components/ui/animated'

const GITHUB_REPO = 'https://github.com/dsebastien/concept-cards'

const ContributingPage: React.FC = () => {
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
                            <FaCodeBranch className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Contributing
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Help make this resource better for everyone
                            </p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* Open Source */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaGithub className='text-secondary h-5 w-5' />
                            </div>
                            <h2 className='text-xl font-semibold'>Open Source Project</h2>
                        </div>
                        <div className='text-primary/80 space-y-4'>
                            <p>
                                This project is open source and available on GitHub. We welcome
                                contributions from the community, whether it's adding new concepts,
                                improving existing content, fixing bugs, or suggesting new features.
                            </p>
                            <div className='flex flex-wrap gap-3 pt-2'>
                                <a
                                    href={GITHUB_REPO}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors'
                                >
                                    <FaGithub className='h-4 w-4' />
                                    View on GitHub
                                    <FaExternalLinkAlt className='h-3 w-3' />
                                </a>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Ways to Contribute */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaLightbulb className='text-secondary h-5 w-5' />
                            </div>
                            <h2 className='text-xl font-semibold'>Ways to Contribute</h2>
                        </div>
                        <div className='text-primary/80 space-y-4'>
                            <ul className='list-inside list-disc space-y-3 pl-2'>
                                <li>
                                    <strong>Add new concepts:</strong> Share knowledge by creating
                                    new concept cards
                                </li>
                                <li>
                                    <strong>Improve content:</strong> Enhance explanations, fix
                                    errors, or add missing references
                                </li>
                                <li>
                                    <strong>Report issues:</strong> Found a bug or have a
                                    suggestion? Open an issue
                                </li>
                                <li>
                                    <strong>Code contributions:</strong> Help improve the website's
                                    features and functionality
                                </li>
                            </ul>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Getting Started */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaBook className='text-secondary h-5 w-5' />
                            </div>
                            <h2 className='text-xl font-semibold'>Getting Started</h2>
                        </div>
                        <div className='text-primary/80 space-y-4'>
                            <p>
                                Ready to contribute? Check out our contribution guide for detailed
                                instructions on how to get started, including setting up your
                                development environment, code style guidelines, and the pull request
                                process.
                            </p>
                            <div className='pt-2'>
                                <a
                                    href={`${GITHUB_REPO}/blob/main/CONTRIBUTING.md`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-secondary hover:text-secondary-text inline-flex items-center gap-2 underline'
                                >
                                    Read the Contribution Guide
                                    <FaExternalLinkAlt className='h-3 w-3' />
                                </a>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Issues and Discussions */}
            <Section className='py-8 pb-16'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        {/* Issues */}
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <div className='mb-4 flex items-center gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                    <FaBug className='text-secondary h-5 w-5' />
                                </div>
                                <h2 className='text-xl font-semibold'>Issues</h2>
                            </div>
                            <div className='text-primary/80 space-y-4'>
                                <p>
                                    Report bugs, request features, or suggest improvements through
                                    GitHub Issues.
                                </p>
                                <a
                                    href={`${GITHUB_REPO}/issues`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-secondary hover:text-secondary-text inline-flex items-center gap-2 underline'
                                >
                                    View Issues
                                    <FaExternalLinkAlt className='h-3 w-3' />
                                </a>
                            </div>
                        </div>

                        {/* Discussions */}
                        <div className='bg-primary/5 rounded-xl p-6'>
                            <div className='mb-4 flex items-center gap-3'>
                                <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                    <FaComments className='text-secondary h-5 w-5' />
                                </div>
                                <h2 className='text-xl font-semibold'>Discussions</h2>
                            </div>
                            <div className='text-primary/80 space-y-4'>
                                <p>
                                    Have questions or ideas? Join the conversation in GitHub
                                    Discussions.
                                </p>
                                <a
                                    href={`${GITHUB_REPO}/discussions`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-secondary hover:text-secondary-text inline-flex items-center gap-2 underline'
                                >
                                    Join Discussions
                                    <FaExternalLinkAlt className='h-3 w-3' />
                                </a>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>
        </AnimatedPage>
    )
}

export default ContributingPage
