# MangaYi integration research

Research date: 2026-08-28.

MangaYi is publicly reachable at https://mangayi.com/ and presents a catalog with Genres and Authors navigation, Latest Releases, chapter-length filters, pagination, series cards, and chapter links. Its public homepage currently exposes 1,142 pages of latest releases in the extracted page content.

The public robots file at https://mangayi.com/robots.txt contains `User-agent: *` and an empty `Disallow:` directive, plus a sitemap at https://mangayi.com/sitemap.xml. This indicates that the site does not publish a robots exclusion for the public catalog, but it does not itself grant permission to republish copyrighted chapter images or bypass access controls.

Implementation decision: integrate MangaYi as a metadata/discovery source first, use server-side rate-limited retrieval of public catalog pages, link users to the original MangaYi chapter page where appropriate, and preserve MangaDex as the in-site reader source. Do not mirror or redistribute MangaYi chapter images unless the site owner’s terms and rights explicitly permit it.

Source pages:

- https://mangayi.com/
- https://mangayi.com/robots.txt

## Extraction test result

A passive request to `https://mangayi.com/` returned HTTP 200 and the expected HTML title. The ordinary server-rendered HTML exposed only two catalog navigation links, Genres and Authors; it did not expose direct series or chapter anchors. The catalog titles visible in a browser-extracted representation are therefore likely hydrated by MangaYi’s Nuxt client application or embedded in a runtime payload rather than emitted as normal HTML links.

The first test script found `server_rendered_link_count: 2` and no direct `/manga/` or `/chapter/` links. A follow-up payload check did not find a payload URL in the static anchor list. The safe integration path is to inspect the site’s public runtime/network data structure or use a documented endpoint if available, then expose metadata with rate limits and attribution. The MangaYi extraction feature is now integrated as a **metadata-only proxy and latest-release rail**; the current MangaDex integration remains the in-site reader source, and MangaYi reader links open on the original source.
