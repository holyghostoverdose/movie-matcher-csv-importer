import React, { useState } from 'react';
import { useImport } from '@/context/ImportContext';
import { Movie } from '@/types';
import { getPosterUrl } from '@/utils/tmdbAPI';
import ImportDialog from './ImportDialog';
import ValidationInterface from './ValidationInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, Import, FileText, FilePlus2, LayoutGrid, List, Film } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
const ImportedMovieCard: React.FC<{
  movie: Movie;
}> = ({
  movie
}) => {
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : movie.year;
  return <div className="card-modern overflow-hidden">
      <div className="aspect-[2/3] relative overflow-hidden rounded-t-xl">
        <img src={getPosterUrl(movie.posterPath || null)} alt={movie.title} className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        
        {movie.rating && <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center gap-0.5">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {movie.rating.toFixed(1)}
            </Badge>
          </div>}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
        {releaseYear && <p className="text-xs text-muted-foreground">{releaseYear}</p>}
      </div>
    </div>;
};
const ImportSummary: React.FC = () => {
  const {
    state,
    dispatch
  } = useImport();
  const {
    toast
  } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const handleFinishImport = () => {
    setIsImporting(true);

    // Simulate finalizing the import - in a real app, this would save to backend
    setTimeout(() => {
      toast({
        title: 'Import completed',
        description: `Successfully imported ${state.importSummary?.imported} movies.`
      });
      setIsImporting(false);
      dispatch({
        type: 'SET_STEP',
        payload: 'select'
      });
    }, 1500);
  };
  return <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Import Summary</h2>
        <p className="text-muted-foreground">
          Review your import results before finalizing
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{state.importSummary?.total || 0}</div>
              <p className="text-sm text-muted-foreground">Total movies</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{state.importSummary?.imported || 0}</div>
              <p className="text-sm text-muted-foreground">Imported</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{state.importSummary?.skipped || 0}</div>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{state.importSummary?.failed || 0}</div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-center mb-2">
            <Check size={24} className="text-green-500" />
            <h3 className="text-lg font-medium">Ready to complete import</h3>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Your movies have been processed and are ready to be added to your collection.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => dispatch({
            type: 'SET_STEP',
            payload: 'validate'
          })}>
              Back to validation
            </Button>
            <Button onClick={handleFinishImport} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Finish import'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};
const Star: React.FC<{
  size: number;
  className?: string;
}> = ({
  size,
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>;
const MovieImporter: React.FC = () => {
  const {
    state,
    dispatch
  } = useImport();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Generate sample imported movies for demonstration
  // In a real implementation, these would come from the database or state
  const importedMovies: Movie[] = state.matches.filter(match => match.matchedMovie).map(match => ({
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
  return <div className="container max-w-screen-xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          
          
        </div>
        
        {state.currentStep === 'select'}
      </div>
      
      {state.error && <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Import Error</p>
          <p className="text-sm">{state.error}</p>
        </div>}
      
      <div className="space-y-8">
        {state.currentStep === 'validate' ? <ValidationInterface /> : state.currentStep === 'summary' ? <ImportSummary /> : <Tabs defaultValue="imported" className="w-full">
            
            
            <TabsContent value="imported" className="animate-fade-in">
              {importedMovies.length > 0 ? <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Your Movies</h2>
                    <div className="flex items-center space-x-2">
                      <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                        <LayoutGrid size={16} />
                      </Button>
                      <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                        <List size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {viewMode === 'grid' ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {importedMovies.map(movie => <ImportedMovieCard key={movie.id} movie={movie} />)}
                    </div> : <div className="space-y-2">
                      {importedMovies.map(movie => <Card key={movie.id}>
                          <CardContent className="p-3 flex items-center space-x-4">
                            <div className="w-12 h-16 flex-shrink-0">
                              <img src={getPosterUrl(movie.posterPath || null)} alt={movie.title} className="w-full h-full object-cover rounded" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                              <div className="flex items-center text-xs text-muted-foreground">
                                {movie.releaseDate && <span>{new Date(movie.releaseDate).getFullYear()}</span>}
                                {movie.rating && <span className="ml-2 flex items-center">
                                    <Star size={12} className="mr-0.5 fill-amber-400 text-amber-400" />
                                    {movie.rating.toFixed(1)}
                                  </span>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>)}
                    </div>}
                </> : <div className="flex flex-col items-center justify-center py-16 text-center">
                  
                  
                  
                  <Button onClick={() => setImportDialogOpen(true)}>
                    <Import size={16} className="mr-2" />
                    Import Movies
                  </Button>
                </div>}
            </TabsContent>
            
            <TabsContent value="history" className="animate-fade-in">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No import history yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Your import history will appear here once you've imported movie collections.
                </p>
              </div>
            </TabsContent>
          </Tabs>}
      </div>
      
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>;
};
export default MovieImporter;