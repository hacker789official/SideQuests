interface ImageLoaderParams {
    src: string
    width: number
    quality?: number
}

export default function imageLoader({ src, width, quality }: ImageLoaderParams): string {

    if (src.includes("?")) {
        return `${src}&w=${width}`
    }
    return `${src}?w=${width}`
}
