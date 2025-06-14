import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, MapPin, Mic, Play, Pause, X, Check, AlertCircle } from 'lucide-react'
import { soundsService } from '../lib/supabase'

export const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      setRecordedBlob(null)
      setError(null)
    } else {
      setError('Please select a valid audio file')
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      
      // Check for supported MIME types
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ]
      
      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType || undefined
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      setRecordingTime(0)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setRecordedBlob(blob)
        setAudioFile(null)
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording failed. Please try again.')
        setIsRecording(false)
      }

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      mediaRecorder.start(100) // Collect data every 100ms for better quality
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Could not access microphone. Please check your permissions and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio:', error)
            setError('Could not play audio. The file might be corrupted.')
          })
        }
      }
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setError(null)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          
          // Try to get location name with proper error handling
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
              }
              return response.json()
            })
            .then(data => {
              if (data.locality || data.city) {
                const locationName = `${data.locality || data.city}, ${data.countryName || data.country}`
                setLocation(locationName)
              } else {
                // If no location name found, just use coordinates
                setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
              }
            })
            .catch(error => {
              console.error('Error getting location name:', error)
              // Set a fallback location using coordinates
              setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
              // Don't show error to user since we have coordinates - just inform them
              console.warn('Could not retrieve location name, using coordinates instead')
            })
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Could not get your location. Please enter it manually.')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!title.trim() || !description.trim() || (!audioFile && !recordedBlob)) {
      setError('Please fill in all required fields and provide an audio file.')
      return
    }

    if (!coordinates) {
      setError('Please provide location coordinates by clicking "Use Current" or entering coordinates manually.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload audio file
      const audioToUpload = recordedBlob || audioFile!
      const fileExtension = recordedBlob ? 'webm' : audioFile!.name.split('.').pop() || 'audio'
      const fileName = `${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.${fileExtension}`
      
      setUploadProgress(25)
      const audioUrl = await soundsService.uploadAudio(audioToUpload, fileName)
      
      if (!audioUrl) {
        throw new Error('Failed to upload audio file')
      }

      setUploadProgress(50)

      // Create sound record
      const soundData = {
        title: title.trim(),
        description: description.trim(),
        audio_url: audioUrl,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        location_name: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined
      }

      setUploadProgress(75)
      const newSound = await soundsService.createSound(soundData)
      
      if (!newSound) {
        throw new Error('Failed to create sound record')
      }

      setUploadProgress(100)
      setUploadSuccess(true)
      
      // Reset form after success
      setTimeout(() => {
        setTitle('')
        setDescription('')
        setLocation('')
        setTags([])
        setAudioFile(null)
        setRecordedBlob(null)
        setCoordinates(null)
        setUploadSuccess(false)
        setRecordingTime(0)
        setUploadProgress(0)
      }, 3000)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(`Failed to upload sound: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const audioUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : 
                   audioFile ? URL.createObjectURL(audioFile) : null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Share Your <span className="text-neon-blue">Sound</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Contribute to the global soundscape by sharing unique audio from your location
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-8 space-y-8"
        >
          {/* Audio Upload/Recording */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Audio *</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* File Upload */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-neon-blue/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                <p className="text-white font-medium">Upload Audio File</p>
                <p className="text-sm text-gray-400">MP3, WAV, M4A, WEBM up to 50MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.div>

              {/* Recording */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-neon-green/50 transition-colors"
              >
                <Mic className={`w-8 h-8 mx-auto mb-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-neon-green'}`} />
                <p className="text-white font-medium">Record Audio</p>
                {isRecording && (
                  <p className="text-red-500 text-sm mb-2 font-mono">Recording: {formatTime(recordingTime)}</p>
                )}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </motion.button>
              </motion.div>
            </div>

            {/* Audio Preview */}
            {audioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={togglePlayback}
                    className="w-10 h-10 bg-neon-blue/20 border border-neon-blue/30 rounded-full flex items-center justify-center text-neon-blue hover:bg-neon-blue/30 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </motion.button>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {recordedBlob ? `Recorded Audio (${formatTime(recordingTime)})` : audioFile?.name}
                    </p>
                    <p className="text-sm text-gray-400">Ready to upload</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedBlob(null)
                      setAudioFile(null)
                      setIsPlaying(false)
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error('Audio error:', e)
                    setError('Error playing audio. The file might be corrupted.')
                  }}
                  className="hidden"
                  preload="metadata"
                />
              </motion.div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your sound a descriptive title..."
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none transition-colors"
              required
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the sound, its context, and what makes it unique..."
              rows={4}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none transition-colors resize-none"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{description.length}/500 characters</p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Location *</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location name..."
                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none transition-colors"
                required
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getCurrentLocation}
                className="bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-3 rounded-lg hover:bg-neon-blue/30 transition-colors flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Use Current</span>
              </motion.button>
            </div>
            {coordinates && (
              <p className="text-xs text-gray-400">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">Tags</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags to help others discover your sound..."
                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-neon-blue focus:outline-none transition-colors"
                maxLength={20}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                className="bg-neon-green/20 border border-neon-green/30 text-neon-green px-4 py-3 rounded-lg hover:bg-neon-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </motion.button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-dark-700 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">{tags.length}/10 tags</p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Upload Progress</span>
                <span className="text-neon-blue">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-neon-blue to-neon-green h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={uploading || !title.trim() || !description.trim() || (!audioFile && !recordedBlob) || !coordinates}
            whileHover={{ scale: uploading ? 1 : 1.02 }}
            whileTap={{ scale: uploading ? 1 : 0.98 }}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
              uploadSuccess
                ? 'bg-neon-green text-dark-900'
                : uploading
                ? 'bg-dark-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-blue to-neon-green text-dark-900 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {uploadSuccess ? (
              <span className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Upload Successful!</span>
              </span>
            ) : uploading ? (
              <span className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
                />
                <span>Uploading... {uploadProgress}%</span>
              </span>
            ) : (
              'Share Your Sound'
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}