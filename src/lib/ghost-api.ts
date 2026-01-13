/**
 * Ghost API utilities for newsletter subscription
 * Uses Ghost 6+ Members API endpoint with integrity token
 */

export interface NewsletterSubscriptionOptions {
    email: string
    name?: string
    newsletters?: string[]
}

export interface NewsletterSubscriptionResult {
    success: boolean
    message?: string
    error?: string
}

/**
 * Fetch integrity token from Ghost
 * Required for Ghost 5.91.0+ and Ghost 6+
 *
 * @param ghostSiteUrl - Full URL to your Ghost site
 * @returns Integrity token string
 */
async function getIntegrityToken(ghostSiteUrl: string): Promise<string> {
    const endpoint = `${ghostSiteUrl}/members/api/integrity-token/`

    console.log('[Ghost API] Fetching integrity token:', endpoint)

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'app-pragma': 'no-cache',
            'x-ghost-version': '6.0'
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch integrity token: ${response.status}`)
    }

    const token = await response.text()
    console.log('[Ghost API] Integrity token received:', token.substring(0, 20) + '...')

    return token
}

/**
 * Subscribe an email address to Ghost newsletter
 *
 * Uses the `/members/api/send-magic-link` endpoint which:
 * - Requires integrity token (Ghost 6+)
 * - Sends a magic link email for verification
 * - Subscribes to specified newsletters
 * - Account remains unconfirmed until user clicks the magic link
 *
 * @param ghostSiteUrl - Full URL to your Ghost site (e.g., 'https://www.dsebastien.net')
 * @param options - Subscription options including email and newsletters
 * @returns Result object with success status and message
 */
export async function subscribeToNewsletter(
    ghostSiteUrl: string,
    options: NewsletterSubscriptionOptions
): Promise<NewsletterSubscriptionResult> {
    const { email, name, newsletters = [] } = options

    // Validate email format
    if (!email || !email.includes('@')) {
        return {
            success: false,
            error: 'Please enter a valid email address'
        }
    }

    try {
        // Step 1: Get integrity token
        const integrityToken = await getIntegrityToken(ghostSiteUrl)

        // Step 2: Send magic link with integrity token
        const endpoint = `${ghostSiteUrl}/members/api/send-magic-link`

        const payload: Record<string, unknown> = {
            email,
            emailType: 'subscribe',
            integrityToken
        }

        // Add optional fields
        if (name) {
            payload['name'] = name
        }

        if (newsletters.length > 0) {
            // Newsletters should be an array of objects with 'id' property
            payload['newsletters'] = newsletters.map((id) => ({ id }))
        }

        console.log('[Ghost API] Subscribing to newsletter:', {
            endpoint,
            email,
            name,
            newsletters
        })

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        console.log('[Ghost API] Response status:', response.status)

        // Ghost returns 201 for successful subscription
        if (response.status === 201) {
            console.log('[Ghost API] Success - magic link sent')

            return {
                success: true,
                message: 'Success! Please check your email to confirm your subscription.'
            }
        }

        // Handle error responses
        const errorData = await response.json().catch(() => ({}))
        console.error('[Ghost API] Error response:', errorData)

        // Check for specific error messages from Ghost
        if (errorData.errors && errorData.errors.length > 0) {
            const errorMessage = errorData.errors[0].message || 'Subscription failed'
            return {
                success: false,
                error: errorMessage
            }
        }

        return {
            success: false,
            error: 'Failed to subscribe. Please try again later.'
        }
    } catch (error) {
        console.error('[Ghost API] Error:', error)
        return {
            success: false,
            error: 'Network error. Please check your connection and try again.'
        }
    }
}
