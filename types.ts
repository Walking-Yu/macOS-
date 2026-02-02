export interface KeyStats {
  totalPresses: number;
  keyCounts: Record<string, number>;
  startTime: number;
  lastPressTime: number;
}

export interface AnalysisResult {
  tone: string;
  summary: string;
  suggestions: string[];
  wpmEstimate: number;
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
}
