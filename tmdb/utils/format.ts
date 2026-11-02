
const content = (string: string) => {
  return string
    .split("\n")
    .filter((section) => section !== "")
    .map((section) => `<p>${section}</p>`)
    .join("")
}

const runtime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours ? hours + "h" : ""} ${mins}min`
}

const date = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    dateStyle: "long",
  })
}

const year = (date: string) => new Date(date).getFullYear()

const currency = (x: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  })
  return formatter.format(x)
}

export const format = {
  content,
  runtime,
  date,
  year,
  currency,
}
