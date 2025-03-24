import React from 'react';
import { useImport } from '../ImportContext';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ImportSummaryProps {
  onImportComplete: (summary: any) => void;
  onImportError: (error: Error) => void;
}

export function ImportSummary({
  onImportComplete,
  onImportError
}: ImportSummaryProps) {
  const { state, dispatch } = useImport();
  const { matches, importOptions } = state;

  const matchedCount = matches.filter(m => m.status === 'matched').length;
  const uncertainCount = matches.filter(m => m.status === 'uncertain').length;
  const unmatchedCount = matches.filter(m => m.status === 'unmatched').length;

  const handleImport = () => {
    try {
      const summary = {
        total: matches.length,
        matched: matchedCount,
        uncertain: uncertainCount,
        unmatched: unmatchedCount,
        matches: matches.map(match => ({
          title: match.matchedMovie?.title || match.detectedTitle,
          year: match.matchedMovie?.release_date?.split('-')[0] || match.detectedYear,
          date: match.detectedDate,
          rating: match.detectedRating,
          confidence: match.confidence,
          status: match.status,
          tmdbId: match.matchedMovie?.id
        }))
      };

      onImportComplete(summary);
    } catch (error) {
      onImportError(error as Error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Matched</p>
              <p className="text-2xl font-bold">{matchedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Uncertain</p>
              <p className="text-2xl font-bold">{uncertainCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">Unmatched</p>
              <p className="text-2xl font-bold">{unmatchedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import Summary</h3>
        <p className="text-sm text-muted-foreground">
          {matchedCount} movies were successfully matched, {uncertainCount} need review, and {unmatchedCount} couldn't be matched.
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 'validate' })}
        >
          Review Matches
        </Button>
        <Button onClick={handleImport}>
          Import {matchedCount} Movies
        </Button>
      </div>
    </div>
  );
} 