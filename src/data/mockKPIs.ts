export interface KPIEntry {
  month: string;       // "2025-05"
  label: string;       // "Mai 2025"
  mrr: number;
  growth_mom: number;  // %
  active_customers: number;
  churn: number;       // %
  runway: number;      // mois
  cac: number;         // €
}

const mockKPIs: KPIEntry[] = [
  { month: '2025-05', label: 'Mai 25',  mrr: 2_000,  growth_mom: 0,    active_customers: 8,  churn: 6.5, runway: 18, cac: 320 },
  { month: '2025-06', label: 'Juin 25', mrr: 2_800,  growth_mom: 40,   active_customers: 11, churn: 6.2, runway: 17, cac: 305 },
  { month: '2025-07', label: 'Juil 25', mrr: 3_600,  growth_mom: 28.6, active_customers: 15, churn: 5.8, runway: 17, cac: 290 },
  { month: '2025-08', label: 'Août 25', mrr: 4_500,  growth_mom: 25,   active_customers: 19, churn: 5.5, runway: 16, cac: 278 },
  { month: '2025-09', label: 'Sep 25',  mrr: 5_800,  growth_mom: 28.9, active_customers: 24, churn: 5.1, runway: 15, cac: 262 },
  { month: '2025-10', label: 'Oct 25',  mrr: 7_200,  growth_mom: 24.1, active_customers: 30, churn: 4.9, runway: 14, cac: 248 },
  { month: '2025-11', label: 'Nov 25',  mrr: 8_600,  growth_mom: 19.4, active_customers: 35, churn: 4.7, runway: 13, cac: 235 },
  { month: '2025-12', label: 'Déc 25',  mrr: 9_800,  growth_mom: 14,   active_customers: 39, churn: 4.5, runway: 12, cac: 225 },
  { month: '2026-01', label: 'Jan 26',  mrr: 11_000, growth_mom: 12.2, active_customers: 43, churn: 4.3, runway: 11, cac: 212 },
  { month: '2026-02', label: 'Fév 26',  mrr: 12_000, growth_mom: 9.1,  active_customers: 46, churn: 4.2, runway: 10, cac: 205 },
  { month: '2026-03', label: 'Mar 26',  mrr: 13_500, growth_mom: 12.5, active_customers: 49, churn: 4.0, runway: 9,  cac: 195 },
  { month: '2026-04', label: 'Avr 26',  mrr: 15_000, growth_mom: 11.1, active_customers: 52, churn: 3.8, runway: 9,  cac: 183 },
];

export const currentKPIs = mockKPIs[mockKPIs.length - 1];
export const previousKPIs = mockKPIs[mockKPIs.length - 2];

export default mockKPIs;
