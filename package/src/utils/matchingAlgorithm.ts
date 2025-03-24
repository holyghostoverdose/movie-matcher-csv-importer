import { searchMovies } from './tmdbAPI';
import { TMDBMovie, MovieMatch, CSVColumn } from '../types';

// Similarity comparison functions
function titleSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  
  // Normalize both strings
  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .trim();
  };
  
  const normalA = normalize(a);
  const normalB = normalize(b);
  
  // Quick exact match check
  if (normalA === normalB) return 1;
  
  // Check if one is a substring of the other
  if (normalA.includes(normalB) || normalB.includes(normalA)) {
    // Calculate length ratio as a bonus factor
    const lengthRatio = Math.min(normalA.length, normalB.length) / Math.max(normalA.length, normalB.length);
    return 0.8 * lengthRatio;
  }
  
  // Calculate Levenshtein distance-based similarity
  const maxLen = Math.max(normalA.length, normalB.length);
  if (maxLen === 0) return 1; // Both strings are empty
  
  const distance = levenshteinDistance(normalA, normalB);
  return 1 - distance / maxLen;
}

// Levenshtein distance calculation
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,        // deletion
        matrix[i][j - 1] + 1,        // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  return matrix[a.length][b.length];
}

// Calculate match confidence score based on various factors
function calculateConfidence(
  movie: TMDBMovie, 
  title: string, 
  year?: number
): number {
  let confidence = 0;
  
  // Title similarity (most important factor)
  const titleScore = Math.max(
    titleSimilarity(title, movie.title),
    titleSimilarity(title, movie.original_title)
  );
  confidence += titleScore * 0.6; // 60% weight for title
  
  // Year match (if available)
  if (year && movie.release_date) {
    const movieYear = parseInt(movie.release_date.split('-')[0], 10);
    if (movieYear === year) {
      confidence += 0.3; // 30% weight for exact year match
    } else if (Math.abs(movieYear - year) === 1) {
      confidence += 0.1; // 10% weight for off-by-one year
    }
  }
  
  // Popularity bonus (helps with disambiguation)
  // Normalize popularity score (typically 0-1000) to 0-0.1 range
  const popularityScore = Math.min(movie.popularity / 1000, 0.1);
  confidence += popularityScore;
  
  return Math.min(confidence, 1); // Cap at 1.0
}

// Determine match status based on confidence score
function getMatchStatus(confidence: number, hasResults: boolean): 'matched' | 'uncertain' | 'unmatched' {
  if (!hasResults) return 'unmatched';
  if (confidence > 0.7) return 'matched';
  if (confidence > 0.4) return 'uncertain';
  return 'unmatched';
}

// Find the best movie match for a given title and year
export async function findBestMatch(
  title: string, 
  year?: number
): Promise<MovieMatch> {
  try {
    // Search for movies with the given title
    const searchResults = await searchMovies(title, year);
    
    if (searchResults.length === 0) {
      return {
        csvData: [],
        originalColumns: [],
        detectedTitle: title,
        detectedYear: year,
        confidence: 0,
        status: 'unmatched'
      };
    }
    
    // Calculate confidence scores for all results
    const moviesWithConfidence = searchResults.map(movie => ({
      movie,
      confidence: calculateConfidence(movie, title, year)
    }));
    
    // Sort by confidence score
    moviesWithConfidence.sort((a, b) => b.confidence - a.confidence);
    
    // Get best match and alternatives
    const bestMatch = moviesWithConfidence[0];
    const alternatives = moviesWithConfidence
      .slice(1, 6)
      .map(item => item.movie);
    
    const status = getMatchStatus(bestMatch.confidence, searchResults.length > 0);
    
    return {
      csvData: [],
      originalColumns: [],
      detectedTitle: title,
      detectedYear: year,
      matchedMovie: bestMatch.movie,
      confidence: bestMatch.confidence,
      status,
      alternatives
    };
  } catch (error) {
    console.error('Error finding match:', error);
    return {
      csvData: [],
      originalColumns: [],
      detectedTitle: title,
      detectedYear: year,
      confidence: 0,
      status: 'unmatched',
      errorMessage: 'Error searching for movie'
    };
  }
}

// Process a batch of CSV rows to find matches
export async function batchProcessMatches(
  csvData: string[][],
  titles: string[],
  years: (number | undefined)[],
  dates: (string | undefined)[],
  ratings: (number | undefined)[],
  columns: CSVColumn[]
): Promise<MovieMatch[]> {
  const results: MovieMatch[] = [];
  
  // Limit concurrent API requests to avoid rate limiting
  const batchSize = 5;
  
  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    const batchYears = years.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map((title, index) => 
      findBestMatch(title, batchYears[index])
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    // Add CSV data and detected values to results
    batchResults.forEach((result, index) => {
      const rowIndex = i + index;
      results.push({
        ...result,
        csvData: csvData[rowIndex],
        originalColumns: columns,
        detectedDate: dates[rowIndex],
        detectedRating: ratings[rowIndex]
      });
    });
    
    // Add a small delay between batches to respect API rate limits
    if (i + batchSize < titles.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
} 