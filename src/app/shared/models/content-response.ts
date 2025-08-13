import { GeneratedContent } from './generated-content';

export interface ContentResponse {
  success: boolean;
  data: GeneratedContent;
  error?: string;
}
