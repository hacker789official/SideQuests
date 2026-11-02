export const MEDIA_CARD_FIELDS = `
  id
  idMal
  type
  format
  status
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    color
  }
  bannerImage
  genres
  averageScore
  episodes
  chapters
  volumes
  duration
  season
  seasonYear
  startDate {
    year
    month
    day
  }
`

export const MEDIA_DETAIL_FIELDS = `
  ${MEDIA_CARD_FIELDS}
  description
  studios {
    nodes {
      name
    }
  }
`
