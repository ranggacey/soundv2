import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sound } from '../lib/supabase'
import { AudioPlayer } from './AudioPlayer'
import { ChevronUp, ChevronDown, Play, Pause, Volume2 } from 'lucide-react'

interface FloatingMusicPlayerProps {
  currentSound: Sound | null
  onClose: () => void
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ 
  currentSound, 
  onClose 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [seekPosition, setSeekPosition] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    // Auto-play when currentSound changes
    if (currentSound && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [currentSound])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
    }
    
    const updateDuration = () => {
      setDuration(audio.duration)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = isDragging 
    ? seekPosition 
    : (duration > 0 ? (currentTime / duration) * 100 : 0)

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    let clientX: number
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX
    } else {
      // Mouse event
      clientX = e.clientX
    }
    
    const position = (clientX - rect.left) / rect.width
    const seekTime = position * duration
    
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleSeekStart = () => {
    setIsDragging(true)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  const handleSeekMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    let clientX: number
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX
    } else {
      // Mouse event
      clientX = e.clientX
    }
    
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100
    setSeekPosition(position)
  }

  const handleSeekEnd = () => {
    if (!isDragging || !audioRef.current) return
    
    const seekTime = (seekPosition / 100) * duration
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
    
    setIsDragging(false)
    if (isPlaying) {
      audioRef.current.play()
    }
  }

  if (!currentSound) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-dark-800/95 backdrop-blur-md border-t border-dark-600 shadow-lg">
          {/* Expand/collapse toggle */}
          <div 
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-5 bg-dark-800 border border-dark-600 rounded-t-lg flex items-center justify-center cursor-pointer"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-gray-400" />
            )}
          </div>
          
          {isExpanded ? (
            <div className="p-3">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                  <Volume2 className="w-5 h-5 text-neon-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">{currentSound.title}</h4>
                  <p className="text-gray-400 text-xs truncate">{currentSound.location_name}</p>
                </div>
                <button
                  onClick={togglePlay}
                  className={`w-8 h-8 ${isPlaying ? 'bg-neon-blue' : 'bg-neon-blue/20'} rounded-full flex items-center justify-center ml-2 flex-shrink-0`}
                >
                  {isPlaying ? (
                    <Pause className={`w-3 h-3 ${isPlaying ? 'text-dark-900' : 'text-neon-blue'}`} />
                  ) : (
                    <Play className={`w-3 h-3 ml-0.5 ${isPlaying ? 'text-dark-900' : 'text-neon-blue'}`} />
                  )}
                </button>
              </div>
              
              {/* Waveform visualization */}
              <div className="relative h-8 bg-dark-700 rounded-lg overflow-hidden mb-2">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-blue/20"
                  style={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.1 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-neon-blue/60 mx-0.5 rounded-full"
                      style={{ height: `${Math.random() * 100}%` }}
                      animate={{
                        height: isPlaying ? 
                          [`${Math.random() * 100}%`, `${Math.random() * 100}%`] : 
                          `${Math.random() * 30}%`,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: isPlaying ? Infinity : 0,
                        repeatType: 'reverse',
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Seekable progress bar */}
              <div 
                ref={progressBarRef}
                className="relative h-2 bg-dark-700 rounded-full mb-1 cursor-pointer touch-none"
                onClick={handleProgressBarClick}
                onMouseDown={handleSeekStart}
                onMouseMove={handleSeekMove}
                onMouseUp={handleSeekEnd}
                onMouseLeave={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchMove={handleSeekMove}
                onTouchEnd={handleSeekEnd}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-neon-blue rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"
                  style={{ 
                    left: `calc(${progressPercentage}% - 6px)`,
                    display: isDragging || isExpanded ? 'block' : 'none'
                  }}
                />
              </div>
              
              {/* Time display */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-1.5">
              <button
                onClick={togglePlay}
                className={`w-6 h-6 ${isPlaying ? 'bg-neon-blue' : 'bg-neon-blue/20'} rounded-full flex items-center justify-center mr-2 flex-shrink-0`}
              >
                {isPlaying ? (
                  <Pause className={`w-2.5 h-2.5 ${isPlaying ? 'text-dark-900' : 'text-neon-blue'}`} />
                ) : (
                  <Play className={`w-2.5 h-2.5 ml-0.5 ${isPlaying ? 'text-dark-900' : 'text-neon-blue'}`} />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-medium truncate">{currentSound.title}</h4>
                
                {/* Seekable mini progress bar */}
                <div 
                  ref={progressBarRef}
                  className="relative w-full h-1 bg-dark-600 rounded-full mt-0.5 cursor-pointer touch-none"
                  onClick={handleProgressBarClick}
                  onTouchStart={handleSeekStart}
                  onTouchMove={handleSeekMove}
                  onTouchEnd={handleSeekEnd}
                >
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-neon-blue rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                {formatTime(currentTime)}
              </div>
            </div>
          )}
          
          <audio 
            ref={audioRef}
            src={currentSound.audio_url}
            preload="metadata"
            autoPlay
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 