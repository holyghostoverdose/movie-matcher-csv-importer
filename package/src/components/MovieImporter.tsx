import React, { useState } from 'react';
import { useImport } from '../ImportContext';
import { Movie } from '../types';
import { getPosterUrl } from '../utils/tmdbAPI';
import { ImportDialog } from './ImportDialog';
import { ValidationInterface } from './ValidationInterface';
import ImportSummary from './ImportSummary';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

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

export interface MovieImporterProps {
  onImportComplete?: (summary: any) => void;
  onImportError?: (error: Error) => void;
  className?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export function MovieImporter({
  onImportComplete,
  onImportError,
  className,
  buttonText = 'Import Movies',
  buttonVariant = 'default',
  buttonSize = 'default'
}: MovieImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch } = useImport();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      dispatch({ type: 'RESET_STATE' });
    }
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Upload className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>

      <ImportDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        onImportComplete={onImportComplete}
        onImportError={onImportError}
      />
    </>
  );
}

export default MovieImporter; 