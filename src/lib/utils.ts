import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLocationName(locationName: string | null, latitude: number | null, longitude: number | null): string {
  // If we have a location name, use it
  if (locationName && locationName.trim() !== '' && !isCoordinateString(locationName)) {
    return locationName;
  }
  
  // If we have coordinates, format them nicely
  if (latitude !== null && longitude !== null) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
  
  // If location name looks like coordinates, format it nicely
  if (locationName && isCoordinateString(locationName)) {
    try {
      const coords = parseCoordinateString(locationName);
      if (coords) {
        return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      }
    } catch (e) {
      // If parsing fails, return the original string
    }
  }
  
  // Fallback
  return locationName || 'Unknown location';
}

// Check if a string looks like coordinates
function isCoordinateString(str: string): boolean {
  // Match patterns like "12.3456, 78.9012" or "12.3456,78.9012" or "-12.3456, -78.9012"
  const coordPattern = /^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/;
  return coordPattern.test(str);
}

// Parse a coordinate string into lat/lng
function parseCoordinateString(str: string): { lat: number, lng: number } | null {
  const parts = str.split(',').map(part => parseFloat(part.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
}

// Try to get location name from coordinates using reverse geocoding
export async function getLocationNameFromCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SoundScape App'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    // Extract the most relevant information
    if (data.address) {
      // Try to get the most specific location name
      const addressParts = [];
      
      // Add city/town/village
      if (data.address.city) addressParts.push(data.address.city);
      else if (data.address.town) addressParts.push(data.address.town);
      else if (data.address.village) addressParts.push(data.address.village);
      
      // Add state/province and country
      if (data.address.state) addressParts.push(data.address.state);
      if (data.address.country) addressParts.push(data.address.country);
      
      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }
    
    // Fallback to display name
    if (data.display_name) {
      const parts = data.display_name.split(',');
      // Return first 2-3 parts to avoid too long names
      return parts.slice(0, 3).join(',');
    }
    
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Error getting location name:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
} 