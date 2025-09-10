"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, MapPin, Phone, Send, CheckCircle, Loader2, Navigation } from "lucide-react"
import Link from "next/link"
import { useOffline } from "@/hooks/use-offline"
import { OfflineBanner } from "@/components/offline-banner"

export default function EmergencyPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    requestType: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [currentLocation, setCurrentLocation] = useState<string>("")

  const { isOnline, addOfflineRequest } = useOffline()

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          setCurrentLocation(locationString)
          setFormData((prev) => ({ ...prev, location: locationString }))
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enter it manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleSOSClick = () => {
    getCurrentLocation()
    setFormData((prev) => ({
      ...prev,
      requestType: "emergency",
      message: "EMERGENCY SOS - Immediate assistance required",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      if (isOnline) {
        const response = await fetch("/api/send_help", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (data.status === "success") {
          setSubmitStatus("success")
          setFormData({
            name: "",
            phone: "",
            location: "",
            requestType: "",
            message: "",
          })
        } else {
          throw new Error(data.message || "Failed to submit request")
        }
      } else {
        addOfflineRequest("help_request", formData)
        setSubmitStatus("success")
        setFormData({
          name: "",
          phone: "",
          location: "",
          requestType: "",
          message: "",
        })
      }
    } catch (error) {
      console.error("Error submitting help request:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-red-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-xl font-bold">Emergency Help</h1>
          </div>
          <Link href="/" className="text-red-100 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </header>

      <OfflineBanner />

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* SOS Section */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              In immediate danger? Click the SOS button to send your location and emergency alert.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSOSClick}>
                <Navigation className="h-5 w-5 mr-2" />
                SOS - Send Location
              </Button>
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get My Location
              </Button>
            </div>
            {currentLocation && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">Location captured: {currentLocation}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Help Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Request Help
              {!isOnline && <Badge variant="secondary">Offline Mode</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your contact number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder="Your current location or address"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={getCurrentLocation} className="bg-transparent">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="requestType">Type of Help Needed</Label>
                <Select
                  value={formData.requestType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, requestType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select help type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency/Life Threatening</SelectItem>
                    <SelectItem value="medical">Medical Assistance</SelectItem>
                    <SelectItem value="rescue">Rescue/Evacuation</SelectItem>
                    <SelectItem value="shelter">Shelter/Housing</SelectItem>
                    <SelectItem value="food">Food/Water</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="general">General Assistance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Additional Details</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your situation and specific needs..."
                  rows={4}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isOnline ? "Send Help Request" : "Save Request (Offline)"}
                  </>
                )}
              </Button>

              {submitStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    {isOnline
                      ? "Help request submitted successfully! Emergency services have been notified."
                      : "Request saved offline. It will be sent when connection is restored."}
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    Failed to submit request. Please try again or contact emergency services directly.
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold">Emergency Services</p>
                  <p className="text-lg font-mono text-red-600">911</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Disaster Helpline</p>
                  <p className="text-lg font-mono text-blue-600">1-800-HELP-NOW</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
