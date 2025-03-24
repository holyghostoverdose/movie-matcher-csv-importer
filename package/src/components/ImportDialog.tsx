import React, { useState } from 'react';
import { useImport } from '../ImportContext';
import { ImportOptions } from '../types';
import { parseCSV, extractTitle, extractYear, extractDate, extractRating } from '../utils/csvParser';
import { configureTMDB } from '../utils/tmdbAPI';
import { batchProcessMatches } from '../utils/matchingAlgorithm';

export interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbApiKey: string;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ 
  open, 
  onOpenChange,
  tmdbApiKey
}) => {
  const { state, dispatch } = useImport();
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
        alert('Please upload a CSV file.');
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
      alert('Please select a CSV file to import.');
      return;
    }

    try {
      // Configure TMDB API with the provided API key
      configureTMDB({
        apiKey: tmdbApiKey
      });

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Import Movies</h2>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file containing your movie collection.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {/* Import type selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Import as</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="watched" 
                  value="watched" 
                  checked={importOptions.type === 'watched'}
                  onChange={() => setImportOptions({...importOptions, type: 'watched'})}
                  className="h-4 w-4"
                />
                <label htmlFor="watched" className="text-sm">Watched Movies</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="rated" 
                  value="rated" 
                  checked={importOptions.type === 'rated'}
                  onChange={() => setImportOptions({...importOptions, type: 'rated'})}
                  className="h-4 w-4"
                />
                <label htmlFor="rated" className="text-sm">Rated Movies</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="watchlist" 
                  value="watchlist" 
                  checked={importOptions.type === 'watchlist'}
                  onChange={() => setImportOptions({...importOptions, type: 'watchlist'})}
                  className="h-4 w-4"
                />
                <label htmlFor="watchlist" className="text-sm">Watchlist</label>
              </div>
            </div>
          </div>

          {/* Duplicate handling options */}
          {(importOptions.type === 'watched' || importOptions.type === 'rated') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Duplicate handling</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="skip" 
                    value="skip" 
                    checked={importOptions.duplicateHandling === 'skip'}
                    onChange={() => setImportOptions({...importOptions, duplicateHandling: 'skip'})}
                    className="h-4 w-4"
                  />
                  <label htmlFor="skip" className="text-sm">Skip duplicates</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="overwrite" 
                    value="overwrite" 
                    checked={importOptions.duplicateHandling === 'overwrite'}
                    onChange={() => setImportOptions({...importOptions, duplicateHandling: 'overwrite'})}
                    className="h-4 w-4"
                  />
                  <label htmlFor="overwrite" className="text-sm">Overwrite existing entries</label>
                </div>
              </div>
            </div>
          )}

          {/* File upload area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 transition-colors duration-200
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
              ${file ? 'bg-gray-50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              {file ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-primary" 
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
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB · CSV
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs py-1 px-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-gray-500" 
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

        <div className="px-6 py-3 border-t flex justify-end gap-2">
          <button 
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || state.isLoading}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {state.isLoading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}; 