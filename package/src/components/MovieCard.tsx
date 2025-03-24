import React from 'react';
import { MovieCardProps } from '../types';
import { getPosterUrl } from '../utils/tmdbAPI';

export function MovieCard({
  movie,
  size = 'md',
  showConfidence = false,
  confidence,
  selected = false,
  onSelect
}: MovieCardProps) {
  const year = movie.release_date?.split('-')[0];
  
  const sizeClasses = {
    sm: 'w-32 h-48',
    md: 'w-48 h-72',
    lg: 'w-64 h-96'
  };

  const confidenceColor = confidence
    ? confidence > 0.7
      ? 'bg-green-500'
      : confidence > 0.4
      ? 'bg-yellow-500'
      : 'bg-red-500'
    : '';

  return (
    <div
      className={`
        relative group cursor-pointer rounded-lg overflow-hidden
        ${selected ? 'ring-2 ring-primary' : ''}
        ${onSelect ? 'hover:ring-2 hover:ring-primary/50' : ''}
      `}
      onClick={() => onSelect?.(movie)}
    >
      <img
        src={getPosterUrl(movie.poster_path, size)}
        alt={movie.title}
        className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${sizeClasses[size]}`}
      />
      
      {showConfidence && confidence && (
        <div className={`
          absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white
          ${confidenceColor}
        `}>
          {(confidence * 100).toFixed(0)}%
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-medium line-clamp-2">{movie.title}</h3>
          {year && (
            <p className="text-white/80 text-sm">{year}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard; 