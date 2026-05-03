import React, { useMemo, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Lock, AlertTriangle, Sparkles, ChevronDown,
  FileText, Clock, Users, Newspaper, TrendingUp, TrendingDown,
  Building2, CheckCircle2, Circle, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { calculateScore as calculateScoreOfficial } from '../services/calculateScore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  firstName?: string;
  lastName?: string;
  founderName?: string;
  email?: string;
  startupName?: string;
  projectName?: string;
  sector?: string;
  stage?: string;
  country?: string;
  region?: string;
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
  team?: { name?: string; role?: string; hadExit?: boolean }[];
  intellectualProperty?: string;
  moat?: string;
  barriers?: string;
  deckFileName?: string;
}

interface PipelineItem {
  id: string;
  name: string;
  type: string;
  ticketTarget?: number | null;
  status: string;
  lastContact: string | null;
  nextAction: string;
  matchScore: number;
  notes?: string;
}

interface NonDilutifPipelineItem {
  id: string;
  name: string;
  organisme: string;
  montant: number;
  initiales: string;
  status: string;
  deadline: string | null;
  nextStep: string;
}

interface ExtendedScore {
  total: number;
  pitch: number;
  traction: number;
  team: number;
  market: number;
  defensibility: number;
  financialCoherence: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n?: number | null): string {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
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

// ─── Score ─────────────────────────────────────────────────────────────────────

function calculateScore(p: Profile): ExtendedScore {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;

  let pitch = 0;
  if ((p.problem?.length ?? 0) > 50) pitch += 7; else if ((p.problem?.length ?? 0) > 20) pitch += 4;
  if ((p.solution?.length ?? 0) > 50) pitch += 7; else if ((p.solution?.length ?? 0) > 20) pitch += 4;
  if ((p.competitiveAdvantage?.length ?? 0) > 30) pitch += 6; else if ((p.competitiveAdvantage?.length ?? 0) > 10) pitch += 3;
  const descLen = (p.startupName?.length ?? 0) > 0 ? 30 : 0; // proxy
  if (descLen > 20) pitch += 5; else if (descLen > 0) pitch += 2;

  let traction = 0;
  if (!p.isPreRevenue && mrr > 0) {
    traction += mrr >= 50_000 ? 9 : mrr >= 10_000 ? 7 : mrr >= 1_000 ? 4 : 2;
  }
  const mom = p.momGrowth ?? p.growthMoM ?? 0;
  if (mom) traction += mom >= 20 ? 7 : mom >= 10 ? 5 : mom >= 5 ? 3 : 1;
  if (p.activeClients) traction += p.activeClients >= 100 ? 5 : p.activeClients >= 20 ? 3 : 1;
  if (p.runway) traction += p.runway >= 12 ? 4 : p.runway >= 6 ? 2 : 0;

  let team = 0;
  if (p.hasCTO) team += 5;
  if (p.previousStartup === 'oui') team += 5;
  if (p.hadExit === 'oui') team += 7;
  if (p.advisors) team += p.advisors >= 3 ? 4 : 2;
  const exp = p.sectorExperience ?? '';
  if (exp.includes('10') || exp.includes('5+')) team += 4; else if (exp.includes('2-5') || exp.includes('3')) team += 2;
  if ((p.foundersCount ?? 1) >= 2) team += 4;

  let market = 0;
  if (p.businessModel) market += 5;
  if (p.sector) market += 5;
  if (p.clientType) market += 5;
  if (p.ambition) market += 5;
  if (p.fundingPreference) market += 5;

  let defensibility = 0;
  if (p.intellectualProperty && p.intellectualProperty !== 'Aucun') defensibility += 4;
  if ((p.moat?.length ?? 0) > 20) defensibility += 3;
  if ((p.barriers?.length ?? 0) > 20) defensibility += 3;

  let financialCoherence = 0;
  const goal = p.fundraisingGoal ?? p.fundingNeeded ?? 0;
  const stage = (p.stage ?? '').toLowerCase();
  if (goal > 0 && mrr === 0 && goal <= 500_000) financialCoherence += 4;
  else if (goal > 0 && mrr > 0) financialCoherence += 4;
  if ((p.runway ?? 0) >= 6) financialCoherence += 3;
  if (p.burnRate && p.burnRate > 0) financialCoherence += 3;
  if (goal > 2_000_000 && mrr === 0 && stage.includes('pre'))
    financialCoherence = Math.max(0, financialCoherence - 4);

  const raw = Math.min(25, pitch) + Math.min(25, traction) + Math.min(25, team)
    + Math.min(25, market) + Math.min(10, defensibility) + Math.min(10, financialCoherence);
  const total = Math.round((raw / 120) * 100);

  return {
    total,
    pitch: Math.min(25, pitch),
    traction: Math.min(25, traction),
    team: Math.min(25, team),
    market: Math.min(25, market),
    defensibility: Math.min(10, defensibility),
    financialCoherence: Math.min(10, financialCoherence),
  };
}

// ─── Investors ────────────────────────────────────────────────────────────────

const INVESTORS_DB = [
  { id: 'partech',  name: 'Partech',        type: 'VC',     stages: ['seed', 'mvp', 'croissance', 'série'],  sectors: ['SaaS B2B', 'IA & Data', 'Fintech', 'Marketplace'] },
  { id: 'kima',     name: 'Kima Ventures',  type: 'VC',     stages: ['pre', 'seed', 'idéat', 'prototype'],   sectors: ['Fintech', 'SaaS B2B', 'E-commerce', 'Marketplace'] },
  { id: 'alven',    name: 'Alven',          type: 'VC',     stages: ['seed', 'mvp', 'série'],                sectors: ['SaaS B2B', 'IA & Data', 'Marketplace', 'Deeptech'] },
  { id: 'idinvest', name: 'Idinvest',       type: 'VC',     stages: ['seed', 'mvp', 'série', 'croissance'], sectors: ['Healthtech', 'Deeptech', 'SaaS B2B', 'Legaltech'] },
  { id: 'otium',    name: 'Otium Capital',  type: 'Family', stages: ['pre', 'seed', 'prototype', 'idéat'],  sectors: ['E-commerce', 'Marketplace', 'SaaS B2B', 'Foodtech'] },
  { id: 'serena',   name: 'Serena Capital', type: 'VC',     stages: ['seed', 'série', 'croissance'],        sectors: ['SaaS B2B', 'Fintech', 'IA & Data', 'Proptech'] },
  { id: 'xange',    name: 'XAnge',          type: 'VC',     stages: ['seed', 'prototype', 'mvp'],           sectors: ['Healthtech', 'Edtech', 'SaaS B2B', 'Greentech'] },
  { id: 'breega',   name: 'Breega',         type: 'VC',     stages: ['seed', 'mvp', 'série'],               sectors: ['Fintech', 'SaaS B2B', 'Marketplace', 'E-commerce'] },
];

function matchInvestors(p: Profile) {
  const stage = (p.stage ?? '').toLowerCase();
  const sector = p.sector ?? '';
  return INVESTORS_DB.map(inv => {
    let score = 60;
    if (inv.stages.some(s => stage.includes(s))) score += 20;
    if (inv.sectors.includes(sector)) score += 15;
    return { ...inv, match: Math.min(99, score + Math.floor(Math.random() * 5)) };
  }).sort((a, b) => b.match - a.match);
}

// ─── Non-dilutif pipeline generator ──────────────────────────────────────────

function generateNonDilutifPipeline(profile: Profile): NonDilutifPipelineItem[] {
  const items: NonDilutifPipelineItem[] = [];
  const sector = (profile.sector ?? '').toLowerCase();
  const deep = ['deeptech', 'ia', 'healthtech', 'ia & data', 'intelligence artificielle'];
  const eu = [...deep, 'greentech'];
  const euCountries = ['France', 'Irlande', 'Belgique', 'Allemagne'];
  const burn = (profile as Record<string, number>).burnRate ?? 5_000;

  if (profile.country === 'France') {
    items.push({ id: 'bft', name: 'Bourse French Tech', organisme: 'BPI France', montant: 90_000, initiales: 'BPI', status: 'Éligible', deadline: null, nextStep: 'Créer votre espace BPI et déposer le dossier en ligne' });
    items.push({ id: 'cir', name: 'CIR — Crédit Impôt Recherche', organisme: 'État français', montant: Math.round(burn * 12 * 0.30), initiales: 'CIR', status: 'Éligible', deadline: '2025-05-31', nextStep: 'Déclarer les dépenses R&D sur votre déclaration fiscale' });
    if (profile.region === 'Île-de-France')
      items.push({ id: 'idf', name: "Innov'up IDF", organisme: 'Région IDF', montant: 200_000, initiales: 'IDF', status: 'À étudier', deadline: null, nextStep: 'Vérifier votre éligibilité sur le portail IDF' });
    if (deep.some(s => sector.includes(s)))
      items.push({ id: 'dt', name: 'Plan DeepTech BPI', organisme: 'BPI France', montant: 500_000, initiales: 'DT', status: 'Éligible', deadline: null, nextStep: 'Prendre contact avec un chargé d\'affaires BPI DeepTech' });
  }
  if (profile.country === 'Irlande') {
    items.push({ id: 'ei', name: 'Enterprise Ireland HPSU', organisme: 'EI', montant: 500_000, initiales: 'EI', status: 'Éligible', deadline: null, nextStep: 'Contacter un Development Advisor Enterprise Ireland' });
    items.push({ id: 'rd', name: 'R&D Tax Credit', organisme: 'Revenue', montant: Math.round(burn * 12 * 0.25), initiales: 'RD', status: 'Éligible', deadline: '2025-09-30', nextStep: 'Faire valider votre R&D par un comptable certifié' });
  }
  if (euCountries.includes(profile.country ?? '') && eu.some(s => sector.includes(s)))
    items.push({ id: 'eic', name: 'EIC Accelerator EU', organisme: 'Commission Européenne', montant: 2_500_000, initiales: 'EIC', status: 'À étudier', deadline: '2025-10-01', nextStep: 'Déposer la candidature en ligne sur le portail EIC' });

  return items;
}

// ─── Today actions ─────────────────────────────────────────────────────────────

interface TodayAction {
  priority: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  emoji: string;
  title: string;
  detail: string;
  timeEstimate: string;
  cta: string;
  ctaLink: string;
  locked: boolean;
}

function getTodayActions(
  profile: Profile,
  pipeline: PipelineItem[],
  nonDilutifPipeline: NonDilutifPipelineItem[],
  score: ExtendedScore,
  isPaid: boolean,
): TodayAction[] {
  const actions: TodayAction[] = [];
  const runway = profile.runway ?? null;

  // 1 — Runway critique
  if (runway !== null && runway <= 3) {
    actions.push({
      priority: 1, urgency: 'critical', emoji: '🚨',
      title: 'Déposez une demande BPI Express aujourd\'hui',
      detail: `Runway critique à ${runway} mois. La BPI Express répond en 15 jours — c'est votre seule option rapide pour sécuriser de la trésorerie sans dilution.`,
      timeEstimate: '45 min', cta: 'Préparer le dossier', ctaLink: '/dashboard/non-dilutif', locked: false,
    });
  }

  // 2 — Relances investisseurs en retard
  const overdueInvestors = pipeline.filter(p => {
    if (!p.lastContact || p.status === 'À contacter' || p.status === 'Closé ✓' || p.status === 'Refus') return false;
    const daysSince = Math.floor((Date.now() - new Date(p.lastContact).getTime()) / 86_400_000);
    return daysSince > 14;
  });

  if (overdueInvestors.length > 0) {
    const first = overdueInvestors[0];
    const others = overdueInvestors.length - 1;
    actions.push({
      priority: 2, urgency: 'high', emoji: '📩',
      title: `Relancez ${first.name}${others > 0 ? ` et ${others} autre${others > 1 ? 's' : ''}` : ''}`,
      detail: `${overdueInvestors.length} investisseur${overdueInvestors.length > 1 ? 's' : ''} sans contact depuis plus de 14 jours. Une relance augmente de 40% les chances de réponse.`,
      timeEstimate: '15 min', cta: 'Voir les relances', ctaLink: '/dashboard/fundraising', locked: !isPaid,
    });
  }

  // 3 — Investisseurs à contacter
  const toContact = pipeline.filter(p => p.status === 'À contacter');
  if (toContact.length > 0 && overdueInvestors.length === 0) {
    const best = toContact[0];
    actions.push({
      priority: 3, urgency: 'high', emoji: '🎯',
      title: `Contactez ${best.name} — ${best.matchScore}% de compatibilité`,
      detail: `${toContact.length} investisseur${toContact.length > 1 ? 's' : ''} identifié${toContact.length > 1 ? 's' : ''} et pas encore contacté${toContact.length > 1 ? 's' : ''}. Commencez par le meilleur match.`,
      timeEstimate: '20 min', cta: 'Voir le profil', ctaLink: '/dashboard/fundraising', locked: !isPaid,
    });
  }

  // 4 — Deadline non-dilutif proche (< 21 jours)
  const urgentND = nonDilutifPipeline.find(d => {
    if (!d.deadline) return false;
    const days = Math.floor((new Date(d.deadline).getTime() - Date.now()) / 86_400_000);
    return days > 0 && days < 21;
  });
  if (urgentND) {
    const daysLeft = Math.floor((new Date(urgentND.deadline!).getTime() - Date.now()) / 86_400_000);
    actions.push({
      priority: 4, urgency: 'high', emoji: '⏰',
      title: `Deadline ${urgentND.name} dans ${daysLeft} jours`,
      detail: `Votre dossier doit être finalisé avant le ${new Date(urgentND.deadline!).toLocaleDateString('fr-FR')}. Ne laissez pas passer cette opportunité de ${formatAmount(urgentND.montant)}.`,
      timeEstimate: '2h', cta: 'Finaliser le dossier', ctaLink: '/dashboard/non-dilutif', locked: !isPaid,
    });
  }

  // 5 — Score faible
  if (score.total < 60 && actions.length < 3) {
    const dims = [
      { key: 'pitch', label: 'pitch', value: score.pitch, max: 25 },
      { key: 'traction', label: 'traction', value: score.traction, max: 25 },
      { key: 'team', label: 'équipe', value: score.team, max: 25 },
      { key: 'market', label: 'marché', value: score.market, max: 25 },
    ].sort((a, b) => (a.value / a.max) - (b.value / b.max));
    const weakest = dims[0];
    actions.push({
      priority: 5, urgency: 'medium', emoji: '📈',
      title: `Améliorez votre score ${weakest.label} (${weakest.value}/${weakest.max})`,
      detail: `C'est votre sous-score le plus faible. L'améliorer augmentera directement vos chances de lever.`,
      timeEstimate: '30 min', cta: 'Voir les recommandations', ctaLink: '/dashboard/welcome', locked: false,
    });
  }

  // 6 — Deck non généré
  if (!localStorage.getItem('raisup_deck_generated') && actions.length < 3) {
    actions.push({
      priority: 6, urgency: 'medium', emoji: '📄',
      title: 'Générez votre pitch deck personnalisé',
      detail: "Votre deck n'a pas encore été généré. 8 minutes suffisent pour avoir un document professionnel prêt à envoyer.",
      timeEstimate: '8 min',
      cta: isPaid ? 'Générer maintenant' : 'Débloquer',
      ctaLink: isPaid ? '/dashboard/documents/generate_deck' : '/pricing',
      locked: !isPaid,
    });
  }

  // 7 — KPIs non mis à jour
  const lastKPI = localStorage.getItem('raisup_last_kpi_update');
  const daysSinceKPI = lastKPI ? Math.floor((Date.now() - new Date(lastKPI).getTime()) / 86_400_000) : 999;
  if (daysSinceKPI > 30 && actions.length < 3) {
    actions.push({
      priority: 7, urgency: 'low', emoji: '📊',
      title: 'Mettez à jour vos KPIs du mois',
      detail: 'Vos KPIs n\'ont pas été mis à jour depuis plus de 30 jours. Des données fraîches améliorent votre score et votre crédibilité.',
      timeEstimate: '3 min', cta: 'Mettre à jour', ctaLink: '/dashboard/kpis', locked: false,
    });
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

// ─── Documents scoring ────────────────────────────────────────────────────────

interface DocScore {
  key: 'bp' | 'deck' | 'teaser';
  label: string;
  icon: React.ReactNode;
  score: number;
  max: number;
  status: 'excellent' | 'bon' | 'à améliorer' | 'non généré';
  recommendation: string;
  improvements: string[];
  cta: string;
  ctaLink: string;
}

function getDocScores(p: Profile): DocScore[] {
  const bpFields = [
    p.problem, p.solution, p.ambition, p.competitiveAdvantage,
    p.businessModel, p.moat, p.sector, p.clientType,
  ];
  const bpFilled = bpFields.filter(f => f && (f as string).length > 10).length;
  const bpScore = Math.round((bpFilled / bpFields.length) * 100);
  const bpStatus: DocScore['status'] = bpScore >= 75 ? 'excellent' : bpScore >= 50 ? 'bon' : bpScore > 0 ? 'à améliorer' : 'non généré';
  const bpReco =
    bpScore >= 75 ? 'Votre BP est solide. Ajoutez des projections financières sur 3 ans pour convaincre les VCs.' :
    bpScore >= 50 ? 'Développez votre avantage concurrentiel et votre modèle de revenus pour renforcer le BP.' :
    'Renseignez votre problème, solution et ambition pour générer un BP de qualité.';

  const pitchFields = [p.problem, p.solution, p.startupName, p.sector, p.stage, p.fundraisingGoal];
  const pitchFilled = pitchFields.filter(f => f !== undefined && f !== null && f !== '').length;
  const deckHasFile = !!(p.deckFileName);
  const deckScore = deckHasFile ? Math.min(100, Math.round((pitchFilled / pitchFields.length) * 70) + 30) : Math.round((pitchFilled / pitchFields.length) * 70);
  const deckStatus: DocScore['status'] = deckScore >= 80 ? 'excellent' : deckScore >= 55 ? 'bon' : deckScore > 0 ? 'à améliorer' : 'non généré';
  const deckReco =
    deckScore >= 80 ? 'Deck complet. Faites-le relire par 2 investisseurs avant envoi pour calibrer les slides clés.' :
    deckScore >= 55 ? 'Ajoutez une slide traction avec vos métriques clés et une slide équipe avec les bios.' :
    'Générez votre deck depuis votre profil — 8 minutes suffisent pour un document investisseur prêt à envoyer.';

  const teaserFields = [p.startupName, p.sector, p.stage, p.problem, p.solution, p.fundraisingGoal];
  const teaserFilled = teaserFields.filter(f => f !== undefined && f !== null && f !== '').length;
  const teaserScore = Math.round((teaserFilled / teaserFields.length) * 100);
  const teaserStatus: DocScore['status'] = teaserScore >= 80 ? 'excellent' : teaserScore >= 50 ? 'bon' : teaserScore > 0 ? 'à améliorer' : 'non généré';
  const teaserReco =
    teaserScore >= 80 ? 'Teaser prêt. Personnalisez l\'objet de l\'email selon le profil de chaque investisseur.' :
    teaserScore >= 50 ? 'Ajoutez votre objectif de levée et vos premiers KPIs pour compléter le teaser.' :
    'Renseignez votre startup name, secteur et stade pour générer un teaser percutant en 2 minutes.';

  // Bullet points d'amélioration dynamiques par document
  const bpImprovements: string[] = [];
  if (!p.problem || (p.problem?.length ?? 0) < 20) bpImprovements.push('Décrire le problème résolu en détail');
  if (!p.solution || (p.solution?.length ?? 0) < 20) bpImprovements.push('Détailler votre solution unique');
  if (!p.competitiveAdvantage || (p.competitiveAdvantage?.length ?? 0) < 20) bpImprovements.push('Préciser votre avantage concurrentiel');
  if (!p.businessModel) bpImprovements.push('Définir votre modèle économique');
  if (!p.moat || (p.moat?.length ?? 0) < 10) bpImprovements.push('Expliquer vos barrières à l\'entrée (moat)');
  if (!p.ambition || (p.ambition?.length ?? 0) < 10) bpImprovements.push('Renseigner votre ambition à 5 ans');
  if (bpScore >= 75) bpImprovements.push('Ajouter projections financières sur 3 ans');

  const deckImprovements: string[] = [];
  if (!deckHasFile) deckImprovements.push('Générer le deck depuis le générateur IA');
  if (!p.problem) deckImprovements.push('Compléter la slide Problème');
  if (!p.solution) deckImprovements.push('Compléter la slide Solution');
  if (!(p as Record<string,unknown>).team || ((p as Record<string,unknown>).team as unknown[])?.length === 0) deckImprovements.push('Ajouter les bios de l\'équipe fondatrice');
  if (!(p as Record<string,unknown>).mrr && !(p as Record<string,unknown>).currentRevenue) deckImprovements.push('Ajouter une slide Traction avec vos métriques');
  if (!p.fundraisingGoal) deckImprovements.push('Préciser l\'utilisation des fonds');
  if (deckScore >= 80) deckImprovements.push('Faire relire par 2 investisseurs avant envoi');

  const teaserImprovements: string[] = [];
  if (!p.startupName) teaserImprovements.push('Renseigner le nom de votre startup');
  if (!p.sector) teaserImprovements.push('Définir votre secteur d\'activité');
  if (!p.problem) teaserImprovements.push('Décrire le problème résolu');
  if (!p.fundraisingGoal) teaserImprovements.push('Indiquer le montant recherché');
  if (!p.solution) teaserImprovements.push('Préciser votre solution en 1 phrase');
  if (teaserScore >= 80) teaserImprovements.push('Personnaliser l\'objet email par investisseur');

  return [
    {
      key: 'bp',
      label: 'Business Plan',
      icon: <FileText className="h-5 w-5" />,
      score: bpScore,
      max: 100,
      status: bpStatus,
      recommendation: bpReco,
      improvements: bpImprovements.slice(0, 4),
      cta: bpScore > 0 ? 'Voir / améliorer' : 'Générer',
      ctaLink: '/dashboard/documents/editor/bp',
    },
    {
      key: 'deck',
      label: 'Pitch Deck',
      icon: <FileText className="h-5 w-5" />,
      score: deckScore,
      max: 100,
      status: deckStatus,
      recommendation: deckReco,
      improvements: deckImprovements.slice(0, 4),
      cta: deckHasFile ? 'Voir / améliorer' : 'Générer le deck',
      ctaLink: '/dashboard/documents/editor/deck',
    },
    {
      key: 'teaser',
      label: 'Teaser Investisseur',
      icon: <FileText className="h-5 w-5" />,
      score: teaserScore,
      max: 100,
      status: teaserStatus,
      recommendation: teaserReco,
      improvements: teaserImprovements.slice(0, 4),
      cta: teaserScore > 0 ? 'Voir / améliorer' : 'Générer',
      ctaLink: '/dashboard/documents/editor/teaser',
    },
  ];
}

const docStatusStyle: Record<DocScore['status'], { bg: string; text: string; border: string }> = {
  'excellent':    { bg: '#D8FFBD', text: '#2D6A00', border: '#A8E68A' },
  'bon':          { bg: '#ABC5FE', text: '#1A3A8F', border: '#7BA4F8' },
  'à améliorer':  { bg: '#FFB96D', text: '#7A3D00', border: '#F5A24A' },
  'non généré':   { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
};

// ─── Timeline helpers ─────────────────────────────────────────────────────────

interface TimelineStep {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  current: boolean;
}

function getTimelineSteps(
  p: Profile,
  s: ExtendedScore,
  pipeline: PipelineItem[],
  ndPipeline: NonDilutifPipelineItem[],
): TimelineStep[] {
  const profileComplete = !!(p.sector && p.stage && (p.fundraisingGoal ?? p.fundingNeeded));
  const scorePassing = s.total >= 60;
  const hasDoc = !!(p.deckFileName) || !!(localStorage.getItem('raisup_deck_generated'));
  const hasInvestors = pipeline.length > 0;
  const hasContacted = pipeline.some(i => i.status !== 'À contacter');
  const hasDiscussion = pipeline.some(i => i.status === 'En discussion' || i.status === 'RDV prévu');
  const hasTermSheet = pipeline.some(i => i.status === 'Term sheet');
  const hasClosed = pipeline.some(i => i.status === 'Closé ✓');

  const steps: TimelineStep[] = [
    { id: 'profile',   label: 'Profil complété',          detail: 'Secteur, stade & objectif renseignés', done: profileComplete, current: false },
    { id: 'score',     label: 'Score ≥ 60',                detail: `Score actuel : ${s.total}/100`, done: scorePassing, current: false },
    { id: 'docs',      label: 'Documents générés',         detail: 'Deck, BP ou teaser disponible', done: hasDoc, current: false },
    { id: 'investors', label: 'Investisseurs identifiés',  detail: `${pipeline.length} investisseur${pipeline.length > 1 ? 's' : ''} dans le pipeline`, done: hasInvestors, current: false },
    { id: 'contact',   label: 'Premiers contacts',         detail: 'Au moins un investisseur contacté', done: hasContacted, current: false },
    { id: 'discussion',label: 'En discussion',             detail: 'RDV ou discussion avancée', done: hasDiscussion, current: false },
    { id: 'termsheet', label: 'Term sheet reçue',          detail: 'Offre formelle en cours', done: hasTermSheet, current: false },
    { id: 'closed',    label: 'Levée clôturée',            detail: 'Fonds sécurisés', done: hasClosed, current: false },
  ];

  // Mark current step
  const firstUndone = steps.findIndex(s => !s.done);
  if (firstUndone >= 0) steps[firstUndone].current = true;

  return steps;
}

// ─── Market news ──────────────────────────────────────────────────────────────

interface MarketNews {
  id: string;
  type: 'opportunity' | 'threat';
  headline: string;
  summary: string;
  source: string;
}

const NEWS_POOL: Record<string, MarketNews[]> = {
  SaaS: [
    { id: 's1',  type: 'opportunity', headline: 'L\'IA générative booste les ARR des SaaS B2B de 30% en moyenne', summary: 'Les éditeurs intégrant des fonctions IA dans leur core product voient leur expansion revenue doubler par rapport à leurs concurrents.', source: 'SaaS Capital' },
    { id: 's2',  type: 'threat',      headline: 'Compression des multiples SaaS : le marché reste exigeant sur le churn', summary: 'Les investisseurs pénalisent fortement les SaaS avec un NRR < 100%. La rétention est devenue le premier critère de valorisation.', source: 'KeyBanc' },
    { id: 's3',  type: 'opportunity', headline: 'La vertical SaaS PME attire des tickets early-stage records en Europe', summary: 'Les fonds spécialisés B2B SMB lèvent massivement pour adresser le segment sous-digitalisé des PME européennes.', source: 'TechCrunch EU' },
    { id: 's4',  type: 'threat',      headline: 'OpenAI et Anthropic entrent en concurrence directe avec les SaaS verticaux', summary: 'Les grands modèles de langage proposent désormais des agents capables de remplacer certains workflows SaaS. Risque de désintermédiation.', source: 'The Information' },
    { id: 's5',  type: 'opportunity', headline: 'Vague de consolidation SaaS : les acquéreurs corporate cherchent des cibles < 5M€ ARR', summary: 'Les grandes ETI cherchent à acquérir des solutions verticales pour accélérer leur transformation digitale.', source: 'Les Echos' },
    { id: 's6',  type: 'threat',      headline: 'Hausse des coûts d\'acquisition client — le CAC SaaS B2B a augmenté de 22% en 12 mois', summary: 'La saturation des canaux digitaux tire les coûts d\'acquisition vers le haut. Le contenu organique reprend sa place comme canal ROI positif.', source: 'Profitwell' },
    { id: 's7',  type: 'opportunity', headline: 'Marché ERP nouvelle génération : 40Md€ d\'opportunité en Europe d\'ici 2027', summary: 'Le renouvellement des systèmes legacy ouvre une fenêtre d\'opportunité historique pour les éditeurs verticaux agiles.', source: 'Gartner' },
    { id: 's8',  type: 'threat',      headline: 'Microsoft Copilot réduit l\'adoption de SaaS concurrents dans les grandes entreprises', summary: 'Les DSI ralentissent les achats de nouveaux logiciels dans l\'attente d\'évaluer l\'impact de Copilot sur leurs workflows.', source: 'Forrester' },
    { id: 's9',  type: 'opportunity', headline: 'France : 2 000 PME passent au SaaS chaque semaine selon BPI France', summary: 'L\'accélération de la transformation numérique des PME françaises crée un afflux de nouveaux clients potentiels pour les SaaS locaux.', source: 'BPI France' },
    { id: 's10', type: 'threat',      headline: 'Les startups SaaS seed peinent à lever au-delà de 1M€ ARR sans profitabilité visible', summary: 'Les fonds Série A exigent désormais un chemin crédible vers la rentabilité avant tout investissement, resserrant les conditions de marché.', source: 'Atomico' },
  ],
  FinTech: [
    { id: 'f1',  type: 'opportunity', headline: 'Open Banking : 60% des banques françaises ouvrent leurs APIs aux tiers en 2025', summary: 'La directive DSP2 pleinement appliquée génère un accès sans précédent aux données bancaires pour les startups FinTech.', source: 'Banque de France' },
    { id: 'f2',  type: 'threat',      headline: 'Durcissement réglementaire ACPR : conformité renforcée pour les PSIP', summary: 'Les nouvelles exigences AML/KYC allongent les délais d\'agrément et alourdissent les coûts de mise en conformité pour les FinTech.', source: 'ACPR' },
    { id: 'f3',  type: 'opportunity', headline: 'PME françaises : 35% cherchent une alternative à leur banque principale en 2025', summary: 'L\'insatisfaction bancaire ouvre des opportunités massives pour les néobanques et solutions de trésorerie B2B innovantes.', source: 'Bpifrance Le Lab' },
    { id: 'f4',  type: 'threat',      headline: 'Revolut et N26 accélèrent en France — concurrence directe sur le segment retail', summary: 'Les néobanques paneuropéennes gagnent 300K nouveaux clients français par trimestre, comprimant les marges des acteurs locaux.', source: 'Finextra' },
    { id: 'f5',  type: 'opportunity', headline: 'Marché de la finance intégrée : 7Md€ d\'opportunité non adressée en France', summary: 'L\'embedded finance dans les ERP, marketplaces et plateformes SaaS reste largement inexploité et attire les fonds Série A/B.', source: 'McKinsey' },
    { id: 'f6',  type: 'threat',      headline: 'Fraude en ligne : +40% en 12 mois — les FinTech exposées à des risques opérationnels croissants', summary: 'La sophistication des attaques impose des investissements fraud-prevention significatifs qui pèsent sur les unit economics.', source: 'FBF' },
    { id: 'f7',  type: 'opportunity', headline: 'DORA en vigueur : les banques cherchent des partenaires cyber-résilients pour externaliser', summary: 'La réglementation DORA pousse les institutions financières à sourcer des solutions SaaS certifiées, créant un nouveau marché.', source: 'EBA' },
    { id: 'f8',  type: 'threat',      headline: 'Taux d\'intérêt : impact négatif sur les modèles d\'affaires BNPL et de crédit à la consommation', summary: 'L\'environnement de taux comprime les marges des FinTech crédit, poussant certains acteurs vers des modèles SaaS plus récurrents.', source: 'Les Echos' },
    { id: 'f9',  type: 'opportunity', headline: 'Crypto-actifs : le règlement MiCA ouvre un cadre légal attractif pour les startups Web3 européennes', summary: 'MiCA en vigueur en 2025 offre enfin une sécurité juridique aux projets Web3 basés en Europe, attirant des talents et des capitaux.', source: 'AMF' },
    { id: 'f10', type: 'threat',      headline: 'Sécheresse de liquidités sur le segment InsurTech — les fonds réduisent leur exposition', summary: 'Après l\'euphorie 2021-2022, les InsurTech peinent à convaincre les Série A face à des combined ratios fragiles.', source: 'Gallagher Re' },
  ],
  HealthTech: [
    { id: 'h1',  type: 'opportunity', headline: 'LFSS 2025 : téléconsultation remboursée — marché de 2Md€ en 5 ans', summary: 'L\'élargissement du remboursement de la téléconsultation à toutes les spécialités propulse les plateformes de santé digitale.', source: 'CNAM' },
    { id: 'h2',  type: 'threat',      headline: 'Marquage CE IA médicale : les délais s\'allongent à 24 mois en moyenne', summary: 'La pression réglementaire sur les DM-IA ralentit les mises sur le marché et pèse sur les plans de développement des MedTech.', source: 'HAS' },
    { id: 'h3',  type: 'opportunity', headline: 'France : plan "My Health 2025" — 500M€ pour la e-santé', summary: 'Le gouvernement déploie un plan massif pour numériser le système de santé, créant des opportunités pour les SaaS santé et les DM connectés.', source: 'Ministère de la Santé' },
    { id: 'h4',  type: 'threat',      headline: 'RGPD santé : sanctions record de la CNIL sur les données de santé mal protégées', summary: 'Les manquements à la sécurité des données de santé coûtent cher. La conformité HDS devient un prérequis pour accéder aux hôpitaux publics.', source: 'CNIL' },
    { id: 'h5',  type: 'opportunity', headline: 'Vieillissement de la population : silver economy en santé estimée à 130Md€ en Europe', summary: 'Le maintien à domicile, la prévention et les outils pour aidants représentent un marché massif sous-adressé par les startups.', source: 'Caisse des Dépôts' },
    { id: 'h6',  type: 'threat',      headline: 'Les CHU resserrent leurs budgets achat — cycles de vente hospitaliers > 18 mois', summary: 'Les contraintes budgétaires des hôpitaux publics allongent considérablement les cycles commerciaux pour les MedTech B2B.', source: 'FEHAP' },
    { id: 'h7',  type: 'opportunity', headline: 'IA diagnostique : la FDA a approuvé 521 logiciels IA médicaux — signal fort pour les régulateurs EU', summary: 'L\'accélération des approbations FDA envoie un signal positif aux régulateurs européens sur l\'IA appliquée au diagnostic.', source: 'FDA' },
    { id: 'h8',  type: 'threat',      headline: 'Désengagement des fonds spécialisés BioTech précoce — moins de tickets < 2M€', summary: 'Les fonds BioTech se concentrent sur des projets cliniques avancés, laissant un vide pour les biotechs en phase pré-clinique.', source: 'France Biotech' },
    { id: 'h9',  type: 'opportunity', headline: 'Santé mentale numérique : la demande a explosé de 180% post-COVID, l\'offre reste limitée', summary: 'Le déficit de prise en charge psychiatrique ouvre un marché massif pour les applications de santé mentale et les solutions de prévention.', source: 'OMS' },
    { id: 'h10', type: 'threat',      headline: 'Apple et Google lancent leurs plateformes santé intégrées — pression sur les apps indépendantes', summary: 'L\'intégration native de fonctions santé dans iOS et Android menace les applications de monitoring et de suivi patient.', source: 'Fierce Healthcare' },
  ],
  GreenTech: [
    { id: 'g1',  type: 'opportunity', headline: 'IRA américain + Green Deal européen : 600Md€ de subventions mobilisés pour la transition', summary: 'La compétition de subventions entre USA et Europe accélère les investissements dans les cleantech et la décarbonation industrielle.', source: 'BloombergNEF' },
    { id: 'g2',  type: 'threat',      headline: 'CSRD en vigueur : les PME non conformes perdront des marchés grands comptes dès 2026', summary: 'La directive sur le reporting extra-financier impose une transparence aux sous-traitants, créant une pression d\'adaptation urgente.', source: 'EFRAG' },
    { id: 'g3',  type: 'opportunity', headline: 'France 2030 : 2Md€ dédiés aux greentech dans le plan d\'investissement', summary: 'Les appels à projets ADEME et BPI ciblent explicitement les solutions de décarbonation industrielle, d\'agritech et d\'énergie verte.', source: 'ADEME' },
    { id: 'g4',  type: 'threat',      headline: 'Fluctuation des matières premières : les projets éolien et solaire ralentissent en Europe', summary: 'La hausse du coût des équipements fragilise les projets EnR et crée de l\'incertitude sur les calendriers de déploiement.', source: 'WindEurope' },
    { id: 'g5',  type: 'opportunity', headline: 'Carbon pricing : le prix EU ETS dépasse 70€/tonne — nouveaux business models carbone rentables', summary: 'La hausse du prix du carbone rend économiquement viables des solutions de capture, stockage et valorisation du CO2.', source: 'ICE' },
    { id: 'g6',  type: 'threat',      headline: 'Concurrence des acteurs chinois sur les batteries et l\'hydrogène — guerre des prix naissante', summary: 'Les industriels chinois subventionnés inondent le marché européen de solutions bas coût, fragilisant les modèles des startups locales.', source: 'Bruegel' },
    { id: 'g7',  type: 'opportunity', headline: 'Agritech : l\'agriculture de précision réduit les intrants de 30% — accélération des adoptions', summary: 'La pression réglementaire et économique pousse les agriculteurs à adopter des outils de pilotage des cultures — marché de 12Md€ en Europe.', source: 'Axema' },
    { id: 'g8',  type: 'threat',      headline: 'Délais de raccordement réseau : les projets EnR décentralisés bloqués 3 à 5 ans', summary: 'La saturation des réseaux électriques locaux retarde les projets de production décentralisée et crée de l\'incertitude pour les investisseurs.', source: 'RTE' },
    { id: 'g9',  type: 'opportunity', headline: 'Bâtiment bas carbone : réglementation RE2020 crée un marché de rénovation de 4Md€/an', summary: 'Les obligations de rénovation énergétique accélèrent l\'adoption de solutions de pilotage, d\'isolation et de production d\'énergie.', source: 'DHUP' },
    { id: 'g10', type: 'threat',      headline: 'Impact washing : les labels ESG sous pression — les investisseurs durcissent leurs critères', summary: 'Les fonds d\'impact renforcent leurs exigences de mesure et de reporting, filtrant davantage les projets lors des levées.', source: 'AMF' },
  ],
  DeepTech: [
    { id: 'd1',  type: 'opportunity', headline: 'France DeepTech : BPI déploie 2Md€ sur le plan DeepTech 2025', summary: 'Le plan national cible les spinoffs académiques et les startups deeptech en pré-amorçage avec des tickets de 500K€ à 3M€.', source: 'BPI France' },
    { id: 'd2',  type: 'threat',      headline: 'Export control : les technologies dual-use soumises à nouvelles restrictions EU-USA', summary: 'Les contrôles à l\'export sur les semi-conducteurs, l\'IA et les quantiques créent des obstacles pour les deeptech à ambition internationale.', source: 'DGA' },
    { id: 'd3',  type: 'opportunity', headline: 'Quantique : 15 startups françaises dans le top 50 mondial — vague d\'investissement Série A', summary: 'La France s\'impose comme hub quantique européen et attire des capitaux américains et asiatiques pour ses startups de calcul et de capteurs.', source: 'Quantonation' },
    { id: 'd4',  type: 'threat',      headline: 'Cycles R&D longs pénalisent les deeptech face aux attentes de ROI des fonds', summary: 'Les investisseurs généralistes réduisent leur exposition aux projets > 5 ans avant commercialisation, favorisant les spécialistes deeptech.', source: 'Hello Tomorrow' },
    { id: 'd5',  type: 'opportunity', headline: 'Défense & sécurité : la demande NATO pousse les budgets deeptech à la hausse en Europe', summary: 'L\'augmentation des budgets de défense ouvre un marché de double usage pour les deeptech spécialisées en capteurs, IA et communications.', source: 'EDA' },
    { id: 'd6',  type: 'threat',      headline: 'Pénurie de profils PhD en IA et quantique — guerre des talents avec les GAFAM', summary: 'Les grands groupes tech surenchérissent sur les profils de recherche, rendant difficile le recrutement pour les deeptech en phase de croissance.', source: 'Inria' },
    { id: 'd7',  type: 'opportunity', headline: 'Robotique collaborative : marché de 12Md€ en Europe d\'ici 2028 sous-adressé', summary: 'La réindustrialisation européenne et la pénurie de main-d\'œuvre créent une demande urgente pour les solutions de robotique industrielle agiles.', source: 'IFR' },
    { id: 'd8',  type: 'threat',      headline: 'Valorisations PI : les universités françaises durcissent leurs conditions de cession de brevets', summary: 'Les conditions de sortie de la propriété intellectuelle académique se complexifient, alourdissant les structures cap-table des spinoffs.', source: 'CPU' },
    { id: 'd9',  type: 'opportunity', headline: 'EIC Pathfinder 2025 : 300M€ disponibles pour les TRL 1-4 à portée européenne', summary: 'L\'appel à projets EIC Pathfinder offre un financement non-dilutif massif pour les startups en recherche exploratoire avant commercialisation.', source: 'EIC' },
    { id: 'd10', type: 'threat',      headline: 'Semi-conducteurs : la dépendance asiatique fragilise les supply chains deeptech europé', summary: 'La concentration de la production de puces en Asie expose les deeptech hardware européennes à des risques d\'approvisionnement critiques.', source: 'SEMI' },
  ],
  default: [
    { id: 'def1',  type: 'opportunity', headline: 'VC français : 8,4Md€ investis en 2024 — le marché early-stage reste porteur', summary: 'Malgré un ralentissement Série B+, le segment seed et pré-seed maintient un rythme soutenu avec plus de 3 000 deals recensés.', source: 'France Invest' },
    { id: 'def2',  type: 'threat',      headline: 'Taux directeurs BCE : les conditions de financement restent serrées pour les startups', summary: 'L\'environnement macro contraint les valorisations et pousse les investisseurs à exiger des métriques de rentabilité plus précoces.', source: 'BCE' },
    { id: 'def3',  type: 'opportunity', headline: 'Plan France 2030 : 54Md€ pour l\'innovation — de nouvelles enveloppes publiées', summary: 'Les prochains appels à projets France 2030 ciblent l\'IA, la santé, l\'énergie et l\'industrie — opportunités directes pour les startups innovantes.', source: 'Bpifrance' },
    { id: 'def4',  type: 'threat',      headline: 'Inflation des salaires tech en France : +15% sur les profils senior en 12 mois', summary: 'La tension sur les talents tech pèse sur les burn rates et accélère les besoins de levée, dans un contexte de valorisation comprimée.', source: 'Talent.io' },
    { id: 'def5',  type: 'opportunity', headline: 'Les corporates français multiplient leurs programmes d\'open innovation — 400 startups cherchées', summary: 'Les grands groupes (LVMH, TotalEnergies, Michelin, L\'Oréal) lancent des appels à startups avec des POC payants et accès réseau.', source: 'ChooseMyCompany' },
    { id: 'def6',  type: 'threat',      headline: 'Allongement des cycles de closing VC : de 4 à 7 mois en moyenne pour une Seed', summary: 'Les investisseurs effectuent des due diligences plus longues et multiplient les conditions suspensives, rallongeant les délais de levée.', source: 'Dealroom' },
    { id: 'def7',  type: 'opportunity', headline: 'Business Angels : +23% de tickets individuels en 2024 selon France Angels', summary: 'La communauté d\'angels français s\'élargit, avec des investisseurs issus des nouvelles licornes (Doctolib, Alan, Qonto) qui réinjectent leur capital.', source: 'France Angels' },
    { id: 'def8',  type: 'threat',      headline: 'Concurrence internationale : 15 000 startups SaaS créées chaque mois dans le monde', summary: 'L\'hyperconcurrence mondiale impose une différenciation forte et un go-to-market ciblé pour capter l\'attention des investisseurs et clients.', source: 'Crunchbase' },
    { id: 'def9',  type: 'opportunity', headline: 'EIC Accelerator 2025 : 300 startups européennes financées, France bien représentée', summary: 'Le programme phare de la Commission Européenne finance 300 startups par an avec des grants non-dilutifs jusqu\'à 2,5M€ — taux de succès en hausse.', source: 'EIC' },
    { id: 'def10', type: 'threat',      headline: 'Pression ESG : les fonds VC ajoutent des clauses de reporting impact à leurs term sheets', summary: 'Les LPs exigent des données ESG de plus en plus granulaires, ce qui se répercute en obligations de reporting sur les startups en portefeuille.', source: 'Invest Europe' },
  ],
};

function getWeekNumber(d: Date): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86_400_000) + onejan.getDay() + 1) / 7);
}

function getLastMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function normalizeSectorForNews(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes('saas') || s.includes('logiciel') || s.includes('numérique')) return 'SaaS';
  if (s.includes('fintech') || s.includes('insurtech') || s.includes('finance') || s.includes('blockchain')) return 'FinTech';
  if (s.includes('health') || s.includes('medtech') || s.includes('biotech') || s.includes('santé')) return 'HealthTech';
  if (s.includes('green') || s.includes('clean') || s.includes('agri') || s.includes('energie') || s.includes('impact')) return 'GreenTech';
  if (s.includes('deep') || s.includes('ia') || s.includes('quantique') || s.includes('robot')) return 'DeepTech';
  return 'default';
}

function getWeeklyMarketNews(sector: string): MarketNews[] {
  const key = normalizeSectorForNews(sector);
  const pool = NEWS_POOL[key] ?? NEWS_POOL.default;
  const week = getWeekNumber(new Date());
  const offset = week % pool.length;
  const indices = [offset, (offset + 3) % pool.length, (offset + 6) % pool.length];
  return indices.map(i => pool[i]);
}

// ─── Partner structure ────────────────────────────────────────────────────────

interface Partner {
  id: string;
  role: string;
  icon: React.ReactNode;
  description: string;
  whenNeeded: string;
  bg: string;
  color: string;
}

