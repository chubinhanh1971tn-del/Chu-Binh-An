import { Injectable, signal, effect } from '@angular/core';
// FIX: Corrected the import path for FilterCriteria. It's defined in property.model.ts.
import { FilterCriteria } from '../models/property.model';

export interface SavedSearch {
  name: string;
  filters: FilterCriteria;
}

const SAVED_SEARCHES_STORAGE_KEY = 'ndtn365_saved_searches';

@Injectable({ providedIn: 'root' })
export class SavedSearchesService {

  private getInitialSearches(): SavedSearch[] {
    try {
      const saved = localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading saved searches from localStorage', error);
      localStorage.removeItem(SAVED_SEARCHES_STORAGE_KEY);
    }
    return [];
  }
  
  readonly searches = signal<SavedSearch[]>(this.getInitialSearches());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(this.searches()));
      } catch (error) {
        console.error('Error saving searches to localStorage', error);
      }
    });
  }

  saveSearch(name: string, filters: FilterCriteria) {
    this.searches.update(currentSearches => {
      const existingIndex = currentSearches.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
      const newSearch = { name, filters };
      if (existingIndex > -1) {
        // Update existing search
        const updatedSearches = [...currentSearches];
        updatedSearches[existingIndex] = newSearch;
        return updatedSearches;
      } else {
        // Add new search
        return [...currentSearches, newSearch];
      }
    });
  }

  deleteSearch(name: string) {
    this.searches.update(currentSearches => currentSearches.filter(s => s.name !== name));
  }
}