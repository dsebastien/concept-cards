import { cn } from '@/lib/utils'

interface SectionProps {
    children: React.ReactNode
    className?: string
    fullWidth?: boolean
    id?: string
}

const Section: React.FC<SectionProps> = ({ children, className, fullWidth = false, id }) => {
    return (
        <section
            id={id}
            className={cn(
                'xg:py-24 py-12 sm:py-14 md:py-16 lg:py-20 xl:py-28',
                !fullWidth && 'xg:px-24 mx-auto max-w-7xl px-6 sm:px-10 md:px-16 lg:px-20 xl:px-32',
                className
            )}
        >
            {children}
        </section>
    )
}

export default Section
