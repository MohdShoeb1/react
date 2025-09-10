"use client"

import { useState, useEffect, useCallback } from "react"

interface OfflineRequest {
  id: string
  type: "help_request" | "family_status"
  data: any
  timestamp: string
  synced: boolean
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingRequests, setPendingRequests] = useState<OfflineRequest[]>([])

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    // Load pending requests from localStorage
    loadPendingRequests()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingRequests()
    }

    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadPendingRequests = () => {
    try {
      const stored = localStorage.getItem("offline_requests")
      if (stored) {
        const requests = JSON.parse(stored)
        setPendingRequests(requests.filter((req: OfflineRequest) => !req.synced))
      }
    } catch (error) {
      console.error("Error loading pending requests:", error)
    }
  }

  const addOfflineRequest = useCallback(
    (type: OfflineRequest["type"], data: any) => {
      const request: OfflineRequest = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        synced: false,
      }

      const updatedRequests = [...pendingRequests, request]
      setPendingRequests(updatedRequests)

      // Save to localStorage
      try {
        const allRequests = JSON.parse(localStorage.getItem("offline_requests") || "[]")
        allRequests.push(request)
        localStorage.setItem("offline_requests", JSON.stringify(allRequests))
      } catch (error) {
        console.error("Error saving offline request:", error)
      }

      return request.id
    },
    [pendingRequests],
  )

  const syncPendingRequests = useCallback(async () => {
    if (!isOnline || pendingRequests.length === 0) return

    console.log(`[v0] Starting sync of ${pendingRequests.length} pending requests`)

    const syncPromises = pendingRequests.map(async (request) => {
      try {
        let endpoint = ""
        const method = "POST"

        switch (request.type) {
          case "help_request":
            endpoint = "/api/send_help"
            break
          case "family_status":
            endpoint = "/api/family_status"
            break
          default:
            throw new Error(`Unknown request type: ${request.type}`)
        }

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request.data),
        })

        const result = await response.json()

        if (result.status === "success") {
          // Mark as synced
          request.synced = true
          console.log(`[v0] Successfully synced request ${request.id}`)
          return { success: true, request }
        } else {
          console.error(`[v0] Failed to sync request ${request.id}:`, result.message)
          return { success: false, request, error: result.message }
        }
      } catch (error) {
        console.error(`[v0] Error syncing request ${request.id}:`, error)
        return { success: false, request, error: error.message }
      }
    })

    const results = await Promise.allSettled(syncPromises)

    // Update localStorage and state
    try {
      const allRequests = JSON.parse(localStorage.getItem("offline_requests") || "[]")
      const updatedRequests = allRequests.map((req: OfflineRequest) => {
        const syncResult = results.find((r) => r.status === "fulfilled" && r.value.request.id === req.id)
        if (syncResult && syncResult.status === "fulfilled" && syncResult.value.success) {
          return { ...req, synced: true }
        }
        return req
      })

      localStorage.setItem("offline_requests", JSON.stringify(updatedRequests))

      // Update state to remove synced requests
      setPendingRequests((prev) => prev.filter((req) => !req.synced))

      const syncedCount = results.filter((r) => r.status === "fulfilled" && r.value.success).length

      if (syncedCount > 0) {
        console.log(`[v0] Successfully synced ${syncedCount} requests`)
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Error updating synced requests:", error)
    }
  }, [isOnline, pendingRequests])

  const cacheData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
        }),
      )
    } catch (error) {
      console.error("Error caching data:", error)
    }
  }, [])

  const getCachedData = useCallback((key: string, maxAge = 3600000) => {
    // 1 hour default
    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const age = Date.now() - new Date(timestamp).getTime()
        if (age < maxAge) {
          return data
        }
      }
    } catch (error) {
      console.error("Error getting cached data:", error)
    }
    return null
  }, [])

  return {
    isOnline,
    pendingRequests,
    addOfflineRequest,
    syncPendingRequests,
    cacheData,
    getCachedData,
  }
}
