import React, { useState } from 'react';
import { useImport } from '../ImportContext';

interface ImportSummaryProps {
  onImportComplete?: () => void;
}

const ImportSummary: React.FC<ImportSummaryProps> = ({ onImportComplete }) => {
  const { state, dispatch } = useImport();
  const [isImporting, setIsImporting] = useState(false);

  const handleFinishImport = () => {
    setIsImporting(true);

    // Call the onImportComplete callback
    if (onImportComplete) {
      onImportComplete();
    }

    // Simulate finalizing the import - in a real app, this would save to backend
    setTimeout(() => {
      alert(`Successfully imported ${state.importSummary?.imported} movies.`);
      setIsImporting(false);
      dispatch({
        type: 'SET_STEP',
        payload: 'select'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Import Summary</h2>
        <p className="text-muted-foreground">
          Review your import results before finalizing
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{state.importSummary?.total || 0}</div>
              <p className="text-sm text-muted-foreground">Total movies</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{state.importSummary?.imported || 0}</div>
              <p className="text-sm text-muted-foreground">Imported</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{state.importSummary?.skipped || 0}</div>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{state.importSummary?.failed || 0}</div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-center space-x-2 text-center mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-green-500" 
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
            <h3 className="text-lg font-medium">Ready to complete import</h3>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Your movies have been processed and are ready to be added to your collection.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => dispatch({
                type: 'SET_STEP',
                payload: 'validate'
              })}
              className="py-2 px-4 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
            >
              Back to validation
            </button>
            <button 
              onClick={handleFinishImport} 
              disabled={isImporting}
              className="py-2 px-4 rounded-md bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isImporting ? 'Importing...' : 'Finish import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary; 