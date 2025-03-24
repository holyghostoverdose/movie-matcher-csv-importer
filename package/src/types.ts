// Movie-related types
export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  year?: number;
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  genres?: Genre[];
  releaseDate?: string;
  watchedDate?: string;
  ratingDate?: string;
  rating?: number;
  status: 'watched' | 'rated' | 'watchlist';
  importConfidence?: number;
  originalData?: Record<string, string>;
}

export interface Genre {
  id: number;
  name: string;
}

// TMDB API types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

// CSV Parsing types
export interface CSVColumn {
  name: string;
  type: 'title' | 'year' | 'date' | 'rating' | 'unknown';
  index: number;
}

export interface CSVParsingResult {
  headers: string[];
  columns: CSVColumn[];
  data: string[][];
  detectedFormat: 'letterboxd' | 'imdb' | 'tmdb' | 'custom' | 'unknown';
}

// Import types
export interface ImportOptions {
  type: 'watched' | 'rated' | 'watchlist';
  duplicateHandling: 'overwrite' | 'skip';
}

export interface MovieMatch {
  csvData: string[];
  originalColumns: CSVColumn[];
  detectedTitle: string;
  detectedYear?: number;
  detectedDate?: string;
  detectedRating?: number;
  matchedMovie?: TMDBMovie;
  confidence: number;
  status: 'matched' | 'uncertain' | 'unmatched';
  alternatives?: TMDBMovie[];
  importStatus?: 'pending' | 'imported' | 'skipped' | 'error';
  errorMessage?: string;
}

export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
}

// Import context state
export interface ImportState {
  csvData: CSVParsingResult | null;
  matches: MovieMatch[];
  importOptions: ImportOptions;
  isLoading: boolean;
  currentStep: 'select' | 'validate' | 'summary';
  error: string | null;
  importSummary: ImportSummary | null;
}

// Import context actions
export type ImportAction =
  | { type: 'SET_CSV_DATA'; payload: string[][] }
  | { type: 'SET_MATCHES'; payload: MovieMatch[] }
  | { type: 'UPDATE_MATCH'; payload: MovieMatch }
  | { type: 'SET_IMPORT_OPTIONS'; payload: ImportOptions }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STEP'; payload: 'upload' | 'validate' | 'summary' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IMPORT_SUMMARY'; payload: ImportSummary }
  | { type: 'RESET_STATE' };

export type MovieCardSize = 'sm' | 'md' | 'lg';

export interface MovieCardProps {
  movie: TMDBMovie;
  size?: MovieCardSize;
  showConfidence?: boolean;
  confidence?: number;
  selected?: boolean;
  onSelect?: (movie: TMDBMovie) => void;
} 