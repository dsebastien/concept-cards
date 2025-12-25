import { Outlet } from 'react-router'
import Header from './header'
import Footer from './footer'
import ScrollToTop from '@/components/ui/scroll-to-top'
import ScrollToTopButton from '@/components/ui/scroll-to-top-button'

const AppLayout: React.FC = () => {
    return (
        <>
            <ScrollToTop />
            <Header />
            <main className='flex w-full flex-1 flex-col items-center'>
                <Outlet />
            </main>
            <Footer />
            <ScrollToTopButton />
        </>
    )
}

export default AppLayout
