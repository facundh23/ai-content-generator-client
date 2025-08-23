import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState, initialAppState } from '../../shared/models/app-state';
import { GeneratedContent } from '../../shared/models/generated-content';
import { ContentHistoryFilter } from '../../shared/models/content-history';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  //  BehaviorSubject = Observable + valor inicial + último valor siempre disponible
  private readonly stateSubject = new BehaviorSubject<AppState>(
    initialAppState
  );

  //  Observable público para que componentes se suscriban
  public readonly state$ = this.stateSubject.asObservable();

  constructor() {
    // Cargar estado desde localStorage si existe
    this.loadStateFromStorage();
  }

  // Getters para acceso directo al estado actual
  get currentState(): AppState {
    return this.stateSubject.value;
  }

  get isLoading(): boolean {
    return this.currentState.isLoading;
  }

  get error(): string | null {
    return this.currentState.error;
  }

  get currentContent(): GeneratedContent | null {
    return this.currentState.currentContent;
  }

  get contentHistory(): GeneratedContent[] {
    return this.currentState.contentHistory;
  }

  // Observables específicos para componentes
  public readonly isLoading$ = this.state$.pipe(
    map((state) => state.isLoading)
  );

  public readonly error$ = this.state$.pipe(map((state) => state.error));
  public readonly currentContent$ = this.state$.pipe(
    map((state) => state.currentContent)
  );
  public readonly contentHistory$ = this.state$.pipe(
    map((state) => state.contentHistory)
  );
  public readonly stats$ = this.state$.pipe(map((state) => state.stats));

  // Métodos para actualizar el estado
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setCurrentContent(content: GeneratedContent | null): void {
    this.updateState({
      currentContent: content,
      error: null, // Limpiar error si hay contenido exitoso
    });
  }

  addToHistory(content: GeneratedContent): void {
    const currentHistory = this.currentState.contentHistory;
    const newHistory = [content, ...currentHistory].slice(0, 50); // Máximo 50 items

    const newStats = {
      totalGenerated: this.currentState.stats.totalGenerated + 1,
      totalTokensUsed:
        this.currentState.stats.totalTokensUsed + content.tokensUsed,
      lastGeneratedAt: new Date().toISOString(),
    };

    this.updateState({
      contentHistory: newHistory,
      stats: newStats,
      currentContent: content,
    });

    // Guardar en el localstorage
    this.saveStateToStorage();
  }

  clearHistory(): void {
    this.updateState({
      contentHistory: [],
      stats: {
        totalGenerated: 0,
        totalTokensUsed: 0,
        lastGeneratedAt: null,
      },
    });
    this.saveStateToStorage();
  }

  removeFromHistory(contentId: string): void {
    const filteredHistory = this.currentState.contentHistory.filter(
      (item) => item.id !== contentId
    );

    this.updateState({ contentHistory: filteredHistory });
    this.saveStateToStorage();
  }

  // Filtrar historial
  getFilteredHistory$(
    filter: ContentHistoryFilter
  ): Observable<GeneratedContent[]> {
    return this.contentHistory$.pipe(
      map((history) => this.filterHistory(history, filter))
    );
  }

  updateUserPreferences(
    preferences: Partial<AppState['userPreferences']>
  ): void {
    const currentPreferences = this.currentState.userPreferences;
    const updatedPreferences = { ...currentPreferences, ...preferences };

    this.updateState({ userPreferences: updatedPreferences });
    this.saveStateToStorage();
  }

  // Limpiar estado actual (mantener el historial)
  clearCurrentState(): void {
    this.updateState({
      isLoading: false,
      error: null,
      currentContent: null,
    });
  }

  // Reset Completo
  resetState(): void {
    this.updateState(initialAppState);
    localStorage.removeItem('ai-content-generator-state');
  }

  // Metodos Privados
  private updateState(partialState: Partial<AppState>): void {
    const currentState = this.currentState;
    const newState = { ...currentState, ...partialState };
    this.stateSubject.next(newState);
  }

  private filterHistory(
    history: GeneratedContent[],
    filter: ContentHistoryFilter
  ): GeneratedContent[] {
    return history.filter((item) => {
      // filtrar por tipo de contenido
      if (filter.contentType && item.contentType !== filter.contentType) {
        return false;
      }

      // Filtrar por fecha
      const itemDate = new Date(item.generatedAt);
      if (filter.dateFrom && itemDate < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && itemDate > filter.dateTo) {
        return false;
      }

      // Filtrar por término de búsqueda
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const contentMatch = item.content.toLowerCase().includes(searchLower);
        const promptMatch = item.originalPrompt
          .toLowerCase()
          .includes(searchLower);

        if (!contentMatch && !promptMatch) {
          return false;
        }
      }
      return true;
    });
  }

  private saveStateToStorage(): void {
    try {
      const stateToSave = {
        contentHistory: this.currentState.contentHistory,
        userPreferences: this.currentState.userPreferences,
        stats: this.currentState.stats,
      };
      localStorage.setItem(
        'ai-content-generator-state',
        JSON.stringify(stateToSave)
      );
    } catch (error) {
      console.warn('No se pudo guardar el estado en localStorage:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const savedState = localStorage.getItem('ai-content-generator-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.updateState({
          contentHistory: parsedState.contentHistory || [],
          userPreferences:
            parsedState.userPreferences || initialAppState.userPreferences,
          stats: parsedState.stats || initialAppState.stats,
        });
      }
    } catch (error) {
      console.warn('No se pudo cargar el estado desde localStorage:', error);
    }
  }
}
