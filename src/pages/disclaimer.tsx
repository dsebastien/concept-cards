import { Link } from 'react-router'
import { FaFileContract, FaArrowLeft, FaEnvelope, FaLink, FaHandshake } from 'react-icons/fa'
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