function getPartnerStructure(): Partner[] {
  return [
    {
      id: 'lawyer',
      role: 'Avocat spécialisé startup',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Rédaction des pactes d\'actionnaires, term sheets, BSA et contrats fondateurs. Indispensable avant toute levée.',
      whenNeeded: 'Dès le premier term sheet reçu',
      bg: '#F0F4FF', color: '#1A3A8F',
    },
    {
      id: 'accountant',
      role: 'Expert-comptable startup',
      icon: <FileText className="h-5 w-5" />,
      description: 'Tenue comptable, CIR/CII, prévisionnel investisseur et data room financière. Certaines banques l\'exigent.',
      whenNeeded: 'Dès la constitution de la société',
      bg: '#F0FFF4', color: '#2D6A00',
    },
    {
      id: 'coach',
      role: 'Coach levée de fonds',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Préparation du pitch, stratégie investisseur, simulation de sessions Q&A et accompagnement closing.',
      whenNeeded: '3 mois avant le lancement de la levée',
      bg: '#FFF5F8', color: '#C4728A',
    },
    {
      id: 'mentor',
      role: 'Mentor / Advisor sectoriel',
      icon: <Users className="h-5 w-5" />,
      description: 'Ouverture réseau, crédibilité sectorielle et guidance stratégique. Souvent rémunéré en BSPCE (0,25-1%).',
      whenNeeded: 'Dès la recherche product-market fit',
      bg: '#FFFBEB', color: '#92400E',
    },
  ];
}

