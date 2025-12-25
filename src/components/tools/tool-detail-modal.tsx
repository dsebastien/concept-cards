import { useEffect, useRef } from 'react'
import {
    FaTimes,
    FaExternalLinkAlt,
    FaGithub,
    FaBook,
    FaStar,
    FaLock,
    FaUnlock,
    FaCode,
    FaTag,
    FaFolder
} from 'react-icons/fa'
import { cn } from '@/lib/utils'
import ToolIcon from '@/components/tools/tool-icon'
import type { Tool, ToolStatus, StatusConfig } from '@/types/tool'

interface ToolDetailModalProps {
    tool: Tool | null
    statuses: Record<ToolStatus, StatusConfig>
    isOpen: boolean
    onClose: () => void
}

const statusColors: Record<string, string> = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, statuses, isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    if (!isOpen || !tool) return null

    const statusConfig = statuses[tool.status]

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
            onClick={handleBackdropClick}
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-title'
        >
            <div
                ref={modalRef}
                className='bg-background border-primary/10 relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border shadow-2xl'
                tabIndex={-1}
            >
                {/* Header */}
                <div className='border-primary/10 bg-background/95 sticky top-0 z-10 flex items-start justify-between border-b p-6 backdrop-blur-md'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 flex h-16 w-16 items-center justify-center rounded-xl'>
                            <ToolIcon icon={tool.icon} category={tool.category} size='xl' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h2 id='modal-title' className='text-xl font-bold sm:text-2xl'>
                                    {tool.name}
                                </h2>
                                {tool.featured && <FaStar className='text-secondary h-5 w-5' />}
                            </div>
                            <div className='mt-1 flex items-center gap-2'>
                                <span
                                    className={cn(
                                        'rounded-full border px-2 py-0.5 text-xs',
                                        statusColors[statusConfig.color]
                                    )}
                                >
                                    {statusConfig.label}
                                </span>
                                {tool.free ? (
                                    <span className='flex items-center gap-1 text-xs text-green-400'>
                                        <FaUnlock className='h-3 w-3' />
                                        Free
                                    </span>
                                ) : (
                                    <span className='text-secondary flex items-center gap-1 text-xs'>
                                        <FaLock className='h-3 w-3' />
                                        Paid
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-primary/60 hover:text-primary hover:bg-primary/10 rounded-lg p-2 transition-colors'
                        aria-label='Close modal'
                    >
                        <FaTimes className='h-5 w-5' />
                    </button>
                </div>

                {/* Content */}
                <div className='space-y-6 p-6'>
                    {/* Description */}
                    <div>
                        <p className='text-primary/80 text-base leading-relaxed'>
                            {tool.description}
                        </p>
                    </div>

                    {/* Category */}
                    <div className='flex items-center gap-2'>
                        <FaFolder className='text-secondary h-4 w-4' />
                        <span className='text-primary/60 text-sm'>Category:</span>
                        <span className='text-sm font-medium'>{tool.category}</span>
                    </div>

                    {/* Labels */}
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <FaTag className='text-secondary h-4 w-4' />
                            <span className='text-primary/60 text-sm'>Labels</span>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            {tool.labels.map((label) => (
                                <span
                                    key={label}
                                    className='bg-primary/5 hover:bg-primary/10 text-primary/70 rounded-full px-3 py-1.5 text-sm transition-colors'
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Technologies */}
                    <div>
                        <div className='mb-2 flex items-center gap-2'>
                            <FaCode className='text-secondary h-4 w-4' />
                            <span className='text-primary/60 text-sm'>Technologies</span>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            {tool.technologies.map((tech) => (
                                <span
                                    key={tech}
                                    className='border-secondary/30 text-secondary rounded border px-3 py-1.5 text-sm'
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* License */}
                    {tool.license && (
                        <div className='flex items-center gap-2'>
                            <span className='text-primary/60 text-sm'>License:</span>
                            <span className='border-primary/20 rounded border px-2 py-0.5 text-sm'>
                                {tool.license}
                            </span>
                        </div>
                    )}

                    {/* Status Description */}
                    <div className='bg-primary/5 rounded-lg p-4'>
                        <span className='text-primary/60 text-sm'>Status: </span>
                        <span className='text-sm'>{statusConfig.description}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className='border-primary/10 bg-background/95 sticky bottom-0 flex flex-wrap gap-3 border-t p-6 backdrop-blur-md'>
                    <a
                        href={tool.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-secondary hover:bg-secondary/90 flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors'
                    >
                        <FaExternalLinkAlt className='h-4 w-4' />
                        Open Tool
                    </a>
                    {tool.sourceCodeUrl && (
                        <a
                            href={tool.sourceCodeUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors'
                        >
                            <FaGithub className='h-4 w-4' />
                            Source Code
                        </a>
                    )}
                    {tool.docsUrl && (
                        <a
                            href={tool.docsUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors'
                        >
                            <FaBook className='h-4 w-4' />
                            Documentation
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ToolDetailModal
