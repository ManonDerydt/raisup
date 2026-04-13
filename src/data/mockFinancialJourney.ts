export interface JourneyStep {
  id: string;
  badge: string;                // "NOW" | "SEED" | "A" | "B" | "C" | "EXIT"
  status: 'completed' | 'current' | 'future';
  title: string;
  subtitle: string;
  description: string;
  estimatedDate: string;
  probability?: number;         // 0-100, undefined for current/completed
  raise?: { amount: string; valuation: string };
  conditions?: string[];        // "Ce qu'il faut atteindre"
  capitalAfter?: { founders: number; current: number; new: number };
  dilutiveMix?: number;         // % dilutif
  kpis?: { label: string; value: string }[];
  equityBadges?: { label: string; color: string }[];
  timeToNext?: string;
}

export interface FinancialJourneyData {
  goal: {
    valuation: string;
    totalRaise: string;
    horizon: string;
    maxDilution: string;
  };
  current: {
    stage: string;
    mrr: number;
    clients: number;
    growth: number;
    churn: number;
    runway: number;
    valuation: string;
    raisupScore: number;
  };
  steps: JourneyStep[];
  globalProgress: number; // 0-100
}

const mockFinancialJourney: FinancialJourneyData = {
  goal: {
    valuation: '50M€',
    totalRaise: '8M€',
    horizon: '4 à 6 ans',
    maxDilution: '35%',
  },
  current: {
    stage: 'Seed',
    mrr: 12000,
    clients: 38,
    growth: 14,
    churn: 4.2,
    runway: 10,
    valuation: '2,5M€',
    raisupScore: 74,
  },
  steps: [
    {
      id: 'now',
      badge: 'MAINTENANT',
      status: 'current',
      title: 'Situation actuelle · Seed',
      subtitle: 'Vous êtes ici',
      description: 'Seed round de 750K€ réalisé. Vous avez 10 mois de runway et 12K€ MRR avec une croissance saine de 14% MoM.',
      estimatedDate: 'Aujourd\'hui',
      equityBadges: [
        { label: 'Fondateurs 85%', color: 'green' },
        { label: 'Investisseurs 15%', color: 'blue' },
      ],
      kpis: [
        { label: 'MRR', value: '12K€' },
        { label: 'Clients', value: '38' },
        { label: 'Croissance', value: '+14%' },
        { label: 'Churn', value: '4.2%' },
      ],
      timeToNext: 'Prochaine étape recommandée dans 8 à 14 mois selon votre croissance',
    },
    {
      id: 'series-a',
      badge: 'A',
      status: 'future',
      title: 'Série A · Q3 2025',
      subtitle: 'Objectif : 3M€ pour une valorisation de 12 à 15M€',
      description: 'Premier tour institutionnel. Vous devez démontrer un modèle scalable avec des métriques solides et une équipe étoffée.',
      estimatedDate: 'Q3 2025',
      probability: 68,
      raise: { amount: '3M€', valuation: '12-15M€' },
      conditions: [
        '28K€ MRR minimum',
        'Churn < 5% mensuel',
        'Équipe de 8 personnes minimum',
      ],
      dilutiveMix: 80,
      capitalAfter: { founders: 62, current: 11, new: 27 },
      kpis: [
        { label: 'MRR cible', value: '28K€' },
        { label: 'Clients cible', value: '90+' },
        { label: 'Équipe', value: '8 pers.' },
        { label: 'Runway post', value: '18 mois' },
      ],
    },
    {
      id: 'series-b',
      badge: 'B',
      status: 'future',
      title: 'Série B · 2027',
      subtitle: 'Objectif : 4M€ pour une valorisation de 25 à 30M€',
      description: 'Tour de croissance. Accélération commerciale et internationalisation. Démontrer une efficacité d\'acquisition à grande échelle.',
      estimatedDate: '2027',
      probability: 42,
      raise: { amount: '4M€', valuation: '25-30M€' },
      conditions: [
        '120K€ MRR minimum',
        'NRR > 110%',
        'Présence dans 3 marchés',
      ],
      dilutiveMix: 75,
      capitalAfter: { founders: 48, current: 22, new: 30 },
      kpis: [
        { label: 'MRR cible', value: '120K€' },
        { label: 'ARR', value: '1,4M€' },
        { label: 'Pays', value: '3+' },
        { label: 'Équipe', value: '25 pers.' },
      ],
    },
    {
      id: 'series-c',
      badge: 'C',
      status: 'future',
      title: 'Série C · 2029-2030',
      subtitle: 'Valorisation cible 50M€',
      description: 'Tour pré-exit ou IPO. Positionnement pour un exit stratégique ou une introduction en bourse.',
      estimatedDate: '2029-2030',
      probability: 28,
      raise: { amount: '1M€', valuation: '45-55M€' },
      conditions: [
        '500K€ MRR ou plus',
        'Rentabilité opérationnelle',
        'Leader sur le marché FR',
      ],
      dilutiveMix: 60,
      capitalAfter: { founders: 38, current: 27, new: 35 },
      kpis: [
        { label: 'ARR cible', value: '6M€+' },
        { label: 'Marge brute', value: '> 70%' },
        { label: 'EBITDA', value: 'Positif' },
        { label: 'Équipe', value: '60 pers.' },
      ],
    },
  ],
  globalProgress: 12,
};

export default mockFinancialJourney;
