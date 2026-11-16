import { expect, test } from "@playwright/test"

test("search suggestions open and selecting a title navigates to its detail route", async ({
  page,
}) => {
  await page.route("**/api/autocomplete**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") || ""
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results:
          query.length >= 2
            ? [
                {
                  id: 550,
                  mediaType: "movie",
                  title: "Fight Club",
                  subtitle: "Movie · 1999",
                  posterPath: null,
                },
              ]
            : [],
      }),
    })
  })

  await page.goto("/library")
  const search = page.getByRole("textbox", {
    name: "Search movies, shows, anime…",
  })
  await search.fill("fight")

  const suggestions = page.getByRole("group", { name: "Search suggestions" })
  const title = page.getByRole("button", { name: "Fight Club, Movie · 1999" })
  await expect(suggestions).toBeVisible()
  await expect(title).toBeVisible()
  await page.waitForTimeout(900)
  await expect(page).toHaveURL(/\/library(?:$|[?#])/, { timeout: 2_000 })
  await expect(title).toBeVisible()
  await title.click()

  await expect(page).toHaveURL(/\/movie\/550(?:$|[?#])/, { timeout: 15_000 })
  await expect(suggestions).toHaveCount(0)
})

test("mobile primary navigation reaches the Library from another public route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/contact")

  const navigation = page.getByRole("navigation", {
    name: "Primary mobile navigation",
  })
  await expect(navigation).toBeVisible()
  await navigation.getByRole("link", { name: "Library" }).click()

  await expect(page).toHaveURL(/\/library(?:$|[?#])/, { timeout: 15_000 })
  await expect(
    page.getByRole("heading", { name: "Pick up where you left off." })
  ).toBeVisible()
})
