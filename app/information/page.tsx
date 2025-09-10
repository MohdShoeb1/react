"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Heart, Phone, AlertTriangle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"

export default function InformationPage() {
  const safetyGuidelines = [
    {
      disaster: "Earthquake",
      icon: "🏠",
      guidelines: [
        "Drop, Cover, and Hold On during shaking",
        "Stay away from windows and heavy objects",
        "If outdoors, move away from buildings and power lines",
        "After shaking stops, check for injuries and hazards",
        "Be prepared for aftershocks",
      ],
    },
    {
      disaster: "Flood",
      icon: "🌊",
      guidelines: [
        "Move to higher ground immediately",
        "Never walk or drive through flood water",
        "Stay away from downed power lines",
        "Listen to emergency broadcasts",
        "Have an evacuation plan ready",
      ],
    },
    {
      disaster: "Fire",
      icon: "🔥",
      guidelines: [
        "Evacuate immediately if safe to do so",
        "Stay low to avoid smoke inhalation",
        "Feel doors before opening - don't open if hot",
        "Have multiple escape routes planned",
        "Meet at designated family meeting point",
      ],
    },
    {
      disaster: "Severe Weather",
      icon: "⛈️",
      guidelines: [
        "Stay indoors and away from windows",
        "Go to lowest floor and interior room",
        "Avoid using electrical appliances",
        "Have battery-powered radio for updates",
        "Stay away from trees and power lines",
      ],
    },
  ]

  const firstAidSteps = [
    {
      emergency: "Bleeding",
      steps: [
        "Apply direct pressure with clean cloth",
        "Elevate the injured area above heart level",
        "Apply pressure to pressure points if needed",
        "Seek medical attention for severe bleeding",
      ],
    },
    {
      emergency: "Burns",
      steps: [
        "Cool the burn with cool (not cold) water",
        "Remove jewelry before swelling occurs",
        "Cover with sterile gauze loosely",
        "Do not break blisters or apply ice",
      ],
    },
    {
      emergency: "Choking",
      steps: [
        "Encourage coughing if person can speak",
        "Give 5 back blows between shoulder blades",
        "Give 5 abdominal thrusts (Heimlich maneuver)",
        "Alternate back blows and abdominal thrusts",
      ],
    },
    {
      emergency: "Unconsciousness",
      steps: [
        "Check for responsiveness and breathing",
        "Call 911 immediately",
        "Place in recovery position if breathing",
        "Begin CPR if not breathing normally",
      ],
    },
  ]

  const helplineNumbers = [
    {
      service: "Emergency Services",
      number: "911",
      description: "Police, Fire, Medical emergencies",
      available: "24/7",
    },
    {
      service: "Disaster Distress Helpline",
      number: "1-800-985-5990",
      description: "Crisis counseling and support",
      available: "24/7",
    },
    {
      service: "American Red Cross",
      number: "1-800-RED-CROSS",
      description: "Disaster relief and assistance",
      available: "24/7",
    },
    {
      service: "FEMA Helpline",
      number: "1-800-621-3362",
      description: "Federal disaster assistance",
      available: "7 AM - 1 AM EST",
    },
    {
      service: "Poison Control",
      number: "1-800-222-1222",
      description: "Poison emergency assistance",
      available: "24/7",
    },
    {
      service: "National Suicide Prevention",
      number: "988",
      description: "Mental health crisis support",
      available: "24/7",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-green-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6" />
            <h1 className="text-xl font-bold">Safety Information</h1>
          </div>
          <Link href="/" className="text-green-100 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Safety Guidelines */}
        <section id="safety-guide">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold">Safety Guidelines</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {safetyGuidelines.map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{guide.icon}</span>
                    {guide.disaster}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.guidelines.map((guideline, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* First Aid */}
        <section id="first-aid">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold">First Aid Guide</h2>
          </div>

          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> These are basic first aid guidelines. Always call 911 for serious injuries or
              medical emergencies.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {firstAidSteps.map((aid, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    {aid.emergency}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {aid.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge
                          variant="outline"
                          className="min-w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Helpline Numbers */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Phone className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Emergency Helplines</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helplineNumbers.map((helpline, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">{helpline.service}</h3>
                    </div>
                    <p className="text-2xl font-mono font-bold text-blue-600">{helpline.number}</p>
                    <p className="text-sm text-muted-foreground">{helpline.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      Available: {helpline.available}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Emergency Kit */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold">Emergency Kit Essentials</h2>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-purple-600">Basic Supplies</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Water (1 gallon per person per day)</li>
                    <li>• Non-perishable food (3-day supply)</li>
                    <li>• Battery-powered radio</li>
                    <li>• Flashlight and extra batteries</li>
                    <li>• First aid kit</li>
                    <li>• Whistle for signaling help</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-purple-600">Personal Items</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Medications (7-day supply)</li>
                    <li>• Important documents (copies)</li>
                    <li>• Cash and credit cards</li>
                    <li>• Emergency contact information</li>
                    <li>• Extra clothing and blankets</li>
                    <li>• Personal hygiene items</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-purple-600">Tools & Safety</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Multi-tool or Swiss Army knife</li>
                    <li>• Duct tape and plastic sheeting</li>
                    <li>• Matches in waterproof container</li>
                    <li>• Fire extinguisher</li>
                    <li>• Smoke and carbon monoxide detectors</li>
                    <li>• Local maps</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
