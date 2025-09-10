"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"
import { useOffline } from "@/hooks/use-offline"

export function OfflineBanner() {
  const { isOnline, pendingRequests, syncPendingRequests } = useOffline()

  if (isOnline && pendingRequests.length === 0) {
    return null
  }

  if (!isOnline) {
    return (
      <Alert className="mx-4 mt-4 border-orange-200 bg-orange-50">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>You're currently offline</strong>
            <p className="text-sm mt-1">
              Some features may be limited. Your requests will be saved and synced when connection is restored.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (pendingRequests.length > 0) {
    return (
      <Alert className="mx-4 mt-4 border-blue-200 bg-blue-50">
        <RefreshCw className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Syncing offline data...</strong>
            <p className="text-sm mt-1">
              {pendingRequests.length} request{pendingRequests.length !== 1 ? "s" : ""} pending sync
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={syncPendingRequests}
            className="bg-transparent border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync Now
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
