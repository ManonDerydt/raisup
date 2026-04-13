// ─── Startup profile ──────────────────────────────────────────────────────────
export const mockStartup = {
  name: 'MediScan',
  founderFirstName: 'Marie',
  sector: 'HealthTech',
  stage: 'seed' as const,
  location: 'Paris',
  fundingGoal: 750_000,
  profileCompletion: 65, // %
};

// ─── Raisup score ──────────────────────────────────────────────────────────────
export const mockRaisupScore = {
  total: 62,
  pitch: 18,    // /25
  traction: 14, // /25
  team: 17,     // /25
  market: 13,   // /25
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export interface KPIHistory { month: string; value: number }

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;     // % vs mois précédent (positif = hausse)
  goodIfUp: boolean;  // false pour churn/CAC
  history: KPIHistory[];
  lastUpdated: string; // ISO date
}

export const mockKPIs: KPI[] = [
  {
    id: 'mrr',
    label: 'MRR',
    value: 12_400,
    unit: '€',
    change: +18,
    goodIfUp: true,
    history: [
      { month: 'Nov', value: 7_200 },
      { month: 'Déc', value: 8_100 },
      { month: 'Jan', value: 9_300 },
      { month: 'Fév', value: 10_500 },
      { month: 'Mar', value: 10_520 },
      { month: 'Avr', value: 12_400 },
    ],
    lastUpdated: '2026-04-01',
  },
  {
    id: 'growth',
    label: 'Croissance MoM',
    value: 18,
    unit: '%',
    change: +3,
    goodIfUp: true,
    history: [
      { month: 'Nov', value: 10 },
      { month: 'Déc', value: 12 },
      { month: 'Jan', value: 14 },
      { month: 'Fév', value: 13 },
      { month: 'Mar', value: 15 },
      { month: 'Avr', value: 18 },
    ],
    lastUpdated: '2026-04-01',
  },
  {
    id: 'clients',
    label: 'Clients actifs',
    value: 47,
    unit: '',
    change: +6,
    goodIfUp: true,
    history: [
      { month: 'Nov', value: 28 },
      { month: 'Déc', value: 33 },
      { month: 'Jan', value: 37 },
      { month: 'Fév', value: 41 },
      { month: 'Mar', value: 44 },
      { month: 'Avr', value: 47 },
    ],
    lastUpdated: '2026-04-01',
  },
  {
    id: 'churn',
    label: 'Churn mensuel',
    value: 2.1,
    unit: '%',
    change: -0.4,
    goodIfUp: false,
    history: [
      { month: 'Nov', value: 3.2 },
      { month: 'Déc', value: 2.9 },
      { month: 'Jan', value: 2.7 },
      { month: 'Fév', value: 2.5 },
      { month: 'Mar', value: 2.5 },
      { month: 'Avr', value: 2.1 },
    ],
    lastUpdated: '2026-04-01',
  },
  {
    id: 'runway',
    label: 'Runway',
    value: 9,
    unit: ' mois',
    change: -1,
    goodIfUp: true,
    history: [
      { month: 'Nov', value: 14 },
      { month: 'Déc', value: 13 },
      { month: 'Jan', value: 12 },
      { month: 'Fév', value: 11 },
      { month: 'Mar', value: 10 },
      { month: 'Avr', value: 9 },
    ],
    lastUpdated: '2026-04-01',
  },
  {
    id: 'cac',
    label: 'CAC',
    value: 320,
    unit: '€',
    change: -12,
    goodIfUp: false,
    history: [
      { month: 'Nov', value: 480 },
      { month: 'Déc', value: 440 },
      { month: 'Jan', value: 400 },
      { month: 'Fév', value: 370 },
      { month: 'Mar', value: 363 },
      { month: 'Avr', value: 320 },
    ],
    lastUpdated: '2026-04-01',
  },
];

// ─── Dilutive pipeline ────────────────────────────────────────────────────────
export type DilutiveStatus =
  | 'to-contact' | 'contacted' | 'in-discussion' | 'meeting' | 'term-sheet' | 'refused';

export interface DilutiveInvestor {
  id: string;
  name: string;
  type: 'VC' | 'Angel' | 'Family Office';
  targetTicket: number;
  status: DilutiveStatus;
  lastContact: string | null;
  nextAction: string;
}

