export interface ContentRequest {
  prompt: string;
  contentType: 'social_post' | 'email' | 'product_description';
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  maxLength?: number;
  language?: string;
}
