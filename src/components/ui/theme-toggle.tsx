import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '@/contexts/theme-context'

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-all duration-300 hover:scale-105 active:scale-95'
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            {theme === 'dark' ? (
                <FaSun className='h-5 w-5 text-amber-400 transition-transform duration-300' />
            ) : (
                <FaMoon className='h-5 w-5 text-indigo-500 transition-transform duration-300' />
            )}
        </button>
    )
}

export default ThemeToggle
