import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sound } from '../lib/supabase'
import { Volume2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue
// Default icon images are not bundled correctly with webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// Custom marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-sound-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div class="w-6 h-6 bg-neon-blue/80 border-2 border-neon-blue rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
        <div class="absolute -top-2 -left-2 w-10 h-10 bg-neon-blue/20 rounded-full animate-ping"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

// Component to handle map center/zoom changes
const MapController = ({ selectedSound }: { selectedSound?: Sound | null }) => {
  const map = useMap()
  
  useEffect(() => {
    if (selectedSound) {
      map.flyTo(
        [selectedSound.latitude, selectedSound.longitude], 
        8, 
        { duration: 2 }
      )
    }
  }, [selectedSound, map])
  
  return null
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
  const [mapError, setMapError] = useState<string | null>(null)

  // Reset view handler
  const handleResetView = () => {
    // This will be handled by the MapController
    onSoundSelect({} as Sound) // Deselect current sound
  }

  return (
    <div className="relative w-full h-full">
      {!mapError ? (
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl overflow-hidden"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {sounds.map((sound) => (
            <Marker 
              key={sound.id} 
              position={[sound.latitude, sound.longitude]}
              icon={createCustomIcon()}
              eventHandlers={{
                click: () => onSoundSelect(sound)
              }}
            >
              <Popup className="sound-popup">
                <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 text-white">
                  <h4 className="font-semibold text-sm">{sound.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{sound.description?.substring(0, 50)}...</p>
                  <div className="text-xs text-neon-blue mt-2">Click to play</div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          <MapController selectedSound={selectedSound} />
        </MapContainer>
      ) : (
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
      
      {/* Map Controls */}
      {!mapError && (
        <div className="absolute top-4 right-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResetView}
            className="bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-lg p-3 text-white hover:border-neon-blue/30 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Sound Counter */}
      {!mapError && (
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

// Keep the LeafletMap component as a separate export
const LeafletMap = () => (
  <MapContainer
    center={[-6.2088, 106.8456]}
    zoom={13}
    style={{ height: '400px', width: '100%' }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    />
    <Marker position={[-6.2088, 106.8456]}>
    </Marker>
  </MapContainer>
);

export default LeafletMap;