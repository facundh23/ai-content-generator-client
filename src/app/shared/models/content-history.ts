import { GeneratedContent } from './generated-content';

export interface ContentHistory {
  items: GeneratedContent[];
  totalCount: number;
  lastUpdated: string;
}

export interface ContentHistoryFilter {
  contentType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}
