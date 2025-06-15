import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Calendar, Play, Pause, Volume2 } from 'lucide-react'
import { Sound } from '../lib/supabase'

interface SoundDetailsModalProps {
  sound: Sound | null
  isOpen: boolean
  onClose: () => void
  isPlaying: boolean
  onPlayToggle: (sound: Sound) => void
}

export const SoundDetailsModal: React.FC<SoundDetailsModalProps> = ({
  sound,
  isOpen,
  onClose,
  isPlaying,
  onPlayToggle
}) => {
  if (!sound) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // This function will handle both toggling play state and closing the modal
  const handlePlayAndClose = () => {
    if (!sound) return
    
    // If not currently playing, start playing
    if (!isPlaying) {
      onPlayToggle(sound)
    } else {
      // If already playing, just pause
      onPlayToggle(sound)
    }
    
    // Close the modal after triggering play
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{sound.title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Description */}
              <p className="text-gray-300 text-sm">{sound.description}</p>
              
              {/* Metadata */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-neon-blue mr-2" />
                  <span className="text-gray-300">
                    {sound.location_name || `${sound.latitude.toFixed(4)}, ${sound.longitude.toFixed(4)}`}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-neon-blue mr-2" />
                  <span className="text-gray-300">{formatDate(sound.created_at)}</span>
                </div>
              </div>
              
              {/* Tags */}
              {sound.tags && sound.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {sound.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-dark-700 text-xs text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Audio player control */}
            <div className="p-4 border-t border-dark-600">
              <button
                onClick={handlePlayAndClose}
                className={`w-full py-3 px-4 rounded-lg flex items-center ${
                  isPlaying ? 'bg-neon-blue text-dark-900' : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                }`}
              >
                <div className={`w-10 h-10 ${isPlaying ? 'bg-dark-900/30' : 'bg-neon-blue/30'} rounded-full flex items-center justify-center`}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">{isPlaying ? 'Now Playing' : 'Play Sound'}</div>
                  <div className="text-xs opacity-80">{isPlaying ? 'Tap to pause' : 'Listen to this recording'}</div>
                </div>
                <Volume2 className="w-5 h-5 opacity-70" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 