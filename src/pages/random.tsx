import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { conceptsData } from '@/data'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'

const RandomConceptPage: React.FC = () => {
    const navigate = useNavigate()
    const { exploredIds } = useExploredConcepts()

    useEffect(() => {
        const concepts = conceptsData.concepts
        if (concepts.length === 0) {
            navigate('/', { replace: true })
            return
        }

        // Prioritize unexplored concepts
        const unexploredConcepts = concepts.filter((c) => !exploredIds.has(c.id))
        const targetPool = unexploredConcepts.length > 0 ? unexploredConcepts : concepts

        const randomIndex = Math.floor(Math.random() * targetPool.length)
        const randomConcept = targetPool[randomIndex]

        // Navigate to the concept's detail page
        if (randomConcept) {
            navigate(`/concept/${randomConcept.id}`, { replace: true })
        }
    }, [navigate, exploredIds])

    // Show a brief loading state while redirecting
    return (
        <div className='flex min-h-[50vh] items-center justify-center'>
            <div className='text-center'>
                <div className='text-secondary mb-4 text-5xl'>🎲</div>
                <p className='text-primary/70'>Finding a random concept...</p>
            </div>
        </div>
    )
}

export default RandomConceptPage
