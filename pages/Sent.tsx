import { Suspense } from "react"
import SentView from "@/components/inbox/SentView"
import AppShell from "@/components/layout/AppShell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Sent() {
  return (
    <AppShell>
      <Suspense fallback={<SentSkeleton />}>
        <SentView />
      </Suspense>
    </AppShell>
  )
}

function SentSkeleton() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-4 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
