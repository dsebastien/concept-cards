import { FaPlus, FaMinus, FaExpand, FaUndo } from 'react-icons/fa'
import type { GraphCanvasHandle } from './graph-canvas'

interface GraphZoomControlsProps {
    canvasRef: React.RefObject<GraphCanvasHandle | null>
}

const GraphZoomControls: React.FC<GraphZoomControlsProps> = ({ canvasRef }) => {
    const handleZoomIn = () => {
        canvasRef.current?.zoom(2, 300)
    }
    const handleZoomOut = () => {
        canvasRef.current?.zoom(0.5, 300)
    }
    const handleFit = () => {
        canvasRef.current?.zoomToFit(400, 40)
    }
    const handleReset = () => {
        canvasRef.current?.centerAt(0, 0, 400)
        setTimeout(() => canvasRef.current?.zoomToFit(400, 40), 100)
    }

    const btnClass =
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-surface/90 backdrop-blur-sm border border-primary/10 text-primary/70 hover:text-primary hover:bg-surface transition-colors shadow-sm'

    return (
        <div
            className='absolute z-30 flex flex-col gap-1.5'
            style={{ right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}
        >
            <button
                onClick={handleZoomIn}
                className={btnClass}
                title='Zoom in'
                aria-label='Zoom in'
            >
                <FaPlus className='h-3.5 w-3.5' />
            </button>
            <button
                onClick={handleZoomOut}
                className={btnClass}
                title='Zoom out'
                aria-label='Zoom out'
            >
                <FaMinus className='h-3.5 w-3.5' />
            </button>
            <button
                onClick={handleFit}
                className={btnClass}
                title='Fit to screen'
                aria-label='Fit to screen'
            >
                <FaExpand className='h-3.5 w-3.5' />
            </button>
            <button
                onClick={handleReset}
                className={btnClass}
                title='Reset view'
                aria-label='Reset view'
            >
                <FaUndo className='h-3.5 w-3.5' />
            </button>
        </div>
    )
}

export default GraphZoomControls
