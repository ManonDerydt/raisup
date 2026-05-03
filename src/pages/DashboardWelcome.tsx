import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { calculateScore as calculateScoreService, getScoreLevel, ScoreResult } from '../services/calculateScore';
import { matchInvestors as matchInvestorsService, MatchResult } from '../services/matchInvestors';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import jsPDF from 'jspdf';
import {
  Sparkles, AlertTriangle, Lightbulb, AlertCircle, ArrowRight,
  Mail, MapPin, Lock, Users, TrendingUp, FileText, Star, X, Download,
  Clock, Trophy, Zap,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TeamMember {
  name?: string;
  role?: string;
  hadExit?: boolean;
}

interface Profile {
  firstName?: string;
  lastName?: string;
  founderName?: string;
  email?: string;
  phone?: string;
  startupName?: string;
  projectName?: string;
  sector?: string;
  stage?: string;
  country?: string;
  region?: string;
  city?: string;
  description?: string;
  oneLiner?: string;
  businessModel?: string;
  clientType?: string;
  mrr?: number | null;
  currentRevenue?: number | null;
  momGrowth?: number | null;
  growthMoM?: number | null;
  activeClients?: number | null;
  runway?: number | null;
  burnRate?: number | null;
  fundraisingGoal?: number | null;
  fundingNeeded?: number | null;
  maxDilution?: number | null;
  finalGoalValuation?: number | null;
  fundraisingTimeline?: string;
  fundingTimeline?: string;
  fundingPreference?: string;
  fundingTypes?: string[];
  isPreRevenue?: boolean;
  teamSize?: number | null;
  hasCTO?: boolean;
  foundersCount?: number | null;
  sectorExperience?: string;
  previousStartup?: string;
  hadExit?: string;
  advisors?: number | null;
  problem?: string;
  solution?: string;
  competitiveAdvantage?: string;
  ambition?: string;
  ambitions?: string[];
  team?: TeamMember[];
  intellectualProperty?: string;
  moat?: string;
  barriers?: string;
  deckFileName?: string;
  freeText?: string;
  churnRate?: number | null;
}

// ScoreResult is imported from ../services/calculateScore

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n?: number | null): string {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

function getMRRPercentile(mrr: number, stage: string): number {
  if (mrr === 0) return 0;
  const s = stage.toLowerCase();
  if (s.includes('pre') || s.includes('idéat') || s.includes('ideat')) {
    if (mrr < 500) return 10;
    if (mrr < 2000) return 25;
    if (mrr < 5000) return 50;
    return 75;
  }
  if (s.includes('seed') || s.includes('mvp') || s.includes('prototype')) {
    if (mrr < 5000) return 15;
    if (mrr < 15000) return 35;
    if (mrr < 30000) return 55;
    if (mrr < 50000) return 75;
    return 90;
  }
  // series-a+
  if (mrr < 50000) return 20;
  if (mrr < 100000) return 40;
  if (mrr < 250000) return 65;
  return 85;
}

function getStageBadge(stage?: string): { bg: string; color: string; label: string } {
  const s = (stage ?? '').toLowerCase();
  if (s.includes('pre') || s.includes('idéat') || s.includes('ideat'))
    return { bg: '#D8FFBD', color: '#2D6A00', label: stage ?? 'Pre-seed' };
  if (s.includes('seed') || s.includes('mvp') || s.includes('prototype'))
    return { bg: '#ABC5FE', color: '#1A3A8F', label: stage ?? 'Seed' };
  if (s.includes('serie') || s.includes('série') || s.includes('croissance'))
    return { bg: '#CDB4FF', color: '#3D0D8F', label: stage ?? 'Série A' };
  return { bg: '#F3F4F6', color: '#374151', label: stage ?? 'Démarrage' };
}

// getLevel is imported as getScoreLevel from ../services/calculateScore


// ─── Investor matching ────────────────────────────────────────────────────────

function normalizeStage(stage: string): 'pre-seed' | 'seed' | 'series-a' | 'series-b' {
  const s = stage.toLowerCase();
  if (s.includes('série a') || s.includes('serie-a') || s.includes('series-a')) return 'series-a';
  if (s.includes('série b') || s.includes('serie-b') || s.includes('series-b')) return 'series-b';
  if (s.includes('seed') || s.includes('mvp') || s.includes('croissance')) return 'seed';
  return 'pre-seed';
}

function buildStartupForMatching(p: Profile) {
  return {
    id: p.email || 'user',
    name: p.startupName || p.projectName || 'Ma startup',
    sector: p.sector || '',
    stage: normalizeStage(p.stage ?? 'pre-seed'),
    fundingAmount: p.fundraisingGoal ?? p.fundingNeeded ?? 0,
    mrr: p.mrr ?? 0,
    location: p.city || p.region || p.country || 'France',
    description: p.description || '',
    emoji: '🚀',
  };
}

// ─── Non-dilutive (profile-based) ─────────────────────────────────────────────

interface NonDilutifItem {
  name: string;
  organisme: string;
  montant: number;
  initiales: string;
}

function generateNonDilutifSummary(profile: Profile): NonDilutifItem[] {
  const dispositifs: NonDilutifItem[] = [];
  const sector = (profile.sector ?? '').toLowerCase();
  const deepTech = ['deeptech', 'ia', 'healthtech', 'ia & data', 'intelligence artificielle'];
  const euSectors = [...deepTech, 'greentech'];
  const euCountries = ['France', 'Irlande', 'Belgique', 'Allemagne'];

  if (profile.country === 'France') {
    dispositifs.push({ name: 'Bourse French Tech', organisme: 'BPI', montant: 90000, initiales: 'BPI' });
    dispositifs.push({ name: 'CIR', organisme: 'État', montant: Math.round((profile.burnRate ?? 5000) * 12 * 0.3), initiales: 'CIR' });
    if (profile.region === 'Île-de-France')
      dispositifs.push({ name: "Innov'up IDF", organisme: 'Région IDF', montant: 200000, initiales: 'IDF' });
    if (deepTech.some(s => sector.includes(s)))
      dispositifs.push({ name: 'Plan DeepTech BPI', organisme: 'BPI', montant: 500000, initiales: 'DT' });
  }

  if (profile.country === 'Irlande') {
    dispositifs.push({ name: 'Enterprise Ireland HPSU', organisme: 'EI', montant: 500000, initiales: 'EI' });
    dispositifs.push({ name: 'R&D Tax Credit', organisme: 'Revenue', montant: Math.round((profile.burnRate ?? 5000) * 12 * 0.25), initiales: 'RD' });
  }

  if (profile.country === 'Belgique') {
    dispositifs.push({ name: 'Innoviris Explore', organisme: 'Innoviris', montant: 50000, initiales: 'INV' });
    dispositifs.push({ name: 'Primes SPW', organisme: 'SPW', montant: 100000, initiales: 'SPW' });
  }

  if (euCountries.includes(profile.country ?? '') && euSectors.some(s => sector.includes(s)))
    dispositifs.push({ name: 'EIC Accelerator EU', organisme: 'EU', montant: 2500000, initiales: 'EU' });

  return dispositifs;
}

// ─── Vigilances ───────────────────────────────────────────────────────────────

interface Vigilance {
  severity: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  cta?: string;
  ctaLink?: string;
}

function getVigilances(profile: Profile): Vigilance[] {
  const vigilances: Vigilance[] = [];
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const goal = profile.fundraisingGoal ?? profile.fundingNeeded ?? 0;
  const stage = (profile.stage ?? '').toLowerCase();
  const bm = (profile.businessModel ?? '').toLowerCase();
  const burn = profile.burnRate ?? 10_000;
  const runway = profile.runway ?? null;

  // ── Runway critique
  if (runway !== null && runway < 3) {
    const cashOutDate = new Date();
    cashOutDate.setMonth(cashOutDate.getMonth() + runway);
    const dateStr = cashOutDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    vigilances.push({
      severity: 'danger',
      title: `Cash-out estimé en ${dateStr} — urgence absolue`,
      message: `Avec ${runway} mois de runway (${formatAmount(burn * runway)} de trésorerie restante), lever des fonds est quasi impossible — les négociations prennent 4 à 6 mois minimum. Priorité : pont de trésorerie immédiat.`,
      cta: 'Voir les financements pont →',
      ctaLink: '/dashboard/non-dilutif',
    });
  } else if (runway !== null && runway < 6) {
    const cashOutDate = new Date();
    cashOutDate.setMonth(cashOutDate.getMonth() + runway);
    const dateStr = cashOutDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    vigilances.push({
      severity: 'warning',
      title: `Runway insuffisant — cash-out estimé ${dateStr}`,
      message: `${runway} mois de runway, soit ${formatAmount(burn * runway)} de trésorerie. Une levée prend 4 à 6 mois en France — vous n'avez aucune marge de négociation. Commencez les démarches cette semaine.`,
      cta: 'Lancer ma levée →',
      ctaLink: '/dashboard/fundraising',
    });
  }

  // ── Montant levée trop élevé
  if (goal > 2_000_000 && mrr === 0 && (stage.includes('pre') || stage.includes('seed'))) {
    const mrrPercentile = getMRRPercentile(mrr, profile.stage ?? '');
    vigilances.push({
      severity: 'danger',
      title: 'Montant de levée incompatible avec votre stade',
      message: `Lever ${formatAmount(goal)} sans revenus en ${profile.stage ?? 'pre-seed'} est refusé par 97% des fonds institutionnels. La médiane des tickets pre-seed est 300–600K€. Votre MRR vous place au ${mrrPercentile}e percentile de votre stade.`,
      cta: 'Recalibrer mon objectif →',
      ctaLink: '/onboarding/raisup',
    });
  }

  // ── Modèle non scalable
  if ((bm.includes('services') || bm.includes('conseil')) && (profile.finalGoalValuation ?? 0) >= 50_000_000)
    vigilances.push({
      severity: 'warning',
      title: 'Modèle non scalable vs ambition élevée',
      message: `Un modèle de services ne dépasse pas 5–10M€ de valorisation sans transformation produit. Pour atteindre ${formatAmount(profile.finalGoalValuation)}, il faut productiser en SaaS ou marketplace — le ratio chiffre d'affaires / headcount doit être > 150K€/personne.`,
      cta: 'Explorer la productisation →',
      ctaLink: '/dashboard/score',
    });

  // ── Pas de CTO SaaS
  if (!profile.hasCTO && bm.includes('saas'))
    vigilances.push({
      severity: 'warning',
      title: 'Pas de CTO identifié pour un SaaS',
      message: "83% des fonds VC refusent de financer un SaaS sans associé technique. Sans CTO co-fondateur, votre valorisation sera divisée par 2 à 3 et les term sheets incluront des clauses contraignantes sur le recrutement technique.",
      cta: 'Comment trouver un CTO →',
      ctaLink: '/dashboard/score',
    });

  // ── Solo founder
  if ((profile.foundersCount ?? profile.team?.length ?? 1) === 1)
    vigilances.push({
      severity: 'info',
      title: 'Solo founder — point de vigilance investisseur',
      message: "72% des fonds VC privilégient les équipes de 2–3 fondateurs. Les raisons les plus citées : risque de burnout, angle mort stratégique, et taux d'échec 2× plus élevé. Envisagez d'associer un profil complémentaire avant de pitcher.",
      cta: 'Renforcer mon dossier →',
      ctaLink: '/dashboard/score',
    });

  // ── Churn élevé
  if ((profile.churnRate ?? 0) > 5)
    vigilances.push({
      severity: 'warning',
      title: `Churn de ${profile.churnRate}% — signal négatif critique`,
      message: `Un churn mensuel > 5% signifie que vous perdez plus de la moitié de vos clients en 12 mois. La médiane SaaS B2B est 1–2%/mois. Les investisseurs refusent systématiquement les dossiers avec un churn > 3% sans plan d'action documenté.`,
    });

  // ── Licorne secteur inadapté
  if ((profile.finalGoalValuation ?? 0) >= 1_000_000_000 && !['SaaS B2B', 'IA & Data', 'Deeptech', 'Fintech', 'Healthtech'].includes(profile.sector ?? ''))
    vigilances.push({
      severity: 'info',
      title: 'Objectif licorne difficile pour ce secteur',
      message: `0,07% des startups atteignent 1Md€. Dans le secteur ${profile.sector ?? 'actuel'}, les licornes mondiales se comptent sur les doigts d'une main. Ramenez votre ambition à 100–200M€ pour crédibiliser le dossier auprès des fonds early-stage.`,
    });

  // ── BPI hors France
  if (profile.country !== 'France' && (profile.fundingPreference ?? '').includes('Non-dilutif'))
    vigilances.push({
      severity: 'info',
      title: 'BPI France non accessible depuis votre pays',
      message: `Votre siège est à ${profile.country ?? "l'étranger"}. Les dispositifs BPI (Bourse French Tech, CIR, Plan DeepTech) sont réservés aux entités immatriculées en France. Envisagez une holding française ou explorez les équivalents locaux.`,
    });

  return vigilances;
}

// ─── Opportunités ─────────────────────────────────────────────────────────────

type OpportunityCategory = 'financement' | 'marche' | 'structure' | 'actualite';

interface Opportunity {
  title: string;
  message: string;
  amount?: number;
  timeline?: string;
  icon?: string;
  fromFreeText?: boolean;
  category: OpportunityCategory;
  tag?: string;
}

function getOpportunities(profile: Profile): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const sec = (profile.sector ?? '').toLowerCase();
  const bm = (profile.businessModel ?? '').toLowerCase();
  const stage = (profile.stage ?? '').toLowerCase();
  const freeText = (profile.freeText ?? '').toLowerCase();
  const euCountries = ['France', 'Irlande', 'Belgique', 'Allemagne', 'Espagne'];
  const deepSectors = ['deeptech', 'ia', 'healthtech', 'greentech', 'intelligence artificielle'];

  // ── FINANCEMENT ───────────────────────────────────────────────────────────────

  if (profile.country === 'France') {
    opportunities.push({
      category: 'financement', icon: '🏛️',
      title: 'Bourse French Tech — BPI',
      message: 'Subvention non-remboursable de 30 à 90K€ pour les startups en développement. Accessible dès le pre-seed. Taux de succès moyen : 40%. Délai de réponse : 8 semaines.',
      amount: 90_000, timeline: '8 semaines',
    });

    const cir = Math.round((profile.burnRate ?? 10_000) * 12 * 0.30);
    opportunities.push({
      category: 'financement', icon: '💡',
      title: 'CIR — Crédit Impôt Recherche',
      message: `30% de vos dépenses R&D remboursées par l'État. Sur votre burn rate actuel, cela représente ${formatAmount(cir)} récupérables par an. Encaissable via BPI en 6 mois.`,
      amount: cir, timeline: '6 mois (via BPI)',
    });
  }

  if (profile.country === 'France' && (sec.includes('ia') || sec.includes('saas') || sec.includes('deeptech') || sec.includes('healthtech') || sec.includes('fintech'))) {
    opportunities.push({
      category: 'financement', icon: '⚡',
      title: 'Statut JEI — Jeune Entreprise Innovante',
      message: "Exonération de charges sociales sur les salaires R&D (jusqu'à 70% d'économies) + impôt sur les bénéfices. Applicable si < 8 ans et dépenses R&D > 15% des charges totales.",
      amount: 30_000, timeline: 'Immédiat (sur déclaration)',
    });
  }

  if (euCountries.includes(profile.country ?? '') && deepSectors.some(s => sec.includes(s))) {
    opportunities.push({
      category: 'financement', icon: '🇪🇺',
      title: 'EIC Accelerator — Commission Européenne',
      message: `Financement mixte (subvention jusqu'à 2.5M€ + equity jusqu'à 15M€) pour les deeptech à fort potentiel. Votre secteur est éligible. Prochaine fenêtre : mars 2026. Taux d'acceptation : 5%.`,
      amount: 2_500_000, timeline: '6–9 mois',
    });
  }

  if (profile.country === 'France' && profile.region === 'Île-de-France') {
    opportunities.push({
      category: 'financement', icon: '📍',
      title: "Innov'up IDF — Région Île-de-France",
      message: 'Aide régionale de 50 à 200K€ pour les startups franciliennes. Instruction en 3 mois, décaissement rapide.',
      amount: 200_000, timeline: '3 mois',
    });
  }

  if (profile.country === 'France' && (sec.includes('deeptech') || sec.includes('ia'))) {
    opportunities.push({
      category: 'financement', icon: '🔬',
      title: 'Plan DeepTech BPI — financement prioritaire',
      message: 'Financement de 1 à 5M€ pour les technologies de rupture. Instruction accélérée (4 mois) et accompagnement BPI dédié.',
      amount: 5_000_000, timeline: '4 mois',
    });
  }

  if (!stage.includes('serie')) {
    opportunities.push({
      category: 'financement', icon: '💰',
      title: 'Prêt Amorçage BPI — 50 à 300K€',
      message: 'Prêt à taux zéro sans garantie personnelle pour les startups innovantes. Cumulable avec tous les autres dispositifs. Réponse en 6 semaines.',
      amount: 300_000, timeline: '6 semaines',
    });
  }

  if (freeText.includes('entreprise') || freeText.includes('grand compte') || freeText.includes('corporate')) {
    opportunities.push({
      category: 'financement', icon: '🏢',
      title: 'Clients corporate détectés — CVC accessible',
      message: 'Vous mentionnez des clients corporate. Les Corporate VC (Orange Ventures, LVMH Ventures, Bouygues Telecom Initiatives) investissent en priorité dans leurs fournisseurs stratégiques.',
      fromFreeText: true,
    });
  }

  // ── MARCHÉ ────────────────────────────────────────────────────────────────────

  if (sec.includes('ia') || sec.includes('intelligence artificielle') || sec.includes('ia & data')) {
    opportunities.push({
      category: 'marche', icon: '🤖',
      title: 'Marché IA générative : +40% en 2025–2026',
      message: `Le marché mondial de l'IA atteindra 1 200Md$ d'ici 2030 (Goldman Sachs). En Europe, la demande B2B pour des solutions IA sectorielles explose. Votre positionnement en ${profile.sector ?? 'IA'} est dans le segment le plus recherché par les investisseurs.`,
      tag: 'Tendance 2026',
    });
  }

  if (sec.includes('saas') || sec.includes('saas-b2b') || sec.includes('saas b2b')) {
    opportunities.push({
      category: 'marche', icon: '☁️',
      title: 'SaaS B2B : le segment préféré des VCs européens',
      message: `Le SaaS B2B représente 45% des deals early-stage en Europe en 2025. Les multiples de valorisation tiennent (8–15× ARR) pour les startups avec un NRR > 110%. ${mrr > 0 ? `Votre MRR de ${formatAmount(mrr)} vous positionne dans le peloton de tête.` : 'Obtenez vos premiers clients payants pour bénéficier de ces multiples.'}`,
      tag: 'Marché porteur',
    });
  }

  if (sec.includes('fintech') || sec.includes('finance')) {
    opportunities.push({
      category: 'marche', icon: '🏦',
      title: 'Open Banking & DORA : nouvelles opportunités fintech',
      message: `La directive DORA (entrée en vigueur jan. 2025) oblige les banques à renforcer leur résilience opérationnelle. Cela crée un marché B2B massif pour les solutions de conformité fintech. L'Open Banking ouvre également de nouveaux canaux de distribution.`,
      tag: 'Réglementation 2025',
    });
  }

  if (sec.includes('healthtech') || sec.includes('santé') || sec.includes('medic')) {
    opportunities.push({
      category: 'marche', icon: '🏥',
      title: 'Healthtech : remboursement ETAPES et virage digital',
      message: `Le programme ETAPES (expérimentations télésoin) ouvre la voie au remboursement des solutions numériques de santé. Le marché français du numérique en santé atteindra 4Md€ en 2027. Les hôpitaux investissent massivement en solutions digitales.`,
      tag: 'Remboursement possible',
    });
  }

  if (sec.includes('greentech') || sec.includes('climat') || sec.includes('energ')) {
    opportunities.push({
      category: 'marche', icon: '🌱',
      title: 'Green Deal européen : 1 000Md€ alloués',
      message: `Le Green Deal européen injecte 1 000Md€ sur 10 ans dans la transition énergétique. Les solutions cleantech / greentech sont prioritaires dans les appels à projets EU, BPI et ADEME. Votre secteur capte une part croissante des capitaux institutionnels.`,
      tag: 'Fonds EU disponibles',
    });
  }

  if (sec.includes('cybersec') || sec.includes('cyber') || sec.includes('sécurité')) {
    opportunities.push({
      category: 'marche', icon: '🛡️',
      title: 'Cybersécurité : marché en croissance de 15%/an',
      message: `Le marché européen de la cybersécurité croît de 15% par an. La directive NIS2 (octobre 2024) oblige 35 000 entreprises françaises supplémentaires à se conformer. Ce contexte réglementaire crée une demande structurelle pour votre secteur.`,
      tag: 'NIS2 — 2024',
    });
  }

  if (bm.includes('marketplace')) {
    opportunities.push({
      category: 'marche', icon: '🔄',
      title: 'Effet réseau : votre principal levier de croissance',
      message: `Les marketplaces avec un effet réseau fort se valorisent 3 à 5× plus que les SaaS équivalents. Documentez votre liquidity ratio (acheteurs/vendeurs actifs) et le GMV par cohorte — ce sont les KPIs clés que les VCs regardent en priorité.`,
      tag: 'Avantage concurrentiel',
    });
  }

  const mrrPercentile = getMRRPercentile(mrr, profile.stage ?? '');
  if (mrr > 10_000 && mrrPercentile >= 70) {
    opportunities.push({
      category: 'marche', icon: '📈',
      title: `${formatAmount(mrr)} MRR — top ${100 - mrrPercentile}% de votre stade`,
      message: `Vous êtes au ${mrrPercentile}e percentile des startups ${profile.stage ?? ''} en MRR. C'est votre argument commercial n°1 — mettez-le en tête de tous vos pitchs et cold emails investisseurs.`,
      tag: 'Argument différenciant',
    });
  }

  if (profile.team?.some(m => m.hadExit) || profile.hadExit === 'oui') {
    opportunities.push({
      category: 'marche', icon: '🏆',
      title: "Exit précédent dans l'équipe — signal investisseur fort",
      message: "Un fondateur avec exit multiplie par 3 la probabilité de closer un tour (PitchBook 2025). C'est le signal de qualité n°1 pour les fonds early-stage. Mentionnez-le dès la première ligne de vos cold emails.",
      tag: 'Signal fort',
    });
  }

  // ── STRUCTURE ─────────────────────────────────────────────────────────────────

  if (!profile.hasCTO && bm.includes('saas')) {
    opportunities.push({
      category: 'structure', icon: '👨‍💻',
      title: 'Recrutez un CTO co-fondateur — condition bloquante',
      message: "83% des fonds VC refusent de financer un SaaS sans associé technique. Explorez les plateformes cofounder (CoFoundersLab, Founder Dating, Station F) et les communautés tech locales. Un CTO avec 5% d'equity peut doubler votre valorisation perçue.",
      tag: 'Priorité haute',
    });
  }

  if ((profile.foundersCount ?? 1) === 1) {
    opportunities.push({
      category: 'structure', icon: '🤝',
      title: 'Associez-vous — solo founder à risque élevé',
      message: "72% des fonds privilégient les équipes de 2–3 fondateurs. Les raisons : résilience face au burnout, complémentarité des compétences, credibilité accrue. Un co-fondateur bien choisi peut faire passer votre valorisation de ×2 à ×4.",
      tag: 'Signal de risque',
    });
  }

  if (!profile.advisors || (profile.advisors ?? 0) < 2) {
    opportunities.push({
      category: 'structure', icon: '🎓',
      title: 'Recrutez 2–3 advisors stratégiques',
      message: `Les advisors reconnus dans votre secteur augmentent le score de crédibilité des term sheets. Visez un expert sectoriel, un ex-fondateur avec exit, et un profil réseau investisseurs. Rémunérez à 0,1–0,5% BSPCE.`,
      tag: 'Levier de crédibilité',
    });
  }

  if ((profile.runway ?? 12) < 18) {
    opportunities.push({
      category: 'structure', icon: '⏱️',
      title: 'Rallongez votre runway avant de pitcher',
      message: `Avec ${profile.runway ?? '?'} mois de runway, votre position de négociation est faible. Les VCs proposent systématiquement des conditions moins favorables aux startups en urgence. Visez 18 mois minimum avant d'entrer en processus — réduisez le burn ou levez un pont non-dilutif.`,
      tag: 'Gouvernance',
    });
  }

  if (bm.includes('saas') && profile.clientType === 'B2C') {
    opportunities.push({
      category: 'structure', icon: '🔄',
      title: 'Pivot B2B — multiple de valorisation ×3 à ×5',
      message: "Les SaaS B2B se valorisent 8–12× l'ARR contre 2–4× pour le B2C. Une offre entreprise avec contrats annuels multiplierait votre valorisation et réduirait votre churn drastiquement. Testez d'abord sur 5 PME.",
      tag: 'Levier valorisation',
    });
  }

  if (freeText.includes('brevet') || freeText.includes('ip') || freeText.includes('propriété intellectuelle')) {
    opportunities.push({
      category: 'structure', icon: '🔒',
      title: 'Protégez votre IP — valorisation +30 à 50%',
      message: "Vous mentionnez des brevets ou de la PI. Les actifs immatériels certifiés augmentent la valorisation de 30 à 50% en due diligence. Déposez un brevet provisoire BPI dans les 12 mois pour sécuriser votre antériorité.",
      fromFreeText: true,
      tag: 'Valorisation',
    });
  }

  if (!stage.includes('serie')) {
    opportunities.push({
      category: 'structure', icon: '📋',
      title: 'Mettez en place un pacte d\'associés',
      message: "Sans pacte d'associés formalisé, les investisseurs peuvent bloquer votre levée ou imposer des conditions défavorables. Un pacte bien rédigé inclut : clause de préemption, bad leaver / good leaver, drag-along. Budget : 3 à 8K€ chez un avocat spécialisé.",
      tag: 'Juridique',
    });
  }

  // ── ACTUALITÉS ────────────────────────────────────────────────────────────────

  if (sec.includes('ia') || sec.includes('intelligence artificielle')) {
    opportunities.push({
      category: 'actualite', icon: '📰',
      title: "EU AI Act — en vigueur depuis août 2024",
      message: "L'AI Act européen classe les usages IA par niveau de risque. Les systèmes à risque élevé (santé, recrutement, crédit) nécessitent une conformité documentée. Les startups IA conformes bénéficieront d'un avantage concurrentiel majeur dès 2026. Anticipez maintenant.",
      tag: 'Réglementation',
    });
  }

  if (sec.includes('fintech') || sec.includes('finance')) {
    opportunities.push({
      category: 'actualite', icon: '📰',
      title: 'DORA & NIS2 : fenêtre de marché pour les compliance tech',
      message: "Les directives DORA (résilience opérationnelle) et NIS2 (cybersécurité) créent une demande urgente de mise en conformité dans les secteurs financier et des infrastructures critiques. Les fintechs spécialisées compliance voient leur valorisation doubler en 2025.",
      tag: 'Actualité réglementaire',
    });
  }

  if (profile.country === 'France') {
    opportunities.push({
      category: 'actualite', icon: '🇫🇷',
      title: "French Tech 2030 — 10 nouvelles licornes visées",
      message: "Le programme French Tech 2030 sélectionne 125 startups pour un accompagnement accéléré vers le stade licorne. La candidature est ouverte aux startups avec un fort potentiel de croissance internationale. Prochaine session : juin 2026.",
      tag: 'Programme gouvernemental',
    });
  }

  if (euCountries.includes(profile.country ?? '')) {
    opportunities.push({
      category: 'actualite', icon: '🌍',
      title: 'Venture debt en hausse en Europe — alternative à l\'equity',
      message: "Les prêts venture debt ont augmenté de 60% en Europe en 2025, offrant une alternative non-dilutive entre deux levées. Les principaux acteurs : Kreos Capital, TriplePoint, BPI Prêt Innovation. Idéal pour financer 12–18 mois sans dilution supplémentaire.",
      tag: 'Tendance financement',
    });
  }

  if (sec.includes('healthtech') || sec.includes('santé')) {
    opportunities.push({
      category: 'actualite', icon: '📰',
      title: 'Plan France 2030 Santé numérique — 650M€ alloués',
      message: "Le volet Santé numérique de France 2030 finance les solutions de prévention, diagnostic IA, et télémédecine. Les appels à projets ANR et BPI sont ouverts. Financement jusqu'à 5M€ pour les projets sélectionnés.",
      tag: 'France 2030',
    });
  }

  if (sec.includes('saas') || sec.includes('b2b')) {
    opportunities.push({
      category: 'actualite', icon: '📊',
      title: 'Taux de rejet VC en hausse — focus sur la preuve',
      message: "En 2025, le taux de refus des dossiers seed a augmenté de 30% en Europe. Les fonds exigent désormais une preuve de traction plus solide (3 mois de MRR croissant, NPS > 50, LTV/CAC > 3). Documentez chaque métrique soigneusement avant de pitcher.",
      tag: 'Marché investissement',
    });
  }

  return opportunities;
}

