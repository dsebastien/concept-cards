import { useState } from 'react'
import { FaEnvelope, FaSpinner } from 'react-icons/fa'
import { subscribeToNewsletter } from '@/lib/ghost-api'

// Ghost site configuration
const GHOST_SITE_URL = 'https://www.dsebastien.net'
const NEWSLETTER_SESSION_KEY = 'newsletter_subscribed'

const CompactNewsletter: React.FC = () => {
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

    // Don't render if already subscribed
    if (hasSubscribed) {
        return null
    }

    return (
        <div className='bg-secondary/5 border-secondary/20 mx-auto max-w-4xl rounded-lg border p-4'>
            {subscribeStatus === 'success' ? (
                <div className='text-center'>
                    <p className='text-secondary text-sm font-semibold'>
                        ✓ Success! Please check your email to confirm your subscription.
                    </p>
                </div>
            ) : (
                <>
                    <form
                        onSubmit={handleNewsletterSubmit}
                        className='flex flex-col items-center gap-3 sm:flex-row'
                    >
                        <div className='flex items-center gap-2'>
                            <FaEnvelope className='text-secondary h-4 w-4' />
                            <span className='text-primary/80 text-sm font-medium'>
                                Get weekly knowledge tips:
                            </span>
                        </div>
                        <div className='flex w-full flex-1 flex-col gap-2 sm:flex-row sm:gap-3'>
                            <label htmlFor='compact-newsletter-email' className='sr-only'>
                                Email address for newsletter subscription
                            </label>
                            <input
                                id='compact-newsletter-email'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='your@email.com'
                                required
                                disabled={subscribeStatus === 'loading'}
                                className='bg-primary/5 border-primary/10 text-primary placeholder:text-primary/40 focus:border-secondary/50 flex-1 rounded-lg border px-3 py-2 text-sm transition-colors outline-none disabled:opacity-50'
                                aria-describedby='compact-newsletter-description'
                            />
                            <span id='compact-newsletter-description' className='sr-only'>
                                Subscribe to receive weekly updates about concepts and resources
                            </span>
                            <button
                                type='submit'
                                disabled={subscribeStatus === 'loading'}
                                className='bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                {subscribeStatus === 'loading' ? (
                                    <>
                                        <FaSpinner className='h-3 w-3 animate-spin' />
                                        Subscribing...
                                    </>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </div>
                    </form>
                    {subscribeStatus === 'error' && errorMessage && (
                        <div className='mt-2 text-center'>
                            <p className='text-xs font-semibold text-red-500'>⚠️ {errorMessage}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default CompactNewsletter
