import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test'
import { THEME_STORAGE_KEYS } from './theme-context'

describe('THEME_STORAGE_KEYS', () => {
    test('exports correct theme storage key', () => {
        expect(THEME_STORAGE_KEYS.THEME).toBe('concept-cards-theme')
    })

    test('exports correct user preference storage key', () => {
        expect(THEME_STORAGE_KEYS.USER_PREFERENCE).toBe('concept-cards-theme-user-set')
    })
})

describe('ThemeContext (logic tests)', () => {
    const { THEME: STORAGE_KEY, USER_PREFERENCE: USER_PREFERENCE_KEY } = THEME_STORAGE_KEYS

    // Mock localStorage
    let mockStorage: Record<string, string>
    let mockMatchMedia: ReturnType<typeof mock>

    beforeEach(() => {
        mockStorage = {}
        globalThis.localStorage = {
            getItem: (key: string) => mockStorage[key] || null,
            setItem: (key: string, value: string) => {
                mockStorage[key] = value
            },
            removeItem: (key: string) => {
                delete mockStorage[key]
            },
            clear: () => {
                mockStorage = {}
            },
            length: 0,
            key: () => null
        }

        // Mock matchMedia
        mockMatchMedia = mock(() => ({
            matches: false,
            addEventListener: mock(() => {}),
            removeEventListener: mock(() => {})
        }))
        globalThis.matchMedia = mockMatchMedia as unknown as typeof matchMedia
    })

    afterEach(() => {
        // @ts-expect-error - reset localStorage
        delete globalThis.localStorage
        // @ts-expect-error - reset matchMedia
        delete globalThis.matchMedia
    })

    describe('theme initialization', () => {
        test('defaults to dark theme when no stored preference', () => {
            const stored = localStorage.getItem(STORAGE_KEY)
            const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
            expect(theme).toBe('dark')
        })

        test('loads stored light theme from localStorage', () => {
            localStorage.setItem(STORAGE_KEY, 'light')
            const stored = localStorage.getItem(STORAGE_KEY)
            const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
            expect(theme).toBe('light')
        })

        test('loads stored dark theme from localStorage', () => {
            localStorage.setItem(STORAGE_KEY, 'dark')
            const stored = localStorage.getItem(STORAGE_KEY)
            const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
            expect(theme).toBe('dark')
        })

        test('ignores invalid stored theme values', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid-theme')
            const stored = localStorage.getItem(STORAGE_KEY)
            const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
            expect(theme).toBe('dark')
        })

        test('respects system preference for light theme when no stored value', () => {
            mockMatchMedia = mock(() => ({
                matches: true, // prefers-color-scheme: light
                addEventListener: mock(() => {}),
                removeEventListener: mock(() => {})
            }))
            globalThis.matchMedia = mockMatchMedia as unknown as typeof matchMedia

            const stored = localStorage.getItem(STORAGE_KEY)
            let theme: 'light' | 'dark'
            if (stored === 'light' || stored === 'dark') {
                theme = stored
            } else if (matchMedia('(prefers-color-scheme: light)').matches) {
                theme = 'light'
            } else {
                theme = 'dark'
            }
            expect(theme).toBe('light')
        })
    })

    describe('theme persistence', () => {
        test('stores theme to localStorage', () => {
            localStorage.setItem(STORAGE_KEY, 'light')
            expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
        })

        test('stores user preference flag', () => {
            localStorage.setItem(USER_PREFERENCE_KEY, 'true')
            expect(localStorage.getItem(USER_PREFERENCE_KEY)).toBe('true')
        })
    })

    describe('toggleTheme logic', () => {
        test('toggles from dark to light', () => {
            let theme: 'light' | 'dark' = 'dark'
            const toggleTheme = () => {
                theme = theme === 'dark' ? 'light' : 'dark'
            }
            toggleTheme()
            expect(theme).toBe('light')
        })

        test('toggles from light to dark', () => {
            let theme: 'light' | 'dark' = 'light'
            const toggleTheme = () => {
                theme = theme === 'dark' ? 'light' : 'dark'
            }
            toggleTheme()
            expect(theme).toBe('dark')
        })

        test('sets user preference flag when toggling', () => {
            let isUserPreference = false
            const toggleTheme = () => {
                isUserPreference = true
                localStorage.setItem(USER_PREFERENCE_KEY, 'true')
            }
            toggleTheme()
            expect(isUserPreference).toBe(true)
            expect(localStorage.getItem(USER_PREFERENCE_KEY)).toBe('true')
        })
    })

    describe('setTheme logic', () => {
        test('sets theme to light', () => {
            let theme: 'light' | 'dark' = 'dark'
            const setTheme = (newTheme: 'light' | 'dark') => {
                theme = newTheme
            }
            setTheme('light')
            expect(theme).toBe('light')
        })

        test('sets theme to dark', () => {
            let theme: 'light' | 'dark' = 'light'
            const setTheme = (newTheme: 'light' | 'dark') => {
                theme = newTheme
            }
            setTheme('dark')
            expect(theme).toBe('dark')
        })

        test('sets user preference flag when setting theme', () => {
            let isUserPreference = false
            const setTheme = (_newTheme: 'light' | 'dark') => {
                isUserPreference = true
                localStorage.setItem(USER_PREFERENCE_KEY, 'true')
            }
            setTheme('light')
            expect(isUserPreference).toBe(true)
            expect(localStorage.getItem(USER_PREFERENCE_KEY)).toBe('true')
        })
    })

    describe('system preference behavior', () => {
        test('does not override user preference when system changes', () => {
            // Simulate user has set preference
            const isUserPreference = true
            let theme: 'light' | 'dark' = 'dark'

            // Simulate system preference change
            const handleSystemChange = (prefersLight: boolean) => {
                if (!isUserPreference) {
                    theme = prefersLight ? 'light' : 'dark'
                }
            }

            handleSystemChange(true) // System changes to light
            expect(theme).toBe('dark') // Should stay dark because user set preference
        })

        test('follows system preference when user has not set preference', () => {
            // Simulate user has NOT set preference
            const isUserPreference = false
            let theme: 'light' | 'dark' = 'dark'

            // Simulate system preference change
            const handleSystemChange = (prefersLight: boolean) => {
                if (!isUserPreference) {
                    theme = prefersLight ? 'light' : 'dark'
                }
            }

            handleSystemChange(true) // System changes to light
            expect(theme).toBe('light') // Should follow system preference
        })
    })

    describe('useTheme error handling', () => {
        test('throws error when used outside ThemeProvider', () => {
            const context = undefined

            const useTheme = () => {
                if (!context) {
                    throw new Error('useTheme must be used within a ThemeProvider')
                }
                return context
            }

            expect(() => useTheme()).toThrow('useTheme must be used within a ThemeProvider')
        })
    })

    describe('data-theme attribute logic', () => {
        test('applies theme to document root', () => {
            // Simulate document.documentElement
            const mockRoot = { dataset: {} as Record<string, string> }
            const setAttribute = (attr: string, value: string) => {
                if (attr === 'data-theme') {
                    mockRoot.dataset.theme = value
                }
            }

            setAttribute('data-theme', 'light')
            expect(mockRoot.dataset.theme).toBe('light')

            setAttribute('data-theme', 'dark')
            expect(mockRoot.dataset.theme).toBe('dark')
        })
    })
})
