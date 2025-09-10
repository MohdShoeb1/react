"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Phone, MapPin, Users, Heart, Shield, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { useOffline } from "@/hooks/use-offline"
import { OfflineBanner } from "@/components/offline-banner"

interface DisasterAlert {
  id: number
  type: string
  severity: string
  title: string
  message: string
  area: string
  timestamp: string
}

export default function HomePage() {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([])
  const [loading, setLoading] = useState(true)
  const { isOnline, cacheData, getCachedData } = useOffline()

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      if (isOnline) {
        const response = await fetch("/api/get_alerts")
        const data = await response.json()
        if (data.status === "success") {
          setAlerts(data.alerts)
          cacheData("disaster_alerts", data.alerts)
        }
      } else {
        const cachedAlerts = getCachedData("disaster_alerts")
        if (cachedAlerts) {
          setAlerts(cachedAlerts)
        }
      }
    } catch (error) {
      console.log("Failed to fetch alerts - using cached data if available")
      const cachedAlerts = getCachedData("disaster_alerts")
      if (cachedAlerts) {
        setAlerts(cachedAlerts)
      }
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const emergencyContacts = [
    { name: "Emergency Services", number: "911", icon: Phone },
    { name: "Disaster Helpline", number: "1-800-HELP-NOW", icon: Shield },
    { name: "Medical Emergency", number: "1-800-MED-HELP", icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8" />
            <h1 className="text-2xl font-bold">DisasterGuard</h1>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1 text-green-200">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-200">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <OfflineBanner />

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Emergency Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Need Immediate Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white" asChild>
                <Link href="/emergency">{isOnline ? "Get Help Now" : "Get Help (Offline)"}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                asChild
              >
                <Link href="/emergency#sos">SOS - Send Location</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Find Relief Centers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="lg" className="w-full" asChild>
                <Link href="/relief-camps">View Nearby Camps</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                <Link href="/family-connect">
                  <Users className="h-4 w-4 mr-2" />
                  Family Connect
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Current Alerts */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Current Alerts</h2>
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading alerts...</p>
              </CardContent>
            </Card>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {alert.title}
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        <p>{alert.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Area: {alert.area} • {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No active alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Emergency Contacts */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <contact.icon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-lg font-mono text-primary">{contact.number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/information">
                <Shield className="h-6 w-6" />
                Safety Guide
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/information#first-aid">
                <Heart className="h-6 w-6" />
                First Aid
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/ai-assistant">
                <Users className="h-6 w-6" />
                AI Assistant
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/admin">
                <MapPin className="h-6 w-6" />
                Admin Portal
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
