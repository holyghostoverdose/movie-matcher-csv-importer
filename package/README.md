# Movie Matcher CSV Importer

A React component library for importing movie data from CSV files and matching them with TMDB (The Movie Database) data.

## Features

- Import movies from CSV files (Letterboxd, IMDb, or custom formats)
- Auto-detect CSV column types (movie titles, years, dates, ratings)
- Match movies against TMDB data
- Validate and correct matches
- Import summary with stats
- Customizable import options (watched, rated, watchlist)

## Installation

```bash
npm install movie-matcher-csv-importer
```

## Usage

### Basic Example

```jsx
import React from 'react';
import { MovieImporter, ImportProvider } from 'movie-matcher-csv-importer';
import 'movie-matcher-csv-importer/dist/styles.css'; // Import styles

const App = () => {
  const handleImportComplete = (movies) => {
    console.log('Imported movies:', movies);
    // Add movies to your app's state or send to your backend
  };

  return (
    <div className="app">
      <ImportProvider>
        <MovieImporter 
          onImportComplete={handleImportComplete}
          tmdbApiKey="YOUR_TMDB_API_KEY" // Get this from themoviedb.org
        />
      </ImportProvider>
    </div>
  );
};

export default App;
```

### Required Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom 
```

### Styling

The component uses minimal styling that works with most design systems. You can customize the appearance by overriding the CSS classes.

## API

### `<MovieImporter />`

The main component for importing movies.

| Prop | Type | Description |
|------|------|-------------|
| `onImportComplete` | `function(movies)` | Callback fired when import is completed |
| `tmdbApiKey` | `string` | Your TMDB API key |

### `<ImportProvider />`

Context provider that manages the import state. Must wrap the `MovieImporter` component.

```jsx
<ImportProvider>
  <MovieImporter />
</ImportProvider>
```

### Utilities

The package also exports several utilities:

```jsx
import { 
  configureTMDB, 
  searchMovies,
  parseCSV
} from 'movie-matcher-csv-importer';

// Configure TMDB API
configureTMDB({ apiKey: 'YOUR_TMDB_API_KEY' });

// Search for movies
const searchResults = await searchMovies('The Matrix', 1999);

// Parse a CSV file
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const parsedData = await parseCSV(file);
```

## Data Types

### Movie Object

```typescript
interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  year?: number;
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  genres?: Array<{ id: number; name: string }>;
  releaseDate?: string;
  watchedDate?: string;
  ratingDate?: string;
  rating?: number;
  status: 'watched' | 'rated' | 'watchlist';
  importConfidence?: number;
  originalData?: Record<string, string>;
}
```

## License

MIT 