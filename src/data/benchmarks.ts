export type Sector = 'SaaS B2B' | 'HealthTech' | 'GreenTech' | 'DeepTech';
export type Stage  = 'pre-seed' | 'seed' | 'series-a';

export interface BenchmarkValues {
  mrr_median: number;
  growth_mom_median: number;
  active_customers_median: number;
  churn_median: number;
  runway_median: number;
  cac_median: number;
}

type BenchmarkMap = Record<Sector, Record<Stage, BenchmarkValues>>;

const benchmarks: BenchmarkMap = {
  'SaaS B2B': {
    'pre-seed': { mrr_median: 0,      growth_mom_median: 0,    active_customers_median: 0,   churn_median: 0,   runway_median: 12, cac_median: 0   },
    'seed':     { mrr_median: 10_000, growth_mom_median: 15,   active_customers_median: 30,  churn_median: 5,   runway_median: 14, cac_median: 250 },
    'series-a': { mrr_median: 80_000, growth_mom_median: 20,   active_customers_median: 150, churn_median: 3,   runway_median: 18, cac_median: 350 },
  },
  'HealthTech': {
    'pre-seed': { mrr_median: 0,      growth_mom_median: 0,    active_customers_median: 0,   churn_median: 0,   runway_median: 15, cac_median: 0   },
    'seed':     { mrr_median: 5_000,  growth_mom_median: 10,   active_customers_median: 15,  churn_median: 4,   runway_median: 16, cac_median: 400 },
    'series-a': { mrr_median: 50_000, growth_mom_median: 15,   active_customers_median: 80,  churn_median: 2.5, runway_median: 20, cac_median: 600 },
  },
  'GreenTech': {
    'pre-seed': { mrr_median: 0,      growth_mom_median: 0,    active_customers_median: 0,   churn_median: 0,   runway_median: 14, cac_median: 0   },
    'seed':     { mrr_median: 8_000,  growth_mom_median: 12,   active_customers_median: 20,  churn_median: 6,   runway_median: 13, cac_median: 320 },
    'series-a': { mrr_median: 60_000, growth_mom_median: 18,   active_customers_median: 100, churn_median: 4,   runway_median: 18, cac_median: 450 },
  },
  'DeepTech': {
    'pre-seed': { mrr_median: 0,      growth_mom_median: 0,    active_customers_median: 0,   churn_median: 0,   runway_median: 18, cac_median: 0   },
    'seed':     { mrr_median: 3_000,  growth_mom_median: 8,    active_customers_median: 8,   churn_median: 3,   runway_median: 18, cac_median: 500 },
    'series-a': { mrr_median: 40_000, growth_mom_median: 12,   active_customers_median: 40,  churn_median: 2,   runway_median: 24, cac_median: 700 },
  },
};

export function getBenchmark(sector: Sector, stage: Stage): BenchmarkValues {
  return benchmarks[sector]?.[stage] ?? benchmarks['SaaS B2B']['seed'];
}

export default benchmarks;
