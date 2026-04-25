// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  firstName?: string;
  lastName?: string;
  founderName?: string;
  startupName?: string;
  projectName?: string;
  oneLiner?: string;
  sector?: string;
  stage?: string;
  country?: string;
  businessModel?: string;
  clientType?: string;
  mrr?: number | null;
  currentRevenue?: number | null;
  momGrowth?: number | null;
  activeClients?: number | null;
  runway?: number | null;
  burnRate?: number | null;
  fundraisingGoal?: number | null;
  fundingNeeded?: number | null;
  maxDilution?: number | null;
  finalGoalValuation?: number | null;
  finalObjective?: string;
  fundingPreference?: string;
  founderSharePct?: number | null;
  hasCTO?: boolean;
  foundersCount?: number | null;
  previousStartup?: string;
  hadExit?: string;
  advisors?: number | null;
  sectorExperience?: string;
  problem?: string;
  solution?: string;
  competitiveAdvantage?: string;
  team?: { name?: string; role?: string; hadExit?: boolean }[];
  teamSize?: number | null;
  churnRate?: number | null;
  targetMarkets?: string[];
  deckFileName?: string;
  ambition?: string;
}

export interface TimelineStage {
  id: string;
  label: string;
  title: string;
  status: 'current' | 'future' | 'objective';
  isObjective?: boolean;
  amount?: number;
  description?: string;
  probability?: number | null;
  conditions?: string[];
  mix?: { dilutif: number; nonDilutif: number };
  capitalAfter?: { founders: number; current: number; new: number };
  kpis?: { label: string; value: string }[];
  estimatedDate?: string;
  timeToNext?: string;
}

export interface TimelineResult {
  currentValuation: number;
  finalObjective: string;
  finalGoalValuation: number;
  stages: TimelineStage[];
  estimatedTotalDuration: number;
  totalFundingNeeded: number;
  globalProgress: number;
}

