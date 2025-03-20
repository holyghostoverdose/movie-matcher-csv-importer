
import React from 'react';
import MovieImporter from '@/components/MovieImporter';
import { ImportProvider } from '@/context/ImportContext';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ImportProvider>
        <MovieImporter />
      </ImportProvider>
    </div>
  );
};

export default Index;
