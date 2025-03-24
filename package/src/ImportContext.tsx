import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ImportState, ImportAction, ImportOptions, CSVParsingResult, ImportSummary } from './types';

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
    
    case 'RESET_STATE':
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