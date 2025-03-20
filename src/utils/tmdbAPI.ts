
import { TMDBMovie, TMDBSearchResponse } from '@/types';

// Cache for API requests to minimize calls
const apiCache = new Map<string, any>();

// Base TMDB API configuration
const API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const getPosterUrl = (path: string | null): string => {
  if (!path) return '/placeholder.svg';
  return `${POSTER_BASE_URL}${path}`;
};

export const getBackdropUrl = (path: string | null): string => {
  if (!path) return '';
  return `${BACKDROP_BASE_URL}${path}`;
};

// Helper function to make API requests with caching
async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = url + JSON.stringify(options || {});
  
  // Check cache first
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  try {
    // Implement exponential backoff for rate limiting
    let retries = 3;
    let delay = 1000;
    
    while (retries > 0) {
      try {
        const response = await fetch(url, options);
        
        // Check for rate limiting
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
          console.log(`Rate limited, waiting for ${retryAfter} seconds`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          retries--;
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache successful responses
        apiCache.set(cacheKey, data);
        
        return data;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error('Max retries exceeded');
  } catch (error) {
    console.error('TMDB API request failed:', error);
    throw error;
  }
}

// Search for movies by title and optionally year
export async function searchMovies(query: string, year?: number): Promise<TMDBMovie[]> {
  let url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
  
  if (year) {
    url += `&year=${year}`;
  }
  
  const response = await fetchWithCache<TMDBSearchResponse>(url);
  return response.results;
}

// Get movie details by TMDB ID
export async function getMovieDetails(tmdbId: number): Promise<TMDBMovie> {
  const url = `${BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}`;
  return fetchWithCache<TMDBMovie>(url);
}

// Clear cache for a specific URL or the entire cache
export function clearCache(url?: string): void {
  if (url) {
    for (const key of apiCache.keys()) {
      if (key.startsWith(url)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
}
