import { DOCUMENT } from '@angular/common';
import { Injectable, type WritableSignal, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _THEME_KEY = 'theme' as const;

  isDarkTheme: WritableSignal<boolean> = signal(this._getInitialThemeState());

  constructor() {
    this._initTheme();
  }

  private _initTheme(): void {
    this._applyTheme();
    this._setupSystemPreferenceListener();
  }

  toggleTheme(): void {
    this.isDarkTheme.update((isDark: boolean): boolean => !isDark);
    this._saveThemePreference();
    this._applyTheme();
  }

  private _getInitialThemeState(): boolean {
    const savedTheme = localStorage.getItem(this._THEME_KEY) as Theme;

    return (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  }

  private _saveThemePreference(): void {
    localStorage.setItem(
      this._THEME_KEY,
      this.isDarkTheme() ? 'dark' : 'light',
    );
  }

  private _applyTheme(): void {
    this._document.documentElement.classList.toggle('dark', this.isDarkTheme());
  }

  private _setupSystemPreferenceListener(): void {
    if (!localStorage.getItem(this._THEME_KEY)) {
      const mediaQuery: MediaQueryList = window.matchMedia(
        '(prefers-color-scheme: dark)',
      );

      const handleChange = (event: MediaQueryListEvent): void => {
        this.isDarkTheme.set(event.matches);
        this._applyTheme();
      };

      mediaQuery.addEventListener('change', handleChange);
    }
  }
}
