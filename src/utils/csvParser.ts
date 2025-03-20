
import { CSVColumn, CSVParsingResult } from '@/types';
import Papa from 'papaparse';

// Detect the type of a column based on its values and header
function detectColumnType(header: string, values: string[]): CSVColumn['type'] {
  // Clean and lowercase the header
  const normalizedHeader = header.toLowerCase().trim();
  
  // Check for title-related headers
  if (
    normalizedHeader.includes('title') || 
    normalizedHeader.includes('name') || 
    normalizedHeader.includes('film') || 
    normalizedHeader === 'movie'
  ) {
    return 'title';
  }
  
  // Check for year-related headers
  if (
    normalizedHeader.includes('year') || 
    normalizedHeader.includes('release year') || 
    normalizedHeader === 'yr'
  ) {
    return 'year';
  }
  
  // Check for date-related headers
  if (
    normalizedHeader.includes('date') || 
    normalizedHeader.includes('watched') || 
    normalizedHeader.includes('viewed') || 
    normalizedHeader.includes('rated on')
  ) {
    return 'date';
  }
  
  // Check for rating-related headers
  if (
    normalizedHeader.includes('rating') || 
    normalizedHeader.includes('score') || 
    normalizedHeader.includes('stars') || 
    normalizedHeader === 'rate'
  ) {
    return 'rating';
  }
  
  // Content-based detection if header is not descriptive
  // Look at a sample of values to determine type
  const sampleValues = values.slice(0, Math.min(10, values.length)).filter(Boolean);
  
  if (sampleValues.length === 0) {
    return 'unknown';
  }
  
  // Check if values look like years
  const yearPattern = /^(19|20)\d{2}$/;
  if (sampleValues.every(v => yearPattern.test(v.trim()))) {
    return 'year';
  }
  
  // Check if values look like dates
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/, // YYYY-MM-DD or YYYY/MM/DD
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/, // MM-DD-YYYY or MM/DD/YYYY
    /^\d{1,2}[-/]\w{3}[-/]\d{4}$/, // DD-MMM-YYYY or DD/MMM/YYYY
  ];
  
  if (sampleValues.some(v => datePatterns.some(pattern => pattern.test(v.trim())))) {
    return 'date';
  }
  
  // Check if values look like ratings
  const ratingPatterns = [
    /^[0-5]$/, // 0-5
    /^[0-9]|10$/, // 0-10
    /^[0-5][.][0-9]$/, // 0.0-5.0
    /^[0-9]?[.][0-9]$|^10[.]0$/, // 0.0-10.0
    /^[★]+$/, // Star symbols
  ];
  
  if (sampleValues.some(v => ratingPatterns.some(pattern => pattern.test(v.trim())))) {
    return 'rating';
  }
  
  // If column has lengthy text values, it's likely titles
  if (sampleValues.some(v => v.length > 10)) {
    return 'title';
  }
  
  return 'unknown';
}

// Detect the CSV format based on headers and content
function detectCsvFormat(headers: string[], sample: string[][]): 'letterboxd' | 'imdb' | 'tmdb' | 'custom' | 'unknown' {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  // Letterboxd format detection
  if (
    normalizedHeaders.includes('name') && 
    normalizedHeaders.includes('date') &&
    normalizedHeaders.some(h => h.includes('rating'))
  ) {
    return 'letterboxd';
  }
  
  // IMDb format detection
  if (
    normalizedHeaders.includes('title') && 
    normalizedHeaders.includes('year') &&
    normalizedHeaders.some(h => h.includes('rating') || h.includes('your rating'))
  ) {
    return 'imdb';
  }
  
  // TMDB format detection
  if (
    normalizedHeaders.some(h => h.includes('tmdb')) ||
    (normalizedHeaders.includes('title') && normalizedHeaders.some(h => h.includes('id')))
  ) {
    return 'tmdb';
  }
  
  // Check if we have recognizable columns even if format doesn't match known formats
  const hasTitle = normalizedHeaders.some(h => h.includes('title') || h.includes('name') || h.includes('movie'));
  const hasYear = normalizedHeaders.some(h => h.includes('year'));
  const hasDate = normalizedHeaders.some(h => h.includes('date') || h.includes('watched'));
  const hasRating = normalizedHeaders.some(h => h.includes('rating') || h.includes('score'));
  
  if (hasTitle && (hasYear || hasDate || hasRating)) {
    return 'custom';
  }
  
  return 'unknown';
}

