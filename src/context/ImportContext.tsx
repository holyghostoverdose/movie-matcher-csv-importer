
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MovieMatch, ImportOptions, ImportSummary, CSVParsingResult } from '@/types';

// Import context state
interface ImportState {
  csvData: CSVParsingResult | null;
  matches: MovieMatch[];
  importOptions: ImportOptions;
  isLoading: boolean;
  currentStep: 'select' | 'validate' | 'summary';
  error: string | null;
  importSummary: ImportSummary | null;
}

// Import context actions
type ImportAction =
  | { type: 'SET_CSV_DATA'; payload: CSVParsingResult }
  | { type: 'SET_MATCHES'; payload: MovieMatch[] }
  | { type: 'UPDATE_MATCH'; payload: { index: number; match: Partial<MovieMatch> } }
  | { type: 'SET_IMPORT_OPTIONS'; payload: ImportOptions }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STEP'; payload: ImportState['currentStep'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IMPORT_SUMMARY'; payload: ImportSummary }
  | { type: 'RESET' };

// Initial state
const initialState: ImportState = {
  csvData: null,
  matches: [],
  importOptions: {
    type: 'watched',
    duplicateHandling: 'skip',
  },
  isLoading: false,
  currentStep: 'select',
  error: null,
  importSummary: null,
};

// Reducer function
function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'SET_CSV_DATA':
      return { ...state, csvData: action.payload, error: null };
    
    case 'SET_MATCHES':
      return { ...state, matches: action.payload };
    
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map((match, index) =>
          index === action.payload.index
            ? { ...match, ...action.payload.match }
            : match
        ),
      };
    
    case 'SET_IMPORT_OPTIONS':
      return { ...state, importOptions: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_IMPORT_SUMMARY':
      return { ...state, importSummary: action.payload };
    
    case 'RESET':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Create context
const ImportContext = createContext<{
  state: ImportState;
  dispatch: React.Dispatch<ImportAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Context provider
export function ImportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(importReducer, initialState);
  
  return (
    <ImportContext.Provider value={{ state, dispatch }}>
      {children}
    </ImportContext.Provider>
  );
}

// Hook for using import context
export function useImport() {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
}
