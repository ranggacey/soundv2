/*
  # Add location search function for SoundScape

  1. Functions
    - `sounds_within_radius` - Find sounds within a specified radius of coordinates
    
  2. Performance
    - Uses PostGIS functions for efficient geospatial queries
*/

-- Create function to find sounds within radius
CREATE OR REPLACE FUNCTION sounds_within_radius(
  lat double precision,
  lng double precision,
  radius_km double precision DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  audio_url text,
  latitude double precision,
  longitude double precision,
  location_name text,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  distance_km double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    s.id,
    s.title,
    s.description,
    s.audio_url,
    s.latitude,
    s.longitude,
    s.location_name,
    s.tags,
    s.created_at,
    s.updated_at,
    (
      6371 * acos(
        cos(radians(lat)) * 
        cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians(lng)) + 
        sin(radians(lat)) * 
        sin(radians(s.latitude))
      )
    ) as distance_km
  FROM sounds s
  WHERE (
    6371 * acos(
      cos(radians(lat)) * 
      cos(radians(s.latitude)) * 
      cos(radians(s.longitude) - radians(lng)) + 
      sin(radians(lat)) * 
      sin(radians(s.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km;
$$;