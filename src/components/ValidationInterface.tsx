import React, { useState } from 'react';
import { useImport } from '@/context/ImportContext';
import { TMDBMovie, MovieMatch } from '@/types';
import { getPosterUrl } from '@/utils/tmdbAPI';
import MovieCard from './MovieCard';
import MovieSearch from './MovieSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Check, AlertTriangle, X, Calendar, Star, Search, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
    matched: <Check size={16} className="text-green-500" />,
    uncertain: <AlertTriangle size={16} className="text-amber-500" />,
    unmatched: <X size={16} className="text-red-500" />,
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-1.5">
              {statusIcons[match.status]}
              <span>{match.detectedTitle}</span>
              {match.detectedYear && (
                <span className="text-muted-foreground">({match.detectedYear})</span>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5 truncate max-w-[30ch]">
              {match.csvData.join(', ')}
            </CardDescription>
          </div>
          
          <Badge 
            variant={
              match.confidence > 0.8 ? "default" : 
              match.confidence > 0.5 ? "secondary" : 
              "destructive"
            }
          >
            {Math.round(match.confidence * 100)}% match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
              {isEditingDate ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" className="h-8" onClick={updateDate}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">
                    {match.detectedDate || 'No date detected'}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2" 
                    onClick={() => setIsEditingDate(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Star size={16} className="text-muted-foreground flex-shrink-0" />
              {isEditingRating ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={tempRating}
                    onChange={(e) => setTempRating(e.target.value)}
                    placeholder="1-10"
                    className="h-8 text-sm"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                  />
                  <Button size="sm" variant="outline" className="h-8" onClick={updateRating}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">
                    {match.detectedRating ? `${match.detectedRating} / 10` : 'No rating detected'}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2" 
                    onClick={() => setIsEditingRating(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2" 
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={14} className="mr-1" />
              {showSearch ? 'Hide search' : 'Search for movie'}
            </Button>

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
                <MovieCard 
                  movie={match.matchedMovie} 
                  confidence={match.confidence}
                  size="sm"
                />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 h-7 text-xs" 
                  onClick={() => onUpdate(index, { 
                    matchedMovie: undefined, 
                    status: 'unmatched',
                    confidence: 0
                  })}
                >
                  <X size={12} className="mr-1" />
                  Dismiss match
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md">
                <Search size={24} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No movie matched
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowSearch(true)}
                >
                  Search manually
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ValidationInterface: React.FC = () => {
  const { state, dispatch } = useImport();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredMatches = state.showOnlyProblems
    ? state.matches.filter(match => match.status !== 'matched')
    : state.matches;

  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const currentMatches = filteredMatches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateMatch = (index: number, updatedMatch: Partial<MovieMatch>) => {
    const realIndex = state.showOnlyProblems
      ? state.matches.findIndex(m => m === filteredMatches[index])
      : index + (currentPage - 1) * itemsPerPage;
    
    dispatch({
      type: 'UPDATE_MATCH',
      payload: { index: realIndex, match: updatedMatch }
    });
  };

  const handleCompleteValidation = () => {
    const unmatchedCount = state.matches.filter(m => !m.matchedMovie).length;
    
    if (unmatchedCount > 0) {
      toast({
        title: `${unmatchedCount} movies unmatched`,
        description: "Some movies couldn't be matched. Continue anyway or fix the matches.",
        variant: 'destructive',
      });
      return;
    }
    
    const summary = {
      total: state.matches.length,
      imported: state.matches.filter(m => m.matchedMovie).length,
      skipped: 0,
      failed: state.matches.filter(m => !m.matchedMovie).length,
    };
    
    dispatch({ type: 'SET_IMPORT_SUMMARY', payload: summary });
    dispatch({ type: 'SET_STEP', payload: 'summary' });
  };

  const toggleShowProblems = () => {
    dispatch({ type: 'TOGGLE_SHOW_PROBLEMS' });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Validate Imported Movies</h2>
          <p className="text-muted-foreground">
            Review and fix any issues with your imported movies
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="show-problems"
            checked={state.showOnlyProblems}
            onCheckedChange={toggleShowProblems}
          />
          <Label htmlFor="show-problems" className="cursor-pointer">
            {state.showOnlyProblems ? (
              <span className="flex items-center">
                <AlertTriangle size={14} className="mr-1 text-amber-500" />
                Showing problems only
              </span>
            ) : (
              <span className="flex items-center">
                <Eye size={14} className="mr-1" />
                Show all movies
              </span>
            )}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{state.matches.length}</div>
              <p className="text-xs text-muted-foreground">Total movies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {state.matches.filter(m => m.status === 'matched').length}
              </div>
              <p className="text-xs text-muted-foreground">Matched</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {state.matches.filter(m => m.status !== 'matched').length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentMatches.length > 0 ? (
        <div className="space-y-4">
          {currentMatches.map((match, index) => (
            <MovieMatchRow
              key={index}
              match={match}
              index={index}
              onUpdate={handleUpdateMatch}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
          <CardTitle>No issues found!</CardTitle>
          <CardDescription className="mt-2">
            {state.showOnlyProblems
              ? "All movies have been successfully matched. You can proceed with the import."
              : "No movies found in your CSV. Try uploading a different file."}
          </CardDescription>
        </Card>
      )}

      {filteredMatches.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMatches.length)} of {filteredMatches.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft size={16} />
            </Button>
            
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 'select' })}
        >
          Back
        </Button>
        <Button onClick={handleCompleteValidation}>
          Complete Import
        </Button>
      </div>
    </div>
  );
};

export default ValidationInterface;
