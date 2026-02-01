import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'concept-cards-theme'
const USER_PREFERENCE_KEY = 'concept-cards-theme-user-set'

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Track whether user has manually set a preference
    const [isUserPreference, setIsUserPreference] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(USER_PREFERENCE_KEY) === 'true'
        }
        return false
    })

    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
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
        localStorage.setItem(STORAGE_KEY, theme)
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
        localStorage.setItem(USER_PREFERENCE_KEY, 'true')
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }

    const setTheme = (newTheme: Theme) => {
        // Mark that user has manually set a preference
        setIsUserPreference(true)
        localStorage.setItem(USER_PREFERENCE_KEY, 'true')
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
