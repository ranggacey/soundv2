import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import mapboxgl from 'mapbox-gl'
import { Sound } from '../lib/supabase'
import { Volume2 } from 'lucide-react'

// Set Mapbox token from environment variable or use a placeholder
const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
if (mapboxToken && mapboxToken !== 'your_mapbox_token_here') {
  mapboxgl.accessToken = mapboxToken
}

interface InteractiveMapProps {
  sounds: Sound[]
  onSoundSelect: (sound: Sound) => void
  selectedSound?: Sound | null
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  sounds, 
  onSoundSelect, 
  selectedSound 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Check if Mapbox token is available
    if (!mapboxToken || mapboxToken === 'your_mapbox_token_here') {
      setMapError('Mapbox access token not configured. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.')
      return
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 2,
        projection: 'globe' as any
      })

      map.current.on('load', () => {
        setMapLoaded(true)
        setMapError(null)
        
        // Add atmosphere for globe view
        map.current!.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        })
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setMapError('Failed to load map. Please check your Mapbox access token.')
      })

    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Failed to initialize map. Please check your Mapbox configuration.')
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || mapError) return

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.sound-marker')
    existingMarkers.forEach(marker => marker.remove())

    // Add markers for each sound
    sounds.forEach((sound) => {
      const markerElement = document.createElement('div')
      markerElement.className = 'sound-marker'
      markerElement.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="w-6 h-6 bg-neon-blue/80 border-2 border-neon-blue rounded-full flex items-center justify-center shadow-lg animate-pulse-slow group-hover:animate-glow">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </div>
          <div class="absolute -top-2 -left-2 w-10 h-10 bg-neon-blue/20 rounded-full animate-ping"></div>
        </div>
      `

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([sound.longitude, sound.latitude])
        .addTo(map.current!)

      markerElement.addEventListener('click', () => {
        onSoundSelect(sound)
      })

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'sound-popup'
      }).setHTML(`
        <div class="bg-dark-800 border border-dark-600 rounded-lg p-3 text-white">
          <h4 class="font-semibold text-sm">${sound.title}</h4>
          <p class="text-xs text-gray-400 mt-1">${sound.description.substring(0, 50)}...</p>
          <div class="text-xs text-neon-blue mt-2">Click to play</div>
        </div>
      `)

      markerElement.addEventListener('mouseenter', () => {
        popup.setLngLat([sound.longitude, sound.latitude]).addTo(map.current!)
      })

      markerElement.addEventListener('mouseleave', () => {
        popup.remove()
      })
    })
  }, [sounds, mapLoaded, onSoundSelect, mapError])

  // Focus on selected sound
  useEffect(() => {
    if (selectedSound && map.current && mapLoaded && !mapError) {
      map.current.flyTo({
        center: [selectedSound.longitude, selectedSound.latitude],
        zoom: 8,
        duration: 2000
      })
    }
  }, [selectedSound, mapLoaded, mapError])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />
      
      {mapError && (
        <div className="absolute inset-0 bg-dark-900 rounded-xl flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Map Unavailable</h3>
            <p className="text-gray-400 text-sm max-w-md">{mapError}</p>
          </div>
        </div>
      )}
      
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-dark-900 rounded-xl flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Map Controls */}
      {mapLoaded && !mapError && (
        <div className="absolute top-4 right-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => map.current?.flyTo({ center: [0, 20], zoom: 2 })}
            className="bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-lg p-3 text-white hover:border-neon-blue/30 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Sound Counter */}
      {mapLoaded && !mapError && (
        <div className="absolute bottom-4 left-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-lg px-4 py-2 text-white"
          >
            <span className="text-sm font-medium">{sounds.length} sounds discovered</span>
          </motion.div>
        </div>
      )}
    </div>
  )
}