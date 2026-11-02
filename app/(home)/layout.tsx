

export const revalidate = 604800

interface HomeLayoutProps {
    children: React.ReactNode
}

export default function HomeLayout({ children }: HomeLayoutProps) {
    return <>{children}</>
}
