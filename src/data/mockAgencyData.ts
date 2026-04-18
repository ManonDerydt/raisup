export interface AgencyDossier {
  id: string;
  startupName: string;
  sector: string;
  stage: string;
  score: number;
  statut: string;
  mrr: number;
  objectifLevee: number;
  derniereAction: string;
  fondateur: string;
}

export interface AgencyProfile {
  name: string;
  type: string;
  responsable: string;
  email: string;
  plan: string;
  dossiersActifs: number;
}

export interface MockAgencyAccount {
  agency: AgencyProfile;
  dossiers: AgencyDossier[];
}

export const dossierStatuts: Record<string, { bg: string; text: string }> = {
  'Onboarding en cours': { bg: '#F3F4F6', text: '#6B7280' },
  'Analyse en cours':    { bg: '#ABC5FE', text: '#1A3A8F' },
  'Dossier prêt':        { bg: '#D8FFBD', text: '#2D6A00' },
  'En prospection':      { bg: '#CDB4FF', text: '#3D0D8F' },
  'RDV investisseurs':   { bg: '#FFB96D', text: '#7A3D00' },
  'Term sheet':          { bg: '#D8FFBD', text: '#2D6A00' },
  'Closé ✓':             { bg: '#D8FFBD', text: '#2D6A00' },
  'En pause':            { bg: '#FFB3B3', text: '#8F1A1A' },
};

export const mockFundherzAccount: MockAgencyAccount = {
  agency: {
    name: 'Fundherz',
    type: 'Agence de levée de fonds',
    responsable: 'Manon Derydt',
    email: 'manon@fundherz.co',
    plan: 'Growth Agency',
    dossiersActifs: 5,
  },
  dossiers: [
    {
      id: 'd1',
      startupName: 'MediScan',
      sector: 'HealthTech',
      stage: 'seed',
      score: 74,
      statut: 'En prospection',
      mrr: 12000,
      objectifLevee: 3000000,
      derniereAction: 'Deck envoyé à Partech',
      fondateur: 'Marie Dupont',
    },
    {
      id: 'd2',
      startupName: 'Bento Cake',
      sector: 'E-commerce',
      stage: 'pre-seed',
      score: 58,
      statut: 'Dossier prêt',
      mrr: 2800,
      objectifLevee: 200000,
      derniereAction: 'Dossier BPI soumis',
      fondateur: 'Fanny Mercier',
    },
    {
      id: 'd3',
      startupName: 'CarbonLoop',
      sector: 'GreenTech',
      stage: 'serie-a',
      score: 81,
      statut: 'Term sheet',
      mrr: 45000,
      objectifLevee: 3000000,
      derniereAction: 'Term sheet reçu — Demeter',
      fondateur: 'Lucas Martin',
    },
    {
      id: 'd4',
      startupName: 'PayLater Pro',
      sector: 'FinTech',
      stage: 'pre-seed',
      score: 42,
      statut: 'Onboarding en cours',
      mrr: 0,
      objectifLevee: 200000,
      derniereAction: 'Invitation envoyée',
      fondateur: 'Thomas Bernard',
    },
    {
      id: 'd5',
      startupName: 'NeuralEdge',
      sector: 'IA',
      stage: 'seed',
      score: 69,
      statut: 'RDV investisseurs',
      mrr: 8000,
      objectifLevee: 1000000,
      derniereAction: '3 RDV planifiés cette semaine',
      fondateur: 'Sarah Chen',
    },
  ],
};
