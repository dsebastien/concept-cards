import { Link } from 'react-router'
import {
    FaFileContract,
    FaArrowLeft,
    FaEnvelope,
    FaLink,
    FaHandshake,
    FaRobot,
    FaExternalLinkAlt
} from 'react-icons/fa'
import Section from '@/components/ui/section'
import { AnimatedPage, AnimatedHero, AnimatedSection } from '@/components/ui/animated'

const DisclaimerPage: React.FC = () => {
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
                        <div className='bg-secondary/10 flex h-14 w-14 items-center justify-center rounded-full'>
                            <FaFileContract className='text-secondary h-7 w-7' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
                                Disclaimer
                            </h1>
                            <p className='text-primary/70 mt-1'>
                                Important information about this website
                            </p>
                        </div>
                    </div>
                </AnimatedHero>
            </Section>

            {/* AI-Generated Content */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaRobot className='text-secondary h-5 w-5' />
                            </div>
                            <h2 className='text-xl font-semibold'>AI-Generated Content</h2>
                        </div>
                        <div className='text-primary/80 space-y-4'>
                            <p>
                                The content on this website is generated with the help of AI, but is
                                primarily based on my personal notes available at{' '}
                                <a
                                    href='https://notes.dsebastien.net'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-secondary hover:text-secondary-text inline-flex items-center gap-1 underline'
                                >
                                    notes.dsebastien.net
                                    <FaExternalLinkAlt className='h-3 w-3' />
                                </a>
                                . These notes represent years of research, learning, and practical
                                application in knowledge management, productivity, and personal
                                development.
                            </p>
                            <p>
                                The content is also informed by my courses, products, newsletter,
                                and articles:
                            </p>
                            <ul className='list-inside list-disc space-y-2 pl-4'>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/obsidian-starter-kit'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Obsidian Starter Kit
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/obsidian-starter-course'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Obsidian Starter Course
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/knowledge-management-for-beginners'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Knowledge Management for Beginners
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/knowii-community'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Knowii Community
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/knowledge-worker-kit'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Knowledge Worker Kit
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/pkm-library'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Personal Knowledge Management Library
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/pkm-coaching'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Personal Knowledge Management Coaching
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/ai-ghostwriter-guide'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        AI Ghostwriter Guide
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://dev-concepts.dev'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Dev Concepts
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://dsebastien.net/newsletter'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        DeveloPassion's Newsletter
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/knowii-voice-ai'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Knowii Voice AI
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/journaling-deep-dive'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Journaling Deep Dive Workshop
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/clarity-101'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Clarity 101 Workshop
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/personal-organization-101'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Personal Organization 101 Workshop
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/ai-master-prompt'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        AI Master Prompt Workshop
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='https://store.dsebastien.net/product/model-context-protocol'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-secondary hover:text-secondary-text'
                                    >
                                        Model Context Protocol (MCP) Workshop
                                    </a>
                                </li>
                            </ul>
                            <p className='text-primary/60 mt-4 text-sm italic'>
                                If you find any mistakes, inaccuracies, or missing concepts, please
                                don't hesitate to{' '}
                                <a
                                    href='mailto:sebastien@developassion.be'
                                    className='text-secondary hover:text-secondary-text underline'
                                >
                                    contact me
                                </a>
                                . Your feedback helps improve the quality of this resource for
                                everyone.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Affiliate Disclosure */}
            <Section className='py-8'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaLink className='text-secondary h-5 w-5' />
                            </div>
                            <h2 className='text-xl font-semibold'>Affiliate Links Disclosure</h2>
                        </div>
                        <div className='text-primary/80 space-y-4'>
                            <p>
                                Some of the links on this website are affiliate links, which means I
                                may earn a small commission if you click through and make a
                                purchase. This comes at no additional cost to you.
                            </p>
                            <p>
                                These affiliate partnerships help support the maintenance and
                                development of this website, allowing me to continue curating and
                                sharing valuable concepts, methods, and principles with you.
                            </p>
                            <p>
                                I only recommend products and resources that I genuinely believe
                                provide value. My recommendations are based on the quality and
                                relevance of the content, not on potential affiliate earnings.
                            </p>
                            <p className='text-primary/60 text-sm italic'>
                                Thank you for your support!
                            </p>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>

            {/* Add Your Resources */}
            <Section className='py-8 pb-16'>
                <AnimatedSection className='mx-auto max-w-4xl'>
                    <div className='bg-primary/5 rounded-xl p-6'>
                        <div className='mb-4 flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaHandshake className='text-secondary h-5 w-5' />
                            </div>
                            <h2 className='text-xl font-semibold'>Add Your Resources</h2>
                        </div>
                        <div className='text-primary/80 space-y-4'>
                            <p>
                                Are you an author, content creator, or educator with resources
                                related to the concepts featured on this website? I offer a paid
                                service to add your links and resources to relevant concept pages.
                            </p>
                            <p>
                                This is a great opportunity to reach an engaged audience interested
                                in personal development, knowledge management, productivity, and
                                learning methodologies.
                            </p>
                            <div className='mt-6'>
                                <a
                                    href='mailto:sebastien@developassion.be'
                                    className='bg-secondary hover:bg-secondary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors'
                                >
                                    <FaEnvelope className='h-4 w-4' />
                                    Contact Me
                                </a>
                                <p className='text-primary/60 mt-3 text-sm'>
                                    Email: sebastien@developassion.be
                                </p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </Section>
        </AnimatedPage>
    )
}

export default DisclaimerPage
