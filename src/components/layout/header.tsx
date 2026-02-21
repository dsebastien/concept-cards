import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import {
    FaBrain,
    FaDice,
    FaCompass,
    FaStar,
    FaFolder,
    FaChartBar,
    FaBars,
    FaTimes,
    FaBook,
    FaNewspaper,
    FaLink,
    FaStickyNote,
    FaHistory,
    FaTag,
    FaProjectDiagram
} from 'react-icons/fa'
import type { NavLink } from '@/types/nav-link.intf'
import ThemeToggle from '@/components/ui/theme-toggle'

// Links that are always visible (even on mobile, as icons)
const alwaysVisibleLinks: NavLink[] = [
    {
        to: '/explore',
        label: 'Explore',
        icon: <FaProjectDiagram className='h-5 w-5' />,
        color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
        to: '/unexplored',
        label: 'Unexplored',
        icon: <FaCompass className='h-5 w-5' />,
        color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
    }
]

// Links that go into the hamburger menu on smaller screens
const menuLinks: NavLink[] = [
    {
        to: '/featured',
        label: 'Featured',
        icon: <FaStar className='h-5 w-5' />,
        color: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
    },
    {
        to: '/random',
        label: 'Random',
        icon: <FaDice className='h-5 w-5' />,
        color: 'bg-primary/10 hover:bg-primary/20'
    },
    {
        to: '/categories',
        label: 'Categories',
        icon: <FaFolder className='h-5 w-5' />,
        color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
        to: '/tags',
        label: 'Tags',
        icon: <FaTag className='h-5 w-5' />,
        color: 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
    },
    {
        to: '/statistics',
        label: 'Statistics',
        icon: <FaChartBar className='h-5 w-5' />,
        color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20'
    },
    {
        to: '/books',
        label: 'Books',
        icon: <FaBook className='h-5 w-5' />,
        color: 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
    },
    {
        to: '/articles',
        label: 'Articles',
        icon: <FaNewspaper className='h-5 w-5' />,
        color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
    },
    {
        to: '/references',
        label: 'References',
        icon: <FaLink className='h-5 w-5' />,
        color: 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
    },
    {
        to: '/notes',
        label: 'Notes',
        icon: <FaStickyNote className='h-5 w-5' />,
        color: 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
    },
    {
        to: '/history',
        label: 'History',
        icon: <FaHistory className='h-5 w-5' />,
        color: 'text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20'
    }
]

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false)
    }, [location.pathname])

    // Prevent body scroll when menu is open and handle ESC key
    useEffect(() => {
        if (!isMenuOpen) {
            document.body.style.overflow = ''
            return
        }

        document.body.style.overflow = 'hidden'

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false)
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleEsc)
        }
    }, [isMenuOpen])

    return (
        <>
            <header className='border-primary/10 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-lg shadow-black/5 backdrop-blur-md'>
                <nav className='mx-auto max-w-7xl'>
                    <div className='flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
                        {/* Logo */}
                        <div className='flex items-center'>
                            <Link
                                to='/'
                                className='flex cursor-pointer items-center gap-3 transition-transform hover:scale-105 active:scale-95 sm:gap-4'
                            >
                                <div className='relative'>
                                    <div className='bg-secondary/20 absolute inset-0 rounded-full blur-md'></div>
                                    <div className='bg-secondary/10 relative flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 md:h-14 md:w-14'>
                                        <FaBrain className='text-secondary h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7' />
                                    </div>
                                </div>
                                <span className='from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl md:text-2xl'>
                                    Concepts
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className='flex items-center gap-1 sm:gap-2'>
                            {/* Always visible links (icons on mobile, labels on xl) */}
                            {alwaysVisibleLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-lg transition-colors xl:w-auto xl:px-4 ${link.color}`}
                                    title={link.label}
                                >
                                    {link.icon}
                                    <span className='hidden xl:inline'>{link.label}</span>
                                </Link>
                            ))}

                            {/* Website Link - always visible */}
                            <a
                                href='https://www.dsebastien.net'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-lg transition-colors xl:w-auto xl:px-4'
                                title='DeveloPassion Website'
                            >
                                <img
                                    src='/assets/images/developassion-logo.png'
                                    alt='DeveloPassion'
                                    className='h-5 w-5 rounded-full object-contain'
                                />
                                <span className='hidden xl:inline'>Website</span>
                            </a>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Hamburger Menu Button - always visible */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors'
                                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <FaTimes className='h-5 w-5' />
                                ) : (
                                    <FaBars className='h-5 w-5' />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Fullscreen Overlay Menu */}
            <div
                className={`bg-background/98 fixed inset-0 z-40 flex flex-col backdrop-blur-md transition-all duration-300 ${
                    isMenuOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
                }`}
                style={{ top: '64px' }}
                onClick={() => setIsMenuOpen(false)}
            >
                {/* Close button */}
                <div className='flex justify-end p-4 sm:p-6' onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className='bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors'
                        aria-label='Close menu'
                    >
                        <FaTimes className='h-5 w-5' />
                    </button>
                </div>

                <div
                    className='flex-1 overflow-y-auto px-6 pb-6'
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Grid on desktop, compact list on mobile */}
                    <div className='mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-4 lg:gap-6'>
                        {menuLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-4 text-center transition-all hover:scale-105 sm:gap-3 sm:p-6 md:p-5 lg:p-8 ${link.color}`}
                            >
                                <span className='text-2xl sm:text-3xl md:text-3xl lg:text-4xl'>
                                    {link.icon}
                                </span>
                                <span className='text-sm font-medium sm:text-base'>
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Close hint */}
                <div className='text-primary/40 shrink-0 py-4 text-center text-sm'>
                    Tap anywhere or press ESC to close
                </div>
            </div>
        </>
    )
}

export default Header
