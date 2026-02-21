import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
    FaTimes,
    FaExternalLinkAlt,
    FaStar,
    FaTag,
    FaFolder,
    FaBook,
    FaNewspaper,
    FaGraduationCap,
    FaStickyNote,
    FaQuoteLeft,
    FaLink,
    FaCheckCircle,
    FaChevronLeft,
    FaChevronRight,
    FaCopy,
    FaCheck
} from 'react-icons/fa'
import { backdropVariants, scaleFadeVariants } from '@/lib/animations'
import ConceptIcon from '@/components/concepts/concept-icon'
import Markdown from '@/components/ui/markdown'
import { MetaTags, getConceptSocialImage } from '@/components/layout/meta-tags'
import type { ConceptDetailModalProps } from '@/types/concept-detail-modal-props.intf'
import type { Reference } from '@/types/reference.intf'
import type { Book } from '@/types/book.intf'

// Confetti celebration animation
const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#e5007d', '#ff1493', '#ffd700', '#00ff88', '#00bfff']
        })
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#e5007d', '#ff1493', '#ffd700', '#00ff88', '#00bfff']
        })

        if (Date.now() < end) {
            requestAnimationFrame(frame)
        }
    }

    // Initial burst
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e5007d', '#ff1493', '#ffd700', '#00ff88', '#00bfff']
    })

    frame()
}

// Icons for reference types (books are displayed separately via BookList)
const referenceTypeIcons: Record<string, React.ReactNode> = {
    paper: <FaNewspaper className='h-4 w-4 text-blue-400' />,
    website: <FaExternalLinkAlt className='h-4 w-4 text-green-400' />,
    video: <FaGraduationCap className='h-4 w-4 text-red-400' />,
    podcast: <FaQuoteLeft className='h-4 w-4 text-purple-400' />,
    other: <FaExternalLinkAlt className='h-4 w-4 text-gray-400' />
}

