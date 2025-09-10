"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Send,
  User,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Cloud,
  Thermometer,
  Droplets,
  Activity,
} from "lucide-react"
import Link from "next/link"

interface ChatMessage {
  id: string
  type: "user" | "bot"
  message: string
  timestamp: Date
}

interface RiskData {
  overall: number
  factors: {
    weather: number
    seismic: number
    flood: number
    fire: number
  }
  location: string
  lastUpdated: Date
}

const chatbotResponses = {
  greetings: [
    "Hello! I'm your disaster preparedness assistant. How can I help you stay safe today?",
    "Hi there! I'm here to help with emergency preparedness and safety information. What would you like to know?",
    "Welcome! I can provide information about disaster preparedness, safety tips, and emergency procedures. How can I assist you?",
  ],
  earthquake: [
    "During an earthquake: DROP to your hands and knees, take COVER under a sturdy desk or table, and HOLD ON until shaking stops. Stay away from windows and heavy objects that could fall.",
    "After an earthquake, check for injuries and hazards. Be prepared for aftershocks. If you're trapped, tap on pipes or walls to signal rescuers rather than shouting.",
    "Earthquake preparedness: Secure heavy furniture to walls, keep emergency supplies ready, and practice drop-cover-hold drills with your family.",
  ],
  flood: [
    "If flooding occurs: Move to higher ground immediately. Never walk or drive through flood water - just 6 inches can knock you down, and 12 inches can carry away a vehicle.",
    "Flood safety: Stay away from downed power lines, listen to emergency broadcasts, and have an evacuation plan ready. Turn off utilities if instructed.",
    "After a flood: Don't return home until authorities say it's safe. Avoid flood water as it may be contaminated. Document damage with photos for insurance.",
  ],
  fire: [
    "In case of fire: Get out fast and stay out. Crawl low under smoke. Feel doors before opening - if hot, use another exit. Meet at your family meeting point.",
    "Fire prevention: Install smoke detectors, create and practice an escape plan, keep fire extinguishers accessible, and maintain heating equipment.",
    "Wildfire safety: Create defensible space around your home, have an evacuation plan, and sign up for local emergency alerts.",
  ],
  emergency_kit: [
    "Your emergency kit should include: Water (1 gallon per person per day for 3 days), non-perishable food, battery-powered radio, flashlight, first aid kit, medications, and important documents.",
    "Don't forget: Extra batteries, whistle, dust masks, plastic sheeting, moist towelettes, wrench to turn off gas, manual can opener, and local maps.",
    "Update your kit every 6 months: Replace expired food and water, update documents, and check battery-powered equipment.",
  ],
  family_plan: [
    "Create a family emergency plan: Choose meeting places, establish out-of-area contact, make copies of important documents, and ensure everyone knows the plan.",
    "Practice your plan regularly: Conduct drills, update contact information, and make sure all family members know how to turn off utilities.",
    "Special considerations: Plan for pets, elderly family members, and people with disabilities. Keep important phone numbers written down.",
  ],
  first_aid: [
    "Basic first aid priorities: Check for responsiveness, call 911, control bleeding with direct pressure, and treat for shock by keeping the person warm and calm.",
    "For burns: Cool with water, remove jewelry before swelling, cover loosely with sterile gauze. Don't break blisters or apply ice.",
    "For choking: Give 5 back blows between shoulder blades, then 5 abdominal thrusts. Alternate until object is expelled or person becomes unconscious.",
  ],
  default: [
    "I can help with information about earthquakes, floods, fires, emergency kits, family planning, and first aid. What specific topic would you like to know about?",
    "I'm here to provide disaster preparedness guidance. Try asking about emergency supplies, evacuation plans, or specific disaster types like earthquakes or floods.",
    "I can assist with safety information and emergency preparedness. What would you like to learn about today?",
  ],
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [riskData, setRiskData] = useState<RiskData>({
    overall: 65,
    factors: {
      weather: 45,
      seismic: 75,
      flood: 30,
      fire: 80,
    },
    location: "San Francisco Bay Area",
    lastUpdated: new Date(),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add initial greeting message
    const initialMessage: ChatMessage = {
      id: "initial",
      type: "bot",
      message: chatbotResponses.greetings[0],
      timestamp: new Date(),
    }
    setMessages([initialMessage])

    // Simulate risk data updates
    const interval = setInterval(() => {
      setRiskData((prev) => ({
        ...prev,
        factors: {
          weather: Math.max(0, Math.min(100, prev.factors.weather + (Math.random() - 0.5) * 10)),
          seismic: Math.max(0, Math.min(100, prev.factors.seismic + (Math.random() - 0.5) * 5)),
          flood: Math.max(0, Math.min(100, prev.factors.flood + (Math.random() - 0.5) * 15)),
          fire: Math.max(0, Math.min(100, prev.factors.fire + (Math.random() - 0.5) * 20)),
        },
        lastUpdated: new Date(),
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update overall risk based on factors
    const avgRisk = Object.values(riskData.factors).reduce((sum, val) => sum + val, 0) / 4
    setRiskData((prev) => ({ ...prev, overall: Math.round(avgRisk) }))
  }, [riskData.factors])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return chatbotResponses.greetings[Math.floor(Math.random() * chatbotResponses.greetings.length)]
    }

    if (message.includes("earthquake") || message.includes("quake")) {
      return chatbotResponses.earthquake[Math.floor(Math.random() * chatbotResponses.earthquake.length)]
    }

    if (message.includes("flood") || message.includes("flooding")) {
      return chatbotResponses.flood[Math.floor(Math.random() * chatbotResponses.flood.length)]
    }

    if (message.includes("fire") || message.includes("wildfire")) {
      return chatbotResponses.fire[Math.floor(Math.random() * chatbotResponses.fire.length)]
    }

    if (message.includes("emergency kit") || message.includes("supplies") || message.includes("kit")) {
      return chatbotResponses.emergency_kit[Math.floor(Math.random() * chatbotResponses.emergency_kit.length)]
    }

    if (message.includes("family plan") || message.includes("evacuation") || message.includes("plan")) {
      return chatbotResponses.family_plan[Math.floor(Math.random() * chatbotResponses.family_plan.length)]
    }

    if (message.includes("first aid") || message.includes("medical") || message.includes("injury")) {
      return chatbotResponses.first_aid[Math.floor(Math.random() * chatbotResponses.first_aid.length)]
    }

    return chatbotResponses.default[Math.floor(Math.random() * chatbotResponses.default.length)]
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(
      () => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          message: getBotResponse(inputMessage),
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    )
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return "text-red-600"
    if (risk >= 60) return "text-orange-600"
    if (risk >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getRiskLevel = (risk: number) => {
    if (risk >= 80) return "Very High"
    if (risk >= 60) return "High"
    if (risk >= 40) return "Moderate"
    if (risk >= 20) return "Low"
    return "Very Low"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-purple-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <h1 className="text-xl font-bold">AI Assistant</h1>
          </div>
          <Link href="/" className="text-purple-100 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="chatbot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Chatbot
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Risk Assessment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chatbot" className="space-y-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <p className="text-purple-800">
                  Ask me about disaster preparedness, emergency procedures, safety tips, and more. I'm here to help you
                  stay prepared and safe!
                </p>
              </CardContent>
            </Card>

            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Disaster Preparedness Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${message.type === "user" ? "justify-end" : ""}`}
                    >
                      {message.type === "bot" && (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-purple-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 border"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {message.type === "user" && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-lg border">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about emergency preparedness..."
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isTyping || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    "What should be in my emergency kit?",
                    "How do I prepare for an earthquake?",
                    "What to do during a flood?",
                    "Fire safety tips",
                    "Family emergency plan",
                    "Basic first aid",
                  ].map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(question)}
                      className="text-left justify-start bg-transparent"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Demo Mode:</strong> This risk assessment uses simulated data for demonstration purposes. In a
                real system, this would integrate with weather services, geological surveys, and other data sources.
              </AlertDescription>
            </Alert>

            {/* Overall Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Overall Risk Assessment
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {riskData.location}
                  <span>•</span>
                  <span>Last updated: {riskData.lastUpdated.toLocaleTimeString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getRiskColor(riskData.overall)}`}>{riskData.overall}%</div>
                    <div className={`text-lg font-medium ${getRiskColor(riskData.overall)}`}>
                      {getRiskLevel(riskData.overall)} Risk
                    </div>
                  </div>
                  <Progress value={riskData.overall} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Weather Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Severe Weather</span>
                      <span className={`font-medium ${getRiskColor(riskData.factors.weather)}`}>
                        {riskData.factors.weather.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={riskData.factors.weather} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Based on current weather patterns, storm forecasts, and seasonal conditions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Seismic Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Earthquake Activity</span>
                      <span className={`font-medium ${getRiskColor(riskData.factors.seismic)}`}>
                        {riskData.factors.seismic.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={riskData.factors.seismic} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Based on recent seismic activity, fault line proximity, and geological data.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Flood Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Flooding Potential</span>
                      <span className={`font-medium ${getRiskColor(riskData.factors.flood)}`}>
                        {riskData.factors.flood.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={riskData.factors.flood} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Based on rainfall levels, river conditions, and flood zone mapping.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Fire Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Wildfire Danger</span>
                      <span className={`font-medium ${getRiskColor(riskData.factors.fire)}`}>
                        {riskData.factors.fire.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={riskData.factors.fire} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Based on temperature, humidity, wind conditions, and vegetation dryness.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {riskData.factors.fire >= 70 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        <strong>High Fire Risk:</strong> Avoid outdoor burning, keep emergency supplies ready, and
                        monitor local fire alerts closely.
                      </AlertDescription>
                    </Alert>
                  )}
                  {riskData.factors.seismic >= 60 && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertDescription className="text-orange-800">
                        <strong>Elevated Seismic Activity:</strong> Review your earthquake preparedness plan and secure
                        heavy furniture.
                      </AlertDescription>
                    </Alert>
                  )}
                  {riskData.overall >= 70 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-yellow-800">
                        <strong>General Preparedness:</strong> Ensure your emergency kit is stocked and your family
                        emergency plan is up to date.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
