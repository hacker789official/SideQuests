const assert = require("node:assert/strict")
const { buildMovieVidLink, buildTvVidLink, buildAnimeVidLink } = require("./.tmp-vidlink.cjs")

assert.equal(buildMovieVidLink(603), "https://vidlink.pro/movie/603")
assert.equal(buildTvVidLink(1399, 2, 4), "https://vidlink.pro/tv/1399/2/4")
assert.equal(buildAnimeVidLink(12345, 7, "dub"), "https://vidlink.pro/anime/12345/7/dub?fallback=true")
console.log("VidLink URL assertions passed")