// ─── Next actions ─────────────────────────────────────────────────────────────

interface NextAction {
  urgency: number;
  borderColor: string;
  iconName: string;
  title: string;
  description: string;
  cta: string;
  link: string;
}

function getNextActions(profile: Profile, score: ScoreResult, isPaid: boolean): NextAction[] {
  const actions: NextAction[] = [];
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;

  if ((profile.runway ?? Infinity) < 6)
    actions.push({
      urgency: 1, borderColor: '#FFB3B3', iconName: 'AlertCircle',
      title: 'Runway critique — agissez maintenant',
      description: `${profile.runway ?? '?'} mois de runway restants. Déposez une demande BPI Express cette semaine.`,
      cta: 'Voir les financements urgents',
      link: isPaid ? '/dashboard/non-dilutif' : '/pricing',
    });

  if (!profile.hasCTO && (profile.businessModel ?? '').toLowerCase().includes('saas'))
    actions.push({
      urgency: 2, borderColor: '#FFB96D', iconName: 'Users',
      title: 'Recrutez un CTO co-fondateur',
      description: "Sans profil technique, votre dossier sera systématiquement rejeté par les fonds institutionnels.",
      cta: 'Voir comment renforcer', link: '/dashboard/score',
    });

  if (score.total < 60)
    actions.push({
      urgency: 3, borderColor: '#F4B8CC', iconName: 'Star',
      title: 'Améliorez votre score Raisup',
      description: `Score actuel : ${score.total}/100. ${score.pilier1_fintech < 10 ? 'Documentez mieux votre traction MRR.' : score.pilier3_marche < 10 ? 'Renforcez votre analyse de marché.' : 'Complétez votre profil.'}`,
      cta: 'Voir les recommandations', link: '/dashboard/score',
    });

  if (mrr === 0)
    actions.push({
      urgency: 4, borderColor: '#ABC5FE', iconName: 'TrendingUp',
      title: 'Obtenez vos premiers clients',
      description: "La traction est le critère n°1 pour les investisseurs seed. Même 3 clients payants changent radicalement votre dossier.",
      cta: 'Voir la stratégie', link: '/dashboard/score',
    });

  actions.push({
    urgency: 5, borderColor: '#D8FFBD', iconName: 'FileText',
    title: 'Générez votre pitch deck',
    description: 'Votre deck personnalisé est prêt à être généré en 8 minutes avec vos données.',
    cta: isPaid ? 'Générer mon deck' : 'Débloquer la génération',
    link: isPaid ? '/dashboard/documents' : '/pricing',
  });

  return actions.sort((a, b) => a.urgency - b.urgency).slice(0, 3);
}

