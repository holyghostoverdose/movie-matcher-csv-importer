
import { MovieMatch } from "@/types";
import Papa from "papaparse";

/**
 * Generates a CSV string from a list of unmatched movies
 */
export const generateUnmatchedMoviesCsv = (unmatchedMovies: MovieMatch[]): string => {
  // Extract the relevant data from the unmatched movies
  const csvData = unmatchedMovies.map(movie => ({
    title: movie.detectedTitle,
    year: movie.detectedYear || '',
    date: movie.detectedDate || '',
    rating: movie.detectedRating || '',
    rawData: movie.csvData.join(', ')
  }));

  // Generate the CSV string
  return Papa.unparse(csvData, {
    header: true,
    delimiter: ",",
  });
};

/**
 * Triggers a download of a CSV file containing unmatched movies
 */
export const downloadUnmatchedMovies = (unmatchedMovies: MovieMatch[]): void => {
  if (unmatchedMovies.length === 0) return;
  
  const csvString = generateUnmatchedMoviesCsv(unmatchedMovies);
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  // Create a link element and trigger the download
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `unmatched_movies_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};
