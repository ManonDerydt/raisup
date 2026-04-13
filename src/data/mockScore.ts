export interface ScoreEntry {
  month: string;
  label: string;
  total: number;
  pitch: number;
  traction: number;
  team: number;
  market: number;
}

const mockScoreHistory: ScoreEntry[] = [
  { month: '2025-11', label: 'Nov 25', total: 42, pitch: 12, traction: 9,  team: 12, market: 9  },
  { month: '2025-12', label: 'Déc 25', total: 48, pitch: 14, traction: 11, team: 13, market: 10 },
  { month: '2026-01', label: 'Jan 26', total: 53, pitch: 15, traction: 12, team: 14, market: 12 },
  { month: '2026-02', label: 'Fév 26', total: 57, pitch: 16, traction: 13, team: 15, market: 13 },
  { month: '2026-03', label: 'Mar 26', total: 62, pitch: 17, traction: 14, team: 17, market: 14 },
  { month: '2026-04', label: 'Avr 26', total: 67, pitch: 19, traction: 16, team: 18, market: 14 },
];

export const currentScore = mockScoreHistory[mockScoreHistory.length - 1];

export default mockScoreHistory;