// ─── Status configs ───────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'À contacter':  { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  'Contacté':     { bg: '#ABC5FE', text: '#1A3A8F', dot: '#3B82F6' },
  'En discussion':{ bg: '#FFB96D', text: '#7A3D00', dot: '#F59E0B' },
  'RDV prévu':    { bg: '#CDB4FF', text: '#3D0D8F', dot: '#7C3AED' },
  'Term sheet':   { bg: '#D8FFBD', text: '#2D6A00', dot: '#22C55E' },
  'Closé ✓':      { bg: '#D8FFBD', text: '#2D6A00', dot: '#22C55E' },
  'Refus':        { bg: '#FFB3B3', text: '#8F1A1A', dot: '#EF4444' },
};

const nonDilutifStatusConfig: Record<string, { bg: string; text: string }> = {
  'Éligible':           { bg: '#D8FFBD', text: '#2D6A00' },
  'Dossier en cours':   { bg: '#ABC5FE', text: '#1A3A8F' },
  'Déposé':             { bg: '#CDB4FF', text: '#3D0D8F' },
  'En instruction':     { bg: '#FFB96D', text: '#7A3D00' },
  'Accordé ✓':          { bg: '#D8FFBD', text: '#2D6A00' },
  'Refusé':             { bg: '#FFB3B3', text: '#8F1A1A' },
  'À étudier':          { bg: '#F3F4F6', text: '#6B7280' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const urgencyBorder: Record<string, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#ABC5FE',
  low:      '#E5E7EB',
};
const urgencyBg: Record<string, string> = {
  critical: '#FFF5F5',
  high:     '#FFFBF5',
  medium:   '#F0F5FF',
  low:      '#FAFAFA',
};

const ActionCard: React.FC<{ action: TodayAction; index: number }> = ({ action, index }) => {
  const navigate = useNavigate();
  const border = urgencyBorder[action.urgency];
  const bg = urgencyBg[action.urgency];

  return (
    <div
      className="relative bg-white rounded-2xl p-5 flex gap-4 items-start overflow-hidden"
      style={{ borderLeft: `4px solid ${border}`, backgroundColor: bg }}
    >
      {/* Numéro */}
      <div className="absolute top-4 right-5 text-[11px] font-bold text-gray-300">#{index + 1}</div>

      {/* Emoji */}
      <div className="text-[28px] flex-shrink-0 leading-none mt-0.5">{action.emoji}</div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-gray-900 leading-snug pr-6">{action.title}</p>
        <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{action.detail}</p>

        <div className="flex items-center gap-3 mt-3">
          {/* Temps estimé */}
          <span className="text-[11px] text-gray-400 font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: '#F3F4F6' }}>
            ⏱ {action.timeEstimate}
          </span>

          {/* CTA */}
          {action.locked ? (
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            >
              <Lock className="h-3 w-3" />
              Débloquer →
            </button>
          ) : (
            <button
              onClick={() => navigate(action.ctaLink)}
              className="text-[12px] font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer text-white"
              style={{ backgroundColor: '#0A0A0A' }}
            >
              {action.cta} →
            </button>
          )}
        </div>
      </div>

      {/* Overlay si locked */}
      {action.locked && (
        <div className="absolute inset-0 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(2px)' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            <p className="text-[12px] font-semibold text-gray-500">Fonctionnalité Premium</p>
            <button
              onClick={() => navigate('/pricing')}
              className="text-[12px] font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer"
              style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}
            >
              Débloquer →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Status badge dropdown
const StatusDropdown: React.FC<{
  status: string;
  options: string[];
  onChange: (s: string) => void;
  config: Record<string, { bg: string; text: string; dot?: string }>;
}> = ({ status, options, onChange, config }) => {
  const [open, setOpen] = useState(false);
  const cfg = config[status] ?? { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' };
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer"
        style={{ backgroundColor: cfg.bg, color: cfg.text }}
      >
        {'dot' in cfg && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: (cfg as {dot: string}).dot }} />}
        {status}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
            {options.map(opt => {
              const c = config[opt] ?? { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-[12px] font-semibold hover:bg-gray-50 flex items-center gap-2"
                  style={{ color: c.text }}>
                  {'dot' in c && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: (c as {dot: string}).dot }} />}
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Score mini-gauge
const MiniScore: React.FC<{ score: number; darkBg?: boolean; size?: number }> = ({ score, darkBg = false, size = 40 }) => {
  const trackColor = darkBg ? 'rgba(255,255,255,0.12)' : '#F3F4F6';
  const arcColor = score >= 70 ? '#D8FFBD' : score >= 50 ? '#F4B8CC' : score >= 30 ? '#FFB96D' : '#FFB3B3';
  const textColor = darkBg ? '#FFFFFF' : (score >= 70 ? '#2D6A00' : score >= 50 ? '#C4728A' : score >= 30 ? '#92520A' : '#8F1A1A');
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={arcColor} strokeWidth="5"
          strokeDasharray={circ} strokeLinecap="round"
          strokeDashoffset={circ - (score / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <span className="absolute text-[10px] font-black" style={{ color: textColor }}>{score}</span>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const PIPELINE_STATUSES = Object.keys(statusConfig);
const ND_STATUSES = Object.keys(nonDilutifStatusConfig);

const typeColor: Record<string, { bg: string; text: string }> = {
  VC:     { bg: '#ABC5FE', text: '#1A3A8F' },
  Angel:  { bg: '#CDB4FF', text: '#3D0D8F' },
  Family: { bg: '#FFB96D', text: '#7A3D00' },
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Data from localStorage
  const profile = useMemo<Profile>(() => {
    try {
      const a = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      const b = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
      return { ...b, ...a };
    } catch { return {}; }
  }, []);

  const { isPremium } = useUserProfile();
  const isPaid = isPremium;
  const score = useMemo(() => {
    const s = calculateScore(profile);
    // total = score officiel (même formule que DashboardWelcome / Score Raisup)
    return { ...s, total: calculateScoreOfficial(profile).total };
  }, [profile]);
  const matches = useMemo(() => matchInvestors(profile), [profile]);

  // ── Pipeline dilutif
  const [checkedMissions, setCheckedMissions] = useState<Set<string>>(new Set());
  const toggleMission = (id: string) => setCheckedMissions(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const [pipeline, setPipeline] = useState<PipelineItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('raisup_pipeline') || '[]');
      if (stored.length > 0) return stored;
      return matches.slice(0, 5).map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        ticketTarget: profile.fundraisingGoal ?? null,
        status: 'À contacter',
        lastContact: null,
        nextAction: `Envoyer le premier email à ${m.name}`,
        matchScore: m.match,
        notes: '',
      }));
    } catch { return []; }
  });

  // ── Pipeline non-dilutif
  const [ndPipeline, setNdPipeline] = useState<NonDilutifPipelineItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('raisup_non_dilutif') || '[]');
      if (stored.length > 0) return stored;
      return generateNonDilutifPipeline(profile);
    } catch { return []; }
  });

  // Save pipeline to localStorage on change
  const updatePipelineStatus = (id: string, newStatus: string) => {
    const updated = pipeline.map(p => p.id === id ? { ...p, status: newStatus, lastContact: newStatus !== 'À contacter' ? new Date().toISOString().split('T')[0] : p.lastContact } : p);
    setPipeline(updated);
    localStorage.setItem('raisup_pipeline', JSON.stringify(updated));
  };

  const updateNdStatus = (id: string, newStatus: string) => {
    const updated = ndPipeline.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setNdPipeline(updated);
    localStorage.setItem('raisup_non_dilutif', JSON.stringify(updated));
  };

  const todayActions = useMemo(
    () => getTodayActions(profile, pipeline, ndPipeline, score, isPaid),
    [profile, pipeline, ndPipeline, score, isPaid],
  );

  const docScores = useMemo(() => getDocScores(profile), [profile]);
  const timelineSteps = useMemo(() => getTimelineSteps(profile, score, pipeline, ndPipeline), [profile, score, pipeline, ndPipeline]);
  const marketNews = useMemo(() => getWeeklyMarketNews(profile.sector ?? ''), [profile.sector]);
  const partnerStructure = useMemo(() => getPartnerStructure(), []);
  const lastMonday = useMemo(() => getLastMonday(), []);

  // Pipeline stats — déclarés AVANT les missions (TDZ)
  const contacted = pipeline.filter(p => p.status !== 'À contacter').length;
  const totalND = ndPipeline.reduce((s, d) => s + d.montant, 0);
  const accordedND = ndPipeline.filter(d => d.status === 'Accordé ✓').reduce((s, d) => s + d.montant, 0);
  const inDiscussion = pipeline.filter(p => p.status === 'En discussion').length;
  const rdvCount = pipeline.filter(p => p.status === 'RDV prévu').length;
  const totalGoal = pipeline.reduce((s, p) => s + (p.ticketTarget ?? 0), 0);

  // Missions de la semaine — variées, avec cases à cocher
  const missionsDelasSemaine = useMemo(() => {
    const m: { id: string; label: string; date: string; color: string; text: string; category: string }[] = [];
    const mrr = (profile.mrr ?? profile.currentRevenue ?? 0) as number;
    const growth = ((profile as Record<string, unknown>).momGrowth ?? (profile as Record<string, unknown>).growthMoM ?? 10) as number;
    const today = new Date();
    const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + 7);

    // 1 — Relances urgentes (> 14j sans contact)
    pipeline.filter(p => {
      if (!p.lastContact || ['À contacter','Closé ✓','Refus'].includes(p.status)) return false;
      return Math.floor((Date.now() - new Date(p.lastContact).getTime()) / 86_400_000) > 14;
    }).slice(0, 3).forEach(p =>
      m.push({ id: `relance-${p.id}`, label: `Relancer ${p.name}`, date: 'Urgent', color: '#FFB3B3', text: '#8F1A1A', category: 'Investisseur' })
    );

    // 2 — Deadlines ND < 7j
    ndPipeline.filter(d => {
      if (!d.deadline) return false;
      const days = Math.floor((new Date(d.deadline).getTime() - Date.now()) / 86_400_000);
      return days >= 0 && days <= 7;
    }).forEach(d =>
      m.push({ id: `nd-urgent-${d.id}`, label: `Deadline : dossier ${d.name}`, date: new Date(d.deadline!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), color: '#FFB96D', text: '#7A3D00', category: 'Financement' })
    );

    // 3 — Préparer RDV investisseur prévu
    pipeline.filter(p => p.status === 'RDV prévu').slice(0, 2).forEach(p =>
      m.push({ id: `rdv-${p.id}`, label: `Préparer RDV avec ${p.name}`, date: 'Cette semaine', color: '#CDB4FF', text: '#3D0D8F', category: 'Investisseur' })
    );

    // 4 — Premiers contacts à initier
    pipeline.filter(p => p.status === 'À contacter').slice(0, 2).forEach(p =>
      m.push({ id: `contact-${p.id}`, label: `Contacter ${p.name} — ${p.matchScore}% match`, date: 'Cette semaine', color: '#FFD6E5', text: '#C4728A', category: 'Investisseur' })
    );

    // 5 — Objectif MRR avec date
    if (mrr === 0 || (profile as Record<string,unknown>).isPreRevenue) {
      m.push({ id: 'first-mrr', label: 'Signer votre 1er contrat client', date: 'Priorité', color: '#FFB3B3', text: '#8F1A1A', category: 'Croissance' });
    } else if (mrr < 5_000) {
      const months5k = growth > 0 ? Math.ceil(Math.log(5_000 / mrr) / Math.log(1 + growth / 100)) : null;
      const d5k = new Date(today);
      if (months5k) d5k.setMonth(today.getMonth() + months5k);
      m.push({ id: 'mrr-5k', label: `Atteindre 5K€ MRR (actuel : ${formatAmount(mrr)})`, date: months5k ? d5k.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Objectif', color: '#CDB4FF', text: '#3D0D8F', category: 'Croissance' });
    } else if (mrr < 50_000) {
      const months50k = growth > 0 ? Math.ceil(Math.log(50_000 / mrr) / Math.log(1 + growth / 100)) : null;
      const d2 = new Date(today);
      if (months50k) d2.setMonth(today.getMonth() + months50k);
      m.push({ id: 'mrr-50k', label: `Atteindre 50K€ MRR (actuel : ${formatAmount(mrr)})`, date: months50k ? d2.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Objectif', color: '#ABC5FE', text: '#1A3A8F', category: 'Croissance' });
    }

    // 6 — Investor update mensuel
    if (contacted > 0) {
      const lastUpdate = localStorage.getItem('raisup_last_investor_update');
      const daysSince = lastUpdate ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 86_400_000) : 999;
      if (daysSince > 25)
        m.push({ id: 'investor-update', label: 'Envoyer votre Investor Update mensuel', date: 'Ce mois', color: '#D8FFBD', text: '#2D6A00', category: 'Communication' });
    }

    // 7 — Documents à générer / améliorer
    docScores.filter(d => d.score < 60).slice(0, 2).forEach(d =>
      m.push({ id: `doc-${d.key}`, label: `Améliorer votre ${d.label} (${d.score}/100)`, date: 'Cette semaine', color: '#FFE8C2', text: '#92520A', category: 'Documents' })
    );

    // 8 — Score Raisup à améliorer
    if (score.total < 60)
      m.push({ id: 'score', label: `Améliorer votre score Raisup (${score.total}/100)`, date: 'Priorité', color: '#FFE8C2', text: '#92520A', category: 'Profil' });

    // 9 — Deadlines ND du mois
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    ndPipeline.filter(d => {
      if (!d.deadline) return false;
      const dl = new Date(d.deadline);
      return dl > endOfWeek && dl <= endOfMonth;
    }).slice(0, 2).forEach(d =>
      m.push({ id: `nd-month-${d.id}`, label: `Préparer dossier ${d.name}`, date: new Date(d.deadline!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }), color: '#D8FFBD', text: '#2D6A00', category: 'Financement' })
    );

    // 10 — Mettre à jour les KPIs
    const lastKPI = localStorage.getItem('raisup_last_kpi_update');
    const daysSinceKPI = lastKPI ? Math.floor((Date.now() - new Date(lastKPI).getTime()) / 86_400_000) : 999;
    if (daysSinceKPI > 30)
      m.push({ id: 'kpi', label: 'Mettre à jour vos KPIs du mois', date: 'Ce mois', color: '#ABC5FE', text: '#1A3A8F', category: 'Suivi' });

    if (m.length === 0)
      m.push({ id: 'default', label: 'Toutes vos missions sont à jour 🎉', date: 'Bravo !', color: '#D8FFBD', text: '#2D6A00', category: '' });

    return m.slice(0, 10);
  }, [pipeline, ndPipeline, profile, docScores, score.total, contacted]);
  // ── Display helpers
  const firstName = profile.firstName || profile.founderName || user?.user_metadata?.given_name || user?.email?.split('@')[0] || 'Fondateur';
  const initials = (firstName[0] ?? 'F').toUpperCase();
  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const badge = getStageBadge(profile.stage);
  const runway = profile.runway ?? null;

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>

      {/* ── SECTION 1 — HEADER ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-2xl px-6 py-5" style={{ backgroundColor: '#0A0A0A' }}>
          <div className="flex items-center gap-5 flex-wrap">

            {/* Avatar */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-black"
              style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}>
              {initials}
            </div>

            {/* Identité */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[22px] font-bold text-white">Bonjour {firstName}</h1>
                <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{startupName}</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{todayCapitalized}</p>
            </div>

            {/* Runway badge */}
            <div className="flex items-center gap-3">
              {runway !== null && runway <= 3 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: '#FFB3B3', color: '#8F1A1A' }}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-[12px] font-bold">Runway critique — {runway} mois</span>
                </div>
              )}
              {runway !== null && runway > 3 && runway <= 6 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#FFE8C2', color: '#92520A' }}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-[12px] font-bold">Runway {runway} mois</span>
                </div>
              )}
            </div>

            {/* Score compact */}
            <button onClick={() => navigate('/dashboard/welcome')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <MiniScore score={score.total} darkBg size={52} />
              <div className="text-left">
                <p className="text-[11px] leading-none" style={{ color: 'rgba(255,255,255,0.4)' }}>Score Raisup</p>
                <p className="text-[20px] font-black leading-tight text-white">{score.total}<span className="text-[12px] font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>/100</span></p>
                <p className="text-[11px] font-semibold leading-none" style={{ color: '#F4B8CC' }}>Voir l'analyse →</p>
              </div>
            </button>
          </div>

          {/* Navigation secondaire */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { label: 'Mon analyse', href: '/dashboard/welcome' },
              { label: 'Mon parcours', href: '/dashboard/financial-journey' },
              { label: 'Mes documents', href: '/dashboard/documents' },
              { label: 'Mon score', href: '/dashboard/score' },
            ].map(link => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                    isActive
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/40 text-white/80 hover:border-white hover:text-white'
                  }`
                }
              >
                {link.label} →
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── SECTION 2 — TIMELINE ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5" style={{ color: '#C4728A' }} />
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Votre parcours vers la levée</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                Étape {Math.max(0, timelineSteps.findIndex(s => s.current))} / {timelineSteps.length} — {
                  timelineSteps.find(s => s.current)?.label ?? 'Levée en cours'
                }
              </p>
            </div>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden md:flex items-start gap-0">
            {timelineSteps.map((step, i) => {
              const isLast = i === timelineSteps.length - 1;
              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative min-w-0">
                  {!isLast && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 z-0"
                      style={{ backgroundColor: step.done ? '#F4B8CC' : '#E5E7EB' }} />
                  )}
                  <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                    style={{
                      backgroundColor: step.done ? '#F4B8CC' : step.current ? '#0A0A0A' : '#F9FAFB',
                      borderColor: step.done ? '#F4B8CC' : step.current ? '#0A0A0A' : '#E5E7EB',
                    }}>
                    {step.done
                      ? <CheckCircle2 className="h-4 w-4" style={{ color: '#C4728A' }} />
                      : step.current
                        ? <Circle className="h-3 w-3 fill-white" style={{ color: '#fff' }} />
                        : <Circle className="h-3 w-3" style={{ color: '#D1D5DB' }} />}
                  </div>
                  <p className="text-[10px] font-bold mt-2 text-center px-1 leading-tight"
                    style={{ color: step.current ? '#0A0A0A' : step.done ? '#C4728A' : '#9CA3AF' }}>
                    {step.label}
                  </p>
                  {step.current && (
                    <p className="text-[9px] text-center px-1 mt-0.5 leading-tight" style={{ color: '#6B7280' }}>
                      {step.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden space-y-2">
            {timelineSteps.map((step, i) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0"
                    style={{
                      backgroundColor: step.done ? '#F4B8CC' : step.current ? '#0A0A0A' : '#F9FAFB',
                      borderColor: step.done ? '#F4B8CC' : step.current ? '#0A0A0A' : '#E5E7EB',
                    }}>
                    {step.done
                      ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#C4728A' }} />
                      : <Circle className="h-3 w-3" style={{ color: step.current ? '#fff' : '#D1D5DB' }} />}
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className="w-0.5 h-4 mt-1" style={{ backgroundColor: step.done ? '#F4B8CC' : '#E5E7EB' }} />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-[13px] font-bold leading-tight"
                    style={{ color: step.current ? '#0A0A0A' : step.done ? '#C4728A' : '#9CA3AF' }}>
                    {step.label}
                  </p>
                  {(step.done || step.current) && (
                    <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{step.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {timelineSteps.find(s => s.current) && (
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[13px] font-medium text-gray-600">
                Prochaine étape : <span className="font-bold text-gray-900">{timelineSteps.find(s => s.current)?.label}</span>
              </p>
              <button
                onClick={() => navigate(
                  timelineSteps.find(s => s.current)?.id === 'docs' ? '/dashboard/documents' :
                  timelineSteps.find(s => s.current)?.id === 'investors' ? '/dashboard/fundraising' :
                  timelineSteps.find(s => s.current)?.id === 'contact' ? '/dashboard/fundraising' :
                  timelineSteps.find(s => s.current)?.id === 'score' ? '/dashboard/welcome' :
                  '/dashboard/settings'
                )}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold text-white"
                style={{ backgroundColor: '#0A0A0A' }}>
                Progresser <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── SECTION 3 — DOCUMENTS ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Vos documents investisseur</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">Business Plan · Pitch Deck · Teaser — notes et recommandations</p>
            </div>
            <button onClick={() => navigate('/dashboard/documents')}
              className="text-[12px] font-bold" style={{ color: '#C4728A' }}>
              Gérer les documents →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {docScores.map((doc, idx) => {
              const pct = doc.score;
              // Couleurs demandées : BP orange, Deck bleu clair, Teaser vert
              const palette = [
                { bg: '#FFFBF5', border: '#FFB96D', accent: '#FFB96D', iconBg: '#FFE8C2', tag: 'white' }, // BP → orange
                { bg: '#F5F7FF', border: '#C7D2FE', accent: '#abc5fe', iconBg: '#dbe6ff' }, // Deck → indigo
                { bg: '#f8f4ff', border: '#cdb4ff', accent: '#cdb4ff', iconBg: '#e7dbff' }, // Teaser → vert
              ][idx] ?? { bg: '#F9FAFB', border: '#E5E7EB', accent: '#374151', iconBg: '#F3F4F6' };
              return (
                <div key={doc.key} className="rounded-2xl border p-5 flex flex-col gap-3"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}>
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: palette.iconBg, color: palette.accent }}>
                        {doc.icon}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900">{doc.label}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: palette.border, color: palette.tag }}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[26px] font-black leading-none" style={{ color: palette.accent }}>{pct}</p>
                      <p className="text-[10px] text-gray-400">/100</p>
                    </div>
                  </div>

                  {/* Barre */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: palette.border + '80' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: palette.accent }} />
                  </div>

                  {/* Points d'amélioration */}
                  {doc.improvements.length > 0 && (
                    <ul className="space-y-1.5">
                      {doc.improvements.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                          <span className="mt-0.5 text-[10px] font-black shrink-0" style={{ color: palette.accent }}>→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => navigate(isPaid || doc.key !== 'deck' ? doc.ctaLink : '/pricing')}
                    className="mt-auto w-full py-2 rounded-xl text-[12px] font-bold text-center transition-colors hover:opacity-90"
                    style={{ backgroundColor: palette.accent, color: '#fff' }}>
                    {!isPaid && doc.key === 'deck' ? <><Lock className="h-3.5 w-3.5 inline mr-1" />Débloquer</> : `${doc.cta} →`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MONTANTS SÉCURISÉS ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 shadow-sm">
          <div className="pb-4 sm:pb-0 sm:pr-6">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#C4728A' }}>
              Levée visée
            </p>
            <p className="text-[28px] font-black text-gray-900 leading-none">
              {formatAmount(profile.fundraisingGoal ?? totalGoal ?? 0)}
            </p>
            <p className="text-[12px] mt-1 text-gray-400">
              {pipeline.length} investisseur{pipeline.length > 1 ? 's' : ''} dans le pipeline
            </p>
          </div>
          <div className="py-4 sm:py-0 sm:px-6">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#1A3A8F' }}>
              En discussion / RDV
            </p>
            <p className="text-[28px] font-black leading-none" style={{ color: inDiscussion + rdvCount > 0 ? '#1A3A8F' : '#9CA3AF' }}>
              {inDiscussion + rdvCount}
            </p>
            <p className="text-[12px] mt-1 text-gray-400">
              {inDiscussion} en discussion · {rdvCount} RDV prévu{rdvCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="pt-4 sm:pt-0 sm:pl-6">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#2D6A00' }}>
              Non-dilutif sécurisé
            </p>
            <p className="text-[28px] font-black leading-none"
              style={{ color: accordedND > 0 ? '#2D6A00' : '#9CA3AF' }}>
              {formatAmount(accordedND)}
            </p>
            <p className="text-[12px] mt-1 text-gray-400">
              {accordedND > 0
                ? `${ndPipeline.filter(d => d.status === 'Accordé ✓').length} dossier(s) accordé(s)`
                : `${formatAmount(totalND)} potentiel identifié`}
            </p>
          </div>
        </div>

        {/* ── MISSIONS DE LA SEMAINE ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4" style={{ color: '#C4728A' }} />
            <h2 className="text-[18px] font-bold text-gray-900">Missions de la semaine</h2>
            <span className="ml-auto text-[11px] text-gray-400">
              {checkedMissions.size}/{missionsDelasSemaine.length} accomplies
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-5" style={{ backgroundColor: '#F3F4F6' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${missionsDelasSemaine.length > 0 ? (checkedMissions.size / missionsDelasSemaine.length) * 100 : 0}%`, backgroundColor: '#F4B8CC' }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {missionsDelasSemaine.map(m => {
              const done = checkedMissions.has(m.id);
              return (
                <button key={m.id} onClick={() => toggleMission(m.id)}
                  className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: done ? '#F9FAFB' : m.color + '25',
                    borderLeft: `3px solid ${done ? '#E5E7EB' : m.color}`,
                    opacity: done ? 0.6 : 1,
                  }}>
                  {/* Checkbox */}
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: done ? '#D1D5DB' : m.color,
                      backgroundColor: done ? '#D1D5DB' : 'transparent',
                    }}>
                    {done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-tight ${done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {m.label}
                    </p>
                    {m.category && <p className="text-[10px] text-gray-400 mt-0.5">{m.category}</p>}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: done ? '#F3F4F6' : m.color, color: done ? '#9CA3AF' : m.text }}>
                    {m.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── INTERLOCUTEURS ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Mes interlocuteurs</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {contacted} contacté{contacted > 1 ? 's' : ''} · {inDiscussion} en discussion · {rdvCount} RDV
              </p>
            </div>
            <button onClick={() => navigate('/dashboard/fundraising')}
              className="text-[12px] font-bold" style={{ color: '#C4728A' }}>
              Voir tous →
            </button>
          </div>
          {pipeline.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-[13px]">Aucun investisseur dans le pipeline.</p>
              <button onClick={() => navigate('/dashboard/fundraising')}
                className="mt-3 text-[12px] font-bold px-4 py-1.5 rounded-full text-white"
                style={{ backgroundColor: '#0A0A0A' }}>
                Trouver mes matchs →
              </button>
            </div>
          ) : (
            <>
              {/* En-têtes */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-3 px-3 pb-2 border-b border-gray-100">
                {['Investisseur', 'Type', 'Ticket visé', 'Statut'].map(h => (
                  <p key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                ))}
              </div>
              <div className="space-y-1 mt-1">
              {pipeline.slice(0, 6).map(inv => {
                const tc = typeColor[inv.type] ?? { bg: '#F3F4F6', text: '#6B7280' };
                const ticketMin = formatAmount((profile.fundraisingGoal ?? 500_000) * 0.3);
                const ticketMax = formatAmount((profile.fundraisingGoal ?? 500_000) * 0.6);
                return (
                  <div key={inv.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1.5fr] gap-3 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ backgroundColor: tc.bg, color: tc.text }}>
                        {inv.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{inv.name}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full self-start sm:self-auto w-fit"
                      style={{ backgroundColor: tc.bg, color: tc.text }}>{inv.type}</span>
                    <p className="text-[12px] text-gray-500 hidden sm:block">{ticketMin}–{ticketMax}</p>
                    <StatusDropdown
                      status={inv.status}
                      options={PIPELINE_STATUSES}
                      onChange={s => updatePipelineStatus(inv.id, s)}
                      config={statusConfig}
                    />
                  </div>
                );
              })}
              {pipeline.length > 6 && (
                <button onClick={() => navigate('/dashboard/fundraising')}
                  className="w-full text-center text-[12px] text-gray-400 hover:text-gray-700 py-2 transition-colors">
                  +{pipeline.length - 6} autres →
                </button>
              )}
              </div>
            </>
          )}
        </div>

        {/* ── SECTION — ACTUALITÉS MARCHÉ ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" style={{ color: '#C4728A' }} />
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Actualités de votre marché</h2>
                <p className="text-[13px] text-gray-400 mt-0.5">
                  Sélection automatique chaque lundi · Mise à jour le {lastMonday}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
              {profile.sector ? normalizeSectorForNews(profile.sector) : 'Marché général'}
            </span>
          </div>
          <div className="space-y-4">
            {marketNews.map((news, i) => {
              const isOpportunity = news.type === 'opportunity';
              return (
                <div key={news.id}
                  className="rounded-2xl p-5 flex gap-4 items-start"
                  style={{
                    backgroundColor: isOpportunity ? '#F6FFF4' : '#FFF5F5',
                    border: `1px solid ${isOpportunity ? '#D8FFBD' : '#FFB3B3'}`,
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isOpportunity ? '#D8FFBD' : '#FFB3B3',
                      color: isOpportunity ? '#2D6A00' : '#8F1A1A',
                    }}>
                    {isOpportunity
                      ? <TrendingUp className="h-5 w-5" />
                      : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                        style={{
                          backgroundColor: isOpportunity ? '#D8FFBD' : '#FFB3B3',
                          color: isOpportunity ? '#2D6A00' : '#8F1A1A',
                        }}>
                        {isOpportunity ? 'Opportunité' : 'Menace'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{news.source}</span>
                    </div>
                    <p className="text-[14px] font-bold text-gray-900 leading-snug mb-1">{news.headline}</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{news.summary}</p>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    <span className="text-[11px] font-black">#{i + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            Ces actualités sont générées automatiquement chaque lundi selon votre secteur et recalibrées pour votre stade.
          </p>
        </div>

        <div className="h-4" />

      </div>
    </div>
  );
};

export default Dashboard;
