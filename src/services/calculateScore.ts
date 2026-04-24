export interface ScoreResult {
  total: number;
  // Piliers principaux
  pilier1_fintech: number;   // max 25
  pilier2_tech: number;      // max 20
  pilier3_marche: number;    // max 20
  pilier4_risque: number;    // max 20
  pilier5_liquidite: number; // max 15
  // Sous-scores détaillés
  burnMultipleScore: number;
  ltvCacScore: number;
  moatScore: number;
  ipScore: number;
  tamScore: number;
  conformiteScore: number;
  equipeScore: number;
  exitScore: number;
  // Métadonnées
  investissabilite: 'faible' | 'moyenne' | 'bonne' | 'excellente';
  probabiliteExit5ans: number; // 0 à 100
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateScore(profile: any): ScoreResult {

  // ── PILIER 1 — FINTECH & DATA — 25 points ──────────────────────────────────
  let pilier1 = 0;

  const mrr = Number(profile.mrr ?? profile.currentRevenue) || 0;
  const arr = Number(profile.arr) || mrr * 12;
  void arr; // calculé pour usage futur
  const burnRate = Number(profile.burnRate ?? profile.burn_rate) || 0;
  const mrrGrowthMoM = Number(profile.mrrGrowthMoM ?? profile.momGrowth ?? profile.growthMoM ?? profile.growth_mom) || 0;
  const cac = Number(profile.cac) || 0;
  const ltv = Number(profile.ltv) || 0;

  // MRR & ARR — 8 points
  if (mrr > 0)      pilier1 += 2;
  if (mrr > 5000)   pilier1 += 2;
  if (mrr > 20000)  pilier1 += 2;
  if (mrr > 50000)  pilier1 += 2;

  // Croissance MoM — 7 points
  if (mrrGrowthMoM > 5)  pilier1 += 2;
  if (mrrGrowthMoM > 15) pilier1 += 3;
  if (mrrGrowthMoM > 30) pilier1 += 2;

  // Burn Multiple — 5 points
  const newARR = mrr * (mrrGrowthMoM / 100);
  const burnMultiple = newARR > 0 ? burnRate / newARR : 999;
  if (burnMultiple < 1)        pilier1 += 5;
  else if (burnMultiple < 1.5) pilier1 += 3;
  else if (burnMultiple < 2)   pilier1 += 1;

  // LTV/CAC — 5 points
  const ltvCac = cac > 0 ? ltv / cac : 0;
  if (ltvCac > 3) pilier1 += 3;
  if (ltvCac > 5) pilier1 += 2;

  pilier1 = Math.min(pilier1, 25);

  // ── PILIER 2 — IA & TECH — 20 points ───────────────────────────────────────
  let pilier2 = 0;

  const hasProprietaryTech = profile.hasProprietaryTech || false;
  const techDependency = profile.techDependency || 'openai_wrapper';
  const hasUniqueData = profile.hasUniqueData || false;
  const hasPatent = profile.hasPatent || false;
  const advantage = profile.competitiveAdvantage ?? profile.competitive_advantage ?? '';
  const freeText = profile.freeText ?? '';

  // Propriété intellectuelle — 8 points
  if (hasProprietaryTech) pilier2 += 4;
  if (techDependency === 'proprietary')   pilier2 += 4;
  else if (techDependency === 'mixed')    pilier2 += 2;

  // Données uniques — 6 points
  if (hasUniqueData) pilier2 += 4;
  if (hasPatent)     pilier2 += 2;

  // Moat détecté dans les textes — 6 points
  const moatKeywords = ['données', 'data', 'brevet', 'réseau', 'network', 'switching', 'exclusif', 'propriétaire', 'unique'];
  const combined = (advantage + ' ' + freeText).toLowerCase();
  const moatCount = moatKeywords.filter(kw => combined.includes(kw)).length;
  if (moatCount >= 1) pilier2 += 2;
  if (moatCount >= 3) pilier2 += 2;
  if (moatCount >= 5) pilier2 += 2;

  pilier2 = Math.min(pilier2, 20);

  // ── PILIER 3 — MARCHÉ & MOMENTUM — 20 points ───────────────────────────────
  let pilier3 = 0;

  // TAM : priorité à la valeur explicite, sinon calculé depuis potentialCustomers × averagePrice
  const tamSize = Number(profile.tamSize)
    || (Number(profile.potentialCustomers) * Number(profile.averagePrice))
    || 0;
  const marketGrowthRate = Number(profile.marketGrowthRate) || 0;
  const sector = (profile.sector ?? '').toLowerCase();

  // TAM — 8 points
  if (tamSize > 100_000_000)   pilier3 += 2;
  if (tamSize > 500_000_000)   pilier3 += 2;
  if (tamSize > 1_000_000_000) pilier3 += 2;
  if (tamSize > 5_000_000_000) pilier3 += 2;

  // Croissance du marché — 6 points
  if (marketGrowthRate > 10) pilier3 += 2;
  if (marketGrowthRate > 20) pilier3 += 2;
  if (marketGrowthRate > 30) pilier3 += 2;

  // Secteur en vogue 2026 — 6 points
  const hotSectors = ['ia', 'saas-b2b', 'saas b2b', 'fintech', 'healthtech', 'greentech', 'deeptech', 'cybersecurite', 'cybersécurité', 'ia & data'];
  const topSectors = ['ia', 'saas b2b', 'saas-b2b', 'deeptech', 'ia & data'];
  if (hotSectors.some(s => sector.includes(s))) pilier3 += 4;
  if (topSectors.some(s => sector.includes(s))) pilier3 += 2;

  pilier3 = Math.min(pilier3, 20);

  // ── PILIER 4 — RISQUE & CONFORMITÉ — 20 points ─────────────────────────────
  let pilier4 = 0;

  const founderDependency = profile.founderDependency || 'high';
  const hasCTO = profile.hasCTO ?? profile.has_cto ?? false;
  const foundersCount = Number(profile.foundersCount) || 1;
  const hasBoard = profile.hasBoard || false;
  const hasCSuite = profile.hasC_suite || false;
  void hasCSuite;
  const hadExit = profile.hadExit === 'oui' || profile.hadExit === true || profile.had_exit === true
    || (Array.isArray(profile.team) && profile.team.some((m: { hadExit?: boolean }) => m.hadExit));
  const aiActCompliant = profile.aiActCompliant || false;
  const hasGDPR = profile.hasGDPRCompliance || false;
  const hasLegal = profile.hasLegalCounsel || false;
  const runway = Number(profile.runway) || 0;

  // Structure équipe — 8 points
  if (founderDependency === 'low')    pilier4 += 3;
  else if (founderDependency === 'medium') pilier4 += 1;
  if (hasCTO)             pilier4 += 2;
  if (foundersCount >= 2) pilier4 += 1;
  if (hasBoard)           pilier4 += 1;
  if (hadExit)            pilier4 += 1;

  // Conformité — 8 points
  if (aiActCompliant) pilier4 += 3;
  if (hasGDPR)        pilier4 += 3;
  if (hasLegal)       pilier4 += 2;

  // Runway — 4 points
  if (runway >= 18)      pilier4 += 4;
  else if (runway >= 12) pilier4 += 2;
  else if (runway >= 6)  pilier4 += 1;

  pilier4 = Math.min(pilier4, 20);

  // ── PILIER 5 — LIQUIDITÉ & EXIT — 15 points ────────────────────────────────
  let pilier5 = 0;

  const exitStrategy = profile.exitStrategy || '';
  const hasStrategicPartners = profile.hasStrategicPartners || false;
  const finalGoalValuation = Number(profile.finalGoalValuation ?? profile.final_goal_valuation) || 0;
  const fundraisingGoal = Number(profile.fundraisingGoal ?? profile.fundraising_goal) || 0;

  // Stratégie de sortie définie — 5 points
  if (exitStrategy && exitStrategy !== '') pilier5 += 3;
  if (['acquisition', 'ipo'].includes(exitStrategy)) pilier5 += 2;

  // Partenaires stratégiques — 4 points
  if (hasStrategicPartners) pilier5 += 4;

  // Cohérence valorisation — 6 points
  if (finalGoalValuation > 0)                         pilier5 += 2;
  if (finalGoalValuation > fundraisingGoal * 5)        pilier5 += 2;
  if (finalGoalValuation > 50_000_000)                 pilier5 += 2;

  pilier5 = Math.min(pilier5, 15);

  // ── TOTAL & INVESTISSABILITÉ ────────────────────────────────────────────────
  const total = Math.min(Math.round(pilier1 + pilier2 + pilier3 + pilier4 + pilier5), 100);

  // Probabilité d'exit dans 5 ans
  const probabiliteExit5ans = Math.min(
    Math.round(
      (pilier1 / 25 * 30) +
      (pilier2 / 20 * 20) +
      (pilier3 / 20 * 25) +
      (pilier4 / 20 * 15) +
      (pilier5 / 15 * 10),
    ),
    95,
  );

  const investissabilite: ScoreResult['investissabilite'] =
    total >= 75 ? 'excellente' :
    total >= 55 ? 'bonne' :
    total >= 35 ? 'moyenne' : 'faible';

  return {
    total,
    pilier1_fintech: pilier1,
    pilier2_tech: pilier2,
    pilier3_marche: pilier3,
    pilier4_risque: pilier4,
    pilier5_liquidite: pilier5,
    burnMultipleScore: burnMultiple < 1 ? 5 : burnMultiple < 1.5 ? 3 : 1,
    ltvCacScore: ltvCac > 5 ? 5 : ltvCac > 3 ? 3 : 0,
    moatScore: Math.min(moatCount * 2, 6),
    ipScore: (hasProprietaryTech ? 4 : 0) + (hasUniqueData ? 4 : 0) + (hasPatent ? 2 : 0),
    tamScore: tamSize > 1_000_000_000 ? 8 : tamSize > 500_000_000 ? 6 : tamSize > 100_000_000 ? 4 : 0,
    conformiteScore: (aiActCompliant ? 3 : 0) + (hasGDPR ? 3 : 0) + (hasLegal ? 2 : 0),
    equipeScore: pilier4,
    exitScore: pilier5,
    investissabilite,
    probabiliteExit5ans,
  };
}

export function getScoreLevel(score: number) {
  if (score < 25) return {
    label: 'Non investissable',
    color: '#FFB3B3',
    textColor: '#8F1A1A',
    advice: 'Le dossier présente trop de lacunes fondamentales pour intéresser des investisseurs professionnels.',
  };
  if (score < 45) return {
    label: 'Investissabilité faible',
    color: '#FFB96D',
    textColor: '#7A3D00',
    advice: 'Des éléments clés manquent. Concentrez-vous sur la traction et la structure avant de pitcher.',
  };
  if (score < 60) return {
    label: 'Investissabilité moyenne',
    color: '#ABC5FE',
    textColor: '#1A3A8F',
    advice: 'Profil intéressant pour des business angels. Pas encore prêt pour les fonds institutionnels.',
  };
  if (score < 75) return {
    label: 'Bonne investissabilité',
    color: '#D8FFBD',
    textColor: '#2D6A00',
    advice: 'Dossier solide. Vous pouvez pitcher des fonds seed et série A avec confiance.',
  };
  return {
    label: 'Excellente investissabilité',
    color: '#CDB4FF',
    textColor: '#3D0D8F',
    advice: 'Profil top-tier. Vous avez les attributs des startups qui lèvent rapidement et à bonne valorisation.',
  };
}

// Legacy compatibility — alias
export { getScoreLevel as getLevel };
