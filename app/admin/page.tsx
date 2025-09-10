"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  LogIn,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Utensils,
  Heart,
  Home,
  Droplets,
  Plus,
  Minus,
  Save,
  LogOut,
} from "lucide-react"
import Link from "next/link"

interface AdminUser {
  username: string
  role: string
}

interface HelpRequest {
  id: number
  name: string
  location: string
  phone: string
  request_type: string
  message: string
  status: string
  timestamp: string
}

interface ReliefCamp {
  id: number
  camp_name: string
  location: string
  resources: {
    food: number
    medicine: number
    shelter: number
    water: number
  }
  capacity: number
  current_occupancy: number
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [camps, setCamps] = useState<ReliefCamp[]>([])
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    // Check if already logged in
    const storedUser = localStorage.getItem("admin_user")
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser))
      setIsLoggedIn(true)
      loadDashboardData()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (data.status === "success") {
        setAdminUser(data.user)
        setIsLoggedIn(true)
        localStorage.setItem("admin_user", JSON.stringify(data.user))
        loadDashboardData()
      } else {
        setLoginError(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Network error. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAdminUser(null)
    localStorage.removeItem("admin_user")
    setLoginData({ username: "", password: "" })
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load help requests
      const helpResponse = await fetch("/api/admin/help_requests")
      const helpData = await helpResponse.json()
      if (helpData.status === "success") {
        setHelpRequests(helpData.requests)
      }

      // Load camps
      const campsResponse = await fetch("/api/get_camps")
      const campsData = await campsResponse.json()
      if (campsData.status === "success") {
        setCamps(campsData.camps)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateCampResources = async (campId: number, resources: any) => {
    setUpdateStatus("idle")
    try {
      const response = await fetch("/api/update_resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          camp_id: campId,
          resources,
        }),
      })

      const data = await response.json()

      if (data.status === "success") {
        setUpdateStatus("success")
        // Refresh camps data
        loadDashboardData()
        setTimeout(() => setUpdateStatus("idle"), 3000)
      } else {
        setUpdateStatus("error")
      }
    } catch (error) {
      console.error("Error updating resources:", error)
      setUpdateStatus("error")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRequestTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "medical":
        return "bg-orange-100 text-orange-800"
      case "rescue":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-slate-800 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <h1 className="text-xl font-bold">Admin Portal</h1>
            </div>
            <Link href="/" className="text-slate-300 hover:text-white">
              ← Back to Home
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Admin Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={loginData.username}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    placeholder="Enter password"
                  />
                </div>

                {loginError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{loginError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Credentials:</strong>
                  <br />
                  Username: admin
                  <br />
                  Password: admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <Badge variant="secondary" className="ml-2">
              {adminUser?.role}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Welcome, {adminUser?.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Help Requests
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Manage Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Help Requests</h2>
              <Button onClick={loadDashboardData} variant="outline" className="bg-transparent">
                Refresh
              </Button>
            </div>

            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <p>Loading help requests...</p>
                </CardContent>
              </Card>
            ) : helpRequests.length > 0 ? (
              <div className="space-y-4">
                {helpRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {request.name}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1">{request.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getRequestTypeColor(request.request_type)}>
                            {request.request_type.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>{request.status.toUpperCase()}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {request.message && (
                        <div>
                          <h4 className="font-medium mb-1">Message:</h4>
                          <p className="text-sm text-muted-foreground">{request.message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        {request.phone && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Phone:</span>
                            <span>{request.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(request.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No help requests at this time.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manage Camp Resources</h2>
              <Button onClick={loadDashboardData} variant="outline" className="bg-transparent">
                Refresh
              </Button>
            </div>

            {updateStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">Resources updated successfully!</AlertDescription>
              </Alert>
            )}

            {updateStatus === "error" && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  Failed to update resources. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <p>Loading camps...</p>
                </CardContent>
              </Card>
            ) : camps.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {camps.map((camp) => (
                  <CampResourceManager key={camp.id} camp={camp} onUpdate={updateCampResources} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No camps found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

interface CampResourceManagerProps {
  camp: ReliefCamp
  onUpdate: (campId: number, resources: any) => void
}

function CampResourceManager({ camp, onUpdate }: CampResourceManagerProps) {
  const [resources, setResources] = useState(camp.resources)
  const [hasChanges, setHasChanges] = useState(false)

  const updateResource = (type: keyof typeof resources, change: number) => {
    const newValue = Math.max(0, resources[type] + change)
    const newResources = { ...resources, [type]: newValue }
    setResources(newResources)
    setHasChanges(true)
  }

  const handleSave = () => {
    onUpdate(camp.id, resources)
    setHasChanges(false)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {camp.camp_name}
        </CardTitle>
        <p className="text-muted-foreground">{camp.location}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Capacity: {camp.current_occupancy}/{camp.capacity}
        </div>

        <div className="space-y-3">
          {Object.entries(resources).map(([type, amount]) => (
            <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getResourceIcon(type)}
                <span className="font-medium capitalize">{type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateResource(type as keyof typeof resources, -10)}
                  className="bg-transparent"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="min-w-12 text-center font-mono">{amount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateResource(type as keyof typeof resources, 10)}
                  className="bg-transparent"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
