import React, { useMemo, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Lock, AlertTriangle, Sparkles, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

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
const MiniScore: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 70 ? '#D8FFBD' : score >= 50 ? '#ABC5FE' : score >= 30 ? '#FFB96D' : '#FFB3B3';
  const textColor = score >= 70 ? '#2D6A00' : score >= 50 ? '#1A3A8F' : score >= 30 ? '#92520A' : '#8F1A1A';
  const size = 40;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
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
  const score = useMemo(() => calculateScore(profile), [profile]);
  const matches = useMemo(() => matchInvestors(profile), [profile]);

  // ── Pipeline dilutif
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

  // ── Display helpers
  const firstName = profile.firstName || profile.founderName || user?.user_metadata?.given_name || user?.email?.split('@')[0] || 'Fondateur';
  const initials = (firstName[0] ?? 'F').toUpperCase();
  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const badge = getStageBadge(profile.stage);
  const runway = profile.runway ?? null;

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  // Pipeline stats
  const contacted = pipeline.filter(p => p.status !== 'À contacter').length;
  const totalND = ndPipeline.reduce((s, d) => s + d.montant, 0);
  const accordedND = ndPipeline.filter(d => d.status === 'Accordé ✓').reduce((s, d) => s + d.montant, 0);
  const inDiscussion = pipeline.filter(p => p.status === 'En discussion').length;
  const rdvCount = pipeline.filter(p => p.status === 'RDV prévu').length;
  const totalGoal = pipeline.reduce((s, p) => s + (p.ticketTarget ?? 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>

      {/* ── SECTION 1 — HEADER ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">

          {/* Ligne principale */}
          <div className="flex items-center gap-5 flex-wrap">

            {/* Avatar */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-black"
              style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}>
              {initials}
            </div>

            {/* Identité */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[22px] font-bold text-gray-900">Bonjour {firstName}</h1>
                <span className="text-[14px] text-gray-400">{startupName}</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              <p className="text-[13px] text-gray-400 mt-0.5">{todayCapitalized}</p>
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <MiniScore score={score.total} />
              <div className="text-left">
                <p className="text-[11px] text-gray-400 leading-none">Score Raisup</p>
                <p className="text-[11px] font-semibold text-gray-700 mt-0.5 leading-none">Voir l'analyse →</p>
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
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`
                }
              >
                {link.label} →
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* ── SECTION 2 — ACTIONS DU JOUR ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Vos 3 actions prioritaires aujourd'hui</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">{todayCapitalized}</p>
            </div>
            <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
          </div>
          <div className="space-y-3">
            {todayActions.length > 0
              ? todayActions.map((action, i) => <ActionCard key={action.priority} action={action} index={i} />)
              : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-[14px] font-medium">Aucune action urgente identifiée.</p>
                  <p className="text-[13px] mt-1">Complétez votre profil pour des recommandations personnalisées.</p>
                  <button onClick={() => navigate('/onboarding/raisup')}
                    className="mt-3 text-[13px] font-bold px-4 py-2 rounded-full text-white border-0 cursor-pointer"
                    style={{ backgroundColor: '#0A0A0A' }}>
                    Compléter mon profil →
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* ── SECTION 3 — PIPELINE DILUTIF ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Pipeline investisseurs</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {contacted} contacté{contacted > 1 ? 's' : ''} sur {pipeline.length} matché{pipeline.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/dashboard/fundraising')}
                className="text-[12px] font-bold" style={{ color: '#C4728A' }}>
                Matchs recommandés →
              </button>
              <button className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                + Ajouter
              </button>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="h-2 rounded-full mt-3 mb-5 overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pipeline.length > 0 ? (contacted / pipeline.length) * 100 : 0}%`, backgroundColor: '#F4B8CC' }} />
          </div>

          {pipeline.length === 0 ? (
            <div className="text-center py-8">
              {isPaid ? (
                <>
                  <p className="text-[14px] text-gray-500 mb-3">Votre pipeline est vide — ajoutez vos premiers investisseurs</p>
                  <button onClick={() => navigate('/dashboard/fundraising')}
                    className="text-[13px] font-bold px-4 py-2 rounded-full text-white border-0 cursor-pointer"
                    style={{ backgroundColor: '#0A0A0A' }}>
                    + Commencer mon pipeline
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[14px] text-gray-500 mb-3">Débloquez vos {matches.length} matchs investisseurs pour commencer votre pipeline</p>
                  <button onClick={() => navigate('/pricing?from=pipeline')}
                    className="text-[13px] font-bold px-4 py-2 rounded-full border-0 cursor-pointer"
                    style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}>
                    Débloquer mes matchs →
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Tableau desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Investisseur', 'Type', 'Ticket visé', 'Statut', 'Dernier contact', 'Prochaine action'].map(h => (
                        <th key={h} className="pb-3 pr-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pipeline.slice(0, 5).map(inv => {
                      const tc = typeColor[inv.type] ?? { bg: '#F3F4F6', text: '#6B7280' };
                      const ticketMin = formatAmount((profile.fundraisingGoal ?? 500_000) * 0.3);
                      const ticketMax = formatAmount((profile.fundraisingGoal ?? 500_000) * 0.6);
                      const daysSince = inv.lastContact
                        ? Math.floor((Date.now() - new Date(inv.lastContact).getTime()) / 86_400_000)
                        : null;
                      return (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                                style={{ backgroundColor: tc.bg, color: tc.text }}>
                                {inv.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[13px] font-bold text-gray-900">{inv.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: tc.bg, color: tc.text }}>
                              {inv.type}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-[13px] text-gray-500">{ticketMin}–{ticketMax}</td>
                          <td className="py-3 pr-4">
                            <StatusDropdown
                              status={inv.status}
                              options={PIPELINE_STATUSES}
                              onChange={s => updatePipelineStatus(inv.id, s)}
                              config={statusConfig}
                            />
                          </td>
                          <td className="py-3 pr-4 text-[12px] text-gray-400">
                            {inv.lastContact
                              ? <span className={daysSince !== null && daysSince > 14 ? 'text-orange-500 font-semibold' : ''}>
                                  {daysSince}j
                                </span>
                              : '—'}
                          </td>
                          <td className="py-3 text-[12px] text-gray-400 max-w-[180px] truncate">{inv.nextAction}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <div className="md:hidden space-y-3">
                {pipeline.slice(0, 5).map(inv => {
                  const tc = typeColor[inv.type] ?? { bg: '#F3F4F6', text: '#6B7280' };
                  return (
                    <div key={inv.id} className="p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{ backgroundColor: tc.bg, color: tc.text }}>
                        {inv.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{inv.name}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{inv.nextAction}</p>
                      </div>
                      <StatusDropdown status={inv.status} options={PIPELINE_STATUSES}
                        onChange={s => updatePipelineStatus(inv.id, s)} config={statusConfig} />
                    </div>
                  );
                })}
              </div>

              {/* Ligne total */}
              <div className="mt-4 px-3 py-2.5 rounded-xl flex items-center gap-4 text-[12px] text-gray-500 flex-wrap"
                style={{ backgroundColor: '#F8F8F8' }}>
                <span>Total pipeline : <b className="text-gray-800">{formatAmount(totalGoal)}</b> visé</span>
                <span className="text-gray-300">·</span>
                <span><b className="text-gray-800">{inDiscussion}</b> en discussion</span>
                <span className="text-gray-300">·</span>
                <span><b className="text-gray-800">{rdvCount}</b> RDV prévu{rdvCount > 1 ? 's' : ''}</span>
                {pipeline.length > 5 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button onClick={() => navigate('/dashboard/fundraising')}
                      className="font-semibold text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer p-0">
                      Voir tout le pipeline ({pipeline.length}) →
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── SECTION 4 — PIPELINE NON-DILUTIF ─────────────────────────────── */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#F6FFF4', border: '1px solid #D8FFBD' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Financements non-dilutifs</h2>
              <p className="text-[18px] font-black mt-0.5" style={{ color: '#2D6A00' }}>
                {formatAmount(totalND)} potentiel
              </p>
            </div>
            <button className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-white transition-colors bg-white">
              + Ajouter
            </button>
          </div>

          <div className="text-[12px] font-medium px-3 py-2 rounded-lg mb-4"
            style={{ backgroundColor: '#ECFFF0', border: '1px solid #D8FFBD', color: '#2D6A00' }}>
            Sans dilution · Cumulable avec le dilutif · Identifiés selon votre profil et votre pays
          </div>

          {/* Tableau desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-100">
                  {['Dispositif', 'Organisme', 'Montant', 'Statut', 'Deadline', 'Prochaine étape', ''].map(h => (
                    <th key={h} className="pb-3 pr-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {ndPipeline.map(d => {
                  const cfg = nonDilutifStatusConfig[d.status] ?? { bg: '#F3F4F6', text: '#6B7280' };
                  const daysToDeadline = d.deadline
                    ? Math.floor((new Date(d.deadline).getTime() - Date.now()) / 86_400_000)
                    : null;
                  const deadlineUrgent = daysToDeadline !== null && daysToDeadline < 21 && daysToDeadline > 0;
                  return (
                    <tr key={d.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                            style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                            {d.initiales}
                          </div>
                          <span className="text-[13px] font-bold text-gray-900">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-gray-500">{d.organisme}</td>
                      <td className="py-3 pr-4 text-[13px] font-bold" style={{ color: '#2D6A00' }}>{formatAmount(d.montant)}</td>
                      <td className="py-3 pr-4">
                        <StatusDropdown
                          status={d.status}
                          options={ND_STATUSES}
                          onChange={s => updateNdStatus(d.id, s)}
                          config={nonDilutifStatusConfig}
                        />
                      </td>
                      <td className="py-3 pr-4">
                        {d.deadline ? (
                          <span className={`text-[12px] font-${deadlineUrgent ? 'bold' : 'normal'}`}
                            style={{ color: deadlineUrgent ? '#F97316' : '#6B7280' }}>
                            {deadlineUrgent && '⏰ '}
                            {new Date(d.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        ) : <span className="text-[12px] text-gray-300">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-[11px] text-gray-400 max-w-[180px]">{d.nextStep}</td>
                      <td className="py-3">
                        <button
                          onClick={() => navigate(isPaid ? '/dashboard/non-dilutif' : '/pricing')}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer whitespace-nowrap"
                          style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                          {isPaid ? 'Dossier →' : <><Lock className="h-3 w-3 inline mr-1" />Débloquer</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden space-y-3">
            {ndPipeline.map(d => (
              <div key={d.id} className="bg-white p-3 rounded-xl border border-green-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                  style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                  {d.initiales}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{d.name}</p>
                  <p className="text-[12px] font-bold mt-0.5" style={{ color: '#2D6A00' }}>{formatAmount(d.montant)}</p>
                </div>
                <StatusDropdown status={d.status} options={ND_STATUSES}
                  onChange={s => updateNdStatus(d.id, s)} config={nonDilutifStatusConfig} />
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 px-3 py-2.5 rounded-xl flex items-center gap-4 text-[12px] flex-wrap"
            style={{ backgroundColor: '#ECFFF0', border: '1px solid #D8FFBD', color: '#2D6A00' }}>
            <span>Total potentiel : <b>{formatAmount(totalND)}</b></span>
            <span className="opacity-40">·</span>
            <span><b>{ndPipeline.filter(d => d.status === 'Éligible' || d.status === 'À étudier').length}</b> dossiers éligibles</span>
            <span className="opacity-40">·</span>
            <span><b>{ndPipeline.filter(d => d.status === 'Dossier en cours' || d.status === 'Déposé' || d.status === 'En instruction').length}</b> en cours</span>
          </div>
        </div>

        {/* ── SECTION 5 — RÉSUMÉ RAPIDE ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6">

          {/* Card 1 — Progression levée */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#F8F8F8' }}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Progression levée</p>
            <p className="text-[22px] font-black text-gray-900">
              {pipeline.length > 0 ? Math.round((contacted / pipeline.length) * 100) : 0}%
            </p>
            <p className="text-[12px] text-gray-400 mt-0.5">{contacted} / {pipeline.length} investisseurs contactés</p>
            <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
              <div className="h-full rounded-full"
                style={{ width: `${pipeline.length > 0 ? (contacted / pipeline.length) * 100 : 0}%`, backgroundColor: '#F4B8CC' }} />
            </div>
          </div>

          {/* Card 2 — Non-dilutif sécurisé */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#F8F8F8' }}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Non-dilutif sécurisé</p>
            <p className="text-[22px] font-black" style={{ color: accordedND > 0 ? '#2D6A00' : '#9CA3AF' }}>
              {formatAmount(accordedND)}
            </p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {accordedND > 0
                ? `${ndPipeline.filter(d => d.status === 'Accordé ✓').length} dossier${ndPipeline.filter(d => d.status === 'Accordé ✓').length > 1 ? 's' : ''} accordé${ndPipeline.filter(d => d.status === 'Accordé ✓').length > 1 ? 's' : ''}`
                : 'Aucun dossier accordé encore'}
            </p>
          </div>

          {/* Card 3 — Prochain objectif */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#F8F8F8' }}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Prochain objectif</p>
            {(() => {
              const mrr = (profile.mrr ?? profile.currentRevenue ?? 0) as number;
              if (mrr === 0 || profile.isPreRevenue) {
                return (
                  <>
                    <p className="text-[15px] font-black text-gray-900">Signer le 1er contrat</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">Priorité absolue avant la levée</p>
                  </>
                );
              }
              if (mrr < 5_000) {
                return (
                  <>
                    <p className="text-[15px] font-black text-gray-900">Atteindre 5K€ MRR</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">Actuel : {formatAmount(mrr)}</p>
                  </>
                );
              }
              if (mrr < 50_000) {
                return (
                  <>
                    <p className="text-[15px] font-black text-gray-900">Atteindre 50K€ MRR</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">Actuel : {formatAmount(mrr)}</p>
                  </>
                );
              }
              return (
                <>
                  <p className="text-[15px] font-black text-gray-900">Closer la levée</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Objectif : {formatAmount(profile.fundraisingGoal)}</p>
                </>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
