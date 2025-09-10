"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { MapPin, Users, Utensils, Heart, Home, Droplets, Phone, Navigation, List, Map } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useOffline } from "@/hooks/use-offline"
import { OfflineBanner } from "@/components/offline-banner"

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import("@/components/relief-camp-map"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted rounded-lg flex items-center justify-center">Loading map...</div>,
})

interface ReliefCamp {
  id: number
  camp_name: string
  location: string
  latitude: number
  longitude: number
  resources: {
    food: number
    medicine: number
    shelter: number
    water: number
  }
  contact_number: string
  capacity: number
  current_occupancy: number
  availability: string
}

export default function ReliefCampsPage() {
  const [camps, setCamps] = useState<ReliefCamp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeView, setActiveView] = useState<"map" | "list">("map")

  const { isOnline, cacheData, getCachedData } = useOffline()

  useEffect(() => {
    fetchCamps()
    getCurrentLocation()
  }, [])

  const fetchCamps = async () => {
    try {
      if (isOnline) {
        const response = await fetch("/api/get_camps")
        const data = await response.json()

        if (data.status === "success") {
          setCamps(data.camps)
          cacheData("relief_camps", data.camps)
        } else {
          throw new Error(data.message || "Failed to fetch camps")
        }
      } else {
        const cachedCamps = getCachedData("relief_camps")
        if (cachedCamps) {
          setCamps(cachedCamps)
        } else {
          throw new Error("No cached camp data available")
        }
      }
    } catch (error) {
      console.error("Error fetching camps:", error)
      setError("Failed to load relief camps. Please try again later.")

      const cachedCamps = getCachedData("relief_camps")
      if (cachedCamps) {
        setCamps(cachedCamps)
        setError(null) // Clear error if we have cached data
      }
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Could not get user location:", error)
        },
      )
    }
  }

  const calculateDistance = (camp: ReliefCamp) => {
    if (!userLocation) return null

    const R = 3959 // Earth's radius in miles
    const dLat = ((camp.latitude - userLocation.lat) * Math.PI) / 180
    const dLon = ((camp.longitude - userLocation.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((camp.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance.toFixed(1)
  }

  const getResourceStatus = (available: number, type: string) => {
    if (available > 100) return { status: "High", color: "bg-green-100 text-green-800" }
    if (available > 50) return { status: "Medium", color: "bg-yellow-100 text-yellow-800" }
    if (available > 0) return { status: "Low", color: "bg-red-100 text-red-800" }
    return { status: "None", color: "bg-gray-100 text-gray-800" }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "food":
        return <Utensils className="h-4 w-4" />
      case "medicine":
        return <Heart className="h-4 w-4" />
      case "shelter":
        return <Home className="h-4 w-4" />
      case "water":
        return <Droplets className="h-4 w-4" />
      default:
        return null
    }
  }

  const sortedCamps = userLocation
    ? [...camps].sort((a, b) => {
        const distA = calculateDistance(a)
        const distB = calculateDistance(b)
        if (!distA) return 1
        if (!distB) return -1
        return Number.parseFloat(distA) - Number.parseFloat(distB)
      })
    : camps

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-blue-600 text-white p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              <h1 className="text-xl font-bold">Relief Camp Locator</h1>
            </div>
            <Link href="/" className="text-blue-100 hover:text-white">
              ← Back to Home
            </Link>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-center h-96">
            <p>Loading relief camps...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            <h1 className="text-xl font-bold">Relief Camp Locator</h1>
          </div>
          <Link href="/" className="text-blue-100 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </header>

      <OfflineBanner />

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {camps.length} Relief Camp{camps.length !== 1 ? "s" : ""} Available
              {!isOnline && (
                <Badge variant="secondary" className="ml-2">
                  Cached Data
                </Badge>
              )}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === "map" ? "default" : "outline"}
              onClick={() => setActiveView("map")}
              className={activeView === "outline" ? "bg-transparent" : ""}
            >
              <Map className="h-4 w-4 mr-2" />
              Map View
            </Button>
            <Button
              variant={activeView === "list" ? "default" : "outline"}
              onClick={() => setActiveView("list")}
              className={activeView === "outline" ? "bg-transparent" : ""}
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
        </div>

        {/* Location Status */}
        {userLocation ? (
          <Alert className="border-green-200 bg-green-50">
            <Navigation className="h-4 w-4" />
            <AlertDescription className="text-green-800">
              Location detected. Camps are sorted by distance from your location.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-200 bg-blue-50">
            <Navigation className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              Enable location services to see distances to camps.
              <Button variant="link" onClick={getCurrentLocation} className="ml-2 p-0 h-auto text-blue-600 underline">
                Enable Location
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "map" | "list")}>
          <TabsContent value="map" className="space-y-6">
            {/* Map View */}
            <Card>
              <CardContent className="p-0">
                <MapView camps={camps} userLocation={userLocation} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {/* List View */}
            {sortedCamps.map((camp) => {
              const distance = calculateDistance(camp)
              return (
                <Card key={camp.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          {camp.camp_name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">{camp.location}</p>
                        {distance && <p className="text-sm text-blue-600 font-medium mt-1">{distance} miles away</p>}
                      </div>
                      <Badge
                        variant={camp.availability === "Available" ? "default" : "secondary"}
                        className={camp.availability === "Available" ? "bg-green-100 text-green-800" : ""}
                      >
                        {camp.availability}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Capacity Info */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          Capacity: {camp.current_occupancy}/{camp.capacity}
                        </span>
                      </div>
                      {camp.contact_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{camp.contact_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="font-medium mb-2">Available Resources</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(camp.resources).map(([type, amount]) => {
                          const resourceStatus = getResourceStatus(amount, type)
                          return (
                            <div key={type} className="flex items-center gap-2 p-2 border rounded">
                              {getResourceIcon(type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium capitalize">{type}</p>
                                <Badge variant="outline" className={`text-xs ${resourceStatus.color}`}>
                                  {resourceStatus.status}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${camp.latitude},${camp.longitude}`
                          window.open(url, "_blank")
                        }}
                        className="bg-transparent"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Get Directions
                      </Button>
                      {camp.contact_number && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${camp.contact_number}`)}
                          className="bg-transparent"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>

        {camps.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No relief camps found in your area.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later or contact emergency services for assistance.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
