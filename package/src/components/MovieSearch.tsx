import React, { useState, useEffect } from 'react';
import { searchMovies } from '../utils/tmdbAPI';
import { TMDBMovie } from '../types';
import { MovieCard } from './MovieCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Loader2 } from 'lucide-react';

export interface MovieSearchProps {
  onMovieSelect: (movie: TMDBMovie) => void;
  initialValue?: string;
  selectedMovie?: TMDBMovie;
}

export function MovieSearch({
  onMovieSelect,
  initialValue = '',
  selectedMovie
}: MovieSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [year, setYear] = useState<string>('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Search movies when query changes
  useEffect(() => {
    async function search() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchYear = year ? parseInt(year, 10) : undefined;
        const movies = await searchMovies(debouncedQuery, searchYear);
        setResults(movies);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [debouncedQuery, year]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-24">
          <Input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <Button disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size="sm"
              selected={selectedMovie?.id === movie.id}
              onSelect={onMovieSelect}
            />
          ))}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-8 text-muted-foreground">
          {isLoading ? (
            <p>Searching...</p>
          ) : (
            <p>No movies found</p>
          )}
        </div>
      ) : null}
    </div>
  );
} 