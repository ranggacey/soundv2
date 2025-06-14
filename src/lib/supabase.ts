import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using mock data.')
}

export const supabase = supabaseUrl && supabaseAnonKey ? 
  createClient(supabaseUrl, supabaseAnonKey) : null

export type Sound = {
  id: string
  title: string
  description: string
  audio_url: string
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
  location_name?: string
  tags?: string[]
}

// Database functions
export const soundsService = {
  // Get all sounds
  async getAllSounds(): Promise<Sound[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('sounds')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching sounds:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching sounds:', error)
      return []
    }
  },

  // Get sounds by location (within radius)
  async getSoundsByLocation(lat: number, lng: number, radiusKm: number = 50): Promise<Sound[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    try {
      const { data, error } = await supabase
        .rpc('sounds_within_radius', {
          lat,
          lng,
          radius_km: radiusKm
        })
      
      if (error) {
        console.error('Error fetching sounds by location:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching sounds by location:', error)
      return []
    }
  },

  // Search sounds
  async searchSounds(query: string): Promise<Sound[]> {
    if (!supabase) {
      console.warn('Supabase not configured, returning empty array')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('sounds')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error searching sounds:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error searching sounds:', error)
      return []
    }
  },

  // Upload audio file to storage
  async uploadAudio(file: File | Blob, fileName: string): Promise<string | null> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please connect to Supabase first.')
    }

    try {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 50MB.')
      }

      const { data, error } = await supabase.storage
        .from('sounds')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'audio/webm'
        })

      if (error) {
        console.error('Error uploading audio:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('sounds')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading audio:', error)
      throw error
    }
  },

  // Create new sound
  async createSound(soundData: Omit<Sound, 'id' | 'created_at' | 'updated_at'>): Promise<Sound | null> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please connect to Supabase first.')
    }

    try {
      const { data, error } = await supabase
        .from('sounds')
        .insert([soundData])
        .select()
        .single()

      if (error) {
        console.error('Error creating sound:', error)
        throw new Error(`Failed to create sound: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating sound:', error)
      throw error
    }
  },

  // Test connection
  async testConnection(): Promise<boolean> {
    if (!supabase) {
      return false
    }

    try {
      const { error } = await supabase
        .from('sounds')
        .select('count', { count: 'exact', head: true })

      return !error
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }
}