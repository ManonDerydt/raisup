import investors, { Investor } from '../data/investors';
import type { TestStartup } from '../data/testStartups';

export interface MatchResult {
  investor: Investor;
  score: number;           // 0–100
  breakdown: {
    sector: number;        // 0 ou 40
    stage: number;         // 0 ou 30
    ticket: number;        // 0 ou 20
    location: number;      // 0 ou 10
  };
  whyMatch: string;
}

export interface MatchOutput {
  dilutive: MatchResult[];
  nonDilutive: MatchResult[];
}

/**
 * Normalise un secteur startup vers les labels utilisés dans la base investisseurs.
 */
function normalizeSector(sector: string): string[] {
  const map: Record<string, string[]> = {
    'SaaS':         ['SaaS', 'B2B', 'DevTools'],
    'FinTech':      ['FinTech', 'InsurTech', 'Blockchain'],
    'HealthTech':   ['HealthTech', 'MedTech', 'BioTech', 'Santé'],
    'GreenTech':    ['GreenTech', 'CleanTech', 'AgriTech', 'Energie', 'Impact'],
    'DeepTech':     ['DeepTech', 'IA', 'Quantique', 'Robotique'],
    'IA':           ['IA', 'DeepTech', 'SaaS'],
    'EdTech':       ['EdTech', 'HRTech', 'FutureOfWork'],
    'Marketplace':  ['Marketplace', 'E-commerce', 'RetailTech'],
    'PropTech':     ['PropTech', 'SmartCity', 'Construction'],
    'InsurTech':    ['InsurTech', 'FinTech'],
    'Cybersécurité':['Cybersécurité', 'DeepTech'],
    'Numérique':    ['SaaS', 'IA', 'Numérique'],
  };
  return map[sector] ?? [sector];
}

/**
 * Génère une phrase expliquant pourquoi l'investisseur matche.
 */
function buildWhyMatch(investor: Investor, startup: TestStartup, breakdown: MatchResult['breakdown']): string {
  const parts: string[] = [];

  if (breakdown.sector > 0) {
    const matchedSector = investor.sectors.find(s =>
      normalizeSector(startup.sector).includes(s)
    );
    parts.push(`Investit activement en ${matchedSector ?? startup.sector}`);
  }
  if (breakdown.stage > 0) {
    parts.push(`Ticket aligné sur le stade ${startup.stage}`);
  }
  if (breakdown.ticket > 0) {
    const avg = Math.round((investor.ticketMin + investor.ticketMax) / 2 / 1000);
    if (investor.type === 'non-dilutif' && investor.ticketMin === 0) {
      parts.push('Dispositif gratuit, aucune dilution');
    } else {
      parts.push(`Fourchette couvre ton besoin (ticket moyen ~${avg}K€)`);
    }
  }
  if (breakdown.location > 0) {
    parts.push(`Basé en France, proximité géographique`);
  }

  return parts.join(' · ') || 'Profil compatible';
}

/**
 * Calcule le score de compatibilité entre un investisseur et une startup.
 * Scoring :
 *   Secteur correspondant  : 40 pts
 *   Stade correspondant    : 30 pts
 *   Ticket dans fourchette : 20 pts
 *   Localisation France    : 10 pts
 */
function scoreInvestor(investor: Investor, startup: TestStartup): MatchResult {
  const breakdown = { sector: 0, stage: 0, ticket: 0, location: 0 };

  // Secteur (40 pts)
  const startupSectors = normalizeSector(startup.sector);
  if (investor.sectors.some(s => startupSectors.includes(s))) {
    breakdown.sector = 40;
  }

  // Stade (30 pts)
  if (investor.stages.includes(startup.stage)) {
    breakdown.stage = 30;
  }

  // Ticket (20 pts) — non-dilutif avec ticketMin=0 compte toujours
  if (investor.type === 'non-dilutif' && investor.ticketMin === 0) {
    breakdown.ticket = 20;
  } else if (
    startup.fundingAmount >= investor.ticketMin &&
    startup.fundingAmount <= investor.ticketMax
  ) {
    breakdown.ticket = 20;
  } else if (
    // ticket proche ± 50%
    startup.fundingAmount >= investor.ticketMin * 0.5 &&
    startup.fundingAmount <= investor.ticketMax * 1.5
  ) {
    breakdown.ticket = 10;
  }

  // Localisation (10 pts)
  if (
    investor.location === 'France' ||
    investor.location === startup.location ||
    startup.location === 'Paris' ||
    startup.location === 'Île-de-France'
  ) {
    breakdown.location = 10;
  }

  const score = breakdown.sector + breakdown.stage + breakdown.ticket + breakdown.location;
  const whyMatch = buildWhyMatch(investor, startup, breakdown);

  return { investor, score, breakdown, whyMatch };
}

/**
 * Retourne les investisseurs et dispositifs matchés pour une startup.
 * @param startup  Profil de la startup
 * @param topN     Nombre de résultats à retourner par catégorie (défaut 5)
 */
export function matchInvestors(startup: TestStartup, topN = 5): MatchOutput {
  const allResults = investors.map(inv => scoreInvestor(inv, startup));

  const dilutive = allResults
    .filter(r => r.investor.type !== 'non-dilutif' && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const nonDilutive = allResults
    .filter(r => r.investor.type === 'non-dilutif' && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return { dilutive, nonDilutive };
}

/** Couleur du badge selon le score */
export function scoreBadgeColor(score: number): 'green' | 'orange' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 50) return 'orange';
  return 'red';
}

/** Label du type investisseur */
export function investorTypeLabel(type: Investor['type']): string {
  const labels: Record<Investor['type'], string> = {
    'VC': 'Venture Capital',
    'angel': 'Business Angel',
    'family-office': 'Family Office',
    'non-dilutif': 'Non dilutif',
  };
  return labels[type];
}

/** Formate un montant en euros lisible */
export function formatTicket(min: number, max: number): string {
  if (min === 0 && max === 0) return 'Gratuit';
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${n / 1_000_000}M€` : `${n / 1_000}K€`;
  if (min === max) return fmt(min);
  return `${fmt(min)} – ${fmt(max)}`;
}
