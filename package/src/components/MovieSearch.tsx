import React, { useState, useEffect } from 'react';
import { searchMovies } from '../utils/tmdbAPI';
import { TMDBMovie } from '../types';
import MovieCard from './MovieCard';

interface MovieSearchProps {
  initialValue?: string;
  onMovieSelect: (movie: TMDBMovie) => void;
  selectedMovie?: TMDBMovie;
}

export const MovieSearch: React.FC<MovieSearchProps> = ({
  initialValue = '',
  onMovieSelect,
  selectedMovie,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [searchYear, setSearchYear] = useState<string>('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    const fetchMovies = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const year = searchYear ? parseInt(searchYear, 10) : undefined;
        const searchResults = await searchMovies(debouncedQuery, year);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        alert('Could not retrieve movie results. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    fetchMovies();
  }, [debouncedQuery, searchYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered by the debounced query effect
  };

  const handleClear = () => {
    setQuery('');
    setSearchYear('');
    setResults([]);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
        <input
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
          placeholder="Year"
          className="w-20 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button 
          type="submit" 
          className="p-2 bg-gray-200 rounded-md"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </button>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-8">
          <svg 
            className="animate-spin h-8 w-8 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-4">
          {results.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  size="sm"
                  isSelected={selectedMovie?.id === movie.id}
                  onSelect={() => onMovieSelect(movie)}
                />
              ))}
            </div>
          ) : debouncedQuery.length > 1 ? (
            <div className="text-center py-8 text-gray-500">
              No movies found matching your search
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MovieSearch; 