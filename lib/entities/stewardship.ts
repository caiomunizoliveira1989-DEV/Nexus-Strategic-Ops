export interface PublicSpaceIssue {
  id: string;
  territoryId: string;
  spaceName: string;
  category: 'iluminacao' | 'pavimentacao' | 'saneamento' | 'limpeza' | 'mobilidade';
  description: string;
  reportedAt: string;
  priority: number;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt: string;
  upvotes: number;
}
