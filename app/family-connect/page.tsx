"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, CheckCircle, AlertTriangle, Phone, MapPin } from "lucide-react"
import Link from "next/link"

interface FamilyMember {
  id: number
  family_member_name: string
  status: string
  last_known_location: string
  contact_number: string
  timestamp: string
}

export default function FamilyConnectPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [userId, setUserId] = useState("")
  const [formData, setFormData] = useState({
    family_member_name: "",
    status: "",
    last_known_location: "",
    contact_number: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    // Generate or get user ID
    let storedUserId = localStorage.getItem("family_connect_user_id")
    if (!storedUserId) {
      storedUserId = "user_" + Date.now()
      localStorage.setItem("family_connect_user_id", storedUserId)
    }
    setUserId(storedUserId)

    // Load family members
    loadFamilyMembers(storedUserId)
  }, [])

  const loadFamilyMembers = async (userIdToLoad: string) => {
    try {
      const response = await fetch(`/api/family_status?user_id=${userIdToLoad}`)
      const data = await response.json()
      if (data.status === "success") {
        setFamilyMembers(data.family_members)
      }
    } catch (error) {
      console.error("Error loading family members:", error)
      // Load from localStorage if offline
      const cached = localStorage.getItem(`family_members_${userIdToLoad}`)
      if (cached) {
        setFamilyMembers(JSON.parse(cached))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const requestData = {
        user_id: userId,
        ...formData,
      }

      const response = await fetch("/api/family_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.status === "success") {
        setSubmitStatus("success")
        setFormData({
          family_member_name: "",
          status: "",
          last_known_location: "",
          contact_number: "",
        })
        setShowAddForm(false)
        // Reload family members
        loadFamilyMembers(userId)
      } else {
        throw new Error(data.message || "Failed to update family status")
      }
    } catch (error) {
      console.error("Error updating family status:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "safe":
        return "bg-green-100 text-green-800 border-green-200"
      case "injured":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "missing":
        return "bg-red-100 text-red-800 border-red-200"
      case "evacuated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "safe":
        return <CheckCircle className="h-4 w-4" />
      case "injured":
      case "missing":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-bold">Family Connect</h1>
          </div>
          <Link href="/" className="text-blue-100 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-blue-800">
              Keep track of your family members' safety status during emergencies. Add family members and update their
              status to help coordinate during disasters.
            </p>
          </CardContent>
        </Card>

        {/* Add Family Member */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Family Members
              </CardTitle>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant={showAddForm ? "outline" : "default"}
                className={showAddForm ? "bg-transparent" : ""}
              >
                {showAddForm ? "Cancel" : "Add Member"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="family_member_name">Family Member Name *</Label>
                    <Input
                      id="family_member_name"
                      value={formData.family_member_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, family_member_name: e.target.value }))}
                      required
                      placeholder="Enter family member's name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Current Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="injured">Injured</SelectItem>
                        <SelectItem value="missing">Missing</SelectItem>
                        <SelectItem value="evacuated">Evacuated</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="last_known_location">Last Known Location</Label>
                    <Input
                      id="last_known_location"
                      value={formData.last_known_location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, last_known_location: e.target.value }))}
                      placeholder="Address or location description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      type="tel"
                      value={formData.contact_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contact_number: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Adding..." : "Add Family Member"}
                </Button>

                {submitStatus === "success" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">Family member added successfully!</AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      Failed to add family member. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            )}

            {/* Family Members List */}
            {familyMembers.length > 0 ? (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{member.family_member_name}</h3>
                          <Badge className={getStatusColor(member.status)}>
                            {getStatusIcon(member.status)}
                            <span className="ml-1">{member.status.toUpperCase()}</span>
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          {member.last_known_location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{member.last_known_location}</span>
                            </div>
                          )}
                          {member.contact_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{member.contact_number}</span>
                            </div>
                          )}
                          <p className="text-xs">Last updated: {new Date(member.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No family members added yet.</p>
                <p className="text-sm">Click "Add Member" to start tracking your family's safety.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Other Families */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for Others
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Looking for someone? Contact local authorities or emergency services for assistance in locating missing
              persons.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Call 911
              </Button>
              <Button variant="outline" className="bg-transparent">
                <Search className="h-4 w-4 mr-2" />
                Missing Persons Hotline
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
