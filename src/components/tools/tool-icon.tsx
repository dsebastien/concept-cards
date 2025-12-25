import { IconType } from 'react-icons'
import {
    FaCalendarAlt,
    FaMicrophone,
    FaGhost,
    FaYoutube,
    FaTerminal,
    FaLightbulb,
    FaTools,
    FaRobot,
    FaCode,
    FaGlobe,
    FaWrench,
    FaVideo,
    FaGraduationCap,
    FaBook,
    FaBookOpen,
    FaDatabase,
    FaNewspaper,
    FaUsers,
    FaFileAlt,
    FaBrain,
    FaPen,
    FaChalkboardTeacher,
    FaBoxOpen,
    FaCheckSquare,
    FaReddit,
    FaUser,
    FaEnvelope,
    FaStickyNote,
    FaStore,
    FaHandshake,
    FaGithub,
    FaTiktok,
    FaMedium,
    FaLinkedin,
    FaHackerNews,
    FaPodcast
} from 'react-icons/fa'
import { SiObsidian, SiAngular, SiNotion, SiTrello, SiSubstack, SiBluesky } from 'react-icons/si'
import { FaXTwitter, FaThreads } from 'react-icons/fa6'

// Map of icon names to their components
const iconMap: Record<string, IconType> = {
    // Font Awesome icons
    FaCalendarAlt,
    FaMicrophone,
    FaGhost,
    FaYoutube,
    FaTerminal,
    FaLightbulb,
    FaTools,
    FaRobot,
    FaCode,
    FaGlobe,
    FaWrench,
    FaVideo,
    FaGraduationCap,
    FaBook,
    FaBookOpen,
    FaDatabase,
    FaNewspaper,
    FaUsers,
    FaFileAlt,
    FaBrain,
    FaPen,
    FaChalkboardTeacher,
    FaBoxOpen,
    FaCheckSquare,
    FaReddit,
    FaUser,
    FaEnvelope,
    FaStickyNote,
    FaStore,
    FaHandshake,
    FaGithub,
    FaTiktok,
    FaMedium,
    FaLinkedin,
    FaHackerNews,
    FaPodcast,
    // Simple Icons
    SiObsidian,
    SiAngular,
    SiNotion,
    SiTrello,
    SiSubstack,
    SiBluesky,
    // Font Awesome 6
    FaXTwitter,
    FaThreads
}

// Icon-specific colors (brand colors where applicable)
const iconColors: Record<string, string> = {
    FaYoutube: 'text-red-500',
    FaGhost: 'text-gray-300',
    SiObsidian: 'text-purple-400',
    SiAngular: 'text-red-500',
    SiNotion: 'text-gray-200',
    SiTrello: 'text-blue-400',
    FaReddit: 'text-orange-500',
    FaCalendarAlt: 'text-blue-400',
    FaTerminal: 'text-green-400',
    FaLightbulb: 'text-yellow-400',
    FaRobot: 'text-cyan-400',
    FaCode: 'text-emerald-400',
    FaGlobe: 'text-blue-400',
    FaGraduationCap: 'text-indigo-400',
    FaBook: 'text-amber-500',
    FaBookOpen: 'text-teal-400',
    FaNewspaper: 'text-gray-300',
    FaBrain: 'text-pink-400',
    FaPen: 'text-violet-400',
    FaChalkboardTeacher: 'text-orange-400',
    FaBoxOpen: 'text-amber-400',
    FaCheckSquare: 'text-green-400',
    FaUser: 'text-blue-400',
    FaEnvelope: 'text-amber-400',
    FaStickyNote: 'text-yellow-400',
    FaStore: 'text-emerald-400',
    FaHandshake: 'text-teal-400',
    FaGithub: 'text-gray-300',
    FaTiktok: 'text-gray-200',
    FaMedium: 'text-gray-200',
    FaLinkedin: 'text-blue-500',
    FaHackerNews: 'text-orange-500',
    FaPodcast: 'text-purple-400',
    SiSubstack: 'text-orange-400',
    SiBluesky: 'text-sky-400',
    FaXTwitter: 'text-gray-200',
    FaThreads: 'text-gray-200'
}

// Category fallback icons (emojis or icons)
const categoryFallbacks: Record<string, string> = {
    'AI Tools': '🤖',
    'CLI Tools': '⌨️',
    'Courses': '🎓',
    'Free Resources': '🎁',
    'Obsidian': '💎',
    'Open Source': '💻',
    'Platforms': '🌐',
    'Productivity': '📅',
    'Publications': '📰',
    'Utilities': '🔧',
    'Video Tools': '🎬'
}

interface ToolIconProps {
    icon?: string
    category: string
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
}

const ToolIcon: React.FC<ToolIconProps> = ({ icon, category, className = '', size = 'md' }) => {
    // If icon is a URL, render an image
    if (icon && (icon.startsWith('http') || icon.startsWith('/'))) {
        return (
            <img src={icon} alt='' className={`${sizeClasses[size]} object-contain ${className}`} />
        )
    }

    // If icon is a known react-icon name, render it
    if (icon && iconMap[icon]) {
        const IconComponent = iconMap[icon]
        const colorClass = iconColors[icon] || 'text-secondary'
        return <IconComponent className={`${sizeClasses[size]} ${colorClass} ${className}`} />
    }

    // Fallback to category emoji
    const emoji = categoryFallbacks[category] || '🛠️'
    const emojiSizes = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl'
    }

    return <span className={`${emojiSizes[size]} ${className}`}>{emoji}</span>
}

export default ToolIcon
