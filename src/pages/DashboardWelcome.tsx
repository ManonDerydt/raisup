import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, AlertCircle, CheckCircle2, Info, AlertTriangle,
  Mail, MapPin, TrendingUp, Shield, FileText, Search, Star, Lock,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Profile type ─────────────────────────────────────────────────────────────

interface Profile {
  // Personal
  firstName?: string;
  lastName?: string;
  founderName?: string;
  email?: string;
  phone?: string;
  // Startup
  projectName?: string;
  startupName?: string;
  sector?: string;
  stage?: string;
  country?: string;
  region?: string;
  city?: string;
  description?: string;
  businessModel?: string;
  clientType?: string;
  // Financials
  mrr?: number | null;
  currentRevenue?: number | null;
  momGrowth?: number | null;
  activeClients?: number | null;
  runway?: number | null;
  burnRate?: number | null;
  fundingNeeded?: number | null;
  fundraisingGoal?: number | null;
  maxDilution?: number | null;
  finalGoalValuation?: number | null;
  fundingTimeline?: string;
  fundingPreference?: string;
  fundingTypes?: string[];
  isPreRevenue?: boolean;
  // Team
  teamSize?: number | null;
  hasCTO?: boolean;
  foundersCount?: number | null;
  sectorExperience?: string;
  previousStartup?: string;
  hadExit?: string;
  advisors?: number | null;
  // Pitch
  problem?: string;
  solution?: string;
  competitiveAdvantage?: string;
  // Ambitions
  ambition?: string;
  ambitions?: string[];
}

// ─── Score ────────────────────────────────────────────────────────────────────

interface Score { total: number; pitch: number; traction: number; team: number; market: number }