export interface ExtendedScore {
  total: number;
  pitch: number;
  traction: number;
  team: number;
  market: number;
  defensibility: number;
  financialCoherence: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatAmount(n?: number | null): string {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

// ─── Score calculation (mirrors DashboardWelcome) ────────────────────────────

export function calculateScore(p: Profile): ExtendedScore {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;

  let pitch = 0;
  if ((p.problem?.length ?? 0) > 50) pitch += 7; else if ((p.problem?.length ?? 0) > 20) pitch += 4;
  if ((p.solution?.length ?? 0) > 50) pitch += 7; else if ((p.solution?.length ?? 0) > 20) pitch += 4;
  if ((p.competitiveAdvantage?.length ?? 0) > 30) pitch += 6; else if ((p.competitiveAdvantage?.length ?? 0) > 10) pitch += 3;

  let traction = 0;
  if (mrr > 0) traction += mrr >= 50000 ? 9 : mrr >= 10000 ? 7 : mrr >= 1000 ? 4 : 2;
  if (p.momGrowth) traction += p.momGrowth >= 20 ? 7 : p.momGrowth >= 10 ? 5 : p.momGrowth >= 5 ? 3 : 1;
  if (p.activeClients) traction += p.activeClients >= 100 ? 5 : p.activeClients >= 20 ? 3 : 1;
  if (p.runway) traction += p.runway >= 12 ? 4 : p.runway >= 6 ? 2 : 0;

  let team = 0;
  if (p.hasCTO) team += 5;
  if (p.previousStartup === 'oui') team += 5;
  if (p.hadExit === 'oui') team += 7;
  if (p.advisors) team += p.advisors >= 3 ? 4 : 2;
  const exp = p.sectorExperience ?? '';
  if (exp.includes('10') || exp.includes('5+') || exp.includes('15')) team += 4;
  else if (exp.includes('2-5') || exp.includes('3')) team += 2;
  if ((p.foundersCount ?? 1) >= 2) team += 4;

  let market = 0;
  if (p.businessModel) market += 5;
  if (p.sector) market += 5;
  if (p.clientType) market += 5;
  if (p.fundingPreference) market += 5;

  const defensibility = 0;
  let financialCoherence = 0;
  const goal = p.fundraisingGoal ?? p.fundingNeeded ?? 0;
  const stage = (p.stage ?? '').toLowerCase();
  if (goal > 0 && mrr === 0 && goal <= 500000) financialCoherence += 4;
  else if (goal > 0 && mrr > 0) financialCoherence += 4;
  if ((p.runway ?? 0) >= 6) financialCoherence += 3;
  if (goal > 2_000_000 && mrr === 0 && (stage.includes('pre') || stage.includes('idéat'))) financialCoherence = Math.max(0, financialCoherence - 4);

  return {
    total: Math.min(25, pitch) + Math.min(25, traction) + Math.min(25, team) + Math.min(25, market) + Math.min(10, defensibility) + Math.min(10, financialCoherence),
    pitch: Math.min(25, pitch),
    traction: Math.min(25, traction),
    team: Math.min(25, team),
    market: Math.min(25, market),
    defensibility: Math.min(10, defensibility),
    financialCoherence: Math.min(10, financialCoherence),
  };
}

// ─── Current valuation estimator ─────────────────────────────────────────────

export function calculateCurrentValuation(mrr: number, stage: string, sector: string): number {
  if (mrr === 0) {
    const base: Record<string, number> = {
      'pre-seed': 500_000, 'idéation': 300_000, 'mvp': 800_000,
      'seed': 1_500_000, 'serie-a': 8_000_000, 'serie-b': 30_000_000,
    };
    const s = stage.toLowerCase();
    for (const [key, val] of Object.entries(base)) {
      if (s.includes(key)) return val;
    }
    return 500_000;
  }
  const multiples: Record<string, number> = {
    'saas-b2b': 8, 'saas': 8, 'ia': 12, 'fintech': 10,
    'healthtech': 9, 'deeptech': 10, 'greentech': 8,
  };
  const sec = sector.toLowerCase();
  let mult = 7;
  for (const [key, val] of Object.entries(multiples)) {
    if (sec.includes(key)) { mult = val; break; }
  }
  return mrr * 12 * mult;
}

// ─── Stage progress ───────────────────────────────────────────────────────────

export function getGlobalProgress(stage: string): number {
  const s = stage.toLowerCase();
  if (s.includes('pre') || s.includes('idéat') || s.includes('ideat')) return 10;
  if (s.includes('mvp') || s.includes('prototype')) return 20;
  if (s.includes('seed')) return 28;
  if (s.includes('serie') && s.includes('a')) return 45;
  if (s.includes('serie') && s.includes('b')) return 65;
  if (s.includes('serie') && s.includes('c')) return 82;
  if (s.includes('exit')) return 100;
  return 10;
}

// ─── Conditions per stage ─────────────────────────────────────────────────────

export function getConditionsForStage(stageId: string, profile: Profile): string[] {
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const goal = profile.fundraisingGoal ?? profile.fundingNeeded ?? 500_000;
  const hasCTOInTeam = profile.hasCTO || profile.team?.some(m => (m.role ?? '').toLowerCase().includes('cto'));

  const conditions: Record<string, string[]> = {
    seed: [
      mrr === 0
        ? 'Obtenir les premiers revenus (objectif 3 à 5K€ MRR)'
        : `Atteindre ${formatAmount(mrr * 2)} MRR (+100%)`,
      !hasCTOInTeam
        ? 'Recruter un CTO co-fondateur'
        : 'Documenter les métriques de traction sur 3 mois',
      'Finaliser le pitch deck et l\'executive summary',
    ],
    nonDilutif: [
      'Compléter le dossier BPI (Bourse French Tech ou ADI)',
      'Obtenir un KBIS de moins de 3 mois',
      'Rédiger le plan d\'innovation',
    ],
    growth: [
      `Atteindre ${formatAmount(Math.max(mrr * 3, 10_000))} MRR`,
      'Réduire le burn rate de 20%',
      'Atteindre le cash flow positif',
    ],
    serieA: [
      `Atteindre ${formatAmount(Math.max(mrr * 5, 25_000))} MRR`,
      'Churn < 5% sur 3 mois consécutifs',
      'Équipe de 8 à 12 personnes',
    ],
    serieB: [
      `ARR > ${formatAmount(Math.max(goal * 0.8, 1_000_000))}`,
      'Expansion dans 2 pays minimum',
      'Unit economics positives (LTV/CAC > 3)',
    ],
    serieC: [
      `ARR > ${formatAmount(Math.max(goal * 3, 5_000_000))}`,
      'Leader dans au moins 3 pays EU',
      'Préparation exit ou IPO',
    ],
    profitability: [
      'Cash flow opérationnel positif sur 2 trimestres',
      'Croissance organique ≥ 10% par an',
      'Aucune dépendance aux financements externes',
    ],
    leader: [
      'NPS > 50',
      `ARR > ${formatAmount(Math.max(goal * 2, 5_000_000))}`,
      'Part de marché > 20% en France',
    ],
    eu: [
      'Bureaux dans 5 pays EU',
      '50% du revenu hors France',
      'Recrutement d\'un VP International',
    ],
  };

  return conditions[stageId] ?? [];
}

// ─── Mix per stage ────────────────────────────────────────────────────────────

export function getMixForStage(stageId: string, profile: Profile): { dilutif: number; nonDilutif: number } {
  if ((profile.fundingPreference ?? '').toLowerCase().includes('non-dilutif'))
    return { dilutif: 40, nonDilutif: 60 };
  if ((profile.fundingPreference ?? '').toLowerCase().includes('dilutif'))
    return { dilutif: 85, nonDilutif: 15 };
  const mixes: Record<string, { dilutif: number; nonDilutif: number }> = {
    seed:       { dilutif: 70, nonDilutif: 30 },
    nonDilutif: { dilutif: 0,  nonDilutif: 100 },
    growth:     { dilutif: 50, nonDilutif: 50 },
    serieA:     { dilutif: 80, nonDilutif: 20 },
    serieB:     { dilutif: 90, nonDilutif: 10 },
    serieC:     { dilutif: 95, nonDilutif: 5 },
  };
  return mixes[stageId] ?? { dilutif: 75, nonDilutif: 25 };
}

// ─── Capital structure estimator ──────────────────────────────────────────────

function getCapitalAfter(stageId: string, profile: Profile, mix: { dilutif: number; nonDilutif: number }) {
  const founderBase = profile.founderSharePct ?? 85;
  const dilutionPerRound: Record<string, number> = {
    seed: 15, serieA: 20, serieB: 20, serieC: 15,
  };
  const dilution = ((dilutionPerRound[stageId] ?? 15) * mix.dilutif) / 100;
  const newInvestors = Math.round(dilution);
  const existingInvestors = Math.max(0, 100 - founderBase - newInvestors);
  const founders = Math.max(30, founderBase - (stageId === 'seed' ? 0 : existingInvestors / 2));
  return {
    founders: Math.round(founders),
    current: Math.round(existingInvestors),
    new: newInvestors,
  };
}

// ─── Probability calculator ───────────────────────────────────────────────────

export function calculateStageProbability(
  stageId: string,
  profile: Profile,
  score: ExtendedScore,
): number {
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  let base = 70;

  if (score.total < 40) base -= 25;
  else if (score.total > 70) base += 15;

  if (mrr > 10_000) base += 10;
  else if (mrr === 0) base -= 15;

  const founders = profile.foundersCount ?? profile.team?.length ?? 1;
  if (founders >= 2) base += 5;
  if (profile.team?.some(m => m.hadExit) || profile.hadExit === 'oui') base += 10;
  if ((profile.runway ?? 12) < 6) base -= 20;

  const stageIndex: Record<string, number> = { seed: 0, nonDilutif: 0, growth: 0, serieA: 1, serieB: 2, serieC: 3 };
  base -= (stageIndex[stageId] ?? 0) * 15;

  return Math.max(10, Math.min(95, base));
}

// ─── Duration estimator ───────────────────────────────────────────────────────

export function calculateTotalDuration(stages: TimelineStage[]): number {
  const durations: Record<string, number> = {
    seed: 8, nonDilutif: 6, growth: 18, serieA: 24, serieB: 42, serieC: 60, exit: 72,
    profitability: 18, leader: 30, eu: 36,
  };
  const futureStages = stages.filter(s => s.status !== 'current' && !s.isObjective);
  if (futureStages.length === 0) return 12;
  const last = futureStages[futureStages.length - 1];
  return durations[last?.id ?? ''] ?? 24;
}

// ─── KPIs per stage ───────────────────────────────────────────────────────────

function getKpisForStage(stageId: string, profile: Profile): { label: string; value: string }[] {
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const goal = profile.fundraisingGoal ?? profile.fundingNeeded ?? 500_000;

  const kpiMap: Record<string, { label: string; value: string }[]> = {
    now: [
      { label: 'MRR actuel', value: mrr === 0 ? 'Pre-revenue' : formatAmount(mrr) },
      { label: 'Clients', value: profile.activeClients ? String(profile.activeClients) : '—' },
      { label: 'Croissance', value: profile.momGrowth ? `+${profile.momGrowth}%` : '—' },
      { label: 'Runway', value: profile.runway ? `${profile.runway} mois` : '—' },
    ],
    seed: [
      { label: 'MRR cible', value: formatAmount(Math.max(mrr * 2, 5_000)) },
      { label: 'Clients cible', value: '20+' },
      { label: 'Équipe', value: '3-5 pers.' },
      { label: 'Runway post', value: '18 mois' },
    ],
    nonDilutif: [
      { label: 'Potentiel BPI', value: '~200K€' },
      { label: 'CIR', value: '30% R&D' },
      { label: 'Délai', value: '3-6 mois' },
      { label: 'Dilution', value: '0%' },
    ],
    growth: [
      { label: 'MRR cible', value: formatAmount(Math.max(mrr * 3, 15_000)) },
      { label: 'Marge brute', value: '> 60%' },
      { label: 'CAC payback', value: '< 12 mois' },
      { label: 'NPS cible', value: '> 40' },
    ],
    serieA: [
      { label: 'MRR cible', value: formatAmount(Math.max(mrr * 5, 30_000)) },
      { label: 'Clients cible', value: '100+' },
      { label: 'Équipe', value: '10-15 pers.' },
      { label: 'Runway post', value: '24 mois' },
    ],
    serieB: [
      { label: 'ARR cible', value: formatAmount(Math.max(goal * 2, 1_500_000)) },
      { label: 'Pays', value: '3+' },
      { label: 'Équipe', value: '25-40 pers.' },
      { label: 'NRR cible', value: '> 110%' },
    ],
    serieC: [
      { label: 'ARR cible', value: formatAmount(Math.max(goal * 6, 6_000_000)) },
      { label: 'Marge brute', value: '> 70%' },
      { label: 'EBITDA', value: 'Positif' },
      { label: 'Équipe', value: '60+ pers.' },
    ],
  };

  return kpiMap[stageId] ?? [];
}

// ─── Estimated date per stage ─────────────────────────────────────────────────

function getEstimatedDate(stageId: string, runway: number): string {
  const now = new Date();
  const offsets: Record<string, number> = {
    seed: 6, nonDilutif: 3, growth: 12,
    serieA: 18, serieB: 36, serieC: 60,
    profitability: 18, leader: 30, eu: 36, exit: 60, unicorn: 84,
  };
  const months = offsets[stageId] ?? 12;
  const target = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return `Q${Math.ceil((target.getMonth() + 1) / 3)} ${target.getFullYear()}`;
}

// ─── Stage templates ──────────────────────────────────────────────────────────

function buildStage(
  id: string,
  label: string,
  title: string,
  amount: number,
  profile: Profile,
  score: ExtendedScore,
  description?: string,
): TimelineStage {
  const mix = getMixForStage(id, profile);
  const capitalAfter = id !== 'nonDilutif' && id !== 'growth'
    ? getCapitalAfter(id, profile, mix)
    : undefined;
  const runway = profile.runway ?? 12;

  return {
    id,
    label,
    title,
    status: 'future',
    amount,
    description,
    probability: calculateStageProbability(id, profile, score),
    conditions: getConditionsForStage(id, profile),
    mix,
    capitalAfter,
    kpis: getKpisForStage(id, profile),
    estimatedDate: getEstimatedDate(id, runway),
    timeToNext: `Prochaine étape dans ${Math.round((amount / (profile.burnRate ?? 10_000)) * 0.3)} à ${Math.round((amount / (profile.burnRate ?? 10_000)) * 0.5)} mois après la levée`,
  };
}

// ─── Stage sequences per objective ────────────────────────────────────────────

function getStagesForObjective(
  objective: string,
  currentStage: string,
  goal: number,
  finalValo: number,
  profile: Profile,
  score: ExtendedScore,
): TimelineStage[] {
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const startupName = profile.startupName || profile.projectName || 'Votre startup';

  const nowStage: TimelineStage = {
    id: 'now',
    label: 'Now',
    title: `Situation actuelle · ${profile.stage ?? 'Pre-seed'}`,
    status: 'current',
    kpis: getKpisForStage('now', profile),
    description: `${startupName}${profile.oneLiner ? ` — ${profile.oneLiner}` : ''}. ${mrr > 0 ? `${formatAmount(mrr)} MRR actuel.` : 'Pre-revenue.'} Runway de ${profile.runway ?? '?'} mois.`,
  };

  const objectiveMap: Record<string, TimelineStage[]> = {
    'Rentabilité durable': [
      nowStage,
      buildStage('growth', '→', 'Croissance organique', goal * 0.3, profile, score,
        'Optimisation des revenus, réduction du burn rate et atteinte du cash flow positif.'),
      {
        id: 'profitability', label: '✓', title: 'Rentabilité atteinte',
        status: 'objective', isObjective: true,
        description: `Cash flow positif · Indépendance totale · ${startupName} n'a plus besoin de financement externe.`,
        conditions: getConditionsForStage('profitability', profile),
        kpis: [
          { label: 'Burn rate', value: '0€' }, { label: 'ARR', value: formatAmount(mrr * 18) },
          { label: 'Marge', value: '> 60%' }, { label: 'Dépendance', value: 'Aucune' },
        ],
      },
    ],

    'Leader du marché français': [
      nowStage,
      buildStage('seed', 'Seed', 'Levée Seed', goal, profile, score,
        'Premier financement institutionnel pour accélérer la croissance sur le marché français.'),
      buildStage('serieA', 'A', 'Série A', goal * 3, profile, score,
        'Tour de croissance pour dominer le marché français et préparer l\'expansion.'),
      {
        id: 'leader', label: '✓', title: `Leader FR · ${formatAmount(Math.max(goal * 2, 5_000_000))} ARR`,
        status: 'objective', isObjective: true,
        description: `${startupName} est la référence n°1 en France dans le secteur ${profile.sector ?? ''}. Part de marché > 25%.`,
        conditions: getConditionsForStage('leader', profile),
      },
    ],

    'Expansion européenne': [
      nowStage,
      buildStage('seed', 'Seed', 'Levée Seed', goal, profile, score,
        'Financement pour établir les fondations produit et acquérir les premiers clients.'),
      buildStage('serieA', 'A', 'Série A', goal * 4, profile, score,
        'Accélération commerciale et ouverture des premiers marchés européens.'),
      buildStage('serieB', 'B', 'Série B EU', goal * 10, profile, score,
        'Tour de croissance dédié à l\'expansion dans 5 pays européens majeurs.'),
      {
        id: 'eu', label: '✓', title: 'Présent dans 5 pays EU',
        status: 'objective', isObjective: true,
        description: `${startupName} est présent dans 5 pays européens. ARR > ${formatAmount(Math.max(goal * 8, 5_000_000))}. Leadership EU validé.`,
        conditions: getConditionsForStage('eu', profile),
      },
    ],

    'Scale-up et exit': [
      nowStage,
      buildStage('seed', 'Seed', 'Levée Seed', goal, profile, score,
        'Premier tour pour valider le modèle et construire une base clients solide.'),
      buildStage('serieA', 'A', 'Série A', goal * 4, profile, score,
        'Tour institutionnel pour scaler le go-to-market et étoffer l\'équipe.'),
      buildStage('serieB', 'B', 'Série B', goal * 10, profile, score,
        'Tour de croissance pour préparer le positionnement pré-exit.'),
      {
        id: 'exit', label: '🏆', title: `Exit · ${formatAmount(finalValo)}`,
        status: 'objective', isObjective: true,
        description: `${startupName} réalise un exit à ${formatAmount(finalValo)}. Acquisition stratégique ou IPO. Retour fondateurs estimé : ${formatAmount(finalValo * ((profile.founderSharePct ?? 70) / 100))}.`,
        conditions: ['ARR > ' + formatAmount(finalValo / 10), 'EBITDA positif', 'Due diligence préparée'],
        kpis: [
          { label: 'Valorisation', value: formatAmount(finalValo) },
          { label: 'Multiple', value: `×${Math.round(finalValo / (calculateCurrentValuation(mrr, currentStage, profile.sector ?? '') || 1))}` },
          { label: 'Retour fondateurs', value: formatAmount(finalValo * ((profile.founderSharePct ?? 70) / 100)) },
          { label: 'Horizon', value: '4-6 ans' },
        ],
      },
    ],

    'Licorne': [
      nowStage,
      buildStage('seed', 'Seed', 'Levée Seed', goal, profile, score,
        'Premier financement pour poser les bases d\'une croissance exponentielle.'),
      buildStage('serieA', 'A', 'Série A', goal * 4, profile, score,
        'Validation du modèle à grande échelle et accélération internationale.'),
      buildStage('serieB', 'B', 'Série B', goal * 12, profile, score,
        'Expansion mondiale et consolidation de la position de leader.'),
      buildStage('serieC', 'C', 'Série C', goal * 30, profile, score,
        'Tour pré-licorne. Préparation à la valorisation milliard.'),
      {
        id: 'unicorn', label: '🦄', title: 'Licorne · 1Md€',
        status: 'objective', isObjective: true,
        description: `${startupName} rejoint le club des licornes françaises. 1 milliard d'euros de valorisation. Employés : 500+. Présence mondiale.`,
        conditions: ['ARR > 100M€', 'Présence dans 10+ pays', 'IPO ou levée à 1Md€+'],
      },
    ],

    'Impact et croissance maîtrisée': [
      nowStage,
      buildStage('nonDilutif', 'ND', 'Financement non-dilutif', goal * 0.5, profile, score,
        'Subventions BPI, CIR et dispositifs d\'impact pour démarrer sans dilution.'),
      buildStage('seed', 'Seed', 'Levée impact', goal, profile, score,
        'Levée auprès d\'investisseurs impact alignés avec vos valeurs.'),
      {
        id: 'impact', label: '✓', title: 'Impact mesuré · Équilibre',
        status: 'objective', isObjective: true,
        description: `${startupName} démontre un impact mesurable tout en maintenant une croissance saine et durable.`,
        conditions: ['Score impact certifié', 'Cash flow positif', 'Mission préservée'],
      },
    ],
  };

  return objectiveMap[objective] ?? objectiveMap['Scale-up et exit'];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateTimeline(profile: Profile): TimelineResult {
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const currentStage = profile.stage ?? 'pre-seed';
  const finalObjective = profile.finalObjective
    ?? (profile.ambition?.toLowerCase().includes('licorne') ? 'Licorne'
      : profile.ambition?.toLowerCase().includes('exit') ? 'Scale-up et exit'
      : profile.ambition?.toLowerCase().includes('europ') ? 'Expansion européenne'
      : profile.ambition?.toLowerCase().includes('leader') ? 'Leader du marché français'
      : profile.ambition?.toLowerCase().includes('rentab') ? 'Rentabilité durable'
      : 'Scale-up et exit');

  const fundraisingGoal = profile.fundraisingGoal ?? profile.fundingNeeded ?? 500_000;

  // Licorne → valo forcée à 1 milliard
  const finalGoalValuation = finalObjective === 'Licorne'
    ? Math.max(profile.finalGoalValuation ?? 0, 1_000_000_000)
    : (profile.finalGoalValuation ?? 50_000_000);
  const sector = profile.sector ?? '';

  const score = calculateScore(profile);
  const currentValuation = calculateCurrentValuation(mrr, currentStage, sector);
  const stages = getStagesForObjective(finalObjective, currentStage, fundraisingGoal, finalGoalValuation, profile, score);

  stages.forEach(stage => {
    if (stage.status !== 'current' && !stage.isObjective && stage.id !== 'now') {
      stage.probability = calculateStageProbability(stage.id, profile, score);
    }
  });

  const estimatedTotalDuration = calculateTotalDuration(stages);
  const totalFundingNeeded = stages.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const globalProgress = getGlobalProgress(currentStage);

  return {
    currentValuation,
    finalObjective,
    finalGoalValuation,
    stages,
    estimatedTotalDuration,
    totalFundingNeeded,
    globalProgress,
  };
}

// ─── KPI computations ─────────────────────────────────────────────────────────

export function recommendedDilution(profile: Profile): number {
  const stage = (profile.stage ?? '').toLowerCase();
  if (stage.includes('pre') || stage.includes('idéat')) return 15;
  if (stage.includes('seed') || stage.includes('mvp')) return 20;
  if (stage.includes('serie') && stage.includes('a')) return 22;
  if (stage.includes('serie') && stage.includes('b')) return 18;
  return 20;
}

export function sectorBenchmarkDilution(sector: string): number {
  const s = sector.toLowerCase();
  const benchmarks: Record<string, number> = {
    'saas-b2b': 18, 'saas': 18, 'ia': 20, 'fintech': 22,
    'healthtech': 20, 'deeptech': 15, 'greentech': 17,
  };
  for (const [key, val] of Object.entries(benchmarks)) {
    if (s.includes(key)) return val;
  }
  return 20;
}

export function nextRoundValuation(profile: Profile, timeline: TimelineResult): number {
  const nextStage = timeline.stages.find(s => s.status !== 'current' && !s.isObjective);
  if (!nextStage) return profile.finalGoalValuation ?? 50_000_000;
  const postMoneyMultiples: Record<string, number> = {
    seed: 5, serieA: 4, serieB: 3.5, serieC: 3, nonDilutif: 1, growth: 2,
  };
  const multiple = postMoneyMultiples[nextStage.id] ?? 4;
  return (nextStage.amount ?? 500_000) * multiple;
}

export function getRaisupRecommendation(profile: Profile, score: ExtendedScore, timeline: TimelineResult): string {
  const runway = profile.runway ?? 12;
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;

  if (runway < 6)
    return `Urgence trésorerie — avec ${runway} mois de runway, la priorité absolue est de sécuriser un financement pont avant de pitcher des investisseurs.`;

  if (score.total < 50) {
    const action = mrr === 0 ? 'obtenir vos premiers clients payants'
      : !profile.hasCTO ? 'recruter un profil technique co-fondateur'
      : (profile.foundersCount ?? 1) < 2 ? 'vous associer à un co-fondateur complémentaire'
      : 'compléter votre profil et documenter votre traction';
    return `Votre score de ${score.total}/100 est en dessous du seuil recommandé pour pitcher. Concentrez-vous sur ${action} avant de contacter des investisseurs.`;
  }

  if (mrr === 0)
    return 'Aucun revenu actuellement. Les investisseurs seed attendent généralement 3 à 10K€ MRR avant d\'investir. Concentrez-vous sur vos premiers clients payants.';

  const next = timeline.stages.find(s => s.status !== 'current' && !s.isObjective);
  return `Votre profil est solide. La prochaine étape recommandée est ${next?.title ?? 'la levée Seed'}. Commencez à pitcher des investisseurs matchés dès maintenant.`;
}

export function getObjectiveMessage(profile: Profile): string {
  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const finalGoalValuation = profile.finalGoalValuation ?? 50_000_000;
  const goal = profile.fundraisingGoal ?? profile.fundingNeeded ?? 500_000;
  const objective = profile.finalObjective ?? 'Scale-up et exit';

  const messages: Record<string, string> = {
    'Rentabilité durable': `${startupName} atteint la profitabilité. Cash flow positif, aucune dépendance externe, liberté totale.`,
    'Leader du marché français': `${startupName} est la référence n°1 en France dans le secteur ${profile.sector ?? 'tech'}.`,
    'Expansion européenne': `${startupName} est présent dans 5 pays européens avec un ARR > ${formatAmount(goal * 8)}.`,
    'Scale-up et exit': `${startupName} réalise un exit à ${formatAmount(finalGoalValuation)}. Acquisition stratégique ou IPO.`,
    'Licorne': `${startupName} rejoint le club des licornes françaises. 1 milliard d'euros de valorisation.`,
    'Impact et croissance maîtrisée': `${startupName} a un impact mesurable tout en générant une croissance saine et durable.`,
  };

  return messages[objective] ?? messages['Scale-up et exit'];
}
