import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Play } from 'lucide-react'
import { Sound } from '../lib/supabase'

interface SoundCardProps {
  sound: Sound
  onPlay: (sound: Sound) => void
  onViewDetails: (sound: Sound) => void
}

export const SoundCard: React.FC<SoundCardProps> = ({ sound, onPlay, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-4 cursor-pointer group hover:border-neon-blue/30 transition-all duration-300"
      onClick={() => onViewDetails(sound)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white truncate group-hover:text-neon-blue transition-colors">
              {sound.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {sound.description}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onPlay(sound)
            }}
            className="w-8 h-8 bg-neon-blue/20 border border-neon-blue/30 rounded-full flex items-center justify-center text-neon-blue hover:bg-neon-blue/30 transition-colors ml-3"
          >
            <Play className="w-3 h-3 ml-0.5" />
          </motion.button>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span className="text-xs truncate max-w-[100px]">{sound.location_name || `${sound.latitude.toFixed(2)}, ${sound.longitude.toFixed(2)}`}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatDate(sound.created_at)}</span>
          </div>
        </div>

        {/* Tags */}
        {sound.tags && sound.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sound.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-dark-700 text-xs text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {sound.tags.length > 2 && (
              <span className="px-1.5 py-0.5 bg-dark-700 text-xs text-gray-400 rounded-full">
                +{sound.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Waveform Preview */}
        <div className="flex items-center space-x-0.5 h-6">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 bg-neon-blue/40 rounded-full"
              style={{ height: `${Math.random() * 100}%` }}
              whileHover={{
                height: '100%',
                backgroundColor: 'rgba(0, 212, 255, 0.8)',
              }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}