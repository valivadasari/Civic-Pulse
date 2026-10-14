export type IssueCategory = 'Pothole' | 'Garbage' | 'Blocked Drain' | 'Water Leakage' | 'Other';

export type IssuePriority = 'Low' | 'Medium' | 'High';

export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';

export interface LocationCoords {
  lat: number;
  lng: number;
  address: string;
  neighborhood?: string;
}

export interface AIAnalysisResult {
  likelyCategory: IssueCategory;
  summary: string;
  recommendedPriority: IssuePriority;
  reasoning: string;
  nextAction: string;
  confidence: number; // 0 to 1
  hazardScore: number; // 1 to 10
  isSimulated: boolean;
  analyzedAt: string;
  detectedFeatures?: string[];
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location: LocationCoords;
  imageUrl: string;
  createdAt: string; // ISO String
  updatedAt: string;
  resolvedAt?: string;
  isDemo: boolean;
  reporterName?: string;
  upvotes: number;
  aiAnalysis?: AIAnalysisResult;
  priorityOverrideReason?: string;
  statusHistory?: {
    status: IssueStatus;
    timestamp: string;
    note?: string;
  }[];
}

export type ActiveTab = 'dashboard' | 'report' | 'map' | 'manage' | 'analytics';

export interface FilterState {
  searchQuery: string;
  category: string;
  priority: string;
  status: string;
  showDemoOnly: 'all' | 'demo' | 'genuine';
}
