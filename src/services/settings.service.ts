import { Injectable, signal, effect } from '@angular/core';

const AI_FEATURE_STORAGE_KEY = 'mga365_ai_feature_enabled';
const API_KEY_STORAGE_KEY = 'mga365_api_key';

@Injectable({ providedIn: 'root' })
export class SettingsService {

  private getInitialState<T>(key: string, defaultValue: T): T {
    try {
      const savedState = localStorage.getItem(key);
      return savedState ? JSON.parse(savedState) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage`, error);
      localStorage.removeItem(key);
      return defaultValue;
    }
  }

  readonly isAiFeatureEnabled = signal<boolean>(this.getInitialState<boolean>(AI_FEATURE_STORAGE_KEY, true));
  readonly apiKey = signal<string | null>(this.getInitialState<string | null>(API_KEY_STORAGE_KEY, null));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(AI_FEATURE_STORAGE_KEY, JSON.stringify(this.isAiFeatureEnabled()));
      } catch (error) {
        console.error('Error saving AI feature setting to localStorage', error);
      }
    });
    effect(() => {
      try {
        const key = this.apiKey();
        if (key) {
          localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(key));
        } else {
          localStorage.removeItem(API_KEY_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving API key to localStorage', error);
      }
    });
  }
  
  toggleAiFeature() {
    this.isAiFeatureEnabled.update(enabled => !enabled);
  }

  setApiKey(key: string | null) {
    this.apiKey.set(key);
  }
}