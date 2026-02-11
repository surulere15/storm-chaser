'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

interface Storm {
  id: string
  latitude: number
  longitude: number
  event_type: string
  severity: number
  city: string
  state: string
  estimated_homes: number
  headline: string
}

export default function StormMap({ storms }: { storms: Storm[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const markers = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-95, 38], // US center
        zoom: 4,
        attributionControl: false
      })

      map.current.on('load', () => {
        setMapLoaded(true)
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      markers.current.forEach(marker => marker.remove())
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Remove existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers for each storm
    storms.forEach(storm => {
      if (!storm.latitude || !storm.longitude) return

      const severity = storm.severity
      const color = severity >= 8 ? '#ef4444' :
                    severity >= 6 ? '#f59e0b' :
                    severity >= 4 ? '#eab308' : '#3b82f6'

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'storm-marker'
      el.style.width = `${20 + severity * 3}px`
      el.style.height = `${20 + severity * 3}px`
      el.style.borderRadius = '50%'
      el.style.backgroundColor = color
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)'
      el.style.cursor = 'pointer'
      el.style.animation = 'pulse 2s ease-in-out infinite'

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([storm.longitude, storm.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: 'storm-popup' })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-lg mb-2">${storm.event_type.replace('_', ' ').toUpperCase()}</h3>
                <div class="space-y-1 text-sm">
                  <p><span class="font-semibold">Severity:</span> ${severity}/10</p>
                  <p><span class="font-semibold">Location:</span> ${storm.city}, ${storm.state}</p>
                  <p><span class="font-semibold">Homes affected:</span> ~${storm.estimated_homes?.toLocaleString() || 'Unknown'}</p>
                </div>
                <div class="mt-3 pt-3 border-t border-slate-600">
                  <p class="text-xs text-slate-300">${storm.headline}</p>
                </div>
              </div>
            `)
        )
        .addTo(map.current!)

      markers.current.push(marker)
    })

    // Fit map to show all storms if there are any
    if (storms.length > 0 && storms.some(s => s.latitude && s.longitude)) {
      const bounds = new mapboxgl.LngLatBounds()
      storms.forEach(storm => {
        if (storm.latitude && storm.longitude) {
          bounds.extend([storm.longitude, storm.latitude])
        }
      })
      map.current?.fitBounds(bounds, { padding: 50, maxZoom: 8 })
    }
  }, [storms, mapLoaded])

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </>
  )
}
