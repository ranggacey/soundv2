/*
  # Create sounds table for SoundScape

  1. New Tables
    - `sounds`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `audio_url` (text, required - URL to audio file in storage)
      - `latitude` (double precision, required)
      - `longitude` (double precision, required)
      - `location_name` (text, optional - human readable location)
      - `tags` (text array, optional)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `sounds` table
    - Add policy for anyone to read sounds (public access)
    - Add policy for anyone to insert sounds (no auth required)

  3. Storage
    - Create storage bucket for audio files
    - Set up public access for audio files
*/

-- Create sounds table
CREATE TABLE IF NOT EXISTS sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  audio_url text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location_name text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sounds ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can read sounds"
  ON sounds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert sounds"
  ON sounds
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('sounds', 'sounds', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to sounds bucket
CREATE POLICY "Public can read sounds bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'sounds');

CREATE POLICY "Public can upload to sounds bucket"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'sounds');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sounds_updated_at
  BEFORE UPDATE ON sounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS sounds_location_idx ON sounds USING gist (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS sounds_created_at_idx ON sounds (created_at DESC);
CREATE INDEX IF NOT EXISTS sounds_tags_idx ON sounds USING gin (tags);