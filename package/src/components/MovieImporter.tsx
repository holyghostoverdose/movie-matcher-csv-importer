import React, { useState } from 'react';
import { useImport } from '../ImportContext';
import { Movie } from '../types';
import { getPosterUrl } from '../utils/tmdbAPI';
import { ImportDialog } from './ImportDialog';
import { ValidationInterface } from './ValidationInterface';
import ImportSummary from './ImportSummary';

// Star component for displaying ratings
const Star: React.FC<{
  size: number;
  className?: string;
}> = ({
  size,
  className
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Movie card for displaying imported movies
const ImportedMovieCard: React.FC<{
  movie: Movie;
}> = ({
  movie
}) => {
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : movie.year;
  
  return (
    <div className="card-modern overflow-hidden">
      <div className="aspect-[2/3] relative overflow-hidden rounded-t-xl">
        <img 
          src={getPosterUrl(movie.posterPath || null)} 
          alt={movie.title} 
          className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        
        {movie.rating && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-0.5 bg-secondary rounded-full px-1.5 py-0.5 text-xs">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {movie.rating.toFixed(1)}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
        {releaseYear && <p className="text-xs text-muted-foreground">{releaseYear}</p>}
      </div>
    </div>
  );
};

// Component for selecting import options and importing CSV
export interface MovieImporterProps {
  onImportComplete?: (movies: Movie[]) => void;
  tmdbApiKey: string;
}

export const MovieImporter: React.FC<MovieImporterProps> = ({ 
  onImportComplete,
  tmdbApiKey
}) => {
  const { state, dispatch } = useImport();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Generate imported movies based on matches
  const importedMovies: Movie[] = state.matches
    .filter(match => match.matchedMovie)
    .map(match => ({
      id: Math.random(),
      tmdbId: match.matchedMovie!.id,
      title: match.matchedMovie!.title,
      originalTitle: match.matchedMovie!.original_title,
      posterPath: match.matchedMovie!.poster_path,
      backdropPath: match.matchedMovie!.backdrop_path,
      releaseDate: match.matchedMovie!.release_date,
      watchedDate: match.detectedDate,
      rating: match.detectedRating,
      status: state.importOptions.type,
      importConfidence: match.confidence,
      originalData: match.csvData.reduce((obj, val, idx) => {
        if (match.originalColumns && match.originalColumns[idx]) {
          obj[match.originalColumns[idx].name] = val;
        }
        return obj;
      }, {} as Record<string, string>)
    }));

  // Handle import completion
  const handleImportComplete = () => {
    if (onImportComplete) {
      onImportComplete(importedMovies);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {state.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Import Error</p>
          <p className="text-sm">{state.error}</p>
        </div>
      )}
      
      <div className="space-y-8">
        {state.currentStep === 'validate' ? (
          <ValidationInterface />
        ) : state.currentStep === 'summary' ? (
          <ImportSummary onImportComplete={handleImportComplete} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-muted-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Import your movies from CSV</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Import movie collections from Letterboxd, IMDb, or your own custom CSV format.
            </p>
            <button 
              onClick={() => setImportDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
                        disabled:pointer-events-none disabled:opacity-50 
                        bg-primary text-primary-foreground hover:bg-primary/90
                        h-9 px-4 py-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                />
              </svg>
              Import Movies
            </button>
          </div>
        )}
      </div>
      
      <ImportDialog 
        open={importDialogOpen} 
        onOpenChange={setImportDialogOpen}
        tmdbApiKey={tmdbApiKey}
      />
    </div>
  );
};

export default MovieImporter; 