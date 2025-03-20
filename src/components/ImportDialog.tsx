
import React, { useState } from 'react';
import { useImport } from '@/context/ImportContext';
import { ImportOptions } from '@/types';
import { parseCSV, extractTitle, extractYear, extractDate, extractRating } from '@/utils/csvParser';
import { batchProcessMatches } from '@/utils/matchingAlgorithm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileX, Loader2 } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onOpenChange }) => {
  const { state, dispatch } = useImport();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    type: 'watched',
    duplicateHandling: 'skip',
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        toast({
          title: 'Invalid file',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
        variant: 'destructive',
      });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_IMPORT_OPTIONS', payload: importOptions });

      // Parse CSV file
      const parsedCsv = await parseCSV(file);
      dispatch({ type: 'SET_CSV_DATA', payload: parsedCsv });

      // Extract data from CSV
      const titles: string[] = [];
      const years: (number | undefined)[] = [];
      const dates: (string | undefined)[] = [];
      const ratings: (number | undefined)[] = [];

      for (const row of parsedCsv.data) {
        titles.push(extractTitle(row, parsedCsv.columns));
        years.push(extractYear(row, parsedCsv.columns));
        dates.push(extractDate(row, parsedCsv.columns));
        ratings.push(extractRating(row, parsedCsv.columns));
      }

      // Find matches for all movies
      const matches = await batchProcessMatches(
        parsedCsv.data,
        titles,
        years,
        dates,
        ratings,
        parsedCsv.columns
      );

      dispatch({ type: 'SET_MATCHES', payload: matches });
      dispatch({ type: 'SET_STEP', payload: 'validate' });
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Unknown error occurred during import' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Movies</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your movie collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Import type selection */}
          <div className="space-y-2">
            <Label>Import as</Label>
            <RadioGroup
              defaultValue={importOptions.type}
              onValueChange={(value) => 
                setImportOptions({...importOptions, type: value as ImportOptions['type']})
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="watched" id="watched" />
                <Label htmlFor="watched" className="cursor-pointer">Watched Movies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rated" id="rated" />
                <Label htmlFor="rated" className="cursor-pointer">Rated Movies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="watchlist" id="watchlist" />
                <Label htmlFor="watchlist" className="cursor-pointer">Watchlist</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Duplicate handling options */}
          {(importOptions.type === 'watched' || importOptions.type === 'rated') && (
            <div className="space-y-2">
              <Label>Duplicate handling</Label>
              <RadioGroup
                defaultValue={importOptions.duplicateHandling}
                onValueChange={(value) => 
                  setImportOptions({
                    ...importOptions, 
                    duplicateHandling: value as ImportOptions['duplicateHandling']
                  })
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="skip" />
                  <Label htmlFor="skip" className="cursor-pointer">Skip duplicates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwrite" id="overwrite" />
                  <Label htmlFor="overwrite" className="cursor-pointer">Overwrite existing entries</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* File upload area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 transition-colors duration-200
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
              ${file ? 'bg-muted/50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              {file ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload size={20} className="text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB · CSV
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-xs h-7"
                  >
                    <FileX size={14} className="mr-1" />
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Upload size={20} className="text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Drag and drop your CSV file here</p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse files
                    </p>
                  </div>
                  <label className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
                                   disabled:pointer-events-none disabled:opacity-50 
                                   bg-primary text-primary-foreground hover:bg-primary/90
                                   shadow-sm h-8 px-3 cursor-pointer">
                    Browse files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || state.isLoading}
          >
            {state.isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Processing
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
