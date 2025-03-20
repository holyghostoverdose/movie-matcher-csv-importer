
import React, { useState, useEffect } from 'react';
import { searchMovies } from '@/utils/tmdbAPI';
import { TMDBMovie, MovieMatch } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MovieCard from './MovieCard';
import { useToast } from '@/hooks/use-toast';
import { Search, X, Loader2 } from 'lucide-react';

interface MovieSearchProps {
  initialValue?: string;
  onMovieSelect: (movie: TMDBMovie) => void;
  selectedMovie?: TMDBMovie;
}

const MovieSearch: React.FC<MovieSearchProps> = ({
  initialValue = '',
  onMovieSelect,
  selectedMovie,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [searchYear, setSearchYear] = useState<string>('');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const { toast } = useToast();

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
        toast({
          title: 'Search failed',
          description: 'Could not retrieve movie results. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSearching(false);
      }
    };

    fetchMovies();
  }, [debouncedQuery, searchYear, toast]);

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
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Input
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
          placeholder="Year"
          className="w-20"
        />
        <Button type="submit" variant="secondary" size="icon">
          <Search size={18} />
        </Button>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <div className="text-center py-8 text-muted-foreground">
              No movies found matching your search
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
