import { describe, expect, test, mock, beforeEach, afterEach, spyOn } from 'bun:test'
import { subscribeToNewsletter } from './ghost-api'

describe('subscribeToNewsletter', () => {
    const originalFetch = globalThis.fetch
    let mockFetch: ReturnType<typeof mock>
    let consoleLogSpy: ReturnType<typeof spyOn>
    let consoleErrorSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
        mockFetch = mock(() => Promise.resolve(new Response()))
        globalThis.fetch = mockFetch
        consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {})
        consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
        consoleLogSpy.mockRestore()
        consoleErrorSpy.mockRestore()
    })

    test('returns error for invalid email', async () => {
        const result = await subscribeToNewsletter('https://example.com', {
            email: 'invalid-email'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Please enter a valid email address')
        expect(mockFetch).not.toHaveBeenCalled()
    })

    test('returns error for empty email', async () => {
        const result = await subscribeToNewsletter('https://example.com', {
            email: ''
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Please enter a valid email address')
    })

    test('fetches integrity token before subscribing', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-integrity-token', { status: 200 }))
            )
            .mockImplementationOnce(() => Promise.resolve(new Response('', { status: 201 })))

        globalThis.fetch = mockFetch

        await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        expect(mockFetch).toHaveBeenCalledTimes(2)
        expect(mockFetch.mock.calls[0][0]).toBe('https://example.com/members/api/integrity-token/')
    })

    test('sends correct payload for subscription', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-token', { status: 200 }))
            )
            .mockImplementationOnce(() => Promise.resolve(new Response('', { status: 201 })))

        globalThis.fetch = mockFetch

        await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com',
            name: 'Test User',
            newsletters: ['newsletter-1']
        })

        const subscribeCall = mockFetch.mock.calls[1]
        expect(subscribeCall[0]).toBe('https://example.com/members/api/send-magic-link')
        expect(subscribeCall[1].method).toBe('POST')

        const body = JSON.parse(subscribeCall[1].body)
        expect(body.email).toBe('test@example.com')
        expect(body.name).toBe('Test User')
        expect(body.emailType).toBe('subscribe')
        expect(body.integrityToken).toBe('test-token')
        expect(body.newsletters).toEqual([{ id: 'newsletter-1' }])
    })

    test('returns success message on 201 response', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-token', { status: 200 }))
            )
            .mockImplementationOnce(() => Promise.resolve(new Response('', { status: 201 })))

        globalThis.fetch = mockFetch

        const result = await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        expect(result.success).toBe(true)
        expect(result.message).toBe(
            'Success! Please check your email to confirm your subscription.'
        )
    })

    test('returns error from Ghost API response', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-token', { status: 200 }))
            )
            .mockImplementationOnce(() =>
                Promise.resolve(
                    new Response(
                        JSON.stringify({
                            errors: [{ message: 'Email already subscribed' }]
                        }),
                        { status: 400 }
                    )
                )
            )

        globalThis.fetch = mockFetch

        const result = await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Email already subscribed')
    })

    test('returns generic error on non-201 response without error details', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-token', { status: 200 }))
            )
            .mockImplementationOnce(() => Promise.resolve(new Response('{}', { status: 400 })))

        globalThis.fetch = mockFetch

        const result = await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Failed to subscribe. Please try again later.')
    })

    test('returns network error on fetch failure', async () => {
        mockFetch = mock().mockImplementationOnce(() => Promise.reject(new Error('Network error')))

        globalThis.fetch = mockFetch

        const result = await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error. Please check your connection and try again.')
    })

    test('returns error when integrity token fetch fails', async () => {
        mockFetch = mock().mockImplementationOnce(() =>
            Promise.resolve(new Response('', { status: 500 }))
        )

        globalThis.fetch = mockFetch

        const result = await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error. Please check your connection and try again.')
    })

    test('does not include name if not provided', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-token', { status: 200 }))
            )
            .mockImplementationOnce(() => Promise.resolve(new Response('', { status: 201 })))

        globalThis.fetch = mockFetch

        await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com'
        })

        const subscribeCall = mockFetch.mock.calls[1]
        const body = JSON.parse(subscribeCall[1].body)
        expect(body.name).toBeUndefined()
    })

    test('does not include newsletters if empty array', async () => {
        mockFetch = mock()
            .mockImplementationOnce(() =>
                Promise.resolve(new Response('test-token', { status: 200 }))
            )
            .mockImplementationOnce(() => Promise.resolve(new Response('', { status: 201 })))

        globalThis.fetch = mockFetch

        await subscribeToNewsletter('https://example.com', {
            email: 'test@example.com',
            newsletters: []
        })

        const subscribeCall = mockFetch.mock.calls[1]
        const body = JSON.parse(subscribeCall[1].body)
        expect(body.newsletters).toBeUndefined()
    })
})
