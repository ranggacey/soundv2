import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Play, Pause } from 'lucide-react'
import { InteractiveMap } from '../components/InteractiveMap'
import { SoundCard } from '../components/SoundCard'
import { AudioPlayer } from '../components/AudioPlayer'
import { Sound, soundsService } from '../lib/supabase'

export const ExplorePage: React.FC = () => {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([])
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Sound | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map')
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration (fallback if Supabase not connected)
  const mockSounds: Sound[] = [
    {
      id: '1',
      title: 'Tokyo Rain',
      description: 'Gentle rainfall on busy Tokyo streets with distant traffic sounds',
      audio_url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
      latitude: 35.6762,
      longitude: 139.6503,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      location_name: 'Shibuya, Tokyo',
      tags: ['rain', 'urban', 'peaceful']
    },
    {
      id: '2',
      title: 'Amazon Rainforest',
      description: 'Deep jungle sounds with exotic birds and insects',
      audio_url: 'https://www.soundjay.com/nature/sounds/forest-01.wav',
      latitude: -3.4653,
      longitude: -62.2159,
      created_at: '2024-01-14T08:15:00Z',
      updated_at: '2024-01-14T08:15:00Z',
      location_name: 'Amazon Basin, Brazil',
      tags: ['nature', 'wildlife', 'tropical']
    },
    {
      id: '3',
      title: 'Icelandic Waterfall',
      description: 'Powerful waterfall cascading down volcanic rocks',
      audio_url: 'https://www.soundjay.com/nature/sounds/waterfall-01.wav',
      latitude: 64.1466,
      longitude: -21.9426,
      created_at: '2024-01-13T14:45:00Z',
      updated_at: '2024-01-13T14:45:00Z',
      location_name: 'Gullfoss, Iceland',
      tags: ['water', 'nature', 'powerful']
    },
    {
      id: '4',
      title: 'Sahara Wind',
      description: 'Desert winds sweeping across endless sand dunes',
      audio_url: 'https://www.soundjay.com/nature/sounds/wind-01.wav',
      latitude: 23.8859,
      longitude: 2.5085,
      created_at: '2024-01-12T16:20:00Z',
      updated_at: '2024-01-12T16:20:00Z',
      location_name: 'Sahara Desert, Algeria',
      tags: ['desert', 'wind', 'vast']
    },
    {
      id: '5',
      title: 'NYC Subway',
      description: 'Underground train approaching with platform ambience',
      audio_url: 'https://www.soundjay.com/transport/sounds/subway-01.wav',
      latitude: 40.7128,
      longitude: -74.0060,
      created_at: '2024-01-11T12:00:00Z',
      updated_at: '2024-01-11T12:00:00Z',
      location_name: 'Times Square Station, NYC',
      tags: ['urban', 'transport', 'busy']
    }
  ]

  useEffect(() => {
    loadSounds()
  }, [])

  const loadSounds = async () => {
    setLoading(true)
    try {
      const fetchedSounds = await soundsService.getAllSounds()
      if (fetchedSounds.length > 0) {
        setSounds(fetchedSounds)
        setFilteredSounds(fetchedSounds)
      } else {
        // Use mock data if no sounds in database
        setSounds(mockSounds)
        setFilteredSounds(mockSounds)
      }
    } catch (error) {
      console.error('Error loading sounds:', error)
      // Fallback to mock data
      setSounds(mockSounds)
      setFilteredSounds(mockSounds)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSounds(sounds)
    } else {
      const filtered = sounds.filter(sound =>
        sound.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sound.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sound.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sound.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredSounds(filtered)
    }
  }, [searchQuery, sounds])

  const handleSoundSelect = (sound: Sound) => {
    setSelectedSound(sound)
    setCurrentlyPlaying(sound)
  }

  const handlePlay = (sound: Sound) => {
    setCurrentlyPlaying(currentlyPlaying?.id === sound.id ? null : sound)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Explore <span className="text-neon-blue">SoundScape</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Discover unique sounds from around the world
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sounds, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none transition-colors"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-dark-800 border border-dark-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-neon-blue text-dark-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neon-blue text-dark-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid View
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {viewMode === 'map' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-xl overflow-hidden"
              >
                <div className="p-4 border-b border-dark-600">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Interactive Map</h3>
                    <span className="text-sm text-gray-400">{filteredSounds.length} sounds discovered</span>
                  </div>
                </div>
                <div className="h-[500px]">
                  <InteractiveMap
                    sounds={filteredSounds}
                    onSoundSelect={handleSoundSelect}
                    selectedSound={selectedSound}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-xl p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Sound Collection</h3>
                  <span className="text-sm text-gray-400">{filteredSounds.length} sounds found</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredSounds.length > 0 ? (
                    filteredSounds.map((sound, index) => (
                      <motion.div
                        key={sound.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="transform transition-all hover:scale-[1.02]"
                      >
                        <SoundCard
                          sound={sound}
                          onPlay={handlePlay}
                          onViewDetails={handleSoundSelect}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-16 h-16 bg-dark-700/50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-white mb-2">No sounds found</h4>
                      <p className="text-gray-400 max-w-md">Try adjusting your search query or explore different categories</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Currently Playing */}
            {currentlyPlaying && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Now Playing</h3>
                <AudioPlayer
                  audioUrl={currentlyPlaying.audio_url}
                  title={currentlyPlaying.title}
                />
              </motion.div>
            )}

            {/* Sound Details */}
            {selectedSound && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Sound Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neon-blue">{selectedSound.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{selectedSound.description}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Location:</span>
                    <p className="text-sm text-white">
                      {selectedSound.location_name || `${selectedSound.latitude.toFixed(4)}, ${selectedSound.longitude.toFixed(4)}`}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Recorded:</span>
                    <p className="text-sm text-white">
                      {new Date(selectedSound.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {selectedSound.tags && selectedSound.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSound.tags.map((tag, index) => (
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
              </motion.div>
            )}

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Discovery Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Sounds</span>
                  <span className="text-neon-blue font-medium">{sounds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Countries</span>
                  <span className="text-neon-green font-medium">
                    {new Set(sounds.map(s => s.location_name?.split(',').pop()?.trim())).size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Filtered Results</span>
                  <span className="text-white font-medium">{filteredSounds.length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}