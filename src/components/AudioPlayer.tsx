import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, RotateCcw, AlertCircle, Maximize2, Minimize2 } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  title: string
  className?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
  onClose?: () => void
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title, 
  className = '',
  isMinimized = false,
  onToggleMinimize,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      setIsBuffering(false)
    }
    
    const updateDuration = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setError('Failed to load audio. Please check your connection.')
      setIsLoading(false)
      setIsPlaying(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handleCanPlayThrough = () => {
      setIsBuffering(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplaythrough', handleCanPlayThrough)

    // Set initial volume
    audio.volume = volume

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
    }
  }, [volume])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio || error) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        setIsBuffering(true)
        await audio.play()
        setIsPlaying(true)
        setIsBuffering(false)
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      setError('Failed to play audio. The file might be corrupted.')
      setIsPlaying(false)
      setIsBuffering(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)
    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Error restarting audio:', error)
      })
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  // Render mini player for mobile
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed bottom-0 left-0 right-0 bg-dark-800/90 backdrop-blur-md border-t border-dark-600 p-3 z-50 ${className}`}
      >
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload="metadata"
          crossOrigin="anonymous"
        />
        
        <div className="flex items-center">
          {/* Play/Pause Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            disabled={isLoading || error !== null}
            className="w-10 h-10 bg-neon-blue/20 border border-neon-blue/30 rounded-full flex items-center justify-center text-neon-blue hover:bg-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-3"
          >
            {isBuffering ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full"
              />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>
          
          {/* Title and Progress */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{title}</h4>
            
            {/* Progress Bar */}
            <div className="relative w-full h-1 bg-dark-600 rounded-full mt-1">
              <motion.div
                className="absolute top-0 left-0 h-full bg-neon-blue rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Time */}
          <div className="text-xs text-gray-400 mx-3 hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* Expand Button */}
          {onToggleMinimize && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleMinimize}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    )
  }

  // Render full player
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-4 ${className}`}
    >
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      <div className="space-y-3">
        {/* Header with title and minimize button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
          
          {onToggleMinimize && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleMinimize}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Waveform Visualization */}
        <div className="relative h-12 bg-dark-700 rounded-lg overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-green/20"
            style={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.1 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-neon-blue/60 mx-0.5 rounded-full"
                style={{ height: `${Math.random() * 100}%` }}
                animate={{
                  height: isPlaying && !isBuffering ? 
                    [`${Math.random() * 100}%`, `${Math.random() * 100}%`] : 
                    `${Math.random() * 30}%`,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isPlaying && !isBuffering ? Infinity : 0,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>
          
          {/* Loading/Buffering Overlay */}
          {(isLoading || isBuffering) && (
            <div className="absolute inset-0 bg-dark-700/80 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full"
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={!duration || error !== null}
            className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            disabled={isLoading || error !== null}
            className="w-10 h-10 bg-neon-blue/20 border border-neon-blue/30 rounded-full flex items-center justify-center text-neon-blue hover:bg-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBuffering ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full"
              />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={restart}
            disabled={!duration || error !== null}
            className="w-8 h-8 bg-dark-700 border border-dark-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
          </motion.button>

          <div className="flex-1" />

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}