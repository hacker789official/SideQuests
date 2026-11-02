

export const revalidate = 604800

interface DetailLayoutProps {
    children: React.ReactNode
}

export default function DetailLayout({ children }: DetailLayoutProps) {
    return <>{children}</>
}
