import { GeneratedContent } from './generated-content';
export interface AppState {
  isLoading: boolean;
  error: string | null;

  //* Contenido actual
  currentContent: GeneratedContent | null;

  //* Historial
  contentHistory: GeneratedContent[];

  //* Configuraciçon de usuario
  userPreferences: {
    defaultContentType: string;
    defaultTone: string;
    defaultLanguage: string;
  };

  //* Estadisticas
  stats: {
    totalGenerated: number;
    totalTokensUsed: number;
    lastGeneratedAt: string | null;
  };
}

export const initialAppState: AppState = {
  isLoading: false,
  error: null,
  currentContent: null,
  contentHistory: [],
  userPreferences: {
    defaultContentType: 'social_post',
    defaultTone: 'friendly',
    defaultLanguage: 'es',
  },
  stats: {
    totalGenerated: 0,
    totalTokensUsed: 0,
    lastGeneratedAt: null,
  },
};
