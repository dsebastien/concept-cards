/**
 * Social image generation utilities
 */

/**
 * Escape XML special characters
 */
export function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

/**
 * Truncate text if it's too long
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
}

/**
 * Sanitize filename by removing or replacing invalid characters
 */
export function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Generate social image SVG by replacing placeholder in template
 */
export function generateSocialImageSvg(template: string, text: string, maxLength = 50): string {
    const escapedText = escapeXml(truncateText(text, maxLength))
    return template.replace('TEXT_GOES_HERE', escapedText)
}
