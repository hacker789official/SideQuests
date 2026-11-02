import { anilistQuery } from "./client"
import { MEDIA_DETAIL_FIELDS } from "./fragments"
import { AniListMedia } from "@/anilist/models/media"

const byId = (id: number) =>
  anilistQuery<{ Media: AniListMedia }>({
    query: `
      query ($id: Int) {
        Media(id: $id) {
          ${MEDIA_DETAIL_FIELDS}
        }
      }
    `,
    variables: { id },
  })

export const detail = {
  byId,
}
