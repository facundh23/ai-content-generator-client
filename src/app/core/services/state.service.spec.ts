import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';
import { GeneratedContent } from '../../shared/models/generated-content';
import { initialAppState } from '../../shared/models/app-state';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);

    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with initial state', () => {
    expect(service.currentState).toEqual(initialAppState);
    expect(service.isLoading).toBe(false);
    expect(service.error).toBe(null);
    expect(service.currentContent).toBe(null);
    expect(service.contentHistory).toEqual([]);
  });

  it('should update loading state', () => {
    service.setLoading(true);
    expect(service.isLoading).toBe(true);

    service.setLoading(false);
    expect(service.isLoading).toBe(false);
  });

  it('should update error state', () => {
    const errorMessage = 'Test error';
    service.setError(errorMessage);
    expect(service.error).toBe(errorMessage);

    service.setError(null);
    expect(service.error).toBe(null);
  });

  it('should add content to history', () => {
    const mockContent: GeneratedContent = {
      id: 'test-1',
      content: 'Test content',
      contentType: 'social_post',
      originalPrompt: 'Test prompt',
      tokensUsed: 50,
      generatedAt: new Date().toISOString(),
      metadata: {},
    };

    service.addToHistory(mockContent);

    expect(service.contentHistory.length).toBe(1);
    expect(service.contentHistory[0]).toEqual(mockContent);
    expect(service.currentContent).toEqual(mockContent);
    expect(service.currentState.stats.totalGenerated).toBe(1);
    expect(service.currentState.stats.totalTokensUsed).toBe(50);
  });

  it('should limit history to 50 items', () => {
    // Agregar 52 items
    for (let i = 0; i < 52; i++) {
      const mockContent: GeneratedContent = {
        id: `test-${i}`,
        content: `Test content ${i}`,
        contentType: 'social_post',
        originalPrompt: `Test prompt ${i}`,
        tokensUsed: 10,
        generatedAt: new Date().toISOString(),
        metadata: {},
      };
      service.addToHistory(mockContent);
    }

    expect(service.contentHistory.length).toBe(50);
    expect(service.contentHistory[0].id).toBe('test-51'); // El más reciente
  });

  it('should clear history', () => {
    const mockContent: GeneratedContent = {
      id: 'test-1',
      content: 'Test content',
      contentType: 'social_post',
      originalPrompt: 'Test prompt',
      tokensUsed: 50,
      generatedAt: new Date().toISOString(),
      metadata: {},
    };

    service.addToHistory(mockContent);
    expect(service.contentHistory.length).toBe(1);

    service.clearHistory();
    expect(service.contentHistory.length).toBe(0);
    expect(service.currentState.stats.totalGenerated).toBe(0);
  });

  it('should emit state changes through observables', (done) => {
    service.isLoading$.subscribe((isLoading) => {
      if (isLoading) {
        expect(isLoading).toBe(true);
        done();
      }
    });

    service.setLoading(true);
  });

  it('should update user preferences', () => {
    const newPreferences = {
      defaultContentType: 'email',
      defaultTone: 'professional',
    };

    service.updateUserPreferences(newPreferences);

    expect(service.currentState.userPreferences.defaultContentType).toBe(
      'email'
    );
    expect(service.currentState.userPreferences.defaultTone).toBe(
      'professional'
    );
    expect(service.currentState.userPreferences.defaultLanguage).toBe('es'); // No cambiado
  });
});
