"use client"

import dynamic from "next/dynamic"

const SyncProvider = dynamic(
    () => import("@/components/sync-provider").then((mod) => mod.SyncProvider),
    { ssr: false }
)

export function DynamicProviders() {
    return (
        <>
            <SyncProvider />
        </>
    )
}

