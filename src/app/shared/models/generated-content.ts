export interface GeneratedContent {
  id:string;
  content:string;
  contentType:string;
  originalPrompt: string;
  tokensUsed: number;
  generatedAt:string;
  metadata:any
}
