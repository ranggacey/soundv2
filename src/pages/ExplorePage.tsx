import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Play, Pause, X } from 'lucide-react'
import { InteractiveMap } from '../components/InteractiveMap'
import { SoundCard } from '../components/SoundCard'
import { AudioPlayer } from '../components/AudioPlayer'
import { Sound, soundsService } from '../lib/supabase'
import { SoundDetailsModal } from '../components/SoundDetailsModal'
import { FloatingMusicPlayer } from '../components/FloatingMusicPlayer'
import { FilterBar } from '../components/FilterBar'
import { Pagination } from '../components/Pagination'

export const ExplorePage: React.FC = () => {
  const [sounds, setSounds] = useState<Sound[]>([])
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([])
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Sound | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('grid')
  const [loading, setLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  // Tag filtering
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

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
    },
    {
      id: '6',
      title: 'Ocean Waves',
      description: 'Gentle waves crashing on a sandy beach at sunset',
      audio_url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.wav',
      latitude: -33.8688,
      longitude: 151.2093,
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-10T09:15:00Z',
      location_name: 'Bondi Beach, Sydney',
      tags: ['water', 'nature', 'relaxing']
    },
    {
      id: '7',
      title: 'Campfire Crackle',
      description: 'Wood crackling in a campfire under starry night sky',
      audio_url: 'https://www.soundjay.com/nature/sounds/campfire-1.wav',
      latitude: 36.1069,
      longitude: -112.1129,
      created_at: '2024-01-09T20:45:00Z',
      updated_at: '2024-01-09T20:45:00Z',
      location_name: 'Grand Canyon, Arizona',
      tags: ['fire', 'nature', 'night']
    },
    {
      id: '8',
      title: 'Paris Cafe',
      description: 'Ambient sounds of a busy Parisian cafe with distant conversations',
      audio_url: 'https://www.soundjay.com/human/sounds/restaurant-crowd-1.wav',
      latitude: 48.8566,
      longitude: 2.3522,
      created_at: '2024-01-08T11:20:00Z',
      updated_at: '2024-01-08T11:20:00Z',
      location_name: 'Montmartre, Paris',
      tags: ['urban', 'social', 'relaxing']
    },
    {
      id: '9',
      title: 'Thunderstorm',
      description: 'Powerful thunderstorm with heavy rain and lightning',
      audio_url: 'https://www.soundjay.com/nature/sounds/thunder-1.wav',
      latitude: -27.4698,
      longitude: 153.0251,
      created_at: '2024-01-07T18:30:00Z',
      updated_at: '2024-01-07T18:30:00Z',
      location_name: 'Brisbane, Australia',
      tags: ['weather', 'rain', 'powerful']
    },
    {
      id: '10',
      title: 'Mountain Stream',
      description: 'Crystal clear water flowing over rocks in a mountain stream',
      audio_url: 'https://www.soundjay.com/nature/sounds/stream-1.wav',
      latitude: 46.6020,
      longitude: 8.0298,
      created_at: '2024-01-06T14:10:00Z',
      updated_at: '2024-01-06T14:10:00Z',
      location_name: 'Swiss Alps, Switzerland',
      tags: ['water', 'nature', 'peaceful']
    },
    {
      id: '11',
      title: 'Jungle Night',
      description: 'Nocturnal insects and animals in a dense tropical jungle',
      audio_url: 'https://www.soundjay.com/nature/sounds/jungle-1.wav',
      latitude: 0.9619,
      longitude: 114.5548,
      created_at: '2024-01-05T22:05:00Z',
      updated_at: '2024-01-05T22:05:00Z',
      location_name: 'Borneo Rainforest',
      tags: ['wildlife', 'night', 'tropical']
    },
    {
      id: '12',
      title: 'Tokyo Crosswalk',
      description: 'Busy Shibuya crossing with pedestrian signals and crowd ambience',
      audio_url: 'https://www.soundjay.com/transportation/sounds/city-traffic-1.wav',
      latitude: 35.6595,
      longitude: 139.7004,
      created_at: '2024-01-04T16:40:00Z',
      updated_at: '2024-01-04T16:40:00Z',
      location_name: 'Shibuya Crossing, Tokyo',
      tags: ['urban', 'busy', 'city']
    },
    {
      id: '13',
      title: 'Market Bazaar',
      description: 'Vibrant sounds of vendors and shoppers at a traditional market',
      audio_url: 'https://www.soundjay.com/human/sounds/market-crowd-1.wav',
      latitude: 41.0082,
      longitude: 28.9784,
      created_at: '2024-01-03T09:50:00Z',
      updated_at: '2024-01-03T09:50:00Z',
      location_name: 'Grand Bazaar, Istanbul',
      tags: ['urban', 'social', 'busy']
    },
    {
      id: '14',
      title: 'Desert Night',
      description: 'Quiet desert night with occasional wind and distant animal calls',
      audio_url: 'https://www.soundjay.com/nature/sounds/desert-1.wav',
      latitude: 27.9881,
      longitude: 86.9250,
      created_at: '2024-01-02T23:15:00Z',
      updated_at: '2024-01-02T23:15:00Z',
      location_name: 'Sahara Desert, Morocco',
      tags: ['desert', 'night', 'peaceful']
    },
    {
      id: '15',
      title: 'Morning Birds',
      description: 'Dawn chorus of birds in a spring forest',
      audio_url: 'https://www.soundjay.com/nature/sounds/birds-1.wav',
      latitude: 51.5074,
      longitude: -0.1278,
      created_at: '2024-01-01T05:30:00Z',
      updated_at: '2024-01-01T05:30:00Z',
      location_name: 'Hyde Park, London',
      tags: ['wildlife', 'nature', 'morning']
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

  // Get all unique tags from sounds
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    sounds.forEach(sound => {
      sound.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [sounds])

  // Filter sounds based on search query and selected tags
  useEffect(() => {
    let filtered = sounds
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(sound =>
        sound.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sound.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sound.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sound.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(sound =>
        selectedTags.every(tag => sound.tags?.includes(tag))
      )
    }
    
    setFilteredSounds(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedTags, sounds])

  // Get current page items
  const currentSounds = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredSounds.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredSounds, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredSounds.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSoundSelect = (sound: Sound) => {
    setSelectedSound(sound)
    // Automatically play the sound when selected
    setCurrentlyPlaying(sound)
    
    if (isMobile) {
      setIsDetailsModalOpen(true)
    }
  }

  const handlePlay = (sound: Sound) => {
    setCurrentlyPlaying(currentlyPlaying?.id === sound.id ? null : sound)
  }

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false)
  }

  const togglePlayerMinimize = () => {
    setIsPlayerMinimized(!isPlayerMinimized)
  }

  const closePlayer = () => {
    setCurrentlyPlaying(null)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags([...selectedTags, tag])
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const clearFilters = () => {
    setSelectedTags([])
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
    <div className="min-h-screen bg-dark-900 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Explore <span className="text-neon-blue">SoundScape</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-lg">
            Discover unique sounds from around the world
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3 mb-4 md:mb-6"
        >
          {/* Search with Filter */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sounds, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-12 py-2 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none transition-colors"
            />
            <FilterBar 
              availableTags={allTags}
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
              onTagRemove={handleTagRemove}
              onClearFilters={clearFilters}
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
              Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neon-blue text-dark-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <div className={`grid grid-cols-1 ${!isMobile ? 'lg:grid-cols-3 gap-6' : 'gap-4'}`}>
          {/* Main Content */}
          <div className={`${!isMobile ? 'lg:col-span-3' : ''}`}>
            {viewMode === 'map' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-xl overflow-hidden"
              >
                <div className="p-3 border-b border-dark-600">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-white">Interactive Map</h3>
                    <span className="text-xs text-gray-400">{filteredSounds.length} sounds</span>
                  </div>
                </div>
                <div className="h-[400px] md:h-[500px]">
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
                className="bg-dark-800/30 backdrop-blur-sm border border-dark-600 rounded-xl p-3"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-white">Sound Collection</h3>
                  <span className="text-xs text-gray-400">{filteredSounds.length} sounds</span>
                </div>
                
                {filteredSounds.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {currentSounds.map((sound) => (
                        <SoundCard
                          key={sound.id}
                          sound={sound}
                          onPlay={handlePlay}
                          onViewDetails={handleSoundSelect}
                          isPlaying={currentlyPlaying?.id === sound.id}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-dark-700/50 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="text-base font-medium text-white mb-1">No sounds found</h4>
                    <p className="text-gray-400 text-sm">Try adjusting your search query or filters</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar - Only show on desktop */}
          {!isMobile && selectedSound && (
            <div className="hidden lg:block">
              {/* Sound Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-4 mb-4"
              >
                <h3 className="text-lg font-semibold text-white mb-3">Sound Details</h3>
                <div className="space-y-3">
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
                  
                  {/* Play button */}
                  <button
                    onClick={() => handlePlay(selectedSound)}
                    className={`mt-2 w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                      currentlyPlaying?.id === selectedSound.id 
                        ? 'bg-neon-blue text-dark-900' 
                        : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                    }`}
                  >
                    {currentlyPlaying?.id === selectedSound.id ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause Sound</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Play Sound</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Currently Playing - Desktop */}
              {currentlyPlaying && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <AudioPlayer
                    audioUrl={currentlyPlaying.audio_url}
                    title={currentlyPlaying.title}
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sound Details Modal */}
      <SoundDetailsModal 
        sound={selectedSound}
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        isPlaying={currentlyPlaying?.id === selectedSound?.id}
        onPlayToggle={handlePlay}
      />

      {/* Mobile Floating Player */}
      {isMobile && currentlyPlaying && (
        <FloatingMusicPlayer 
          currentSound={currentlyPlaying}
          onClose={closePlayer}
        />
      )}
    </div>
  )
}