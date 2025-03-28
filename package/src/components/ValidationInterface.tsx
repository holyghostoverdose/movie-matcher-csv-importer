import React, { useState, useEffect } from 'react';
import { useImport } from '../ImportContext';
import { TMDBMovie, MovieMatch } from '../types';
import { getPosterUrl } from '../utils/tmdbAPI';
import MovieCard from './MovieCard';
import MovieSearch from './MovieSearch';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Search, Check, X, AlertCircle } from 'lucide-react';

type FilterMode = 'all' | 'matched' | 'errors';

interface MovieMatchRowProps {
  match: MovieMatch;
  index: number;
  onUpdate: (index: number, updatedMatch: Partial<MovieMatch>) => void;
}

const MovieMatchRow: React.FC<MovieMatchRowProps> = ({ match, index, onUpdate }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [tempDate, setTempDate] = useState(match.detectedDate || '');
  const [tempRating, setTempRating] = useState(match.detectedRating?.toString() || '');
  const [showSearch, setShowSearch] = useState(false);

  const statusIcons = {
    matched: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-green-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
      </svg>
    ),
    uncertain: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-amber-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
    ),
    unmatched: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 text-red-500" 
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
    ),
  };

  const updateDate = () => {
    onUpdate(index, { detectedDate: tempDate });
    setIsEditingDate(false);
  };

  const updateRating = () => {
    const rating = tempRating ? parseFloat(tempRating) : undefined;
    onUpdate(index, { detectedRating: rating });
    setIsEditingRating(false);
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    onUpdate(index, { 
      matchedMovie: movie,
      status: 'matched',
      confidence: 1.0 // Manual selection means 100% confidence
    });
    setShowSearch(false);
  };

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base flex items-center gap-1.5 font-medium">
              {statusIcons[match.status]}
              <span>{match.detectedTitle}</span>
              {match.detectedYear && (
                <span className="text-gray-500">({match.detectedYear})</span>
              )}
            </div>
            <div className="text-xs mt-1 text-gray-500 truncate max-w-[30ch]">
              {match.csvData.join(', ')}
            </div>
          </div>
          
          <div className={`
            px-2 py-1 text-xs rounded-full
            ${match.confidence > 0.8 ? 'bg-green-100 text-green-800' : 
              match.confidence > 0.5 ? 'bg-amber-100 text-amber-800' : 
              'bg-red-100 text-red-800'}
          `}>
            {Math.round(match.confidence * 100)}% match
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              {isEditingDate ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button 
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    onClick={updateDate}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">
                    {match.detectedDate || 'No date detected'}
                  </span>
                  <button 
                    className="text-xs px-2 py-1 text-gray-500 hover:text-gray-800"
                    onClick={() => setIsEditingDate(true)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                />
              </svg>
              {isEditingRating ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={tempRating}
                    onChange={(e) => setTempRating(e.target.value)}
                    placeholder="1-10"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                  />
                  <button 
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    onClick={updateRating}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">
                    {match.detectedRating ? `${match.detectedRating} / 10` : 'No rating detected'}
                  </span>
                  <button 
                    className="text-xs px-2 py-1 text-gray-500 hover:text-gray-800"
                    onClick={() => setIsEditingRating(true)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <button 
              className="w-full mt-2 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
              onClick={() => setShowSearch(!showSearch)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 inline mr-1"
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
              {showSearch ? 'Hide search' : 'Search for movie'}
            </button>

            {showSearch && (
              <div className="mt-2">
                <MovieSearch
                  initialValue={match.detectedTitle}
                  onMovieSelect={handleMovieSelect}
                  selectedMovie={match.matchedMovie}
                />
              </div>
            )}
          </div>

          <div className="col-span-5">
            {match.matchedMovie ? (
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <MovieCard 
                    movie={match.matchedMovie} 
                    confidence={match.confidence}
                    size="sm"
                  />
                  
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-75 text-white text-xs transition-opacity duration-200 rounded-b-lg">
                    <div className="font-medium">{match.matchedMovie.title}</div>
                    {match.matchedMovie.release_date && (
                      <div className="text-gray-300 text-xs">
                        {new Date(match.matchedMovie.release_date).getFullYear()}
                      </div>
                    )}
                    {match.matchedMovie.vote_average > 0 && (
                      <div className="flex items-center mt-1 text-amber-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span>{match.matchedMovie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => onUpdate(index, { 
                    matchedMovie: undefined, 
                    status: 'unmatched',
                    confidence: 0
                  })}
                  className="mt-2 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 inline mr-1"
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
                  Dismiss match
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400 mb-2"
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
                <p className="text-sm text-gray-500">
                  No movie matched
                </p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-2 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Search manually
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PaginationControls: React.FC<{ 
  currentPage: number; 
  totalPages: number; 
  setCurrentPage: (page: number) => void;
  className?: string;
}> = ({ 
  currentPage, 
  totalPages, 
  setCurrentPage,
  className = ""
}) => {
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="p-2 rounded-md border disabled:opacity-50"
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
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>
      
      <span className="text-sm">
        {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border disabled:opacity-50"
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
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>
    </div>
  );
};

export function ValidationInterface() {
  const { state, dispatch } = useImport();
  const { matches, importOptions } = state;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showSearch, setShowSearch] = useState(false);

  const filteredMatches = matches.filter(match => {
    switch (filterMode) {
      case 'matched':
        return match.status === 'matched';
      case 'errors':
        return match.status === 'unmatched' || match.status === 'uncertain';
      default:
        return true;
    }
  });

  const currentMatch = filteredMatches[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setShowSearch(false);
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(filteredMatches.length - 1, prev + 1));
    setShowSearch(false);
  };

  const handleUpdateMatch = (match: typeof currentMatch) => {
    dispatch({
      type: 'UPDATE_MATCH',
      payload: match
    });
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    if (currentMatch) {
      handleUpdateMatch({
        ...currentMatch,
        matchedMovie: movie,
        status: 'matched',
        confidence: 1
      });
    }
    setShowSearch(false);
  };

  const handleSkip = () => {
    if (currentMatch) {
      handleUpdateMatch({
        ...currentMatch,
        status: 'unmatched'
      });
    }
    handleNext();
  };

  const handleConfirm = () => {
    if (currentMatch) {
      handleUpdateMatch({
        ...currentMatch,
        status: 'matched'
      });
    }
    handleNext();
  };

  if (!currentMatch) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium">No matches to review</p>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 'summary' })}
          className="mt-4"
        >
          View Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterMode('all')}
            className={filterMode === 'all' ? 'bg-accent' : ''}
          >
            All ({matches.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterMode('matched')}
            className={filterMode === 'matched' ? 'bg-accent' : ''}
          >
            Matched ({matches.filter(m => m.status === 'matched').length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterMode('errors')}
            className={filterMode === 'errors' ? 'bg-accent' : ''}
          >
            Errors ({matches.filter(m => m.status !== 'matched').length})
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentIndex + 1} of {filteredMatches.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === filteredMatches.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Detected Movie</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Title:</span> {currentMatch.detectedTitle}
              </p>
              {currentMatch.detectedYear && (
                <p className="text-sm">
                  <span className="font-medium">Year:</span> {currentMatch.detectedYear}
                </p>
              )}
              {currentMatch.detectedDate && (
                <p className="text-sm">
                  <span className="font-medium">Date:</span> {currentMatch.detectedDate}
                </p>
              )}
              {currentMatch.detectedRating && (
                <p className="text-sm">
                  <span className="font-medium">Rating:</span> {currentMatch.detectedRating}
                </p>
              )}
            </div>
          </div>

          {currentMatch.matchedMovie ? (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-2">Matched Movie</h3>
              <MovieCard
                movie={currentMatch.matchedMovie}
                size="medium"
                showConfidence
                confidence={currentMatch.confidence}
              />
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-2">No Match Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No matching movie was found in TMDB. You can search manually or skip this entry.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(true)}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Search Manually
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">Match Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {currentMatch.status === 'matched' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : currentMatch.status === 'uncertain' ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm capitalize">{currentMatch.status}</span>
              </div>
              {currentMatch.confidence && (
                <div className="text-sm">
                  <span className="font-medium">Confidence:</span>{' '}
                  <span className={currentMatch.confidence > 0.7 ? 'text-green-500' : 'text-yellow-500'}>
                    {(currentMatch.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip
            </Button>
            {currentMatch.matchedMovie && (
              <Button
                onClick={handleConfirm}
              >
                Confirm Match
              </Button>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="mt-6">
          <MovieSearch
            onMovieSelect={handleMovieSelect}
            initialValue={currentMatch.detectedTitle}
            selectedMovie={currentMatch.matchedMovie}
          />
        </div>
      )}
    </div>
  );
}

export default ValidationInterface; 