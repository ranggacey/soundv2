import React, { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Upload, X, Loader2 } from 'lucide-react'
import { getLocationNameFromCoordinates } from '../lib/utils'

export const AddSoundPage = () => {
  const supabase = useSupabaseClient()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isResolvingLocationName, setIsResolvingLocationName] = useState(false)

  // Get user's current location when component mounts
  useEffect(() => {
    getCurrentLocation()
  }, [])

  // Update location name when coordinates change
  useEffect(() => {
    if (coordinates) {
      resolveLocationName(coordinates.lat, coordinates.lng)
    }
  }, [coordinates])

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ lat: latitude, lng: longitude })
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Could not get your location. Please enter coordinates manually.')
          setIsGettingLocation(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
      setIsGettingLocation(false)
    }
  }

  const resolveLocationName = async (latitude: number, longitude: number) => {
    setIsResolvingLocationName(true)
    try {
      const name = await getLocationNameFromCoordinates(latitude, longitude)
      setLocationName(name)
    } catch (error) {
      console.error('Error resolving location name:', error)
    } finally {
      setIsResolvingLocationName(false)
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0])
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description || !audioFile || !coordinates) {
      setError('Please fill in all required fields')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      // Upload audio file to storage
      const fileName = `${Date.now()}-${audioFile.name}`
      const { error: uploadError, data } = await supabase.storage
        .from('sounds')
        .upload(fileName, audioFile, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percent))
          }
        })
      
      if (uploadError) throw uploadError
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('sounds')
        .getPublicUrl(fileName)
      
      // Insert record into database
      const { error: insertError } = await supabase
        .from('sounds')
        .insert({
          title,
          description,
          audio_url: publicUrl,
          location_name: locationName,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          tags: tags.length > 0 ? tags : null
        })
      
      if (insertError) throw insertError
      
      // Navigate back to explore page on success
      navigate('/explore')
    } catch (error) {
      console.error('Error uploading sound:', error)
      setError('Failed to upload sound. Please try again.')
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-3 py-4 max-w-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Add New Sound</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-3 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Audio file upload */}
        <div>
          <label className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
            Audio File <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-dark-600 rounded-lg p-3 sm:p-4 text-center">
            {audioFile ? (
              <div className="flex items-center justify-between bg-dark-700 p-2 sm:p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neon-blue/20 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-[250px]">{audioFile.name}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setAudioFile(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mb-2" />
                  <p className="text-white text-sm sm:text-base mb-1">Drag and drop your audio file here</p>
                  <p className="text-gray-400 text-xs sm:text-sm">or click to browse</p>
                </div>
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden"
                  onChange={handleAudioChange}
                />
              </label>
            )}
          </div>
        </div>
        
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="bg-dark-800 w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-dark-600 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-neon-blue"
            placeholder="Give your sound a descriptive title"
            required
          />
          <div className="text-gray-400 text-xs sm:text-sm mt-1">
            {title.length}/100 characters
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="bg-dark-800 w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-dark-600 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-neon-blue resize-none"
            placeholder="Describe the sound, its context, and what makes it unique..."
            required
          />
          <div className="text-gray-400 text-xs sm:text-sm mt-1">
            {description.length}/500 characters
          </div>
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="location"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="bg-dark-800 w-full px-3 py-2 sm:px-4 sm:py-3 pl-8 sm:pl-10 rounded-lg border border-dark-600 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="Enter location name..."
              required
            />
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="absolute inset-y-0 right-0 px-2 sm:px-4 py-1 sm:py-2 bg-neon-blue/20 text-neon-blue rounded-r-lg border-l border-dark-600 hover:bg-neon-blue/30 transition-colors flex items-center text-xs sm:text-sm"
            >
              {isGettingLocation ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                'Use Current'
              )}
            </button>
          </div>
          {coordinates && (
            <div className="text-gray-400 text-xs sm:text-sm mt-1">
              Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              {isResolvingLocationName && (
                <span className="ml-2 inline-flex items-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  <span className="text-xs">Resolving...</span>
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-white text-base sm:text-lg mb-1 sm:mb-2">
            Tags
          </label>
          <div className="flex">
            <input
              id="tags"
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-dark-800 flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-l-lg border border-dark-600 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="Add tags to help others discover..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-neon-blue/20 text-neon-blue px-3 py-2 sm:px-4 sm:py-3 rounded-r-lg border border-l-0 border-dark-600 hover:bg-neon-blue/30 transition-colors text-sm sm:text-base"
            >
              Add
            </button>
          </div>
          <div className="text-gray-400 text-xs sm:text-sm mt-1">
            {tags.length}/10 tags
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-dark-700 text-gray-300 px-2 py-1 rounded-full flex items-center text-xs sm:text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 sm:ml-2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Upload progress */}
        {isUploading && (
          <div>
            <div className="flex justify-between text-gray-400 text-xs sm:text-sm mb-1">
              <span>Upload Progress</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-neon-blue h-1.5 sm:h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-neon-blue text-dark-900 font-medium py-2 sm:py-3 px-4 rounded-lg hover:bg-neon-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                Uploading...
              </div>
            ) : (
              'Share Your Sound'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 