export const revalidate = 21600

interface AnimeLayoutProps {
  children: React.ReactNode
}

export default function AnimeLayout({ children }: AnimeLayoutProps) {
  return <>{children}</>
}
