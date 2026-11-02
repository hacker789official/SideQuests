

export const revalidate = 604800

interface ListsLayoutProps {
    children: React.ReactNode
}

export default function ListsLayout({ children }: ListsLayoutProps) {
    return <>{children}</>
}