// ─── Fundraising recommendation ────────────────────────────────────────────────

interface FundraisingReco { possible: boolean | 'difficult'; reason?: string; alternative?: string }

function getFundraisingRecommendation(profile: Profile): FundraisingReco {
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const goal = profile.fundraisingGoal ?? profile.fundingNeeded ?? 0;
  const stage = (profile.stage ?? '').toLowerCase();
  const founders = profile.foundersCount ?? profile.team?.length ?? 1;

  if ((profile.runway ?? Infinity) < 2)
    return {
      possible: false,
      reason: "Avec moins de 2 mois de runway, aucun investisseur ne peut être approché.",
      alternative: "Priorité absolue : pont de trésorerie — prêt bancaire garanti BPI, love money, ou avance remboursable BPI Express (réponse en 15 jours).",
    };

  if (mrr === 0 && goal > 1_000_000 && stage.includes('pre'))
    return {
      possible: false,
      reason: `Lever ${formatAmount(goal)} en pre-seed sans revenus est quasi impossible auprès de fonds institutionnels.`,
      alternative: "Commencez par la Bourse French Tech BPI (jusqu'à 90K€), obtenez vos premiers clients, puis revenez avec un dossier renforcé.",
    };

  if (founders === 1 && goal > 500_000)
    return {
      possible: 'difficult',
      reason: "Solo founder avec un objectif > 500K€ — très difficile auprès des fonds institutionnels.",
      alternative: "Trouvez un co-fondateur complémentaire avant de pitcher des fonds.",
    };

  return { possible: true };
}