function calculateScore(p: Profile): Score {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;

  // Traction (0-25)
  let traction = 0;
  if (p.isPreRevenue || mrr === 0) { traction += 0; }
  else { traction += mrr >= 50000 ? 9 : mrr >= 10000 ? 7 : mrr >= 1000 ? 4 : 2; }
  if (p.momGrowth) traction += p.momGrowth >= 20 ? 7 : p.momGrowth >= 10 ? 5 : p.momGrowth >= 5 ? 3 : 1;
  if (p.activeClients) traction += p.activeClients >= 100 ? 5 : p.activeClients >= 20 ? 3 : 1;
  if (p.runway) traction += p.runway >= 12 ? 4 : p.runway >= 6 ? 2 : 0;

  // Team (0-25)
  let team = 0;
  if (p.hasCTO) team += 5;
  if (p.previousStartup === 'oui') team += 5;
  if (p.hadExit === 'oui') team += 7;
  if (p.advisors) team += p.advisors >= 3 ? 4 : 2;
  const exp = p.sectorExperience ?? '';
  if (exp.includes('10') || exp.includes('5+')) team += 4;
  else if (exp.includes('2-5') || exp.includes('3')) team += 2;
  else if (exp.includes('1')) team += 1;

  // Pitch (0-25)
  let pitch = 0;
  if ((p.problem?.length ?? 0) > 50) pitch += 7; else if ((p.problem?.length ?? 0) > 20) pitch += 4;
  if ((p.solution?.length ?? 0) > 50) pitch += 7; else if ((p.solution?.length ?? 0) > 20) pitch += 4;
  if ((p.competitiveAdvantage?.length ?? 0) > 30) pitch += 6; else if ((p.competitiveAdvantage?.length ?? 0) > 10) pitch += 3;
  if ((p.description?.length ?? 0) > 50) pitch += 5; else if ((p.description?.length ?? 0) > 20) pitch += 2;

  // Market (0-25)
  let market = 0;
  if (p.businessModel) market += 5;
  if (p.sector || p.sector) market += 5;
  if (p.clientType) market += 5;
  if (p.ambition || (p.ambitions?.length ?? 0) > 0) market += 5;
  if (p.fundingPreference || (p.fundingTypes?.length ?? 0) > 0) market += 5;

  const t = Math.min(25, traction);
  const te = Math.min(25, team);
  const pi = Math.min(25, pitch);
  const ma = Math.min(25, market);
  return { total: t + te + pi + ma, traction: t, team: te, pitch: pi, market: ma };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(n?: number | null): string {
  if (!n) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

function getInitials(p: Profile): string {
  const a = (p.firstName?.[0] ?? p.founderName?.[0] ?? '?').toUpperCase();
  const b = (p.lastName?.[0] ?? '').toUpperCase();
  return a + b;
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

function getScoreLevel(total: number): { label: string; color: string } {
  if (total < 30)  return { label: 'Dossier insuffisant',    color: '#ef4444' };
  if (total < 50)  return { label: 'Dossier en construction', color: '#f97316' };
  if (total < 70)  return { label: 'Dossier prometteur',     color: '#3b82f6' };
  if (total < 85)  return { label: 'Dossier solide',         color: '#22c55e' };
  return             { label: 'Dossier excellent',          color: '#a855f7' };
}

function getScoreAnalysis(p: Profile, s: Score): string {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;
  if (s.total < 30)
    return `Votre dossier manque d'éléments fondamentaux. ${!p.problem ? "Votre problème n'est pas défini. " : ''}${s.traction < 5 ? 'Aucune traction visible. ' : ''}Concentrez-vous sur la validation avant de pitcher.`;
  if (s.total < 50)
    return `Votre projet a du potentiel mais nécessite plus de structure. ${s.team < 10 ? "L'équipe est incomplète — un associé technique renforcerait votre dossier. " : ''}${s.traction < 10 ? 'Vos métriques de traction sont faibles — obtenez vos premiers clients.' : ''}`;
  if (s.total < 70)
    return `Bonne base. Votre dossier intéressera des angels et fonds early-stage. ${mrr > 0 ? `Votre MRR de ${formatAmount(mrr)} est un bon signal. ` : 'Obtenir vos premiers revenus ferait passer votre score au niveau supérieur. '}Continuez à documenter votre traction.`;
  return `Excellent dossier. Vous êtes prêt à pitcher des fonds institutionnels. ${mrr > 10000 ? 'Votre MRR est solide. ' : ''}Concentrez-vous sur la qualité de vos pitchs plutôt que le volume.`;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

type AlertType = 'danger' | 'warning' | 'info' | 'success';
interface Alert { type: AlertType; title: string; message: string }

const ALERT_STYLES: Record<AlertType, { border: string; bg: string; icon: React.ReactNode }> = {
  danger:  { border: '#ef4444', bg: '#FFF5F5', icon: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> },
  warning: { border: '#f97316', bg: '#FFFBF5', icon: <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" /> },
  info:    { border: '#3b82f6', bg: '#F0F7FF', icon: <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" /> },
  success: { border: '#22c55e', bg: '#F0FFF4', icon: <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> },
};

function computeAlerts(p: Profile): Alert[] {
  const alerts: Alert[] = [];
  const mrr = p.mrr ?? p.currentRevenue ?? 0;
  const bm = (p.businessModel ?? '').toLowerCase();
  const sec = (p.sector ?? '').toLowerCase();

  if ((p.finalGoalValuation ?? 0) >= 500_000_000 && (bm.includes('conseil') || bm.includes('service')))
    alerts.push({ type: 'danger', title: 'Ambition incohérente avec le modèle', message: `Une valorisation de ${formatAmount(p.finalGoalValuation)} est quasi-impossible avec un modèle de conseil — non scalable par nature. Les licornes sont toutes des modèles SaaS, marketplace ou deep tech. Envisagez de pivoter vers un modèle productisé.` });

  if ((p.finalGoalValuation ?? 0) >= 1_000_000_000 && sec.includes('service'))
    alerts.push({ type: 'danger', title: 'Objectif licorne irréaliste pour ce secteur', message: 'Moins de 0.1% des startups atteignent 1Md€. Pour y prétendre, il faut un marché mondial adressable > 10Mds€ et un modèle hyper-scalable. Votre secteur actuel ne le permet pas.' });

  const stage = (p.stage ?? '').toLowerCase();
  if ((p.fundraisingGoal ?? p.fundingNeeded ?? 0) > 2_000_000 && mrr === 0 && (stage.includes('pre') || stage.includes('idéat')))
    alerts.push({ type: 'warning', title: 'Montant de levée trop élevé pour votre stade', message: `Lever ${formatAmount(p.fundraisingGoal ?? p.fundingNeeded)} en pre-seed sans revenus est très difficile. Les fonds seed investissent en moyenne 300–800K€ à ce stade. Réduisez votre objectif à 300–500K€ pour un premier tour réaliste.` });

  if ((p.runway ?? Infinity) < 3)
    alerts.push({ type: 'danger', title: 'Runway critique — urgence absolue', message: 'Avec moins de 3 mois de runway, lever des fonds est presque impossible — les négociations prennent 3–6 mois minimum. Priorité absolue : réduire les coûts, chercher du love money, ou déposer en urgence une Bourse BPI.' });

  if ((p.runway ?? Infinity) < 6 && (p.fundingTimeline ?? '').includes('3'))
    alerts.push({ type: 'warning', title: 'Timeline de levée trop optimiste', message: "Une levée de fonds prend en moyenne 4 à 6 mois en France. Avec 6 mois de runway, vous n'avez pas assez de marge. Commencez les démarches immédiatement et prévoyez un plan B." });

  if (!p.hasCTO && (bm.includes('saas') || bm.includes('abonnement')))
    alerts.push({ type: 'warning', title: 'Pas de CTO pour un projet SaaS', message: 'Les investisseurs sont très réticents à financer un SaaS sans associé technique. Soit recrutez un CTO co-fondateur, soit prouvez que vous pouvez développer vous-même.' });

  if ((p.foundersCount ?? 1) === 1 && (p.finalGoalValuation ?? 0) > 50_000_000)
    alerts.push({ type: 'info', title: 'Solo founder avec ambition élevée', message: 'Les fonds VC privilégient les équipes de 2–3 fondateurs. Un seul fondateur avec un objectif > 50M€ sera questionné. Trouvez un co-fondateur complémentaire avant de pitcher des Série A.' });

  if (mrr > 10_000)
    alerts.push({ type: 'success', title: `${formatAmount(mrr)} MRR — signal fort`, message: "Votre MRR est excellent pour votre stade. C'est votre argument le plus fort — mettez-le en avant dans tous vos pitchs." });

  if (p.previousStartup === 'oui' && p.hadExit === 'oui')
    alerts.push({ type: 'success', title: 'Exit précédent — atout majeur', message: "Un exit réussi est l'un des signaux les plus forts pour les investisseurs. Mentionnez-le systématiquement et utilisez votre réseau de l'exit précédent." });

  const exp = p.sectorExperience ?? '';
  if (exp.includes('10') || exp.includes('15') || exp.includes('20'))
    alerts.push({ type: 'success', title: 'Expertise sectorielle — crédibilité forte', message: 'Plus de 10 ans dans le secteur est un avantage concurrentiel réel. Valorisez cette expertise dans votre pitch comme une barrière à l\'entrée.' });

  return alerts;
}

// ─── Sub-score analysis ───────────────────────────────────────────────────────

function getPitchAnalysis(v: number): string {
  if (v < 10) return 'Problème, solution et différenciation mal définis';
  if (v < 18) return 'Pitch correct mais manque de précision sur le marché';
  return 'Pitch clair et convaincant';
}
function getTractionAnalysis(v: number, p: Profile): string {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;
  if (v < 10) return mrr === 0 ? 'Pre-revenue — aucune preuve de marché' : 'Traction faible — accélérez l\'acquisition';
  if (v < 18) return `${formatAmount(mrr)} MRR — continuez à croître`;
  return 'Traction solide — argument fort pour les investisseurs';
}
function getTeamAnalysis(v: number, p: Profile): string {
  if (v < 10) return `${!p.hasCTO ? 'Pas de CTO — risque technique perçu. ' : ''}${(p.foundersCount ?? 1) < 2 ? 'Solo founder — les investisseurs préfèrent les équipes.' : 'Équipe légère.'}`;
  if (v < 18) return 'Équipe correcte mais peut être renforcée';
  return 'Équipe complète et expérimentée';
}
function getMarketAnalysis(v: number): string {
  if (v < 10) return 'Marché et stratégie go-to-market peu définis';
  if (v < 18) return 'Marché identifié mais objectifs à affiner';
  return 'Vision marché claire et ambitieuse';
}
function getSubScoreColor(v: number): string {
  if (v < 10) return '#ef4444';
  if (v < 18) return '#f97316';
  return '#22c55e';
}

// ─── Investors & funding ──────────────────────────────────────────────────────

const INVESTORS = [
  { name: 'Partech',        type: 'VC',     stages: ['seed', 'mvp', 'croissance', 'série'],   sectors: ['SaaS B2B', 'IA & Data', 'Fintech', 'Marketplace'] },
  { name: 'Kima Ventures',  type: 'VC',     stages: ['pre', 'seed', 'idéat', 'prototype'],    sectors: ['Fintech', 'SaaS B2B', 'E-commerce', 'Marketplace'] },
  { name: 'Alven',          type: 'VC',     stages: ['seed', 'mvp', 'série'],                 sectors: ['SaaS B2B', 'IA & Data', 'Marketplace', 'Deeptech'] },
  { name: 'Idinvest',       type: 'VC',     stages: ['seed', 'mvp', 'série', 'croissance'],   sectors: ['Healthtech', 'Deeptech', 'SaaS B2B', 'Legaltech'] },
  { name: 'Otium Capital',  type: 'Family', stages: ['pre', 'seed', 'prototype', 'idéat'],    sectors: ['E-commerce', 'Marketplace', 'SaaS B2B', 'Foodtech'] },
  { name: 'Serena Capital', type: 'VC',     stages: ['seed', 'série', 'croissance'],          sectors: ['SaaS B2B', 'Fintech', 'IA & Data', 'Proptech'] },
  { name: 'XAnge',          type: 'VC',     stages: ['seed', 'prototype', 'mvp'],             sectors: ['Healthtech', 'Edtech', 'SaaS B2B', 'Greentech'] },
  { name: 'Breega',         type: 'VC',     stages: ['seed', 'mvp', 'série'],                 sectors: ['Fintech', 'SaaS B2B', 'Marketplace', 'E-commerce'] },
];

function matchInvestors(p: Profile, n: number) {
  const stage = (p.stage ?? '').toLowerCase();
  const sector = p.sector ?? '';
  const scored = INVESTORS.map(inv => {
    let score = 60;
    if (inv.stages.some(s => stage.includes(s))) score += 20;
    if (inv.sectors.includes(sector)) score += 15;
    return { ...inv, match: Math.min(99, score + Math.floor(Math.random() * 5)) };
  });
  return scored.sort((a, b) => b.match - a.match).slice(0, n);
}

const NON_DILUTIVE: Record<string, { name: string; amount: string; type: string }[]> = {
  France: [
    { name: 'Bourse French Tech BPI', amount: '30K€',  type: 'Subvention' },
    { name: 'Aide à l\'Innovation BPI', amount: '200K€', type: 'Prêt sans intérêt' },
    { name: 'Crédit Impôt Recherche',  amount: '30% R&D', type: 'Crédit fiscal' },
  ],
  Belgique: [
    { name: 'Innoviris Explore',   amount: '50K€',  type: 'Subvention' },
    { name: 'Primes SPW',          amount: '100K€', type: 'Subvention' },
    { name: 'Recovinno',           amount: '75K€',  type: 'Prêt' },
  ],
  Suisse: [
    { name: 'Innosuisse Startup',  amount: '150K€', type: 'Coaching + financement' },
    { name: 'CTI Startup Label',   amount: '—',     type: 'Label + réseau' },
    { name: 'SECO StartUp',        amount: '50K€',  type: 'Subvention' },
  ],
};
function getNonDilutive(country?: string) {
  return NON_DILUTIVE[country ?? ''] ?? NON_DILUTIVE['France'];
}
function getNonDilutivePotential(country?: string): string {
  const map: Record<string, string> = { France: '~340K€', Belgique: '~225K€', Suisse: '~200K€', Luxembourg: '~120K€' };
  return map[country ?? ''] ?? '~200K€';
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface Action { icon: React.ReactNode; iconBg: string; title: string; subtitle: string; cta: string }

function getActions(p: Profile, score: Score): Action[] {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;
  const items: Action[] = [];

  if (!mrr || mrr === 0)
    items.push({ icon: <TrendingUp className="h-4 w-4" />, iconBg: '#ABC5FE', title: 'Obtenez vos premiers clients', subtitle: 'La traction est le critère n°1 pour les investisseurs seed', cta: 'Voir la stratégie' });

  if ((p.runway ?? Infinity) < 6)
    items.push({ icon: <AlertCircle className="h-4 w-4" />, iconBg: '#FFB3B3', title: 'Runway critique — agissez maintenant', subtitle: 'Priorité : BPI Express et love money pour tenir 6 mois', cta: 'Voir les financements urgents' });

  if (score.total < 50)
    items.push({ icon: <Star className="h-4 w-4" />, iconBg: '#F4B8CC', title: 'Améliorez votre score Raisup', subtitle: 'Complétez votre profil pour débloquer plus de matchs investisseurs', cta: 'Améliorer mon score' });

  items.push({ icon: <FileText className="h-4 w-4" />, iconBg: '#D8FFBD', title: 'Préparez votre pitch deck', subtitle: 'Générez votre deck en 8 minutes avec vos données', cta: 'Générer mon deck' });
  items.push({ icon: <Search className="h-4 w-4" />, iconBg: '#CDB4FF', title: 'Explorez vos subventions disponibles', subtitle: `Jusqu'à ${getNonDilutivePotential(p.country)} de financements non-dilutifs identifiés`, cta: 'Voir les subventions' });

  return items.slice(0, 3);
}

// ─── Animated circular gauge ──────────────────────────────────────────────────

const CircleGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 100 }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 200); return () => clearTimeout(t); }, [score]);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const level = getScoreLevel(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={level.color} strokeWidth="8"
          strokeDasharray={circ} strokeLinecap="round"
          strokeDashoffset={circ - (anim / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black leading-none" style={{ color: level.color }}>{score}</span>
        <span className="text-[10px] text-gray-400">/100</span>
      </div>
    </div>
  );
};

// ─── Sub-score bar ────────────────────────────────────────────────────────────

const SubScoreBar: React.FC<{ label: string; value: number; analysis: string }> = ({ label, value, analysis }) => {
  const color = getSubScoreColor(value);
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
        <span className="text-sm font-black" style={{ color }}>{value}<span className="text-xs text-gray-400 font-normal">/25</span></span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(value / 25) * 100}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-gray-500 leading-snug">{analysis}</p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const DashboardWelcome: React.FC = () => {
  const navigate = useNavigate();

  const isPremium = useMemo(() => localStorage.getItem('raisup_is_premium') === 'true', []);

  const profile = useMemo<Profile>(() => {
    try {
      const a = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      const b = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
      return { ...b, ...a };
    } catch { return {}; }
  }, []);

  const score   = useMemo(() => calculateScore(profile), [profile]);
  const alerts  = useMemo(() => computeAlerts(profile),  [profile]);
  const actions = useMemo(() => getActions(profile, score), [profile, score]);
  const investors = useMemo(() => matchInvestors(profile, 3), [profile]);
  const ndFunding = useMemo(() => getNonDilutive(profile.country), [profile]);

  const initials  = getInitials(profile);
  const badge     = getStageBadge(profile.stage);
  const level     = getScoreLevel(score.total);
  const analysis  = getScoreAnalysis(profile, score);
  const firstName = profile.firstName || profile.founderName || 'Fondateur';
  const lastName  = profile.lastName ?? '';
  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const fundraising = profile.fundraisingGoal ?? profile.fundingNeeded;

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Section 1 : Header ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 flex items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ width: 52, height: 52, backgroundColor: '#FFD6E5', color: '#C4728A' }}>
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Bonjour, {firstName} {lastName}
              </h1>
              <p className="text-[15px] text-gray-500 mt-0.5">{startupName}</p>
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1"
                style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-2 text-right flex-shrink-0">
            {profile.email && (
              <div className="flex items-center gap-1.5 justify-end text-[13px] text-gray-400">
                <Mail className="h-3.5 w-3.5" />
                <span>{profile.email}</span>
              </div>
            )}
            {(profile.country || profile.city) && (
              <div className="flex items-center gap-1.5 justify-end text-[13px] text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2 : Diagnostic IA ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm space-y-6">

          {/* Header diagnostic */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
            <h2 className="text-xl font-bold text-gray-900">Diagnostic Raisup</h2>
          </div>

          {/* 2a — Score global */}
          <div className="flex items-center gap-6 p-5 rounded-xl" style={{ backgroundColor: '#FAFAFA' }}>
            <CircleGauge score={score.total} size={100} />
            <div>
              <p className="text-lg font-bold" style={{ color: level.color }}>{level.label}</p>
              <p className="text-sm text-gray-600 mt-1 max-w-sm leading-relaxed">{analysis}</p>
            </div>
          </div>

          {/* 2b — 4 sous-scores */}
          <div className="grid grid-cols-2 gap-3">
            <SubScoreBar label="Pitch"    value={score.pitch}    analysis={getPitchAnalysis(score.pitch)} />
            <SubScoreBar label="Traction" value={score.traction} analysis={getTractionAnalysis(score.traction, profile)} />
            <SubScoreBar label="Équipe"   value={score.team}     analysis={getTeamAnalysis(score.team, profile)} />
            <SubScoreBar label="Marché"   value={score.market}   analysis={getMarketAnalysis(score.market)} />
          </div>

          {/* 2c — Analyse de cohérence */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <h3 className="text-base font-bold text-gray-900">Analyse de cohérence</h3>
            </div>

            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 p-4 rounded-xl text-sm font-medium"
                style={{ backgroundColor: '#F0FFF4', color: '#166534' }}>
                <CheckCircle2 className="h-4 w-4" />
                Votre dossier est cohérent — aucune incohérence majeure détectée.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a, i) => {
                  const st = ALERT_STYLES[a.type];
                  return (
                    <div key={i} className="flex gap-3 p-4 rounded-xl text-sm"
                      style={{ backgroundColor: st.bg, borderLeft: `3px solid ${st.border}` }}>
                      {st.icon}
                      <div>
                        <p className="font-bold text-gray-900">{a.title}</p>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{a.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3 : Financement ─────────────────────────────────────── */}
        <div className="relative">
          {/* Content — blurred if not premium */}
          <div className={clsx(
            'grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300',
            !isPremium && 'opacity-40 blur-[3px] pointer-events-none select-none',
          )}>
            {/* Dilutif */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Financement dilutif</h3>
              </div>
              {fundraising && (
                <p className="text-xs text-gray-400 mb-3">
                  Objectif : <span className="font-semibold text-gray-700">{formatAmount(fundraising)}</span>
                </p>
              )}
              <div className="space-y-2">
                {investors.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{inv.name}</p>
                      <p className="text-[11px] text-gray-400">{inv.type}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#ABC5FE', color: '#1A3A8F' }}>
                      {inv.match}% match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-dilutif */}
            <div className="rounded-2xl p-5 shadow-sm" style={{ backgroundColor: '#F6FFF4', border: '1px solid #D8FFBD' }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">Financement non-dilutif</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Potentiel : <span className="font-semibold text-green-700">{getNonDilutivePotential(profile.country)}</span>
              </p>
              <div className="space-y-2">
                {ndFunding.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                      <p className="text-[11px] text-gray-400">{f.type}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                      {f.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lock overlay — shown only if not premium */}
          {!isPremium && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-7 text-center max-w-sm mx-4"
                style={{ border: '1px solid #F4B8CC' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#FFD6E5' }}>
                  <Lock className="h-6 w-6" style={{ color: '#C4728A' }} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Débloquez vos opportunités de financement
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Accédez aux investisseurs matchés à votre profil et aux financements non-dilutifs disponibles dans votre région.
                </p>
                <button
                  onClick={() => navigate('/pricing?from=welcome&type=financement')}
                  className="flex items-center gap-2 text-white text-sm font-bold px-6 py-3 rounded-full mx-auto"
                  style={{ backgroundColor: '#0A0A0A' }}
                >
                  Voir les offres <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 4 : Prochaines actions ──────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Vos prochaines actions</h2>
          <div className="space-y-3">
            {actions.map((action, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                <span className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-800"
                  style={{ backgroundColor: action.iconBg }}>
                  {action.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-gray-900">{action.title}</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">{action.subtitle}</p>
                </div>
                <button className="flex-shrink-0 text-[12px] font-bold text-white px-3.5 py-1.5 rounded-full border-0 cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: '#0A0A0A' }}>
                  {action.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <button
          onClick={() => isPremium
            ? navigate('/dashboard/financial-journey')
            : navigate('/pricing?from=welcome&type=parcours')
          }
          className="w-full flex items-center justify-center gap-2 text-white font-bold text-[15px] border-0 cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0A0A0A', borderRadius: 50, padding: '16px 24px' }}
        >
          {!isPremium && <Lock className="h-4 w-4" />}
          Voir mon parcours financier complet
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default DashboardWelcome;
