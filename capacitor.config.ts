import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "net.arnavrana.sidequests",
  appName: "SideQuests",
  webDir: "public",
  server: {
    url: process.env.SIDEQUESTS_APP_URL || "https://sidequests-arnavarana789-9179s-projects.vercel.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#060b12",
  },
}

export default config
