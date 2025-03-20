
import React from 'react';
import { TMDBMovie } from '@/types';
import { getPosterUrl } from '@/utils/tmdbAPI';
import { Badge } from '@/components/ui/badge';

interface MovieCardProps {
  movie: TMDBMovie;
  confidence?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  confidence,
  isSelected,
  onSelect,
  size = 'md',
}) => {
  // Get release year from date
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : undefined;

  // Determine poster dimensions based on size
  const dimensions = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  }[size];

  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg transition-all duration-300
        ${isSelected 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]' 
          : 'hover:scale-[1.02]'
        }
        ${onSelect ? 'cursor-pointer' : ''}
      `}
      onClick={onSelect}
    >
      <div className={`relative ${dimensions} bg-muted`}>
        {/* Poster */}
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />

        {/* Confidence badge - if provided */}
        {confidence !== undefined && (
          <div className="absolute top-1 right-1">
            <Badge variant={confidence > 0.7 ? "default" : confidence > 0.5 ? "outline" : "destructive"}>
              {Math.round(confidence * 100)}%
            </Badge>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />

        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
          <h3 className="font-medium text-sm leading-tight text-balance line-clamp-2">
            {movie.title}
          </h3>
          {releaseYear && (
            <span className="text-xs text-gray-300">{releaseYear}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