const BookList: React.FC<{
    books: Book[]
}> = ({ books }) => {
    if (!books || books.length === 0) return null

    return (
        <div>
            <div className='mb-2 flex items-center gap-2'>
                <FaBook className='text-secondary h-4 w-4' />
                <span className='text-primary/60 text-sm'>Recommended Books</span>
            </div>
            <div className='space-y-2'>
                {books.map((book, index) => (
                    <a
                        key={index}
                        href={book.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex cursor-pointer items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10'
                    >
                        <FaBook className='h-4 w-4 text-amber-400' />
                        <span className='flex-1 text-sm'>{book.title}</span>
                        <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                    </a>
                ))}
            </div>
        </div>
    )
}

const ReferenceList: React.FC<{
    title: string
    references: Reference[]
    icon: React.ReactNode
}> = ({ title, references, icon }) => {
    if (!references || references.length === 0) return null

    return (
        <div>
            <div className='mb-2 flex items-center gap-2'>
                {icon}
                <span className='text-primary/60 text-sm'>{title}</span>
            </div>
            <div className='space-y-2'>
                {references.map((ref, index) => (
                    <a
                        key={index}
                        href={ref.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-primary/5 hover:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors'
                    >
                        {referenceTypeIcons[ref.type] || referenceTypeIcons['other']}
                        <span className='flex-1 text-sm'>{ref.title}</span>
                        <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                    </a>
                ))}
            </div>
        </div>
    )
}

const ConceptDetailModal: React.FC<ConceptDetailModalProps> = ({
    concept,
    allConcepts,
    isOpen,
    onClose,
    onNavigateToConcept,
    onTagClick,
    onCategoryClick,
    isExplored,
    hidePreviousButton = false
}) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
    const [copied, setCopied] = useState(false)
    const [copiedImage, setCopiedImage] = useState(false)
    const [copyMenuOpen, setCopyMenuOpen] = useState(false)
    const copyMenuRef = useRef<HTMLDivElement>(null)
    const scrollPositionRef = useRef<number>(0)

    // Sort concepts the same way as displayed (featured first, then alphabetically)
    const sortedConcepts = useMemo(() => {
        return [...allConcepts].sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return a.name.localeCompare(b.name)
        })
    }, [allConcepts])

    // Find current index and prev/next concepts (carousel style - wraps around)
    const currentIndex = useMemo(() => {
        if (!concept) return -1
        return sortedConcepts.findIndex((c) => c.id === concept.id)
    }, [concept, sortedConcepts])

    const prevConcept = useMemo(() => {
        if (sortedConcepts.length === 0 || currentIndex === -1) return null
        // Wrap to last item if at the beginning
        const prevIndex = currentIndex === 0 ? sortedConcepts.length - 1 : currentIndex - 1
        return sortedConcepts[prevIndex]
    }, [sortedConcepts, currentIndex])

    const nextConcept = useMemo(() => {
        if (sortedConcepts.length === 0) return null
        // When current concept is not in the list (e.g., just explored), show the first concept
        if (currentIndex === -1) {
            return sortedConcepts[0]
        }
        // When hidePreviousButton is true, don't wrap around
        if (hidePreviousButton && currentIndex === sortedConcepts.length - 1) return null
        // Wrap to first item if at the end (only when previous button is shown)
        const nextIndex = currentIndex === sortedConcepts.length - 1 ? 0 : currentIndex + 1
        return sortedConcepts[nextIndex]
    }, [sortedConcepts, currentIndex, hidePreviousButton])

    // Track if collection was not fully explored when modal opened
    const wasNotAllExploredOnOpen = useRef(false)
    const lastCollectionKey = useRef<string>('')

    // Generate a stable key for the current collection
    const collectionKey = useMemo(() => {
        return sortedConcepts.map((c) => c.id).join(',')
    }, [sortedConcepts])

    // Check if all concepts are explored
    const checkAllExplored = useCallback(() => {
        if (!isExplored || sortedConcepts.length === 0) return false
        return sortedConcepts.every((c) => isExplored(c.id))
    }, [sortedConcepts, isExplored])

    // Capture state when modal opens or collection changes
    useEffect(() => {
        if (isOpen && concept) {
            // If collection changed, reset the tracking
            if (collectionKey !== lastCollectionKey.current) {
                lastCollectionKey.current = collectionKey
                // Check if NOT all explored when we open
                wasNotAllExploredOnOpen.current = !checkAllExplored()
            }
        }
    }, [isOpen, concept, collectionKey, checkAllExplored])

    // Check for collection completion after concept is marked as explored
    useEffect(() => {
        if (!isOpen || !concept) return

        // Small delay to ensure parent's markAsExplored has run
        const timer = setTimeout(() => {
            const allExplored = checkAllExplored()

            // Show confetti only if:
            // 1. All concepts are now explored
            // 2. They weren't all explored when we opened the modal
            if (allExplored && wasNotAllExploredOnOpen.current) {
                triggerConfetti()
                wasNotAllExploredOnOpen.current = false // Prevent re-triggering
            }
        }, 150)

        return () => clearTimeout(timer)
    }, [isOpen, concept, checkAllExplored])

    const handlePrevious = () => {
        if (prevConcept && sortedConcepts.length > 1) {
            setSlideDirection('right')
            onNavigateToConcept(prevConcept)
        }
    }

    const handleNext = () => {
        if (nextConcept && sortedConcepts.length > 1) {
            setSlideDirection('left')
            onNavigateToConcept(nextConcept)
        }
    }

    // Close copy menu on click outside
    useEffect(() => {
        if (!copyMenuOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
                setCopyMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [copyMenuOpen])

    // Close copy menu when concept changes
    useEffect(() => {
        setCopyMenuOpen(false)
        setCopied(false)
        setCopiedImage(false)
    }, [concept?.id])

    const handleCopy = async () => {
        if (!concept) return

        const conceptUrl = `https://concepts.dsebastien.net/#/concept/${concept.id}`
        const textToCopy = `${concept.name}\n\n${concept.summary}\n\n${concept.explanation}\n\n${conceptUrl}`

        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setCopyMenuOpen(false)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text:', err)
        }
    }

    const handleCopyAsImage = async () => {
        if (!concept) return

        const conceptUrl = `https://concepts.dsebastien.net/concept/${concept.id}`
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = 800
        const padding = 48
        const contentWidth = width - padding * 2
        const listIndent = 24
        const fontFamily = 'system-ui, -apple-system, sans-serif'

        // Font helper
        const getFont = (size: number, bold: boolean, italic: boolean): string => {
            const style = italic ? 'italic ' : ''
            const weight = bold ? 'bold ' : ''
            return `${style}${weight}${size}px ${fontFamily}`
        }

        // Inline markdown types
        type WordToken = { word: string; bold: boolean; italic: boolean }

        // Parse inline markdown into segments, then split into word tokens
        const parseToWords = (text: string): WordToken[] => {
            type Segment = { text: string; bold: boolean; italic: boolean }
            const segments: Segment[] = []
            const regex = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\([^)]+\)/g
            let lastIndex = 0
            let match
            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    segments.push({
                        text: text.slice(lastIndex, match.index),
                        bold: false,
                        italic: false
                    })
                }
                if (match[1] !== undefined)
                    segments.push({ text: match[1], bold: true, italic: false })
                else if (match[2] !== undefined)
                    segments.push({ text: match[2], bold: false, italic: true })
                else if (match[3] !== undefined)
                    segments.push({ text: match[3], bold: false, italic: true })
                else if (match[4] !== undefined)
                    segments.push({ text: match[4], bold: false, italic: false })
                lastIndex = match.index + match[0].length
            }
            if (lastIndex < text.length) {
                segments.push({ text: text.slice(lastIndex), bold: false, italic: false })
            }
            if (segments.length === 0) {
                segments.push({ text, bold: false, italic: false })
            }

            const tokens: WordToken[] = []
            for (const seg of segments) {
                for (const word of seg.text.split(/\s+/).filter((w) => w)) {
                    tokens.push({ word, bold: seg.bold, italic: seg.italic })
                }
            }
            return tokens
        }

        // Wrap word tokens into lines that fit maxWidth, respecting per-word fonts
        const wrapWords = (
            tokens: WordToken[],
            fontSize: number,
            maxWidth: number
        ): WordToken[][] => {
            const lines: WordToken[][] = []
            let line: WordToken[] = []
            let lineWidth = 0
            ctx.font = getFont(fontSize, false, false)
            const spaceWidth = ctx.measureText(' ').width

            for (const token of tokens) {
                ctx.font = getFont(fontSize, token.bold, token.italic)
                const wordWidth = ctx.measureText(token.word).width
                const needed = line.length > 0 ? spaceWidth + wordWidth : wordWidth
                if (lineWidth + needed > maxWidth && line.length > 0) {
                    lines.push(line)
                    line = [token]
                    lineWidth = wordWidth
                } else {
                    line.push(token)
                    lineWidth += needed
                }
            }
            if (line.length > 0) lines.push(line)
            return lines
        }

        // Render a line of word tokens with per-word font styling
        const renderTokenLine = (
            tokens: WordToken[],
            x: number,
            y: number,
            fontSize: number,
            color: string,
            boldColor?: string
        ) => {
            let curX = x
            ctx.font = getFont(fontSize, false, false)
            const spaceWidth = ctx.measureText(' ').width

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i]!
                ctx.font = getFont(fontSize, token.bold, token.italic)
                ctx.fillStyle = token.bold && boldColor ? boldColor : color
                ctx.fillText(token.word, curX, y)
                curX += ctx.measureText(token.word).width
                if (i < tokens.length - 1) curX += spaceWidth
            }
        }

        // Parse markdown into blocks
        type Block =
            | { type: 'paragraph'; text: string }
            | { type: 'bullet'; text: string }
            | { type: 'numbered'; num: string; text: string }
            | { type: 'table'; headers: string[]; rows: string[][] }
            | { type: 'blank' }

        const parseTableRow = (line: string): string[] =>
            line
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim())

        const isTableSeparator = (line: string): boolean => /^\|[\s:-]+\|/.test(line.trim())

        const parseBlocks = (markdown: string): Block[] => {
            const blocks: Block[] = []
            const lines = markdown.split('\n')
            let i = 0
            while (i < lines.length) {
                const line = lines[i]!
                if (line.trim() === '') {
                    blocks.push({ type: 'blank' })
                    i++
                    continue
                }
                // Detect table: line starts with |
                if (line.trim().startsWith('|')) {
                    const headers = parseTableRow(line)
                    i++
                    // Skip separator row
                    if (i < lines.length && isTableSeparator(lines[i]!)) i++
                    const rows: string[][] = []
                    while (
                        i < lines.length &&
                        lines[i]!.trim().startsWith('|') &&
                        !isTableSeparator(lines[i]!)
                    ) {
                        rows.push(parseTableRow(lines[i]!))
                        i++
                    }
                    blocks.push({ type: 'table', headers, rows })
                    continue
                }
                const bulletMatch = line.match(/^[-*]\s+(.*)/)
                if (bulletMatch) {
                    blocks.push({ type: 'bullet', text: bulletMatch[1]! })
                    i++
                    continue
                }
                const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
                if (numberedMatch) {
                    blocks.push({
                        type: 'numbered',
                        num: numberedMatch[1]!,
                        text: numberedMatch[2]!
                    })
                    i++
                    continue
                }
                // Strip header markers but keep the text
                const headerMatch = line.match(/^#{1,6}\s+(.*)/)
                blocks.push({ type: 'paragraph', text: headerMatch ? headerMatch[1]! : line })
                i++
            }
            return blocks
        }

        // Pre-calculate layout
        const titleFontSize = 32
        const summaryFontSize = 18
        const explanationFontSize = 16

        const titleLines = wrapWords(parseToWords(concept.name), titleFontSize, contentWidth)
        const summaryLines = wrapWords(parseToWords(concept.summary), summaryFontSize, contentWidth)

        // Build explanation rendered elements
        const tableCellPadding = 10
        const tableRowHeight = explanationFontSize * 1.5 + tableCellPadding * 2

        type RenderedTextLine = {
            type: 'line'
            tokens: WordToken[]
            indent: number
            bullet?: string
        }
        type RenderedTable = {
            type: 'table'
            headers: WordToken[][]
            rows: WordToken[][][]
            colWidths: number[]
        }
        type RenderedBlank = { type: 'blank' }
        type RenderedElement = RenderedTextLine | RenderedTable | RenderedBlank

        const explanationRendered: RenderedElement[] = []
        const maxLines = 20
        let lineCount = 0
        let truncated = false

        for (const block of parseBlocks(concept.explanation)) {
            if (truncated) break

            if (block.type === 'blank') {
                if (lineCount >= maxLines) {
                    truncated = true
                    break
                }
                explanationRendered.push({ type: 'blank' })
                lineCount++
                continue
            }

            if (block.type === 'table') {
                const totalRows = 1 + block.rows.length
                if (lineCount + totalRows > maxLines) {
                    truncated = true
                    break
                }
                // Parse cells into word tokens
                const headerTokens = block.headers.map((cell) => parseToWords(cell))
                const rowTokens = block.rows.map((row) => row.map((cell) => parseToWords(cell)))

                // Calculate column widths based on content
                const colCount = block.headers.length
                const colWidths: number[] = new Array(colCount).fill(0) as number[]
                for (let c = 0; c < colCount; c++) {
                    // Measure header
                    ctx.font = getFont(explanationFontSize, true, false)
                    const headerText = block.headers[c] ?? ''
                    colWidths[c] = Math.max(colWidths[c]!, ctx.measureText(headerText).width)
                    // Measure data cells
                    for (const row of block.rows) {
                        ctx.font = getFont(explanationFontSize, false, false)
                        const cellText = row[c] ?? ''
                        colWidths[c] = Math.max(colWidths[c]!, ctx.measureText(cellText).width)
                    }
                    colWidths[c] = colWidths[c]! + tableCellPadding * 2
                }

                // Scale columns to fit content width if they overflow
                const totalColWidth = colWidths.reduce((a, b) => a + b, 0)
                if (totalColWidth > contentWidth) {
                    const scale = contentWidth / totalColWidth
                    for (let c = 0; c < colCount; c++) {
                        colWidths[c] = colWidths[c]! * scale
                    }
                }

                explanationRendered.push({
                    type: 'table',
                    headers: headerTokens,
                    rows: rowTokens,
                    colWidths
                })
                lineCount += totalRows
                continue
            }

            const isList = block.type === 'bullet' || block.type === 'numbered'
            const indent = isList ? listIndent : 0
            const words = parseToWords(block.text)
            const wrapped = wrapWords(words, explanationFontSize, contentWidth - indent)

            for (let i = 0; i < wrapped.length; i++) {
                if (lineCount >= maxLines) {
                    truncated = true
                    const lastEl = explanationRendered[explanationRendered.length - 1]
                    if (lastEl && lastEl.type === 'line' && lastEl.tokens.length > 0) {
                        const lastToken = lastEl.tokens[lastEl.tokens.length - 1]
                        if (lastToken) {
                            lastEl.tokens[lastEl.tokens.length - 1] = {
                                ...lastToken,
                                word: lastToken.word + '...'
                            }
                        }
                    }
                    break
                }
                const bullet =
                    i === 0
                        ? block.type === 'bullet'
                            ? '\u2022'
                            : block.type === 'numbered'
                              ? `${block.num}.`
                              : undefined
                        : undefined
                explanationRendered.push({ type: 'line', tokens: wrapped[i]!, indent, bullet })
                lineCount++
            }
        }

        // Calculate total height
        const accentBarHeight = 8
        const titleBlockHeight = titleLines.length * titleFontSize * 1.5 + 16
        const summaryBlockHeight = summaryLines.length * summaryFontSize * 1.5 + 32
        const explanationBlockHeight = explanationRendered.reduce((h, el) => {
            if (el.type === 'blank') return h + 8
            if (el.type === 'table') return h + (1 + el.rows.length) * tableRowHeight + 16
            return h + explanationFontSize * 1.5
        }, 24)
        const urlBlockHeight = 48
        const height =
            accentBarHeight +
            padding +
            titleBlockHeight +
            summaryBlockHeight +
            explanationBlockHeight +
            urlBlockHeight +
            padding

        canvas.width = width
        canvas.height = height

        // -- Render --

        // Background
        ctx.fillStyle = '#37404C'
        ctx.fillRect(0, 0, width, height)

        // Top accent bar
        ctx.fillStyle = '#E5007D'
        ctx.fillRect(0, 0, width, accentBarHeight)

        let y = accentBarHeight + padding

        // Title
        for (const line of titleLines) {
            renderTokenLine(line, padding, y, titleFontSize, '#FFFFFF')
            y += titleFontSize * 1.5
        }
        y -= 8 // Pull back trailing line-height gap

        // Divider
        ctx.strokeStyle = 'rgba(229, 0, 125, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(width - padding, y)
        ctx.stroke()
        y += 24

        // Summary
        for (const line of summaryLines) {
            renderTokenLine(line, padding, y, summaryFontSize, '#FF1493')
            y += summaryFontSize * 1.5
        }
        y += 16

        // Explanation
        for (const rendered of explanationRendered) {
            if (rendered.type === 'blank') {
                y += 8
                continue
            }

            if (rendered.type === 'table') {
                const { headers, rows, colWidths } = rendered
                const totalRows = 1 + rows.length
                const tableWidth = colWidths.reduce((a, b) => a + b, 0)

                // Table background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
                ctx.fillRect(padding, y, tableWidth, totalRows * tableRowHeight)

                // Header row background
                ctx.fillStyle = 'rgba(229, 0, 125, 0.15)'
                ctx.fillRect(padding, y, tableWidth, tableRowHeight)

                // Draw header cells
                let cellX = padding
                for (let c = 0; c < headers.length; c++) {
                    const cellWidth = colWidths[c]!
                    renderTokenLine(
                        headers[c]!,
                        cellX + tableCellPadding,
                        y + tableCellPadding + explanationFontSize,
                        explanationFontSize,
                        '#FFFFFF'
                    )
                    cellX += cellWidth
                }
                y += tableRowHeight

                // Header bottom border
                ctx.strokeStyle = 'rgba(229, 0, 125, 0.4)'
                ctx.lineWidth = 1.5
                ctx.beginPath()
                ctx.moveTo(padding, y)
                ctx.lineTo(padding + tableWidth, y)
                ctx.stroke()

                // Draw data rows
                for (let r = 0; r < rows.length; r++) {
                    const row = rows[r]!
                    // Alternating row background
                    if (r % 2 === 1) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
                        ctx.fillRect(padding, y, tableWidth, tableRowHeight)
                    }
                    cellX = padding
                    for (let c = 0; c < row.length; c++) {
                        const cellWidth = colWidths[c]!
                        renderTokenLine(
                            row[c]!,
                            cellX + tableCellPadding,
                            y + tableCellPadding + explanationFontSize,
                            explanationFontSize,
                            'rgba(255, 255, 255, 0.8)',
                            '#FFFFFF'
                        )
                        cellX += cellWidth
                    }
                    y += tableRowHeight
                }

                // Table border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
                ctx.lineWidth = 1
                ctx.strokeRect(
                    padding,
                    y - totalRows * tableRowHeight,
                    tableWidth,
                    totalRows * tableRowHeight
                )

                // Vertical column separators
                cellX = padding
                for (let c = 0; c < colWidths.length - 1; c++) {
                    cellX += colWidths[c]!
                    ctx.beginPath()
                    ctx.moveTo(cellX, y - totalRows * tableRowHeight)
                    ctx.lineTo(cellX, y)
                    ctx.stroke()
                }

                y += 16
                continue
            }

            // Regular text line
            if (rendered.bullet) {
                ctx.fillStyle = '#E5007D'
                ctx.font = getFont(explanationFontSize, false, false)
                ctx.fillText(rendered.bullet, padding, y)
            }
            renderTokenLine(
                rendered.tokens,
                padding + rendered.indent,
                y,
                explanationFontSize,
                'rgba(255, 255, 255, 0.8)',
                '#FFFFFF'
            )
            y += explanationFontSize * 1.5
        }

        // URL at bottom
        y = height - padding
        ctx.fillStyle = '#E5007D'
        ctx.font = getFont(16, false, false)
        ctx.fillText(conceptUrl, padding, y)

        // Copy to clipboard
        try {
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/png')
            )
            if (!blob) throw new Error('Failed to create image blob')
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            setCopiedImage(true)
            setCopyMenuOpen(false)
            setTimeout(() => setCopiedImage(false), 2000)
        } catch (err) {
            console.error('Failed to copy image:', err)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowLeft' && sortedConcepts.length > 1 && !hidePreviousButton) {
                handlePrevious()
            } else if (e.key === 'ArrowRight' && sortedConcepts.length > 1 && nextConcept) {
                handleNext()
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                // Allow scrolling with up/down arrows
                const scrollContainer = modalRef.current?.querySelector('.overflow-auto')
                if (scrollContainer) {
                    const scrollAmount = e.key === 'ArrowUp' ? -100 : 100
                    scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' })
                    e.preventDefault()
                }
            }
        }

        if (isOpen) {
            // Try to get saved scroll position from sessionStorage (set before navigation)
            const savedPosition = sessionStorage.getItem('scrollPosition')
            if (savedPosition) {
                scrollPositionRef.current = parseInt(savedPosition, 10)
            } else {
                scrollPositionRef.current = window.scrollY
            }

            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollPositionRef.current}px`
            document.body.style.width = '100%'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)

            // Restore body styles when modal closes (scroll position is handled by parent component)
            if (isOpen) {
                document.body.style.overflow = ''
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.width = ''
            }
        }
    }, [isOpen, onClose, prevConcept, nextConcept, hidePreviousButton])

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && modalRef.current && concept) {
            modalRef.current.scrollTop = 0
        }
    }, [isOpen, concept])

    const currentConceptExplored = concept ? (isExplored?.(concept.id) ?? false) : false

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && concept && (
                <>
                    <MetaTags
                        title={`${concept.name} - Concepts`}
                        description={concept.summary}
                        image={getConceptSocialImage(concept.id)}
                        url={`https://concepts.dsebastien.net/#/concept/${concept.id}`}
                    />
                    <motion.div
                        initial='initial'
                        animate='animate'
                        exit='exit'
                        variants={backdropVariants}
                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
                        onClick={handleBackdropClick}
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='modal-title'
                    >
                        <motion.div
                            ref={modalRef}
                            variants={scaleFadeVariants}
                            className='bg-background border-primary/10 relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl'
                            tabIndex={-1}
                        >
                            <AnimatePresence mode='wait' initial={false}>
                                <motion.div
                                    key={concept.id}
                                    initial={
                                        slideDirection
                                            ? {
                                                  x: slideDirection === 'left' ? 100 : -100,
                                                  opacity: 0
                                              }
                                            : false
                                    }
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: slideDirection === 'left' ? -100 : 100, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className='max-h-[90vh] overflow-auto'
                                >
                                    {/* Header */}
                                    <div
                                        className={`sticky top-0 z-10 flex items-start justify-between border-b p-6 backdrop-blur-md ${
                                            currentConceptExplored
                                                ? 'border-success bg-success-subtle'
                                                : 'border-primary/10 bg-background/95'
                                        }`}
                                    >
                                        <div className='flex items-center gap-4'>
                                            <div
                                                className={`relative flex h-16 w-16 items-center justify-center rounded-xl ${
                                                    currentConceptExplored
                                                        ? 'bg-success'
                                                        : 'bg-primary/10'
                                                }`}
                                            >
                                                <ConceptIcon
                                                    icon={concept.icon}
                                                    category={concept.category}
                                                    size='xl'
                                                />
                                                {currentConceptExplored && (
                                                    <FaCheckCircle className='text-success-muted absolute -right-1 -bottom-1 h-5 w-5' />
                                                )}
                                            </div>
                                            <div>
                                                <div className='flex items-center gap-2'>
                                                    <h2
                                                        id='modal-title'
                                                        className='text-xl font-bold sm:text-2xl'
                                                    >
                                                        {concept.name}
                                                    </h2>
                                                    {concept.featured && (
                                                        <FaStar className='text-secondary h-5 w-5' />
                                                    )}
                                                    {currentConceptExplored && (
                                                        <span className='bg-success text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'>
                                                            <FaCheckCircle className='h-2.5 w-2.5' />
                                                            Explored
                                                        </span>
                                                    )}
                                                </div>
                                                {concept.aliases && concept.aliases.length > 0 && (
                                                    <p className='text-primary/50 mt-1 text-sm italic'>
                                                        Also known as: {concept.aliases.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-center gap-2'>
                                            <button
                                                onClick={onClose}
                                                className='text-primary/60 hover:text-primary hover:bg-primary/10 cursor-pointer rounded-lg p-2 transition-colors'
                                                aria-label='Close modal'
                                            >
                                                <FaTimes className='h-5 w-5' />
                                            </button>
                                            <div className='relative' ref={copyMenuRef}>
                                                <button
                                                    onClick={() => setCopyMenuOpen((prev) => !prev)}
                                                    className='text-primary/60 hover:text-primary hover:bg-primary/10 cursor-pointer rounded-lg p-2 transition-colors'
                                                    aria-label='Copy concept'
                                                    title='Copy concept'
                                                >
                                                    {copied || copiedImage ? (
                                                        <FaCheck className='text-success-muted h-5 w-5' />
                                                    ) : (
                                                        <FaCopy className='h-5 w-5' />
                                                    )}
                                                </button>
                                                {copyMenuOpen && (
                                                    <div className='bg-background border-primary/20 absolute right-0 z-50 mt-1 min-w-[170px] overflow-hidden rounded-lg border shadow-lg'>
                                                        <button
                                                            onClick={handleCopy}
                                                            className='text-primary/80 hover:bg-primary/10 flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors'
                                                        >
                                                            <FaCopy className='h-3.5 w-3.5 shrink-0' />
                                                            Copy as text
                                                        </button>
                                                        <button
                                                            onClick={handleCopyAsImage}
                                                            className='text-primary/80 hover:bg-primary/10 flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors'
                                                        >
                                                            <span className='text-sm leading-none'>
                                                                📷
                                                            </span>
                                                            Copy as image
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className='space-y-6 p-6'>
                                        {/* Summary */}
                                        <div className='bg-secondary/10 border-secondary/20 rounded-lg border p-4'>
                                            <p className='text-primary/90 text-base leading-relaxed font-medium'>
                                                {concept.summary}
                                            </p>
                                        </div>

                                        {/* Full Explanation */}
                                        <div>
                                            <h3 className='text-primary/80 mb-3 text-sm font-semibold tracking-wider uppercase'>
                                                Explanation
                                            </h3>
                                            <div className='text-primary/80 text-base leading-relaxed'>
                                                <Markdown>{concept.explanation}</Markdown>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className='flex items-center gap-2'>
                                            <FaFolder className='text-secondary h-4 w-4' />
                                            <span className='text-primary/60 text-sm'>
                                                Category:
                                            </span>
                                            <button
                                                onClick={() => onCategoryClick(concept.category)}
                                                className='bg-primary/5 hover:bg-primary/10 text-primary/70 hover:text-primary/90 cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors'
                                            >
                                                {concept.category}
                                            </button>
                                        </div>

                                        {/* Tags */}
                                        <div>
                                            <div className='mb-2 flex items-center gap-2'>
                                                <FaTag className='text-secondary h-4 w-4' />
                                                <span className='text-primary/60 text-sm'>
                                                    Tags
                                                </span>
                                            </div>
                                            <div className='flex flex-wrap gap-2'>
                                                {concept.tags.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => onTagClick(tag)}
                                                        className='bg-primary/5 hover:bg-primary/10 text-primary/70 hover:text-primary/90 cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors'
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Related Concepts */}
                                        {concept.relatedConcepts &&
                                            concept.relatedConcepts.length > 0 && (
                                                <div>
                                                    <div className='mb-2 flex items-center gap-2'>
                                                        <FaLink className='text-secondary h-4 w-4' />
                                                        <span className='text-primary/60 text-sm'>
                                                            Related Concepts
                                                        </span>
                                                    </div>
                                                    <div className='flex flex-wrap gap-2'>
                                                        {concept.relatedConcepts.map(
                                                            (conceptId) => {
                                                                const relatedConcept =
                                                                    allConcepts.find(
                                                                        (c) => c.id === conceptId
                                                                    )
                                                                if (!relatedConcept) return null
                                                                const explored =
                                                                    isExplored?.(conceptId) ?? false
                                                                return (
                                                                    <button
                                                                        key={conceptId}
                                                                        onClick={() =>
                                                                            onNavigateToConcept(
                                                                                relatedConcept
                                                                            )
                                                                        }
                                                                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                                                            explored
                                                                                ? 'border-success bg-success text-success bg-success-hover'
                                                                                : 'bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20'
                                                                        }`}
                                                                    >
                                                                        <ConceptIcon
                                                                            icon={
                                                                                relatedConcept.icon
                                                                            }
                                                                            category={
                                                                                relatedConcept.category
                                                                            }
                                                                            size='sm'
                                                                        />
                                                                        {relatedConcept.name}
                                                                        {explored && (
                                                                            <FaCheckCircle className='text-success-muted h-3 w-3' />
                                                                        )}
                                                                    </button>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Related Notes */}
                                        {concept.relatedNotes &&
                                            concept.relatedNotes.length > 0 && (
                                                <div>
                                                    <div className='mb-2 flex items-center gap-2'>
                                                        <FaStickyNote className='text-secondary h-4 w-4' />
                                                        <span className='text-primary/60 text-sm'>
                                                            Related Notes
                                                        </span>
                                                    </div>
                                                    <div className='space-y-2'>
                                                        {concept.relatedNotes.map((note, index) => (
                                                            <a
                                                                key={index}
                                                                href={note}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                                className='bg-primary/5 hover:bg-primary/10 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors'
                                                            >
                                                                <FaStickyNote className='h-4 w-4 text-yellow-400' />
                                                                <span className='flex-1 truncate text-sm'>
                                                                    {note}
                                                                </span>
                                                                <FaExternalLinkAlt className='text-primary/40 h-3 w-3' />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Articles Section */}
                                        <ReferenceList
                                            title='Articles'
                                            references={concept.articles || []}
                                            icon={
                                                <FaNewspaper className='text-secondary h-4 w-4' />
                                            }
                                        />

                                        {/* Books Section */}
                                        <BookList books={concept.books || []} />

                                        {/* References Section */}
                                        <ReferenceList
                                            title='References'
                                            references={concept.references || []}
                                            icon={<FaLink className='text-secondary h-4 w-4' />}
                                        />

                                        {/* Tutorials Section */}
                                        <ReferenceList
                                            title='Tutorials'
                                            references={concept.tutorials || []}
                                            icon={
                                                <FaGraduationCap className='text-secondary h-4 w-4' />
                                            }
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className='border-primary/10 bg-background/95 sticky bottom-0 flex items-center gap-3 border-t p-4 backdrop-blur-md sm:p-6'>
                                        {/* Previous Button - hidden when hidePreviousButton is true */}
                                        {!hidePreviousButton && (
                                            <button
                                                onClick={handlePrevious}
                                                disabled={sortedConcepts.length <= 1}
                                                className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                                    sortedConcepts.length > 1
                                                        ? 'bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer'
                                                        : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                                }`}
                                                aria-label='Previous concept'
                                                title={
                                                    prevConcept
                                                        ? `Previous: ${prevConcept.name}`
                                                        : 'No other concepts'
                                                }
                                            >
                                                <FaChevronLeft className='h-4 w-4' />
                                                <span className='hidden sm:inline'>Previous</span>
                                            </button>
                                        )}

                                        {/* Close Button */}
                                        <button
                                            onClick={onClose}
                                            className='bg-primary/10 hover:bg-primary/20 text-primary flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors sm:px-6 sm:py-3'
                                        >
                                            Close
                                        </button>

                                        {/* Next Button */}
                                        <button
                                            onClick={handleNext}
                                            disabled={!nextConcept}
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 sm:py-3 ${
                                                nextConcept
                                                    ? 'bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer'
                                                    : 'text-primary/30 bg-primary/5 cursor-not-allowed'
                                            }`}
                                            aria-label='Next concept'
                                            title={
                                                nextConcept
                                                    ? `Next: ${nextConcept.name}`
                                                    : 'No more concepts'
                                            }
                                        >
                                            <span className='hidden sm:inline'>Next</span>
                                            <FaChevronRight className='h-4 w-4' />
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ConceptDetailModal
