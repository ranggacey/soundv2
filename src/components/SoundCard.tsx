import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Play, Pause } from 'lucide-react'
import { Sound } from '../lib/supabase'

interface SoundCardProps {
  sound: Sound
  onPlay: (sound: Sound) => void
  onViewDetails: (sound: Sound) => void
  isPlaying?: boolean
}

export const SoundCard: React.FC<SoundCardProps> = ({ sound, onPlay, onViewDetails, isPlaying = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-lg overflow-hidden group hover:border-neon-blue/30 transition-all duration-300 h-full flex flex-col"
    >
      {/* Card content */}
      <div className="p-2.5 cursor-pointer flex-1" onClick={() => onViewDetails(sound)}>
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-neon-blue transition-colors pr-2 leading-tight">
            {sound.title}
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onPlay(sound)
            }}
            className={`w-7 h-7 ${isPlaying ? 'bg-neon-blue' : 'bg-neon-blue/20'} border border-neon-blue/30 rounded-full flex items-center justify-center ${isPlaying ? 'text-dark-900' : 'text-neon-blue'} hover:bg-neon-blue/30 transition-colors flex-shrink-0 -mt-0.5 -mr-0.5`}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3 ml-0.5" />
            )}
          </motion.button>
        </div>
        
        <p className="text-xs text-gray-400 truncate mb-1.5 leading-tight">
          {sound.description}
        </p>
        
        {/* Location */}
        <div className="flex items-center text-xs text-gray-400">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{sound.location_name || `${sound.latitude.toFixed(2)}, ${sound.longitude.toFixed(2)}`}</span>
        </div>
      </div>
      
      {/* Waveform footer */}
      <div className={`h-1.5 w-full ${isPlaying ? 'bg-neon-blue/20' : 'bg-dark-700'}`}>
        <div className="flex items-end h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`flex-1 ${isPlaying ? 'bg-neon-blue' : 'bg-neon-blue/40'}`}
              animate={isPlaying ? {
                height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
              } : {}}
              transition={{ 
                duration: 0.4, 
                repeat: isPlaying ? Infinity : 0, 
                repeatType: 'reverse',
                delay: i * 0.02
              }}
              style={{ 
                height: isPlaying ? '100%' : `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}