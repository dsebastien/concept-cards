import { useState } from 'react'
import { Link } from 'react-router'
import {
    FaHeart,
    FaBrain,
    FaDice,
    FaChartBar,
    FaCompass,
    FaFolder,
    FaStar,
    FaFileContract,
    FaBook,
    FaNewspaper,
    FaLink,
    FaStickyNote,
    FaHistory,
    FaTag,
    FaCodeBranch,
    FaGithub,
    FaClipboardList,
    FaSpinner
} from 'react-icons/fa'
import resourcesData from '@/data/resources.json'
import socialsData from '@/data/socials.json'
import ConceptIcon from '@/components/concepts/concept-icon'
import { subscribeToNewsletter } from '@/lib/ghost-api'

// Ghost site configuration
const GHOST_SITE_URL = 'https://www.dsebastien.net'
const NEWSLETTER_SESSION_KEY = 'newsletter_subscribed'

const Footer: React.FC = () => {
    const [email, setEmail] = useState('')
    const [subscribeStatus, setSubscribeStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')
    // Initialize hasSubscribed from sessionStorage using lazy initializer
    const [hasSubscribed, setHasSubscribed] = useState<boolean>(() => {
        const subscribed = sessionStorage.getItem(NEWSLETTER_SESSION_KEY)
        if (subscribed === 'true') {
            console.log('[Newsletter] User has already subscribed (from sessionStorage)')
            return true
        }
        return false
    })

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setSubscribeStatus('loading')
        setErrorMessage('')

        console.log('[Newsletter] Submitting subscription for:', email)

        const result = await subscribeToNewsletter(GHOST_SITE_URL, {
            email: email.trim(),
            newsletters: [] // Subscribe to all newsletters (empty = default)
        })

        console.log('[Newsletter] Subscription result:', result)

        if (result.success) {
            setSubscribeStatus('success')
            setEmail('')
            // Store subscription in sessionStorage after a delay to show success message
            console.log('[Newsletter] Subscription successful, showing success message')
            setTimeout(() => {
                sessionStorage.setItem(NEWSLETTER_SESSION_KEY, 'true')
                setHasSubscribed(true)
                console.log('[Newsletter] Subscription stored in sessionStorage')
            }, 3000) // Hide after 3 seconds
        } else {
            setSubscribeStatus('error')
            setErrorMessage(result.error || 'Subscription failed. Please try again.')
        }
    }

    return (
        <footer className='border-primary/10 bg-background border-t'>
            {/* Newsletter Section - Hidden if user already subscribed */}
            {!hasSubscribed && (
                <div className='bg-secondary/5 border-primary/10 border-b py-12 sm:py-16'>
                    <div className='xg:px-24 mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20 xl:px-32'>
                        <div className='mx-auto max-w-2xl text-center'>
                            <h3 className='mb-2 text-2xl font-bold sm:text-3xl'>
                                Stay Updated with Knowledge Tips
                            </h3>
                            <p className='text-primary/70 mb-6 text-sm sm:text-base'>
                                Join thousands of knowledge workers getting weekly insights on PKM,
                                productivity, and lifelong learning.
                            </p>
                            {subscribeStatus === 'success' ? (
                                <div className='bg-secondary/10 border-secondary/30 rounded-lg border px-6 py-4'>
                                    <p className='text-secondary font-semibold'>
                                        ✓ Success! Please check your email to confirm your
                                        subscription.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <form
                                        onSubmit={handleNewsletterSubmit}
                                        className='mx-auto flex max-w-md flex-col gap-3 sm:flex-row'
                                    >
                                        <label htmlFor='newsletter-email' className='sr-only'>
                                            Email address for newsletter subscription
                                        </label>
                                        <input
                                            id='newsletter-email'
                                            type='email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder='Enter your email'
                                            required
                                            disabled={subscribeStatus === 'loading'}
                                            className='bg-primary/5 border-primary/10 text-primary placeholder:text-primary/40 focus:border-secondary/50 flex-1 rounded-lg border px-4 py-3 text-sm transition-colors outline-none disabled:opacity-50'
                                            aria-describedby='newsletter-description'
                                        />
                                        <span id='newsletter-description' className='sr-only'>
                                            Subscribe to receive updates about new concepts and
                                            resources
                                        </span>
                                        <button
                                            type='submit'
                                            disabled={subscribeStatus === 'loading'}
                                            className='bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold whitespace-nowrap text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                                        >
                                            {subscribeStatus === 'loading' ? (
                                                <>
                                                    <FaSpinner className='h-4 w-4 animate-spin' />
                                                    Subscribing...
                                                </>
                                            ) : (
                                                'Subscribe'
                                            )}
                                        </button>
                                    </form>
                                    {subscribeStatus === 'error' && errorMessage && (
                                        <div className='mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3'>
                                            <p className='text-sm font-semibold text-red-500'>
                                                ⚠️ {errorMessage}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Footer Content */}
            <div className='xg:px-24 mx-auto max-w-7xl px-6 pt-12 pb-20 sm:px-10 sm:pt-16 sm:pb-24 md:px-16 md:pt-20 md:pb-28 lg:px-20 lg:pt-24 lg:pb-32 xl:px-32'>
                <div className='grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-12'>
                    {/* Logo and Description */}
                    <div className='flex flex-col gap-4'>
                        <Link to='/' className='flex items-center gap-3'>
                            <div className='bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                <FaBrain className='text-secondary h-5 w-5' />
                            </div>
                            <span className='text-lg font-bold'>Concepts</span>
                        </Link>
                        <p className='text-primary/70 text-sm'>
                            A curated collection of concepts, methods, and principles.
                        </p>
                        <div className='flex flex-wrap gap-3 pt-2'>
                            {socialsData.socials.map((social) => (
                                <a
                                    key={social.url}
                                    href={social.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='transition-transform hover:scale-110'
                                    aria-label={social.name}
                                    title={social.name}
                                >
                                    <ConceptIcon icon={social.icon} category='' size='md' />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Explore</h3>
                        <ul className='space-y-2 text-sm'>
                            <li>
                                <Link
                                    to='/featured'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaStar className='h-4 w-4' />
                                    Featured
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/unexplored'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaCompass className='h-4 w-4' />
                                    Unexplored
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/random'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaDice className='h-4 w-4' />
                                    Random Concept
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/categories'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaFolder className='h-4 w-4' />
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/tags'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaTag className='h-4 w-4' />
                                    Tags
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/statistics'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaChartBar className='h-4 w-4' />
                                    Statistics
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/history'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaHistory className='h-4 w-4' />
                                    History
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Content</h3>
                        <ul className='space-y-2 text-sm'>
                            <li>
                                <Link
                                    to='/books'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaBook className='h-4 w-4' />
                                    Books
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/articles'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaNewspaper className='h-4 w-4' />
                                    Articles
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/references'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaLink className='h-4 w-4' />
                                    References
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/notes'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaStickyNote className='h-4 w-4' />
                                    Notes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/disclaimer'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaFileContract className='h-4 w-4' />
                                    Disclaimer
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/contributing'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaCodeBranch className='h-4 w-4' />
                                    Contributing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/changelog'
                                    className='text-primary/70 hover:text-secondary inline-flex items-center gap-2 transition-colors'
                                >
                                    <FaClipboardList className='h-4 w-4' />
                                    Changelog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className='mb-4 font-semibold'>Resources</h3>
                        <ul className='space-y-2 text-sm'>
                            {resourcesData.resources.map((resource) => (
                                <li key={resource.url}>
                                    <a
                                        href={resource.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-primary/70 hover:text-secondary flex items-center gap-2 transition-colors'
                                    >
                                        <ConceptIcon icon={resource.icon} category='' size='sm' />
                                        {resource.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className='border-primary/10 text-primary/70 mt-12 border-t pt-12 text-center text-sm sm:mt-16 sm:pt-16 lg:mt-20 lg:pt-20'>
                    <p className='flex items-center justify-center gap-1'>
                        Made with <FaHeart className='text-secondary h-4 w-4' /> by{' '}
                        <a
                            href='https://www.dsebastien.net'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-secondary transition-colors'
                        >
                            Sébastien Dubois
                        </a>
                    </p>
                    <p className='mt-2 flex items-center justify-center gap-1'>
                        <FaGithub className='h-4 w-4' />
                        <a
                            href='https://github.com/dsebastien/concept-cards'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='hover:text-secondary transition-colors'
                        >
                            Open Source
                        </a>
                        {' · '}
                        <Link to='/contributing' className='hover:text-secondary transition-colors'>
                            Contributions welcome
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
