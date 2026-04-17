import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { Map, TrendingUp, RefreshCw, Lock, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Profile {
  firstName?: string;
  startupName?: string;
  sector?: string;
  stage?: string;
  mrr?: number | null;
  currentRevenue?: number | null;
  momGrowth?: number | null;
  growthMoM?: number | null;
  churnRate?: number | null;
  activeClients?: number | null;
  fundraisingGoal?: number | null;
  fundingNeeded?: number | null;
  finalGoalValuation?: number | null;
  founderShare?: number | null;
  founderSharePct?: number | null;
  problem?: string;
  solution?: string;
  competitiveAdvantage?: string;
  businessModel?: string;
  clientType?: string;
  runway?: number | null;
  burnRate?: number | null;
  isPreRevenue?: boolean;
  hasCTO?: boolean;
  previousStartup?: string;
  hadExit?: string;
  advisors?: number | null;
  foundersCount?: number | null;
  sectorExperience?: string;
  ambition?: string;
  fundingPreference?: string;
  intellectualProperty?: string;
  moat?: string;
  barriers?: string;
}

interface SimData {
  currentMRR: number;
  growthMoM: number;
  churnRate: number;
  activeClients: number;
  sector: string;
  stage: string;
  targetValuation: number;
  secondaryPct: number;
  founderSharePct: number;
  fundraisingGoal: number;
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(n?: number | null): string {
  if (n == null || n === 0) return '0€';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${Math.round(n)}€`;
}

function calculateScore(p: Profile): ExtendedScore {
  const mrr = p.mrr ?? p.currentRevenue ?? 0;
  let pitch = 0;
  if ((p.problem?.length ?? 0) > 50) pitch += 7; else if ((p.problem?.length ?? 0) > 20) pitch += 4;
  if ((p.solution?.length ?? 0) > 50) pitch += 7; else if ((p.solution?.length ?? 0) > 20) pitch += 4;
  if ((p.competitiveAdvantage?.length ?? 0) > 30) pitch += 6; else if ((p.competitiveAdvantage?.length ?? 0) > 10) pitch += 3;
  pitch += 3; // proxy description

  let traction = 0;
  if (!p.isPreRevenue && mrr > 0) traction += mrr >= 50_000 ? 9 : mrr >= 10_000 ? 7 : mrr >= 1_000 ? 4 : 2;
  const mom = p.momGrowth ?? p.growthMoM ?? 0;
  if (mom) traction += mom >= 20 ? 7 : mom >= 10 ? 5 : mom >= 5 ? 3 : 1;
  if (p.activeClients) traction += p.activeClients >= 100 ? 5 : p.activeClients >= 20 ? 3 : 1;
  if (p.runway) traction += p.runway >= 12 ? 4 : p.runway >= 6 ? 2 : 0;

  let team = 0;
  if (p.hasCTO) team += 5;
  if (p.previousStartup === 'oui') team += 5;
  if (p.hadExit === 'oui') team += 7;
  if (p.advisors) team += p.advisors >= 3 ? 4 : 2;
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

  let fc = 0;
  const goal = p.fundraisingGoal ?? p.fundingNeeded ?? 0;
  if (goal > 0 && mrr === 0 && goal <= 500_000) fc += 4;
  else if (goal > 0 && mrr > 0) fc += 4;
  if ((p.runway ?? 0) >= 6) fc += 3;
  if (p.burnRate && p.burnRate > 0) fc += 3;

  const raw = Math.min(25, pitch) + Math.min(25, traction) + Math.min(25, team)
    + Math.min(25, market) + Math.min(10, defensibility) + Math.min(10, fc);

  return {
    total: Math.round((raw / 120) * 100),
    pitch: Math.min(25, pitch),
    traction: Math.min(25, traction),
    team: Math.min(25, team),
    market: Math.min(25, market),
    defensibility: Math.min(10, defensibility),
    financialCoherence: Math.min(10, fc),
  };
}

// ─── Valuation multiples ───────────────────────────────────────────────────────

const MULTIPLES: Record<string, Record<string, number>> = {
  'saas-b2b':   { 'pre-seed': 8,  'seed': 12, 'serie-a': 15, 'serie-b': 12 },
  'ia':         { 'pre-seed': 12, 'seed': 18, 'serie-a': 22, 'serie-b': 18 },
  'fintech':    { 'pre-seed': 10, 'seed': 15, 'serie-a': 18, 'serie-b': 15 },
  'healthtech': { 'pre-seed': 9,  'seed': 14, 'serie-a': 16, 'serie-b': 13 },
  'deeptech':   { 'pre-seed': 10, 'seed': 15, 'serie-a': 20, 'serie-b': 16 },
  'greentech':  { 'pre-seed': 8,  'seed': 12, 'serie-a': 14, 'serie-b': 11 },
  'marketplace':{ 'pre-seed': 7,  'seed': 10, 'serie-a': 12, 'serie-b': 10 },
  'e-commerce': { 'pre-seed': 4,  'seed': 6,  'serie-a': 8,  'serie-b': 6  },
};

const SECTOR_LABELS: Record<string, string> = {
  'saas-b2b': 'SaaS B2B', 'ia': 'IA & Data', 'fintech': 'Fintech',
  'healthtech': 'Healthtech', 'deeptech': 'Deeptech', 'greentech': 'Greentech',
  'marketplace': 'Marketplace', 'e-commerce': 'E-commerce',
};

const STAGE_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-seed', 'seed': 'Seed', 'serie-a': 'Série A', 'serie-b': 'Série B',
};

const STAGE_RANGES: Record<string, { min: number; max: number }> = {
  'pre-seed': { min: 300_000,    max: 2_000_000 },
  'seed':     { min: 1_000_000,  max: 8_000_000 },
  'serie-a':  { min: 8_000_000,  max: 30_000_000 },
  'serie-b':  { min: 30_000_000, max: 150_000_000 },
};

const MRR_BENCHMARKS: Record<string, Record<string, number>> = {
  'pre-seed': { p25: 2_000,  p50: 5_000,  p75: 15_000  },
  'seed':     { p25: 10_000, p50: 25_000, p75: 80_000  },
  'serie-a':  { p25: 80_000, p50: 200_000, p75: 500_000 },
};

const VALO_STEPS = [500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000, 8_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000];

// ─── Calculation functions ─────────────────────────────────────────────────────

function calculateCurrentValuation(simData: SimData, score: ExtendedScore) {
  const baseMultiple = MULTIPLES[simData.sector]?.[simData.stage] ?? 10;
  const BASE_VALOS: Record<string, number> = { 'pre-seed': 500_000, 'seed': 1_500_000, 'serie-a': 8_000_000, 'serie-b': 25_000_000 };

  if (simData.currentMRR === 0) {
    const base = BASE_VALOS[simData.stage] ?? 500_000;
    return { min: Math.round(base * 0.7), mid: base, max: Math.round(base * 1.4), multiple: null, arr: 0, basis: 'stade' as const };
  }

  let adj = baseMultiple;
  if (simData.growthMoM > 30) adj += 5;
  else if (simData.growthMoM > 20) adj += 2;
  if (simData.churnRate < 3) adj += 2;
  else if (simData.churnRate > 8) adj -= 3;
  if (score.total > 70) adj += 1;
  adj = Math.max(1, adj);

  const arr = simData.currentMRR * 12;
  return {
    min: Math.round(arr * Math.max(1, adj - 3)),
    mid: Math.round(arr * adj),
    max: Math.round(arr * (adj + 3)),
    multiple: adj,
    arr,
    basis: 'arr' as const,
  };
}

function getMRRPercentileLabel(mrr: number, stage: string): string {
  const bench = MRR_BENCHMARKS[stage];
  if (!bench) return '';
  if (mrr >= bench.p75) return 'Top 25%';
  if (mrr >= bench.p50) return 'Top 50%';
  if (mrr >= bench.p25) return 'Top 75%';
  return 'Bottom 25%';
}

// ─── Animated counter ──────────────────────────────────────────────────────────

function useAnimatedValue(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const raf = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplay(Math.round(start + diff * ease));
      if (t < 1) requestAnimationFrame(raf);
      else { setDisplay(target); prev.current = target; }
    };
    requestAnimationFrame(raf);
    prev.current = target;
  }, [target, duration]);
  return display;
}

// ─── Styled input ──────────────────────────────────────────────────────────────

const MetricInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  hint?: React.ReactNode;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, unit, hint, placeholder, min = 0, max, step = 1 }) => (
  <div>
    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ''}
        onChange={e => onChange(Math.max(min, Number(e.target.value)))}
        placeholder={placeholder ?? '0'}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 outline-none focus:border-gray-900 transition-colors placeholder-gray-300"
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-gray-400 font-medium pointer-events-none">
          {unit}
        </span>
      )}
    </div>
    {hint && <div className="mt-1.5">{hint}</div>}
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────────────

const MetricSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: React.ReactNode;
}> = ({ label, value, onChange, options, hint }) => (
  <div>
    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 outline-none focus:border-gray-900 transition-colors bg-white appearance-none"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {hint && <div className="mt-1.5">{hint}</div>}
  </div>
);

// ─── Top header metrics ────────────────────────────────────────────────────────

const HeaderMetric: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="text-center">
    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#F4B8CC' }}>{label}</p>
    <p className="text-[28px] font-black text-white leading-none">{value}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ─── Factor badge ──────────────────────────────────────────────────────────────

const FactorBadge: React.FC<{ label: string; value: string; impact: string; positive: boolean | null }> = ({ label, value, impact, positive }) => {
  const ImpactIcon = positive === null ? Minus : positive ? ArrowUp : ArrowDown;
  const impactColor = positive === null ? '#9CA3AF' : positive ? '#22C55E' : '#EF4444';
  return (
    <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
      <div>
        <p className="text-[12px] font-bold text-gray-700">{label}</p>
        <p className="text-[13px] font-semibold text-gray-500">{value}</p>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ backgroundColor: positive === null ? '#F3F4F6' : positive ? '#D8FFBD' : '#FFB3B3' }}>
        <ImpactIcon className="h-3 w-3" style={{ color: impactColor }} />
        <span className="text-[11px] font-black" style={{ color: impactColor }}>{impact}</span>
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

const ValuationPage: React.FC = () => {
  const navigate = useNavigate();

  // ── Profile from localStorage
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

  // ── Normalize sector/stage from profile for simData keys
  function normalizeSector(s?: string): string {
    if (!s) return 'saas-b2b';
    const sl = s.toLowerCase();
    if (sl.includes('ia') || sl.includes('intelligence')) return 'ia';
    if (sl.includes('fintech') || sl.includes('finance')) return 'fintech';
    if (sl.includes('health') || sl.includes('santé') || sl.includes('medic')) return 'healthtech';
    if (sl.includes('deep') || sl.includes('biotech') || sl.includes('nanotech')) return 'deeptech';
    if (sl.includes('green') || sl.includes('climat') || sl.includes('energ')) return 'greentech';
    if (sl.includes('market')) return 'marketplace';
    if (sl.includes('commerce') || sl.includes('retail') || sl.includes('fashion')) return 'e-commerce';
    return 'saas-b2b';
  }

  function normalizeStage(s?: string): string {
    if (!s) return 'seed';
    const sl = s.toLowerCase();
    if (sl.includes('pre') || sl.includes('idéat') || sl.includes('ideat') || sl.includes('prototype')) return 'pre-seed';
    if (sl.includes('serie a') || sl.includes('série a') || sl.includes('series a') || sl.includes('serie-a') || sl.includes('serie a') || sl.includes('croissance')) return 'serie-a';
    if (sl.includes('serie b') || sl.includes('série b')) return 'serie-b';
    return 'seed';
  }

  const profileDefaults = useMemo<SimData>(() => ({
    currentMRR: (profile.mrr ?? profile.currentRevenue ?? 0) as number,
    growthMoM: (profile.momGrowth ?? profile.growthMoM ?? 0) as number,
    churnRate: (profile.churnRate ?? 5) as number,
    activeClients: (profile.activeClients ?? 0) as number,
    sector: normalizeSector(profile.sector),
    stage: normalizeStage(profile.stage),
    targetValuation: (profile.finalGoalValuation ?? 5_000_000) as number,
    secondaryPct: 15,
    founderSharePct: (profile.founderShare ?? profile.founderSharePct ?? 80) as number,
    fundraisingGoal: (profile.fundraisingGoal ?? profile.fundingNeeded ?? 500_000) as number,
  }), [profile]);

  const [simData, setSimData] = useState<SimData>(() => {
    try {
      const saved = localStorage.getItem('raisup_valuation_sim');
      return saved ? JSON.parse(saved) : profileDefaults;
    } catch { return profileDefaults; }
  });

  // Debounced localStorage save
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setSim = useCallback((updater: Partial<SimData> | ((prev: SimData) => Partial<SimData>)) => {
    setSimData(prev => {
      const patch = typeof updater === 'function' ? updater(prev) : updater;
      const next = { ...prev, ...patch };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        localStorage.setItem('raisup_valuation_sim', JSON.stringify(next));
      }, 300);
      return next;
    });
  }, []);

  const resetFromProfile = () => {
    setSimData(profileDefaults);
    localStorage.setItem('raisup_valuation_sim', JSON.stringify(profileDefaults));
  };

  // ── Computed valuations
  const valo = useMemo(() => calculateCurrentValuation(simData, score), [simData, score]);

  const secondaryGross = useMemo(() => {
    const founderValue = valo.mid * (simData.founderSharePct / 100);
    return Math.round(founderValue * (simData.secondaryPct / 100));
  }, [valo.mid, simData.founderSharePct, simData.secondaryPct]);

  const targetValoIdx = useMemo(() => {
    const idx = VALO_STEPS.findIndex(v => v >= simData.targetValuation);
    return idx >= 0 ? idx : VALO_STEPS.length - 1;
  }, [simData.targetValuation]);

  // Animated mid valuation
  const animatedMid = useAnimatedValue(valo.mid);

  // ── Churn color
  const churnColor = simData.churnRate < 3 ? { bg: '#D8FFBD', text: '#2D6A00', label: 'Excellent' }
    : simData.churnRate <= 7 ? { bg: '#FFE8C2', text: '#92520A', label: 'Correct' }
    : { bg: '#FFB3B3', text: '#8F1A1A', label: 'Élevé' };

  // ── MoM projection
  const mrr12 = simData.currentMRR > 0 && simData.growthMoM > 0
    ? Math.round(simData.currentMRR * Math.pow(1 + simData.growthMoM / 100, 12))
    : null;

  // ── MRR percentile label
  const mrrPercentile = getMRRPercentileLabel(simData.currentMRR, simData.stage);

  // ── Current multiple info
  const baseMultiple = MULTIPLES[simData.sector]?.[simData.stage] ?? 10;
  const stageRange = STAGE_RANGES[simData.stage] ?? { min: 0, max: 0 };

  // ── Factor impacts
  const factors = [
    {
      label: 'Croissance MoM',
      value: `${simData.growthMoM}%`,
      impact: simData.growthMoM > 30 ? '+5x' : simData.growthMoM > 20 ? '+2x' : simData.growthMoM > 10 ? 'neutre' : '-1x',
      positive: simData.growthMoM > 10 ? true : simData.growthMoM > 5 ? null : false,
    },
    {
      label: 'Churn mensuel',
      value: `${simData.churnRate}%`,
      impact: simData.churnRate < 3 ? '+2x' : simData.churnRate < 7 ? 'neutre' : '-3x',
      positive: simData.churnRate < 7 ? (simData.churnRate < 3 ? true : null) : false,
    },
    {
      label: 'Score Raisup',
      value: `${score.total}/100`,
      impact: score.total > 70 ? '+1x' : 'neutre',
      positive: score.total > 70 ? true : null,
    },
  ];

  const tabs = [
    { id: 'journey',   label: 'Ligne du temps', Icon: Map,         link: '/dashboard/financial-journey' },
    { id: 'valuation', label: 'Ma Valorisation', Icon: TrendingUp, link: '/dashboard/valuation' },
  ];

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F8F8F8' }}>

      {/* ── Onglets ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex gap-2">
          {tabs.map(({ id, label, Icon, link }) => (
            <NavLink
              key={id}
              to={link}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold border transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Page title ───────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 leading-tight">Ma Valorisation</h1>
            <p className="text-[14px] text-gray-400 mt-1">
              Comprends ce que vaut ton entreprise aujourd'hui et ce qu'il te faut pour atteindre tes objectifs.
            </p>
          </div>
          <button
            onClick={resetFromProfile}
            className="flex items-center gap-2 text-[12px] font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réinitialiser depuis mon profil
          </button>
        </div>

        {/* ── SECTION 1 — Bandeau récapitulatif ────────────────────────────── */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#0A0A0A' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-800">
            <HeaderMetric
              label="Valorisation actuelle estimée"
              value={formatAmount(animatedMid)}
              sub={valo.basis === 'arr' ? `Multiple ${valo.multiple}x ARR` : `Basé sur le stade ${STAGE_LABELS[simData.stage] ?? simData.stage}`}
            />
            <div className="pt-6 sm:pt-0 sm:pl-6">
              <HeaderMetric
                label="Prochaine levée recommandée à"
                value={formatAmount(simData.targetValuation)}
                sub={`Fourchette stade : ${formatAmount(stageRange.min)}–${formatAmount(stageRange.max)}`}
              />
            </div>
            <div className="pt-6 sm:pt-0 sm:pl-6">
              <HeaderMetric
                label="Secondary potentiel (net 30%)"
                value={formatAmount(Math.round(secondaryGross * 0.7))}
                sub={`Brut ${formatAmount(secondaryGross)} · ${simData.secondaryPct}% de vos parts`}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 2 — Tes données actuelles ────────────────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-gray-900">Tes données actuelles</h2>
            <button
              onClick={resetFromProfile}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Synchroniser depuis mon profil
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche — métriques financières */}
            <div className="space-y-5">
              <MetricInput
                label="MRR actuel"
                value={simData.currentMRR}
                onChange={v => setSim({ currentMRR: v })}
                unit="€/mois"
                placeholder="0 si pre-revenue"
                hint={simData.currentMRR > 0 && mrrPercentile ? (
                  <p className="text-[11px] text-gray-400">
                    <span className="font-semibold text-gray-600">{mrrPercentile}</span> des startups {STAGE_LABELS[simData.stage] ?? simData.stage} en {SECTOR_LABELS[simData.sector] ?? simData.sector}
                  </p>
                ) : simData.currentMRR === 0 ? (
                  <p className="text-[11px] text-gray-400">Pre-revenue — valorisation basée sur le stade</p>
                ) : null}
              />

              <MetricInput
                label="Croissance MoM"
                value={simData.growthMoM}
                onChange={v => setSim({ growthMoM: v })}
                unit="%"
                min={0}
                max={200}
                hint={mrr12 ? (
                  <p className="text-[11px] text-gray-400">
                    À ce rythme votre MRR sera de <span className="font-semibold text-gray-600">{formatAmount(mrr12)}</span> dans 12 mois
                  </p>
                ) : null}
              />

              <MetricInput
                label="Churn mensuel"
                value={simData.churnRate}
                onChange={v => setSim({ churnRate: v })}
                unit="%"
                min={0}
                max={100}
                step={0.5}
                hint={
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: churnColor.bg, color: churnColor.text }}>
                    {churnColor.label}
                  </span>
                }
              />

              <MetricInput
                label="Clients actifs"
                value={simData.activeClients}
                onChange={v => setSim({ activeClients: v })}
                placeholder="0"
                hint={simData.activeClients > 0 && simData.currentMRR > 0 ? (
                  <p className="text-[11px] text-gray-400">
                    Revenu moyen par client : <span className="font-semibold text-gray-600">{formatAmount(Math.round(simData.currentMRR / simData.activeClients))}/mois</span>
                  </p>
                ) : null}
              />
            </div>

            {/* Colonne droite — contexte entreprise */}
            <div className="space-y-5">
              <MetricSelect
                label="Secteur"
                value={simData.sector}
                onChange={v => setSim({ sector: v })}
                options={Object.entries(SECTOR_LABELS).map(([value, label]) => ({ value, label }))}
                hint={
                  <p className="text-[11px] text-gray-400">
                    Multiple actuel pour {SECTOR_LABELS[simData.sector] ?? simData.sector} : <span className="font-semibold text-gray-600">{baseMultiple}x ARR</span>
                  </p>
                }
              />

              <MetricSelect
                label="Stade"
                value={simData.stage}
                onChange={v => setSim({ stage: v })}
                options={Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }))}
                hint={
                  <p className="text-[11px] text-gray-400">
                    Fourchette typique : <span className="font-semibold text-gray-600">{formatAmount(stageRange.min)} – {formatAmount(stageRange.max)}</span>
                  </p>
                }
              />

              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Part fondatrice actuelle
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={simData.founderSharePct}
                    onChange={e => setSim({ founderSharePct: Number(e.target.value) })}
                    className="flex-1 accent-gray-900"
                  />
                  <span className="text-[18px] font-black text-gray-900 w-14 text-right">{simData.founderSharePct}%</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Vos parts représentent <span className="font-semibold text-gray-600">{formatAmount(Math.round(valo.mid * simData.founderSharePct / 100))}</span> à la valo actuelle
                </p>
              </div>

              <MetricInput
                label="Prochaine levée visée"
                value={simData.fundraisingGoal}
                onChange={v => setSim({ fundraisingGoal: v })}
                unit="€"
                hint={simData.fundraisingGoal > 0 ? (
                  <p className="text-[11px] text-gray-400">
                    Dilution estimée : <span className="font-semibold text-gray-600">{Math.round((simData.fundraisingGoal / (valo.mid + simData.fundraisingGoal)) * 100)}%</span> du capital
                  </p>
                ) : null}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 3 — MODULE 1 : Valorisation actuelle ─────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ borderLeft: '4px solid #ABC5FE' }}>
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">Ce que vaut ton entreprise aujourd'hui</h2>

          {/* Grand chiffre central */}
          <div className="text-center mb-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Valorisation estimée</p>
            <p className="text-[52px] font-black leading-none" style={{ color: '#1A3A8F' }}>
              {formatAmount(animatedMid)}
            </p>
            <p className="text-[14px] text-gray-400 mt-3">
              Entre{' '}
              <span className="font-bold text-gray-600">{formatAmount(valo.min)}</span>
              {' '}et{' '}
              <span className="font-bold text-gray-600">{formatAmount(valo.max)}</span>
            </p>

            {/* Multiple explication */}
            {valo.basis === 'arr' && valo.multiple !== null ? (
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
                style={{ backgroundColor: '#EEF2FF' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#1A3A8F' }}>
                  Multiple appliqué : <span className="font-black">{valo.multiple}x ARR</span> — basé sur {SECTOR_LABELS[simData.sector] ?? simData.sector} / {STAGE_LABELS[simData.stage] ?? simData.stage} avec ajustements croissance et churn
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
                style={{ backgroundColor: '#F3F4F6' }}>
                <span className="text-[13px] text-gray-500">
                  Pre-revenue — valorisation estimée sur le stade <span className="font-bold">{STAGE_LABELS[simData.stage] ?? simData.stage}</span>
                </span>
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="h-px bg-gray-100 my-6" />

          {/* 3 facteurs */}
          <div>
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Facteurs d'ajustement du multiple</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {factors.map(f => (
                <FactorBadge key={f.label} {...f} />
              ))}
            </div>
          </div>

          {/* Fourchette de stade */}
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Positionnement dans la fourchette {STAGE_LABELS[simData.stage] ?? simData.stage}</p>
            <div className="relative h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
              {/* Zone de fourchette */}
              <div className="absolute h-full rounded-full" style={{ backgroundColor: '#ABC5FE', left: '0%', right: '0%' }} />
              {/* Position actuelle */}
              {stageRange.max > 0 && (
                <div
                  className="absolute top-0 h-full w-1 rounded-full bg-gray-900 transition-all duration-500"
                  style={{
                    left: `${Math.min(95, Math.max(5, ((valo.mid - stageRange.min) / (stageRange.max - stageRange.min)) * 100))}%`,
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-2">
              <span>{formatAmount(stageRange.min)}</span>
              <span className="font-semibold text-gray-600">{formatAmount(valo.mid)} ←</span>
              <span>{formatAmount(stageRange.max)}</span>
            </div>
          </div>

          {/* Comparaison ARR si applicable */}
          {valo.basis === 'arr' && valo.arr > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'ARR actuel', value: formatAmount(valo.arr), sub: `${simData.currentMRR > 0 ? simData.currentMRR.toLocaleString('fr-FR') : 0}€ MRR × 12` },
                { label: 'Multiple de base', value: `${baseMultiple}x`, sub: `${SECTOR_LABELS[simData.sector]} ${STAGE_LABELS[simData.stage]}` },
                { label: 'Multiple ajusté', value: `${valo.multiple}x`, sub: 'Après croissance, churn, score' },
              ].map(m => (
                <div key={m.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F0F5FF' }}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</p>
                  <p className="text-[20px] font-black mt-1" style={{ color: '#1A3A8F' }}>{m.value}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Teaser module suivant si non payant */}
          {!isPaid && (
            <div className="mt-6 p-5 rounded-xl border border-dashed border-gray-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-bold text-gray-900">Modules 2–4 disponibles en Premium</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Simulateur objectif inversé · Calculateur secondary · Plan d'action · Matching investisseurs
                </p>
              </div>
              <button
                onClick={() => navigate('/pricing?from=valuation')}
                className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2.5 rounded-full border-0 cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}
              >
                <Lock className="h-3.5 w-3.5" />
                Débloquer →
              </button>
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default ValuationPage;
