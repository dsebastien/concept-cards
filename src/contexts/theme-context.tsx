import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/** Storage keys for theme persistence */
export const THEME_STORAGE_KEYS = {
    /** Current theme preference (light/dark) */
    THEME: 'concept-cards-theme',
    /** Whether user has manually set a preference (prevents system preference override) */
    USER_PREFERENCE: 'concept-cards-theme-user-set'
} as const

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Track whether this is the initial mount to avoid redundant localStorage writes
    const isInitialMount = useRef(true)

    // Track whether user has manually set a preference
    const [isUserPreference, setIsUserPreference] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(THEME_STORAGE_KEYS.USER_PREFERENCE) === 'true'
        }
        return false
    })

    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEYS.THEME)
            if (stored === 'light' || stored === 'dark') {
                return stored
            }
            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light'
            }
        }
        return 'dark'
    })

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement
        root.setAttribute('data-theme', theme)

        // Skip localStorage write on initial mount (already set by inline script or previous session)
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        localStorage.setItem(THEME_STORAGE_KEYS.THEME, theme)
    }, [theme])

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!isUserPreference) {
                setThemeState(e.matches ? 'light' : 'dark')
            }
        }
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [isUserPreference])

    const toggleTheme = () => {
        // Mark that user has manually set a preference
        setIsUserPreference(true)
        localStorage.setItem(THEME_STORAGE_KEYS.USER_PREFERENCE, 'true')
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }

    const setTheme = (newTheme: Theme) => {
        // Mark that user has manually set a preference
        setIsUserPreference(true)
        localStorage.setItem(THEME_STORAGE_KEYS.USER_PREFERENCE, 'true')
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
