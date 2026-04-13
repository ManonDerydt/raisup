import { KPIEntry } from '../data/mockKPIs';

export interface StartupProfile {
  // Pitch
  problem: string;
  solution: string;
  value_proposition: string;
  differentiation: string;
  // Team
  founders_count: number;
  has_cto: boolean;
  sector_experience_years: number;
  advisors_count: number;
  // Market
  tam_defined: boolean;
  tam_sourced: boolean;
  competitors_identified: boolean;
  gtm_defined: boolean;
}

export interface ScoreResult {
  total: number;
  pitch: number;
  traction: number;
  team: number;
  market: number;
}

// ─── Pitch score (/ 25) ───────────────────────────────────────────────────────
function scorePitch(profile: StartupProfile): number {
  let score = 0;
  if (profile.problem.length > 50)          score += 7;
  else if (profile.problem.length > 20)     score += 4;
  if (profile.solution.length > 50)         score += 7;
  else if (profile.solution.length > 20)    score += 4;
  if (profile.value_proposition.length > 30) score += 6;
  else if (profile.value_proposition.length > 10) score += 3;
  if (profile.differentiation.length > 30) score += 5;
  else if (profile.differentiation.length > 10) score += 2;
  return Math.min(score, 25);
}

// ─── Traction score (/ 25) ────────────────────────────────────────────────────
function scoreTraction(kpis: KPIEntry): number {
  let score = 0;
  // MRR
  if (kpis.mrr >= 50_000)      score += 8;
  else if (kpis.mrr >= 10_000) score += 6;
  else if (kpis.mrr >= 1_000)  score += 3;
  // Croissance
  if (kpis.growth_mom >= 20)      score += 7;
  else if (kpis.growth_mom >= 10) score += 4;
  else if (kpis.growth_mom >= 5)  score += 2;
  // Clients
  if (kpis.active_customers >= 50)  score += 5;
  else if (kpis.active_customers >= 20) score += 3;
  else if (kpis.active_customers >= 5)  score += 1;
  // Churn
  if (kpis.churn <= 2)      score += 5;
  else if (kpis.churn <= 5) score += 3;
  else if (kpis.churn <= 8) score += 1;
  return Math.min(score, 25);
}

// ─── Team score (/ 25) ────────────────────────────────────────────────────────
function scoreTeam(profile: StartupProfile): number {
  let score = 0;
  if (profile.founders_count >= 2)           score += 6;
  else if (profile.founders_count === 1)     score += 3;
  if (profile.has_cto)                       score += 7;
  if (profile.sector_experience_years >= 5)  score += 7;
  else if (profile.sector_experience_years >= 2) score += 4;
  if (profile.advisors_count >= 2)           score += 5;
  else if (profile.advisors_count === 1)     score += 2;
  return Math.min(score, 25);
}

// ─── Market score (/ 25) ──────────────────────────────────────────────────────
function scoreMarket(profile: StartupProfile): number {
  let score = 0;
  if (profile.tam_defined)             score += 7;
  if (profile.tam_sourced)             score += 6;
  if (profile.competitors_identified)  score += 6;
  if (profile.gtm_defined)             score += 6;
  return Math.min(score, 25);
}

// ─── Main function ────────────────────────────────────────────────────────────
export function calculateScore(profile: StartupProfile, kpis: KPIEntry): ScoreResult {
  const pitch    = scorePitch(profile);
  const traction = scoreTraction(kpis);
  const team     = scoreTeam(profile);
  const market   = scoreMarket(profile);
  const total    = pitch + traction + team + market;
  return { total, pitch, traction, team, market };
}

// ─── Recommendations by sub-score ─────────────────────────────────────────────
export function getPitchRecs(score: number): string[] {
  if (score >= 20) return [
    'Votre pitch est solide. Assurez-vous de le tester auprès de 5 investisseurs pour recueillir des retours.',
    'Ajoutez des preuves chiffrées à chaque slide pour renforcer la crédibilité.',
    'Préparez une version 3 minutes et une version 10 minutes de votre pitch.',
  ];
  return [
    'Votre description du problème manque de précision — reformulez en une phrase le problème exact que vous résolvez.',
    'Votre slide marché ne montre pas le TAM / SAM / SOM — ajoutez ces trois chiffres avec leurs sources.',
    'Votre proposition de valeur n\'est pas différenciée — en quoi êtes-vous meilleur que les alternatives existantes ?',
  ];
}

export function getTractionRecs(score: number): string[] {
  if (score >= 20) return [
    'Votre traction est excellente. Documentez votre trajectoire de croissance avec des graphiques.',
    'Calculez et affichez votre LTV / CAC ratio — un ratio > 3 est très attractif pour les investisseurs.',
    'Obtenez des témoignages clients écrits pour renforcer votre social proof.',
  ];
  return [
    'Vous n\'avez pas de revenus affichés — même 1 K€ MRR est un signal fort pour un investisseur seed.',
    'Votre croissance mensuelle n\'est pas documentée — ajoutez l\'évolution de vos métriques sur 3 mois.',
    'Vous n\'avez pas de lettres d\'intention client — obtenez 3 LOI avant de pitcher.',
  ];
}

export function getTeamRecs(score: number): string[] {
  if (score >= 20) return [
    'Votre équipe est solide. Mettez en avant les exits et succès précédents dans vos bios.',
    'Documentez la complémentarité des profils fondateurs dans votre pitch.',
    'Identifiez les 2-3 recrutements clés à faire avec les fonds levés.',
  ];
  return [
    'Votre équipe fondatrice est incomplète — identifiez le profil manquant (CTO, CMO ou CFO).',
    'Vous n\'avez pas d\'advisors — recruter 2 advisors sectoriels renforce fortement la crédibilité.',
    'Votre expérience secteur n\'est pas mise en avant — reformulez vos bios en mettant l\'accent sur ce qui est pertinent.',
  ];
}

export function getMarketRecs(score: number): string[] {
  if (score >= 20) return [
    'Votre analyse de marché est solide. Actualisez-la tous les 6 mois avec les dernières études.',
    'Créez une matrice de positionnement visuelle vs vos concurrents pour votre pitch deck.',
    'Quantifiez votre go-to-market : coût d\'acquisition, taux de conversion, cycle de vente.',
  ];
  return [
    'Votre TAM n\'est pas sourcé — citez Gartner, IDC ou une étude reconnue.',
    'Vous n\'avez pas identifié vos concurrents directs — créez une matrice de positionnement.',
    'Votre go-to-market n\'est pas défini — quel est votre premier canal d\'acquisition et pourquoi ?',
  ];
}
