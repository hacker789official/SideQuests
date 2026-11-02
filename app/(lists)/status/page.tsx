import { ProviderHealthDashboard } from "@/components/provider-health-dashboard"

export const metadata = {
  title: "Provider Health",
  description: "Check the reachability of SideQuests playback providers.",
}

export default function ProviderHealthPage() {
  return (
    <div className="container py-8">
      <ProviderHealthDashboard />
    </div>
  )
}
