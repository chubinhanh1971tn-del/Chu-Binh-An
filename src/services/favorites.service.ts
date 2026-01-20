import { Injectable, signal, effect } from '@angular/core';

const FAVORITES_STORAGE_KEY = 'mga365_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private getInitialFavorites(): Set<number> {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (error) {
      console.error('Error reading favorites from localStorage', error);
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
    return new Set<number>();
  }

  readonly favoriteIds = signal<Set<number>>(this.getInitialFavorites());

  constructor() {
    effect(() => {
      try {
        const ids = Array.from(this.favoriteIds());
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
      } catch (error) {
        console.error('Error saving favorites to localStorage', error);
      }
    });
  }
  
  toggleFavorite(propertyId: number) {
    this.favoriteIds.update(currentFavorites => {
      const newFavorites = new Set(currentFavorites);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  }
}