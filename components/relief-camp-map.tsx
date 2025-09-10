"use client"

import { useEffect, useRef } from "react"

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

interface MapViewProps {
  camps: ReliefCamp[]
  userLocation: { lat: number; lng: number } | null
}

export default function MapView({ camps, userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Import CSS
      import("leaflet/dist/leaflet.css")

      // Fix for default markers in Leaflet with webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      // Initialize map
      const defaultCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : camps.length > 0
          ? [camps[0].latitude, camps[0].longitude]
          : [40.7128, -74.006] // Default to NYC

      const map = L.map(mapRef.current!).setView(defaultCenter, 12)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add user location marker if available
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: "user-location-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup("Your Location")
      }

      // Add camp markers
      camps.forEach((camp) => {
        const getResourceStatus = (available: number) => {
          if (available > 100) return { status: "High", color: "#22c55e" }
          if (available > 50) return { status: "Medium", color: "#eab308" }
          if (available > 0) return { status: "Low", color: "#ef4444" }
          return { status: "None", color: "#6b7280" }
        }

        const campIcon = L.divIcon({
          html: `<div style="background-color: ${camp.availability === "Available" ? "#22c55e" : "#6b7280"}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                     <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                     <circle cx="12" cy="10" r="3"/>
                   </svg>
                 </div>`,
          className: "camp-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        const resourcesHtml = Object.entries(camp.resources)
          .map(([type, amount]) => {
            const status = getResourceStatus(amount)
            const icons = {
              food: "🍽️",
              medicine: "💊",
              shelter: "🏠",
              water: "💧",
            }
            return `
              <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                <span>${icons[type as keyof typeof icons]}</span>
                <span style="text-transform: capitalize; flex: 1;">${type}:</span>
                <span style="color: ${status.color}; font-weight: bold;">${status.status}</span>
              </div>
            `
          })
          .join("")

        const popupContent = `
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${camp.camp_name}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${camp.location}</p>
            
            <div style="margin: 8px 0;">
              <strong>Capacity:</strong> ${camp.current_occupancy}/${camp.capacity}
              <span style="color: ${camp.availability === "Available" ? "#22c55e" : "#6b7280"}; font-weight: bold; margin-left: 8px;">
                ${camp.availability}
              </span>
            </div>
            
            <div style="margin: 8px 0;">
              <strong>Resources:</strong>
              ${resourcesHtml}
            </div>
            
            ${
              camp.contact_number
                ? `
              <div style="margin: 8px 0;">
                <strong>Contact:</strong> ${camp.contact_number}
              </div>
            `
                : ""
            }
            
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${camp.latitude},${camp.longitude}', '_blank')" 
                      style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                Get Directions
              </button>
              ${
                camp.contact_number
                  ? `
                <button onclick="window.open('tel:${camp.contact_number}')" 
                        style="background: #22c55e; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                  Call
                </button>
              `
                  : ""
              }
            </div>
          </div>
        `

        L.marker([camp.latitude, camp.longitude], { icon: campIcon }).addTo(map).bindPopup(popupContent)
      })

      // Fit map to show all markers
      if (camps.length > 0) {
        const group = new L.FeatureGroup()

        camps.forEach((camp) => {
          group.addLayer(L.marker([camp.latitude, camp.longitude]))
        })

        if (userLocation) {
          group.addLayer(L.marker([userLocation.lat, userLocation.lng]))
        }

        map.fitBounds(group.getBounds().pad(0.1))
      }

      mapInstanceRef.current = map

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      }
    })
  }, [camps, userLocation])

  return <div ref={mapRef} className="h-96 w-full rounded-lg" />
}
