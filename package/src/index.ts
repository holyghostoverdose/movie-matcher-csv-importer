// Components
export { MovieImporter } from './components/MovieImporter';
export { ImportDialog } from './components/ImportDialog';
export { ValidationInterface } from './components/ValidationInterface';
export { MovieCard } from './components/MovieCard';
export { MovieSearch } from './components/MovieSearch';

// Context
export { ImportProvider } from './ImportContext';
export { useImport } from './ImportContext';

// Utilities
export { configureTMDB, searchMovies, getPosterUrl, getBackdropUrl } from './utils/tmdbAPI';
export { parseCSV, detectCsvFormat } from './utils/csvParser';
export { findBestMatch, batchProcessMatches } from './utils/matchingAlgorithm';

// Types
export type {
  Movie,
  Genre,
  TMDBMovie,
  TMDBSearchResponse,
  CSVColumn,
  CSVParsingResult,
  ImportOptions,
  MovieMatch,
  ImportSummary,
  ImportState,
  ImportAction,
  MovieCardProps,
  MovieCardSize,
  MovieSearchProps
} from './types'; 