export const mockDilutivePipeline: DilutiveInvestor[] = [
  { id: '1', name: 'Kima Ventures',    type: 'VC',          targetTicket: 150_000, status: 'meeting',       lastContact: '2026-04-08', nextAction: 'RDV call 16 avr.' },
  { id: '2', name: 'Sophie Durand',    type: 'Angel',        targetTicket: 50_000,  status: 'in-discussion', lastContact: '2026-04-05', nextAction: 'Envoyer pitch deck' },
  { id: '3', name: 'Newfund',          type: 'VC',          targetTicket: 300_000, status: 'contacted',     lastContact: '2026-03-28', nextAction: 'Relancer sous 3j' },
  { id: '4', name: 'ISAI',             type: 'Family Office',targetTicket: 200_000, status: 'to-contact',   lastContact: null,         nextAction: 'Envoyer 1er email' },
  { id: '5', name: 'Elaia',            type: 'VC',          targetTicket: 500_000, status: 'term-sheet',    lastContact: '2026-04-10', nextAction: 'Négocier la valorisation' },
  { id: '6', name: 'Marc Ournac',      type: 'Angel',        targetTicket: 30_000,  status: 'refused',       lastContact: '2026-03-15', nextAction: '—' },
  { id: '7', name: 'Alven Capital',    type: 'VC',          targetTicket: 500_000, status: 'to-contact',    lastContact: null,         nextAction: 'Warm intro via réseau' },
];

export const TOTAL_MATCHED_INVESTORS = 18;

// ─── Non-dilutive pipeline ────────────────────────────────────────────────────
export type NonDilutiveStatus =
  | 'eligible' | 'in-progress' | 'submitted' | 'in-review' | 'granted' | 'refused';

export interface NonDilutiveDevice {
  id: string;
  name: string;
  organism: string;
  potentialAmount: number;
  status: NonDilutiveStatus;
  deadline: string | null;
  nextStep: string;
}

export const mockNonDilutivePipeline: NonDilutiveDevice[] = [
  { id: '1', name: 'CIR 2026',                    organism: 'État',        potentialAmount: 180_000, status: 'in-progress', deadline: '2026-05-31', nextStep: 'Compléter le formulaire 2069-A' },
  { id: '2', name: 'BPI Bourse Émergence',         organism: 'Bpifrance',   potentialAmount: 250_000, status: 'eligible',    deadline: '2026-06-15', nextStep: 'Préparer le dossier technique' },
  { id: '3', name: 'Innov\'up',                    organism: 'Région IDF',  potentialAmount: 150_000, status: 'submitted',   deadline: '2026-04-28', nextStep: 'En attente de réponse' },
  { id: '4', name: 'Subvention Innovation PACA',   organism: 'Région PACA', potentialAmount: 80_000,  status: 'refused',     deadline: null,          nextStep: 'Reconsidérer l\'eligibilité' },
  { id: '5', name: 'Horizon Europe — EIC Pathfinder',organism: 'Europe',   potentialAmount: 500_000, status: 'eligible',    deadline: '2026-09-01', nextStep: 'Évaluer la faisabilité' },
];

export const TOTAL_ND_POTENTIAL = mockNonDilutivePipeline
  .filter(d => d.status !== 'refused')
  .reduce((acc, d) => acc + d.potentialAmount, 0);

// ─── Documents & actions ──────────────────────────────────────────────────────
export const mockDocuments = {
  count: 3,
  lastGenerated: '2026-04-02',
  types: ['Pitch Deck', 'Executive Summary', 'Business Plan'],
};

export const mockInvestorUpdate = {
  lastSent: '2026-03-31',
};

export const mockNextMeeting = {
  date: '2026-04-16',
  investor: 'Kima Ventures',
  type: 'Appel découverte',
};

// ─── Recommended actions ──────────────────────────────────────────────────────
export interface RecommendedAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

export const mockRecommendedActions: RecommendedAction[] = [
  {
    id: '1',
    priority: 'high',
    icon: '📊',
    title: 'Score Pitch faible (18/25)',
    description: 'Votre slide Problem et votre slide Marché sont insuffisantes. Régénérez votre deck avec les nouvelles données de traction.',
    cta: 'Mettre à jour le Pitch Deck',
    href: '/dashboard/generate',
  },
  {
    id: '2',
    priority: 'high',
    icon: '⏰',
    title: 'Deadline Innov\'up dans 15 jours',
    description: 'Votre dossier Innov\'up est soumis mais la deadline approche. Vérifiez que tous les documents sont complets.',
    cta: 'Voir le dossier',
    href: '/dashboard/fundraising',
  },
  {
    id: '3',
    priority: 'medium',
    icon: '📬',
    title: '4 investisseurs à relancer',
    description: 'Newfund, ISAI et 2 autres n\'ont pas reçu de suivi depuis plus de 10 jours.',
    cta: 'Voir le pipeline',
    href: '/dashboard/fundraising',
  },
];
