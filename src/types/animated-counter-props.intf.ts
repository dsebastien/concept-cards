export interface AnimatedCounterProps {
    value: number
    duration?: number
    delay?: number
    className?: string
    formatValue?: (value: number) => string
}