// Parse CSV data and analyze its structure
export async function parseCSV(file: File): Promise<CSVParsingResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Get headers from Papa Parse results
          const headers = results.meta.fields || [];
          
          // Convert data to array format for easier processing
          const data: string[][] = [];
          for (const row of results.data as Record<string, string>[]) {
            const rowArray: string[] = [];
            for (const header of headers) {
              rowArray.push(row[header] || '');
            }
            data.push(rowArray);
          }
          
          // Analyze columns
          const columns: CSVColumn[] = headers.map((header, index) => {
            // Extract all values for this column
            const columnValues = data.map(row => row[index]).filter(Boolean);
            
            return {
              name: header,
              type: detectColumnType(header, columnValues),
              index
            };
          });
          
          // Detect CSV format
          const detectedFormat = detectCsvFormat(headers, data.slice(0, 10));
          
          resolve({
            headers,
            columns,
            data,
            detectedFormat
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

// Extract title from CSV data based on detected columns
export function extractTitle(row: string[], columns: CSVColumn[]): string {
  // Find title column
  const titleColumn = columns.find(col => col.type === 'title');
  if (titleColumn) {
    return row[titleColumn.index].trim();
  }
  
  // If no title column found, use the first non-empty cell
  for (const value of row) {
    if (value.trim()) {
      return value.trim();
    }
  }
  
  return '';
}

// Extract year from CSV data based on detected columns
export function extractYear(row: string[], columns: CSVColumn[]): number | undefined {
  // Find year column
  const yearColumn = columns.find(col => col.type === 'year');
  if (yearColumn) {
    const yearStr = row[yearColumn.index].trim();
    const yearMatch = yearStr.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      return parseInt(yearMatch[0], 10);
    }
  }
  
  // Try to extract year from title if in format "Title (Year)"
  const titleColumn = columns.find(col => col.type === 'title');
  if (titleColumn) {
    const title = row[titleColumn.index].trim();
    const yearMatch = title.match(/\((\d{4})\)/);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10);
    }
  }
  
  return undefined;
}

// Extract date from CSV data based on detected columns
export function extractDate(row: string[], columns: CSVColumn[]): string | undefined {
  // Find date column
  const dateColumn = columns.find(col => col.type === 'date');
  if (!dateColumn) return undefined;
  
  const dateStr = row[dateColumn.index].trim();
  if (!dateStr) return undefined;
  
  try {
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Format as YYYY-MM-DD for consistency
      return date.toISOString().split('T')[0];
    }
    
    // Try more date formats if basic parsing fails
    // MM/DD/YYYY or DD/MM/YYYY
    const slashPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const slashMatch = dateStr.match(slashPattern);
    
    if (slashMatch) {
      // Assume MM/DD/YYYY format (common in US)
      const [_, part1, part2, year] = slashMatch;
      const month = parseInt(part1, 10);
      const day = parseInt(part2, 10);
      
      // Validate month and day
      if (month <= 12 && day <= 31) {
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  return undefined;
}

// Extract rating from CSV data based on detected columns
export function extractRating(row: string[], columns: CSVColumn[]): number | undefined {
  // Find rating column
  const ratingColumn = columns.find(col => col.type === 'rating');
  if (!ratingColumn) return undefined;
  
  const ratingStr = row[ratingColumn.index].trim();
  if (!ratingStr) return undefined;
  
  // Handle star symbols (★)
  if (ratingStr.includes('★')) {
    return (ratingStr.match(/★/g) || []).length;
  }
  
  // Handle numerical ratings
  const numericRating = parseFloat(ratingStr);
  if (!isNaN(numericRating)) {
    // Normalize to a 1-10 scale
    if (numericRating <= 5) {
      // Assume 5-star scale
      return numericRating * 2;
    } else if (numericRating <= 10) {
      // Already on 10-point scale
      return numericRating;
    } else if (numericRating <= 100) {
      // Percentage scale
      return numericRating / 10;
    }
  }
  
  return undefined;
}
