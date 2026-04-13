export interface TestStartup {
  id: string;
  name: string;
  sector: string;
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b';
  fundingAmount: number;    // montant recherché en euros
  mrr: number;              // revenus mensuels en euros
  location: string;
  description: string;
  emoji: string;
}

const testStartups: TestStartup[] = [
  {
    id: 'saas-b2b',
    name: 'FlowSync',
    sector: 'SaaS',
    stage: 'seed',
    fundingAmount: 500_000,
    mrr: 10_000,
    location: 'Paris',
    description: 'Outil de synchronisation no-code pour équipes commerciales B2B. 45 clients, 10K€ MRR.',
    emoji: '🔧',
  },
  {
    id: 'healthtech',
    name: 'MedIA',
    sector: 'HealthTech',
    stage: 'pre-seed',
    fundingAmount: 300_000,
    mrr: 0,
    location: 'Lyon',
    description: 'IA de détection précoce des cancers cutanés. Validée sur 5 000 images, en attente CE.',
    emoji: '🏥',
  },
  {
    id: 'greentech',
    name: 'CarbonLoop',
    sector: 'GreenTech',
    stage: 'series-a',
    fundingAmount: 3_000_000,
    mrr: 200_000,
    location: 'Paris',
    description: 'Plateforme de compensation carbone vérifiée pour ETI. 200K€ MRR, 30 clients.',
    emoji: '🌱',
  },
  {
    id: 'deeptech-ia',
    name: 'NeuralEdge',
    sector: 'IA',
    stage: 'seed',
    fundingAmount: 1_000_000,
    mrr: 50_000,
    location: 'Paris',
    description: 'LLM spécialisé pour le droit français. Spinoff INRIA, 3 brevets déposés, 50K€ MRR.',
    emoji: '🤖',
  },
  {
    id: 'fintech',
    name: 'PayLater Pro',
    sector: 'FinTech',
    stage: 'pre-seed',
    fundingAmount: 200_000,
    mrr: 0,
    location: 'Bordeaux',
    description: 'BNPL B2B pour artisans et TPE. MVP live, 12 pilotes en cours, fondateur ex-Crédit Agricole.',
    emoji: '💳',
  },
];

export default testStartups;
