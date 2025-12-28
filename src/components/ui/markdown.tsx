import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownProps {
    children: string
    className?: string
    /** Use compact mode for summaries (inline elements only, no block spacing) */
    compact?: boolean
}

/**
 * Renders Markdown content with proper styling.
 * Supports common Markdown syntax: **bold**, *italic*, `code`, [links](url), lists, etc.
 */
const Markdown: React.FC<MarkdownProps> = ({ children, className, compact = false }) => {
    const content = (
        <ReactMarkdown
            components={{
                // Headings
                h1: ({ children }) => <h1 className='mb-4 text-2xl font-bold'>{children}</h1>,
                h2: ({ children }) => <h2 className='mb-3 text-xl font-semibold'>{children}</h2>,
                h3: ({ children }) => <h3 className='mb-2 text-lg font-semibold'>{children}</h3>,
                // Paragraphs
                p: ({ children }) =>
                    compact ? (
                        <span>{children}</span>
                    ) : (
                        <p className='mb-4 last:mb-0'>{children}</p>
                    ),
                // Inline elements
                strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
                em: ({ children }) => <em className='italic'>{children}</em>,
                code: ({ children }) => (
                    <code className='bg-primary/10 rounded px-1.5 py-0.5 font-mono text-sm'>
                        {children}
                    </code>
                ),
                // Links
                a: ({ href, children }) => (
                    <a
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-secondary hover:text-secondary-text decoration-secondary/50 underline underline-offset-2 transition-colors'
                    >
                        {children}
                    </a>
                ),
                // Lists
                ul: ({ children }) => (
                    <ul className='mb-4 list-inside list-disc space-y-1 last:mb-0'>{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className='mb-4 list-inside list-decimal space-y-1 last:mb-0'>
                        {children}
                    </ol>
                ),
                li: ({ children }) => <li className='text-primary/80'>{children}</li>,
                // Block elements
                blockquote: ({ children }) => (
                    <blockquote className='border-secondary/50 bg-primary/5 my-4 border-l-4 py-2 pr-4 pl-4 italic'>
                        {children}
                    </blockquote>
                ),
                // Horizontal rule
                hr: () => <hr className='border-primary/20 my-6' />,
                // Pre/code blocks
                pre: ({ children }) => (
                    <pre className='bg-primary/10 mb-4 overflow-x-auto rounded-lg p-4 last:mb-0'>
                        {children}
                    </pre>
                )
            }}
        >
            {children}
        </ReactMarkdown>
    )

    if (compact) {
        return <span className={cn('inline', className)}>{content}</span>
    }

    return <div className={cn('prose-content', className)}>{content}</div>
}

export default Markdown