// ─── Treasury projection ───────────────────────────────────────────────────────

function buildTreasuryData(profile: Profile) {
  const initialCash = (profile.runway ?? 12) * (profile.burnRate ?? 10000);
  const burn = profile.burnRate ?? 10000;
  const raise = profile.fundraisingGoal ?? profile.fundingNeeded ?? 0;
  const nonDilutive = 200000;

  return Array.from({ length: 19 }, (_, i) => {
    const withoutRaise = Math.max(0, initialCash - burn * i);
    const withRaise = i >= 5 ? Math.max(0, initialCash - burn * i + raise) : withoutRaise;
    const withMixed = i >= 5 ? Math.max(0, initialCash - burn * i + raise + nonDilutive) : withoutRaise;
    return { month: `M${i}`, withoutRaise, withRaise, withMixed };
  });
}

// ─── Avatar colors ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#FFD6E5', text: '#C4728A' },
  { bg: '#ABC5FE', text: '#1A3A8F' },
  { bg: '#CDB4FF', text: '#3D0D8F' },
  { bg: '#FFE8C2', text: '#92520A' },
];

// ─── CircleGauge ─────────────────────────────────────────────────────────────

const CircleGauge: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 200); return () => clearTimeout(t); }, [score]);
  const size = 120;
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeLinecap="round"
          strokeDashoffset={circ - (anim / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black leading-none" style={{ color }}>{score}</span>
        <span className="text-[11px] text-gray-400 mt-0.5">/100</span>
      </div>
    </div>
  );
};

// ─── SubScoreBar ──────────────────────────────────────────────────────────────

const SubScoreBar: React.FC<{ label: string; value: number; max: number; color: string; analysis: string }> = ({
  label, value, max, color, analysis,
}) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
        <span className="text-sm font-black" style={{ color }}>
          {value}<span className="text-xs text-gray-400 font-normal">/{max}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full"
          style={{ width: `${(anim / max) * 100}%`, backgroundColor: color, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
      <p className="text-xs text-gray-500 leading-snug">{analysis}</p>
    </div>
  );
};

// ─── Action icon map ──────────────────────────────────────────────────────────

const ACTION_ICON: Record<string, React.ReactNode> = {
  AlertCircle: <AlertCircle className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Star: <Star className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
};

// ─── Score Modal ──────────────────────────────────────────────────────────────

const SCORE_CRITERIA = [
  {
    name: 'Pitch', points: 25, color: '#ABC5FE', bonus: false,
    evaluates: "clarté du problème, qualité de la solution, différenciation, proposition de valeur",
    progress: "définissez précisément le problème en une phrase, sourcez votre marché, expliquez votre avantage concurrentiel",
  },
  {
    name: 'Traction', points: 25, color: '#D8FFBD', bonus: false,
    evaluates: "MRR, croissance mensuelle, nombre de clients, churn",
    progress: "obtenez vos premiers clients payants, documentez votre croissance mois par mois",
  },
  {
    name: 'Équipe', points: 25, color: '#CDB4FF', bonus: false,
    evaluates: "nombre de fondateurs, présence CTO, expérience sectorielle, exits précédents",
    progress: "recrutez un co-fondateur complémentaire, ajoutez des advisors reconnus",
  },
  {
    name: 'Marché', points: 25, color: '#FFB96D', bonus: false,
    evaluates: "taille du marché, objectif de valorisation, montant de levée cohérent",
    progress: "définissez votre TAM SAM SOM, sourcez vos données marché",
  },
  {
    name: 'Défendabilité', points: 10, color: '#F4B8CC', bonus: true,
    evaluates: "brevets, effets de réseau, données propriétaires, switching costs",
    progress: "identifiez vos barrières à l'entrée réelles",
  },
  {
    name: 'Cohérence financière', points: 10, color: '#FFE8C2', bonus: true,
    evaluates: "cohérence entre ambition et moyens, runway suffisant, dilution réaliste",
    progress: "assurez-vous d'avoir 18 mois de runway post-levée minimum",
  },
];

const SCORE_LEVELS = [
  { range: '0–29',   label: 'Dossier insuffisant', color: '#FFB3B3' },
  { range: '30–49',  label: 'En construction',      color: '#FFB96D' },
  { range: '50–69',  label: 'Prometteur',            color: '#ABC5FE' },
  { range: '70–84',  label: 'Solide',                color: '#D8FFBD' },
  { range: '85–100', label: 'Excellent',             color: '#CDB4FF' },
];

const ScoreModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 p-4"
    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto"
      style={{ maxWidth: 640 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[20px] font-bold text-gray-900">Méthodologie du Score Raisup</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">
          Le Score Raisup est calculé sur 100 points à partir de 6 critères objectifs. Il évalue la maturité de votre dossier et votre probabilité de lever des fonds avec succès.
        </p>

        {/* Criteria */}
        <div className="space-y-3 mb-6">
          {SCORE_CRITERIA.map(c => (
            <div key={c.name} className="rounded-xl p-4" style={{ backgroundColor: '#F8F8F8' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[14px] font-bold text-gray-900">{c.name}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.color, color: '#0A0A0A' }}>
                  {c.points} pts{c.bonus ? ' bonus' : ''}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 mb-1">
                <span className="font-semibold text-gray-700">Ce qu'on évalue : </span>{c.evaluates}
              </p>
              <p className="text-[12px] text-gray-500">
                <span className="font-semibold text-gray-700">Comment progresser : </span>{c.progress}
              </p>
            </div>
          ))}
        </div>

        {/* Levels */}
        <p className="text-[13px] font-bold text-gray-900 mb-3">Niveaux de score</p>
        <div className="space-y-2 mb-6">
          {SCORE_LEVELS.map(l => (
            <div key={l.range} className="flex items-center gap-3">
              <span className="text-[12px] font-mono text-gray-500 w-14">{l.range}</span>
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: l.color, color: '#0A0A0A' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-gray-400 italic mb-5">
          Ce score est mis à jour automatiquement chaque fois que vous modifiez votre profil. Il est identique sur toutes les pages de Raisup.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full font-bold text-[14px] text-white border-0 cursor-pointer"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
);

// ─── PDF Export ───────────────────────────────────────────────────────────────

function downloadScorePDF(profile: Profile, score: ScoreResult) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const pink = [244, 184, 204] as const;
  const dark = [10, 10, 10] as const;
  const gray = [107, 114, 128] as const;
  const lightGray = [248, 248, 248] as const;

  const firstName = profile.firstName || profile.founderName || 'Fondateur';
  const lastName = profile.lastName ?? '';
  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const level = getScoreLevel(score.total);
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Header band
  doc.setFillColor(...pink);
  doc.rect(0, 0, W, 36, 'F');
  doc.setTextColor(...dark);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Score Raisup', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 40, 60);
  doc.text(`${startupName} · ${firstName} ${lastName}`, 14, 24);
  doc.text(`Généré le ${today}`, 14, 30);

  // ── Score global
  let y = 48;
  doc.setTextColor(...dark);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Score global', 14, y);

  // Cercle score (approximé)
  const cx = 168, cy = y + 12, r = 14;
  const levelColorHex = level.color.replace('#', '');
  const lr = parseInt(levelColorHex.slice(0, 2), 16);
  const lg = parseInt(levelColorHex.slice(2, 4), 16);
  const lb = parseInt(levelColorHex.slice(4, 6), 16);
  doc.setDrawColor(lr, lg, lb);
  doc.setLineWidth(3);
  doc.circle(cx, cy, r, 'S');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lr, lg, lb);
  doc.text(String(score.total), cx, cy + 2, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('/100', cx, cy + 7, { align: 'center' });

  // Niveau label
  y += 6;
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(lr, lg, lb);
  doc.text(level.label, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  const adviceLines = doc.splitTextToSize(level.advice, 130);
  doc.text(adviceLines, 14, y);
  y += adviceLines.length * 5 + 8;

  // ── Sous-scores
  doc.setDrawColor(243, 244, 246);
  doc.setLineWidth(0.3);
  doc.line(14, y, W - 14, y);
  y += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('Détail des sous-scores', 14, y);
  y += 7;

  const subScoreData = [
    { label: 'Fintech & Data',       value: score.pilier1_fintech,   max: 25, color: [171, 197, 254] as const },
    { label: 'Tech & IP',            value: score.pilier2_tech,      max: 20, color: [205, 180, 255] as const },
    { label: 'Marché & Momentum',    value: score.pilier3_marche,    max: 20, color: [216, 255, 189] as const },
    { label: 'Risque & Conformité',  value: score.pilier4_risque,    max: 20, color: [255, 185, 109] as const },
    { label: 'Liquidité & Exit',     value: score.pilier5_liquidite, max: 15, color: [244, 184, 204] as const },
  ];

  for (const ss of subScoreData) {
    // Background row
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, y - 4, W - 28, 14, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(ss.label, 18, y + 3);

    // Score badge
    doc.setFontSize(9);
    doc.setTextColor(ss.color[0] > 200 ? 60 : 30, 60, 60);
    doc.text(`${ss.value}/${ss.max}`, W - 18, y + 3, { align: 'right' });

    // Progress bar
    const barX = 70, barW = W - 28 - 70 - 20, barH = 3;
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(barX, y + 1, barW, barH, 1, 1, 'F');
    doc.setFillColor(...ss.color);
    const filled = Math.max(2, (ss.value / ss.max) * barW);
    doc.roundedRect(barX, y + 1, filled, barH, 1, 1, 'F');

    y += 16;
  }

  y += 4;

  // ── Chiffres clés
  doc.setDrawColor(243, 244, 246);
  doc.line(14, y, W - 14, y);
  y += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('Chiffres clés', 14, y);
  y += 7;

  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const teamCount = profile.team?.length ?? profile.foundersCount ?? 1;
  const metrics = [
    { label: 'MRR',            value: mrr > 0 ? formatAmount(mrr) : 'Pre-revenue' },
    { label: 'Runway',         value: profile.runway ? `${profile.runway} mois` : '—' },
    { label: 'Objectif levée', value: formatAmount(profile.fundraisingGoal ?? profile.fundingNeeded) },
    { label: 'Équipe',         value: `${teamCount} membre${teamCount > 1 ? 's' : ''}` },
  ];

  const colW = (W - 28) / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = 14 + col * colW;
    const my = y + row * 14;
    doc.setFillColor(...lightGray);
    doc.roundedRect(mx, my - 4, colW - 4, 12, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(m.label.toUpperCase(), mx + 4, my + 0.5);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(m.value, mx + 4, my + 5.5);
  });
  y += Math.ceil(metrics.length / 2) * 14 + 6;

  // ── Problème / Solution
  if (profile.problem) {
    doc.setDrawColor(243, 244, 246);
    doc.line(14, y, W - 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gray);
    doc.text('PROBLÈME RÉSOLU', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    const pbLines = doc.splitTextToSize(profile.problem, W - 28);
    doc.text(pbLines, 14, y);
    y += pbLines.length * 5 + 4;
  }

  if (profile.solution) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gray);
    doc.text('SOLUTION', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    const solLines = doc.splitTextToSize(profile.solution, W - 28);
    doc.text(solLines, 14, y);
    y += solLines.length * 5 + 4;
  }

  // ── Footer
  doc.setFillColor(...pink);
  doc.rect(0, 287, W, 10, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 40, 60);
  doc.text('Généré par Raisup · raisup.fr', W / 2, 293, { align: 'center' });

  doc.save(`score-raisup-${startupName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

// ─── Opportunities section with tabs ──────────────────────────────────────────

const OPPORTUNITY_TABS: { id: OpportunityCategory; label: string; color: string; bg: string }[] = [
  { id: 'marche',    label: '📈 Marché',    color: '#1A3A8F',  bg: '#ABC5FE' },
  { id: 'structure', label: '🏗️ Structure', color: '#3D0D8F',  bg: '#CDB4FF' },
  { id: 'actualite', label: '📰 Actus',     color: '#92520A',  bg: '#FFE8C2' },
];

const CATEGORY_STYLES: Record<OpportunityCategory, { border: string; bg: string; tagBg: string; tagColor: string }> = {
  financement: { border: '#D8FFBD', bg: '#F0FFF4', tagBg: '#D8FFBD', tagColor: '#2D6A00' },
  marche:      { border: '#ABC5FE', bg: '#F0F5FF', tagBg: '#ABC5FE', tagColor: '#1A3A8F' },
  structure:   { border: '#CDB4FF', bg: '#F5F0FF', tagBg: '#CDB4FF', tagColor: '#3D0D8F' },
  actualite:   { border: '#FFE8C2', bg: '#FFFBF5', tagBg: '#FFE8C2', tagColor: '#92520A' },
};

const OpportunitiesSection: React.FC<{
  opportunities: Opportunity[];
  formatAmount: (n?: number | null) => string;
}> = ({ opportunities, formatAmount }) => {
  const [activeTab, setActiveTab] = useState<OpportunityCategory>('marche');

  const filtered = opportunities.filter(o => o.category === activeTab);
  const counts: Record<string, number> = { all: opportunities.length };
  for (const cat of ['financement', 'marche', 'structure', 'actualite'] as OpportunityCategory[]) {
    counts[cat] = opportunities.filter(o => o.category === cat).length;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5" style={{ color: '#22C55E' }} />
        <h2 className="text-base font-bold text-gray-900">Opportunités identifiées</h2>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
          {opportunities.length} détectées
        </span>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {OPPORTUNITY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1 rounded-full text-[11px] font-bold transition-all"
            style={activeTab === tab.id
              ? { backgroundColor: tab.bg, color: tab.color }
              : { backgroundColor: '#F8F8F8', color: '#9CA3AF' }}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className="ml-1 opacity-60">({counts[tab.id]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((o, i) => {
          const style = CATEGORY_STYLES[o.category];
          return (
            <div key={i} className="p-4 rounded-xl text-sm"
              style={{ borderLeft: `4px solid ${style.border}`, backgroundColor: style.bg }}>
              <div className="flex gap-3">
                {o.icon && <span className="flex-shrink-0 text-[16px] mt-0.5">{o.icon}</span>}
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{o.title}</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed text-[13px]">{o.message}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.amount != null && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: style.tagBg, color: style.tagColor }}>
                        jusqu'à {formatAmount(o.amount)}
                      </span>
                    )}
                    {o.timeline && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        ⏱ {o.timeline}
                      </span>
                    )}
                    {o.tag && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: style.tagBg, color: style.tagColor, opacity: 0.8 }}>
                        {o.tag}
                      </span>
                    )}
                    {o.fromFreeText && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}>
                        ✨ Détecté par IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Profile Edit Modal ────────────────────────────────────────────────────────

const SECTORS_LIST = [
  'SaaS B2B', 'IA & Data', 'Fintech', 'Healthtech', 'Deeptech', 'Greentech',
  'Marketplace', 'E-commerce', 'Retail / Commerce', 'Cybersécurité', 'HRTech / RH',
];

const STAGES_LIST = [
  'Idéation / Pré-MVP', 'MVP / Prototype', 'Pre-seed', 'Seed', 'Série A', 'Série B+',
];

const BUSINESS_MODELS = ['SaaS', 'Marketplace', 'E-commerce', 'Services', 'Hardware', 'Freemium', 'API/Platform'];

const ProfileEditModal: React.FC<{
  profile: Profile;
  onUpdate: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onClose: () => void;
}> = ({ profile, onUpdate, onClose }) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNum = (key: keyof Profile, val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(key, (val === '' ? null : Number(val)) as Profile[typeof key]);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-h-[92vh] overflow-y-auto"
        style={{ maxWidth: 680 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-bold text-gray-900">Modifier mon profil</h3>
              <p className="text-[13px] text-gray-400 mt-0.5">Les modifications mettent le score à jour en temps réel</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Identité */}
          <section>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Identité</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Prénom</label>
                <input
                  type="text"
                  defaultValue={profile.firstName ?? ''}
                  onBlur={e => onUpdate('firstName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Nom</label>
                <input
                  type="text"
                  defaultValue={profile.lastName ?? ''}
                  onBlur={e => onUpdate('lastName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder="Nom"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Nom de la startup</label>
                <input
                  type="text"
                  defaultValue={profile.startupName ?? profile.projectName ?? ''}
                  onBlur={e => onUpdate('startupName', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder="Nom de votre startup"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">One-liner</label>
                <input
                  type="text"
                  defaultValue={profile.oneLiner ?? profile.description ?? ''}
                  onBlur={e => onUpdate('oneLiner', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 transition-colors"
                  placeholder="En une phrase, ce que vous faites..."
                />
              </div>
            </div>
          </section>

          {/* Positionnement */}
          <section>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Positionnement</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Secteur</label>
                <select
                  defaultValue={profile.sector ?? ''}
                  onChange={e => onUpdate('sector', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 bg-white appearance-none"
                >
                  <option value="">Choisir...</option>
                  {SECTORS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Stade</label>
                <select
                  defaultValue={profile.stage ?? ''}
                  onChange={e => onUpdate('stage', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 bg-white appearance-none"
                >
                  <option value="">Choisir...</option>
                  {STAGES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Modèle</label>
                <select
                  defaultValue={profile.businessModel ?? ''}
                  onChange={e => onUpdate('businessModel', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 bg-white appearance-none"
                >
                  <option value="">Choisir...</option>
                  {BUSINESS_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Type de clients</label>
                <select
                  defaultValue={profile.clientType ?? ''}
                  onChange={e => onUpdate('clientType', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 bg-white appearance-none"
                >
                  <option value="">Choisir...</option>
                  {['B2B', 'B2C', 'B2B2C', 'Marketplace'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Métriques financières */}
          <section>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Métriques financières</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'mrr',             label: 'MRR (€/mois)',         placeholder: '0' },
                { key: 'burnRate',         label: 'Burn rate (€/mois)',   placeholder: '10000' },
                { key: 'runway',           label: 'Runway (mois)',        placeholder: '12' },
                { key: 'fundraisingGoal',  label: 'Objectif levée (€)',   placeholder: '500000' },
                { key: 'finalGoalValuation', label: 'Valo cible (€)',     placeholder: '5000000' },
                { key: 'activeClients',    label: 'Clients actifs',       placeholder: '0' },
              ] as { key: keyof Profile; label: string; placeholder: string }[]).map(f => (
                <div key={f.key as string}>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={(profile[f.key] as number | null | undefined) ?? ''}
                    onChange={e => handleNum(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Équipe */}
          <section>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Équipe</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Nombre de fondateurs</label>
                <input
                  type="number" min={1} max={10}
                  defaultValue={profile.foundersCount ?? 1}
                  onChange={e => onUpdate('foundersCount', Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="hasCTO"
                  defaultChecked={profile.hasCTO ?? false}
                  onChange={e => onUpdate('hasCTO', e.target.checked)}
                  className="w-4 h-4 accent-gray-900"
                />
                <label htmlFor="hasCTO" className="text-[13px] font-semibold text-gray-700">CTO co-fondateur identifié</label>
              </div>
            </div>
          </section>

          {/* Localisation */}
          <section>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Localisation</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Pays</label>
                <select
                  defaultValue={profile.country ?? ''}
                  onChange={e => onUpdate('country', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 bg-white appearance-none"
                >
                  <option value="">Choisir...</option>
                  {['France', 'Belgique', 'Suisse', 'Irlande', 'Allemagne', 'Espagne', 'Autre'].map(c =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Région (si France)</label>
                <select
                  defaultValue={profile.region ?? ''}
                  onChange={e => onUpdate('region', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[14px] outline-none focus:border-gray-400 bg-white appearance-none"
                >
                  <option value="">Choisir...</option>
                  {['Île-de-France', 'Auvergne-Rhône-Alpes', 'PACA', 'Occitanie', 'Bretagne', 'Autre'].map(r =>
                    <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </section>

        </div>

        <div className="sticky bottom-0 bg-white rounded-b-2xl px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-[12px] text-gray-400">
            ✅ Score mis à jour automatiquement à chaque modification
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-[14px] text-white"
            style={{ backgroundColor: '#0A0A0A' }}
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const DashboardWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({});

  const { isPremium, user } = useUserProfile();
  const isPaid = isPremium;

  const [dbProfile, setDbProfile] = useState<Partial<Profile> | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single()
      .then(({ data }) => {
        if (!data) return;
        setDbProfile({
          startupName: data.startup_name,
          oneLiner: data.one_liner,
          ambition: data.ambition,
          businessModel: data.business_model,
          sector: data.sector,
          clientType: data.client_type,
          country: data.country,
          region: data.region,
          city: data.city,
          mrr: data.mrr,
          momGrowth: data.growth_mom,
          activeClients: data.active_clients,
          runway: data.runway,
          burnRate: data.burn_rate,
          fundraisingGoal: data.fundraising_goal,
          maxDilution: data.max_dilution,
          fundingPreference: data.funding_preference,
          finalGoalValuation: data.final_goal_valuation,
          fundingTimeline: data.fundraising_timeline,
          hasCTO: data.has_cto,
          problem: data.problem,
          solution: data.solution,
          competitiveAdvantage: data.competitive_advantage,
          teamSize: data.team_size,
        });
      });
  }, [user?.id]);

  const profile = useMemo<Profile>(() => {
    try {
      const a = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      const b = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
      return { ...b, ...a, ...(dbProfile || {}), ...editProfile };
    } catch { return { ...(dbProfile || {}), ...editProfile }; }
  }, [dbProfile, editProfile]);

  const updateProfileField = useCallback(<K extends keyof Profile>(key: K, value: Profile[K]) => {
    setEditProfile(prev => ({ ...prev, [key]: value }));
    try {
      const stored = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      localStorage.setItem('raisup_profile', JSON.stringify({ ...stored, [key]: value }));
    } catch { /* ignore */ }
    if (user?.id) {
      const colMap: Record<string, string> = {
        startupName: 'startup_name', oneLiner: 'one_liner', ambition: 'ambition',
        businessModel: 'business_model', sector: 'sector', clientType: 'client_type',
        country: 'country', region: 'region', city: 'city', mrr: 'mrr',
        momGrowth: 'growth_mom', activeClients: 'active_clients', runway: 'runway',
        burnRate: 'burn_rate', fundraisingGoal: 'fundraising_goal',
        maxDilution: 'max_dilution', fundingPreference: 'funding_preference',
        finalGoalValuation: 'final_goal_valuation', fundingTimeline: 'fundraising_timeline',
        hasCTO: 'has_cto', problem: 'problem', solution: 'solution',
        competitiveAdvantage: 'competitive_advantage', teamSize: 'team_size',
      };
      const col = colMap[key as string];
      if (col) supabase.from('profiles').update({ [col]: value }).eq('user_id', user.id);
    }
  }, [user?.id]);

  const score = useMemo(() => calculateScoreService(profile), [profile]);
  const level = useMemo(() => getScoreLevel(score.total), [score]);
  const investors = useMemo((): MatchResult[] => {
    if (!profile.sector || !profile.stage || !profile.fundraisingGoal) return [];
    const startup = buildStartupForMatching(profile);
    return matchInvestorsService(startup, 10).dilutive.filter(r => r.score >= 50);
  }, [profile]);
  const vigilances = useMemo(() => getVigilances(profile), [profile]);
  const opportunities = useMemo(() => getOpportunities(profile), [profile]);
  const actions = useMemo(() => getNextActions(profile, score, isPaid), [profile, score, isPaid]);
  const reco = useMemo(() => getFundraisingRecommendation(profile), [profile]);
  const ndFunding = useMemo(() => generateNonDilutifSummary(profile), [profile]);
  const treasuryData = useMemo(() => buildTreasuryData(profile), [profile]);

  const firstName = profile.firstName || profile.founderName || 'Fondateur';
  const lastName = profile.lastName ?? '';
  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const badge = getStageBadge(profile.stage);
  const oneLiner = profile.oneLiner || profile.description || '';
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  const teamCount = profile.team?.length ?? profile.foundersCount ?? 1;
  const totalNdPotential = ndFunding.reduce((sum, d) => sum + d.montant, 0);
  const avgMatch = investors.length > 0
    ? Math.round(investors.reduce((sum, inv) => sum + inv.score, 0) / investors.length)
    : 0;

  // Build team avatars
  const avatarList: { initials: string }[] = [];
  const fn0 = (profile.firstName || profile.founderName || '?')[0].toUpperCase();
  const ln0 = (profile.lastName || '')[0]?.toUpperCase() ?? '';
  avatarList.push({ initials: fn0 + ln0 });
  if (profile.team && profile.team.length > 0) {
    profile.team.slice(0, 3).forEach(m => {
      const parts = (m.name || m.role || '?').split(' ');
      avatarList.push({ initials: (parts[0]?.[0] ?? '?').toUpperCase() + (parts[1]?.[0] ?? '').toUpperCase() });
    });
  } else if ((profile.foundersCount ?? 1) > 1) {
    for (let i = 1; i < Math.min((profile.foundersCount ?? 1), 4); i++)
      avatarList.push({ initials: `F${i + 1}` });
  }
  const displayedAvatars = avatarList.slice(0, 4);

  const subScores = [
    {
      label: 'Fintech & Data',
      sublabel: 'MRR · Croissance · Burn Multiple · LTV/CAC',
      value: score.pilier1_fintech,
      max: 25,
      color: '#ABC5FE',
      analysis: score.pilier1_fintech >= 18 ? 'Métriques financières solides' : score.pilier1_fintech >= 10 ? 'Traction en cours, accélérez la croissance MRR' : 'Revenus et métriques financières à construire',
    },
    {
      label: 'Tech & IP',
      sublabel: 'Propriété intellectuelle · Données uniques · Moat',
      value: score.pilier2_tech,
      max: 20,
      color: '#CDB4FF',
      analysis: score.pilier2_tech >= 15 ? 'Moat technologique défendable' : score.pilier2_tech >= 8 ? 'Quelques avantages tech à renforcer' : 'Pas de barrière technologique identifiée',
    },
    {
      label: 'Marché & Momentum',
      sublabel: 'TAM · Croissance du marché · Timing sectoriel',
      value: score.pilier3_marche,
      max: 20,
      color: '#D8FFBD',
      analysis: score.pilier3_marche >= 15 ? 'Marché large et porteur' : score.pilier3_marche >= 8 ? 'Marché identifié, TAM à documenter' : 'Taille de marché à justifier',
    },
    {
      label: 'Risque & Conformité',
      sublabel: 'Équipe · AI Act 2026 · RGPD · Runway',
      value: score.pilier4_risque,
      max: 20,
      color: '#FFB96D',
      analysis: score.pilier4_risque >= 15 ? 'Profil de risque maîtrisé' : score.pilier4_risque >= 8 ? 'Quelques risques à adresser' : 'Risques structurels importants',
    },
    {
      label: 'Liquidité & Exit',
      sublabel: 'Stratégie de sortie · Partenaires · Valorisation',
      value: score.pilier5_liquidite,
      max: 15,
      color: '#F4B8CC',
      analysis: score.pilier5_liquidite >= 11 ? 'Stratégie de liquidité claire' : score.pilier5_liquidite >= 5 ? 'Exit envisagé, à formaliser' : 'Stratégie de sortie à définir',
    },
  ];

  const radarData = [
    { axis: 'Fintech & Data', current: Math.round((score.pilier1_fintech / 25) * 100), median: 40 },
    { axis: 'Tech & IP',      current: Math.round((score.pilier2_tech / 20) * 100),    median: 35 },
    { axis: 'Marché',         current: Math.round((score.pilier3_marche / 20) * 100),  median: 50 },
    { axis: 'Risque',         current: Math.round((score.pilier4_risque / 20) * 100),  median: 45 },
    { axis: 'Exit',           current: Math.round((score.pilier5_liquidite / 15) * 100), median: 30 },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Dev toggle */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                const current = localStorage.getItem('raisup_paid') === 'true';
                localStorage.setItem('raisup_paid', current ? 'false' : 'true');
                window.location.reload();
              }}
              className="text-[11px] border border-gray-300 rounded-full px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isPaid ? '🔓 Simuler non-payant' : '🔑 Simuler abonnement payant'}
            </button>
          </div>
        )}

        {/* ── RÉSUMÉ DU PROJET ─────────────────────────────────────────────────── */}
        <div className="bg-white shadow-sm mb-6" style={{ borderRadius: 16, padding: 24 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Colonne 1 : Identité */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full text-[18px] font-black"
                  style={{ width: 52, height: 52, backgroundColor: '#FFD6E5', color: '#C4728A' }}
                >
                  {fn0}{ln0}
                </div>
                <div>
                  <p className="text-[18px] font-bold text-gray-900 leading-tight">{firstName} {lastName}</p>
                  {profile.email && (
                    <p className="text-[13px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" />{profile.email}
                    </p>
                  )}
                  {(profile.city || profile.country) && (
                    <p className="text-[13px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {[profile.city, profile.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <span
                className="self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>
              <button
                onClick={() => navigate('/onboarding/raisup?from=dashboard')}
                className="self-start text-[12px] font-semibold border rounded-full px-3 py-1 transition-colors"
                style={{ borderColor: '#F4B8CC', color: '#C4728A', backgroundColor: '#FFF5F8' }}
              >
                ✏️ Modifier mon profil
              </button>
            </div>

            {/* Colonne 2 : Le projet */}
            <div className="flex flex-col gap-2">
              <p className="text-[20px] font-bold text-gray-900">{startupName}</p>
              {oneLiner && (
                <p className="text-[14px] text-gray-500 italic leading-snug">{oneLiner}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.sector && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#ABC5FE', color: '#1A3A8F' }}>
                    {profile.sector}
                  </span>
                )}
                {profile.businessModel && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#CDB4FF', color: '#3D0D8F' }}>
                    {profile.businessModel}
                  </span>
                )}
                {profile.clientType && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                    {profile.clientType}
                  </span>
                )}
              </div>
              {profile.deckFileName && (
                <div className="flex items-center gap-1.5 text-[13px] mt-1" style={{ color: '#C4728A' }}>
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Deck uploadé · {profile.deckFileName}</span>
                </div>
              )}
            </div>

            {/* Colonne 3 : Chiffres clés */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'MRR',           value: mrr > 0 ? formatAmount(mrr) : 'Pre-revenue' },
                { label: 'Runway',        value: profile.runway ? `${profile.runway} mois` : '—' },
                { label: 'Objectif levée', value: formatAmount(profile.fundraisingGoal ?? profile.fundingNeeded) },
                { label: 'Équipe',        value: `${teamCount} membre${teamCount > 1 ? 's' : ''}` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ backgroundColor: '#F8F8F8' }}>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                  <p className="text-[15px] font-black text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bandeau problème / solution */}
          {profile.problem && (
            <div className="mt-4 rounded-lg px-4 py-3" style={{ backgroundColor: '#F8F8F8' }}>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Problème résolu : </span>
              <span className="text-[13px] text-gray-700">{profile.problem}</span>
              {profile.solution && (
                <>
                  <span className="text-gray-300 mx-2">·</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Solution : </span>
                  <span className="text-[13px] text-gray-700">{profile.solution}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── LAYOUT 2 COLONNES ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COLONNE GAUCHE (2/3) ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Score Raisup */}
            <div className="bg-white rounded-2xl p-7 shadow-sm space-y-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
                  <h2 className="text-xl font-bold text-gray-900">Diagnostic Raisup</h2>
                </div>
                <button
                  onClick={() => downloadScorePDF(profile, score)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger PDF
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Gauge + niveau */}
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <CircleGauge score={score.total} color={level.color} />
                  <div>
                    <p className="text-base font-bold" style={{ color: level.color }}>{level.label}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-[220px] mx-auto">{level.advice}</p>
                  </div>
                  <button
                    onClick={() => setShowScoreModal(true)}
                    className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
                  >
                    Comment est calculé ce score ? →
                  </button>
                </div>

                {/* Sous-scores */}
                <div className="grid grid-cols-1 gap-3">
                  {subScores.map(ss => (
                    <SubScoreBar key={ss.label} {...ss} />
                  ))}
                </div>
              </div>
            </div>

            {/* Radar chart */}
            <div className="bg-white rounded-2xl p-7 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1">Votre profil vs médiane du secteur</h2>
              <p className="text-[13px] text-gray-400 mb-6">Comparaison sur 6 dimensions clés</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#F3F4F6" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} />
                  <Radar name="Votre profil" dataKey="current" stroke="#0A0A0A" fill="#0A0A0A" fillOpacity={0.12} strokeWidth={2.5} dot={{ fill: '#0A0A0A', r: 4, strokeWidth: 0 }} />
                  <Radar name="Médiane secteur" dataKey="median" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" dot={{ fill: '#9CA3AF', r: 3, strokeWidth: 0 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                    formatter={(value) => <span style={{ color: '#6B7280', fontWeight: 600 }}>{value}</span>} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Vigilances */}
            {vigilances.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-5 w-5" style={{ color: '#EF4444' }} />
                  <h2 className="text-base font-bold text-gray-900">Points de vigilance</h2>
                </div>
                {vigilances.map((v, i) => {
                  const isD = v.severity === 'danger';
                  const isW = v.severity === 'warning';
                  const borderColor = isD ? '#EF4444' : isW ? '#F97316' : '#3B82F6';
                  const bg = isD ? '#FFF5F5' : isW ? '#FFF8F5' : '#F0F5FF';
                  const iconColor = isD ? '#EF4444' : isW ? '#F97316' : '#3B82F6';
                  const ctaColor = isD ? '#EF4444' : isW ? '#F97316' : '#3B82F6';
                  return (
                    <div key={i} className="p-4 rounded-xl text-sm"
                      style={{ borderLeft: `4px solid ${borderColor}`, backgroundColor: bg }}>
                      <div className="flex gap-3">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{v.title}</p>
                          <p className="text-gray-600 mt-0.5 leading-relaxed">{v.message}</p>
                          {v.cta && v.ctaLink && (
                            <button
                              onClick={() => navigate(v.ctaLink!)}
                              className="mt-2 text-[12px] font-bold bg-transparent border-0 cursor-pointer p-0"
                              style={{ color: ctaColor }}
                            >
                              {v.cta}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Opportunités */}
            {opportunities.length > 0 && (
              <OpportunitiesSection opportunities={opportunities} formatAmount={formatAmount} />
            )}

            {/* Stratégie de financement (si levée impossible/difficile) */}
            {reco.possible !== true && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-4">Stratégie de financement recommandée</h2>
                <div className="rounded-xl p-5"
                  style={{
                    backgroundColor: reco.possible === false ? '#FFF5F5' : '#FFFBF5',
                    border: `1px solid ${reco.possible === false ? '#FFB3B3' : '#FFB96D'}`,
                  }}>
                  <p className="font-bold text-gray-900 mb-1">
                    {reco.possible === false ? 'Levée de fonds non recommandée actuellement' : 'Levée difficile — procédez avec prudence'}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{reco.reason}</p>
                  <div className="p-3 rounded-lg text-sm"
                    style={{ backgroundColor: reco.possible === false ? '#FFD6E5' : '#FFE8C2' }}>
                    <p className="font-semibold text-gray-900 mb-0.5">
                      {reco.possible === false ? 'Alternative recommandée' : 'Notre recommandation'}
                    </p>
                    <p className="text-gray-700 leading-relaxed">{reco.alternative}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trésorerie 18 mois */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-1">Projection de trésorerie sur 18 mois</h2>
              <p className="text-[13px] text-gray-400 mb-5">Basé sur votre burn rate et vos objectifs de levée</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={treasuryData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(v: number) => [formatAmount(v), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="withoutRaise" name="Sans levée" stroke="#FFB3B3" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="withRaise" name="Avec levée dilutive" stroke="#ABC5FE" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="withMixed" name="Avec levée mixte" stroke="#D8FFBD" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* ── COLONNE DROITE STICKY (1/3) ──────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6 lg:self-start">

            {/* Card dilutif */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start"
                    style={{ backgroundColor: '#ABC5FE', color: '#1A3A8F' }}>
                    DILUTIF
                  </span>
                  <span className="text-[15px] font-bold text-gray-900">Investisseurs compatibles</span>
                </div>
                <span className="text-[24px] font-bold" style={{ color: '#1A3A8F' }}>{investors.length}</span>
              </div>

              <div className="relative">
                <div style={!isPaid ? { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
                  {investors.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-[12px] text-gray-400 font-medium">Aucun investisseur compatible</p>
                      <p className="text-[11px] text-gray-300 mt-1">Complétez votre secteur et stade pour obtenir des matchs</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {investors.slice(0, 3).map((inv, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg"
                          style={{ backgroundColor: '#F0F5FF' }}>
                          <div className="flex-shrink-0 flex items-center justify-center rounded-full text-[11px] font-black"
                            style={{ width: 32, height: 32, backgroundColor: '#ABC5FE', color: '#1A3A8F' }}>
                            {inv.investor.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-gray-900 truncate">{inv.investor.name}</p>
                            <p className="text-[12px] text-gray-400 truncate">{inv.whyMatch}</p>
                          </div>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: inv.score >= 85 ? '#D8FFBD' : inv.score >= 60 ? '#FFE8C2' : '#F3F4F6',
                              color: inv.score >= 85 ? '#2D6A00' : inv.score >= 60 ? '#92520A' : '#374151',
                            }}>
                            {inv.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!isPaid && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <p className="text-[12px] text-gray-700 font-semibold text-center leading-tight">
                      Débloquez vos {investors.length > 0 ? investors.length : ''} matchs investisseurs
                    </p>
                    <button
                      onClick={() => navigate('/pricing?from=welcome&type=dilutif')}
                      className="text-[12px] font-bold px-3.5 py-1.5 rounded-full border-0 cursor-pointer"
                      style={{ backgroundColor: '#ABC5FE', color: '#1A3A8F' }}
                    >
                      Voir mes matchs →
                    </button>
                  </div>
                )}
              </div>

              {isPaid && investors.length > 3 && (
                <button
                  onClick={() => navigate('/dashboard/fundraising')}
                  className="mt-3 w-full text-[12px] font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
                >
                  Voir les {investors.length - 3} autres <ArrowRight className="h-3 w-3" />
                </button>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[12px] text-gray-400">
                  Compatibilité moyenne : <span className="font-bold text-gray-700">{avgMatch}%</span>
                </p>
              </div>
            </div>

            {/* Card non-dilutif */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#F6FFF4', border: '1px solid #D8FFBD' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start"
                    style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                    NON-DILUTIF
                  </span>
                  <span className="text-[15px] font-bold text-gray-900">Financements identifiés</span>
                </div>
                <span className="text-[24px] font-bold" style={{ color: '#2D6A00' }}>
                  {totalNdPotential > 0 ? formatAmount(totalNdPotential) : '—'}
                </span>
              </div>

              {ndFunding.length === 0 ? (
                <p className="text-[13px] text-gray-500 italic leading-relaxed">
                  Raisup ne couvre pas encore les dispositifs de {profile.country ?? 'votre pays'}. Contactez-nous pour une analyse manuelle.
                </p>
              ) : (
                <div className="relative">
                  <div style={!isPaid ? { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
                    <div className="space-y-2">
                      {ndFunding.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-white">
                          <div className="flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-black"
                            style={{ width: 32, height: 32, backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                            {d.initiales}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-gray-900 truncate">{d.name}</p>
                            <p className="text-[12px] text-gray-400">{d.organisme}</p>
                          </div>
                          <span className="text-[12px] font-bold flex-shrink-0" style={{ color: '#2D6A00' }}>
                            {formatAmount(d.montant)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isPaid && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      <p className="text-[12px] text-gray-700 font-semibold text-center leading-tight">
                        Débloquez vos subventions
                      </p>
                      <button
                        onClick={() => navigate('/pricing?from=welcome&type=non-dilutif')}
                        className="text-[12px] font-bold px-3.5 py-1.5 rounded-full border-0 cursor-pointer"
                        style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}
                      >
                        Débloquer mes subventions →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isPaid && ndFunding.length > 3 && (
                <button
                  onClick={() => navigate('/dashboard/non-dilutif')}
                  className="mt-3 w-full text-[12px] font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
                >
                  Voir tous les dispositifs <ArrowRight className="h-3 w-3" />
                </button>
              )}

              <div className="mt-3 rounded-lg p-2.5 text-[12px] font-medium"
                style={{ backgroundColor: '#ECFFF0', border: '1px solid #D8FFBD', color: '#2D6A00', borderRadius: 8 }}>
                Sans dilution · Remboursable ou non selon le dispositif · Cumulable avec le dilutif
              </div>
            </div>

            {/* Prochaines actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">Prochaines actions</h3>
              <div className="space-y-3">
                {actions.map((action, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100"
                    style={{ borderLeft: `4px solid ${action.borderColor}` }}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-gray-800"
                        style={{ backgroundColor: action.borderColor }}>
                        {ACTION_ICON[action.iconName]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 leading-tight">{action.title}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA parcours financier */}
            <div>
              <button
                onClick={() => navigate(isPaid ? '/dashboard/financial-journey' : '/pricing?from=welcome')}
                className="w-full flex items-center justify-center gap-2 font-bold text-[15px] border-0 cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: isPaid ? '#0A0A0A' : '#F4B8CC',
                  color: isPaid ? '#ffffff' : '#0A0A0A',
                  borderRadius: 50,
                  padding: '16px 24px',
                }}
              >
                {!isPaid && <Lock className="h-4 w-4" />}
                {isPaid ? 'Voir mon parcours financier complet' : 'Débloquer ma stratégie complète'}
                <ArrowRight className="h-5 w-5" />
              </button>
              {!isPaid && (
                <p className="text-center text-[12px] text-gray-400 mt-3">
                  Accès complet · Investisseurs matchés · Dossiers BPI · Parcours financier personnalisé
                </p>
              )}
            </div>

          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* Score Modal */}
      {showScoreModal && <ScoreModal onClose={() => setShowScoreModal(false)} />}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <ProfileEditModal
          profile={profile}
          onUpdate={updateProfileField}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </div>
  );
};

export default DashboardWelcome;
