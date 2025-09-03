import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Generates a CSV file from data and triggers a download
 * @param data Array of objects to convert to CSV
 * @param filename Name of the file to download
 * @param metadata Optional metadata to include at the top of the CSV
 */
export function downloadCSV(data: Record<string, string | number | boolean | null | undefined>[], filename: string, metadata?: string[]): void {
  if (!data || !data.length) {
    console.warn('No data provided for CSV download');
    return;
  }

  // Start with metadata if provided
  let csvContent = '';
  if (metadata && metadata.length) {
    // For metadata lines, quote each string to prevent commas from causing column splits
    metadata.forEach(line => {
      // The entire metadata line is treated as a single column, with empty columns for the rest
      // Number of empty columns should match the number of headers in the data
      const emptyCols = Object.keys(data[0]).length - 1;
      const emptyColsStr = emptyCols > 0 ? ','.repeat(emptyCols) : '';
      csvContent += `"${line}"${emptyColsStr}\n`;
    });
    // Add an empty line after metadata
    csvContent += '\n';
  }
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] === null || row[header] === undefined ? '' : row[header];
      // Handle values with commas by wrapping in quotes
      const formattedValue = typeof value === 'string' && value.includes(',') ? 
        `"${value}"` : value.toString();
      return formattedValue;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create and trigger download link
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
