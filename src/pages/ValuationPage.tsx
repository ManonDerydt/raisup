import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import {
  RefreshCw, Lock, ArrowUp, ArrowDown, Minus, CheckCircle, X,
  Info, Download, TrendingUp, Target, Clock, Shield, Users, Zap,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { calculateScore as calculateScoreService, getScoreLevel } from '../services/calculateScore';

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
  mrrGrowthMoM?: number | null;
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
  hasGDPRCompliance?: boolean;
  aiActCompliant?: boolean;
  hasLegalCounsel?: boolean;
  hasProprietaryTech?: boolean;
  hasUniqueData?: boolean;
  hasPatent?: boolean;
  techDependency?: string;
  tamSize?: number | null;
  potentialCustomers?: number | null;
  averagePrice?: number | null;
  marketGrowthRate?: number | null;
  cac?: number | null;
  ltv?: number | null;
  arr?: number | null;
  exitStrategy?: string;
  hasStrategicPartners?: boolean;
  founderDependency?: string;
  hasBoard?: boolean;
  hasC_suite?: boolean;
  freeText?: string;
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
  minCashoutTarget: number;
  coFounders: { name: string; sharePct: number }[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(n?: number | null): string {
  if (n == null || n === 0) return '0€';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${Math.round(n)}€`;
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

// ─── Calculation functions ─────────────────────────────────────────────────────

function calculateCurrentValuation(simData: SimData, scoreTotal: number) {
  const baseMultiple = MULTIPLES[simData.sector]?.[simData.stage] ?? 10;
  const BASE_VALOS: Record<string, number> = {
    'pre-seed': 500_000, 'seed': 1_500_000, 'serie-a': 8_000_000, 'serie-b': 25_000_000,
  };

  if (simData.currentMRR === 0) {
    const BASE_VALOS: Record<string, number> = {
      'pre-seed': 350_000,
      'seed':     700_000,
      'serie-a':  3_000_000,
      'serie-b':  10_000_000,
    };
    const base = BASE_VALOS[simData.stage] ?? 350_000;
    // Score boost for pre-revenue
    const scoreAdj = scoreTotal >= 70 ? 1.2 : scoreTotal >= 50 ? 1.0 : 0.8;
    const mid = Math.round(base * scoreAdj);
    return { min: Math.round(mid * 0.6), mid, max: Math.round(mid * 1.5), multiple: null, arr: 0, basis: 'stade' as const };
  }

  let adj = baseMultiple;
  if (simData.growthMoM > 30) adj += 5;
  else if (simData.growthMoM > 20) adj += 2;
  if (simData.churnRate < 3) adj += 2;
  else if (simData.churnRate > 8) adj -= 3;
  if (scoreTotal > 70) adj += 1;
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

// ─── Founder equity ring gauge ─────────────────────────────────────────────────

const FounderRing: React.FC<{ pct: number; label: string; value: string; color: string; size?: number }> = ({
  pct, label, value, color, size = 100,
}) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 300); return () => clearTimeout(t); }, [pct]);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={8} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ} strokeLinecap="round"
            strokeDashoffset={circ - (anim / 100) * circ}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-black text-gray-900 leading-none" style={{ fontSize: size * 0.2 }}>{anim}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{value}</p>
      </div>
    </div>
  );
};

// ─── Metric input ──────────────────────────────────────────────────────────────

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
        type="number" min={min} max={max} step={step}
        value={value}
        onChange={e => {
          const raw = e.target.value;
          onChange(raw === '' ? 0 : Math.max(min, Number(raw)));
        }}
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
      value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 outline-none focus:border-gray-900 transition-colors bg-white appearance-none"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {hint && <div className="mt-1.5">{hint}</div>}
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

// ─── Tooltip info box ──────────────────────────────────────────────────────────

const InfoBox: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#EEF2FF' }) => (
  <div className="flex gap-3 p-4 rounded-xl mt-3" style={{ backgroundColor: color }}>
    <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
    <p className="text-[13px] text-gray-600 leading-relaxed">{children}</p>
  </div>
);

// ─── Normalize helpers ─────────────────────────────────────────────────────────

function normalizeSector(s?: string): string {
  if (!s) return 'saas-b2b';
  const sl = s.toLowerCase();
  if (sl.includes('ia') || sl.includes('intelligence') || sl.includes('ia & data')) return 'ia';
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
  if (sl.includes('serie a') || sl.includes('série a') || sl.includes('serie-a') || sl.includes('croissance')) return 'serie-a';
  if (sl.includes('serie b') || sl.includes('série b')) return 'serie-b';
  return 'seed';
}

// ─── Main component ────────────────────────────────────────────────────────────

const ValuationPage: React.FC = () => {
  const navigate = useNavigate();

  const [profileTick, setProfileTick] = useState(0);
  useEffect(() => {
    const h = () => setProfileTick(t => t + 1);
    window.addEventListener('raisup:profile-updated', h);
    return () => window.removeEventListener('raisup:profile-updated', h);
  }, []);

  const profile = useMemo<Profile>(() => {
    try {
      const a = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      const b = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
      return { ...b, ...a };
    } catch { return {}; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileTick]);

  const { isPremium } = useUserProfile();
  const isPaid = isPremium;

  // Use the same score as DashboardWelcome
  const score = useMemo(() => calculateScoreService(profile), [profile]);
  const scoreLevel = useMemo(() => getScoreLevel(score.total), [score.total]);

  const profileDefaults = useMemo<SimData>(() => {
    const fc = (profile.foundersCount ?? 1) as number;
    const coFounders = fc > 1
      ? Array.from({ length: fc - 1 }, (_, i) => ({
          name: `Co-fondateur ${i + 1}`,
          sharePct: Math.round((100 - (profile.founderShare ?? profile.founderSharePct ?? 70) as number) / (fc - 1)),
        }))
      : [];
    return {
      currentMRR: (profile.mrr ?? profile.currentRevenue ?? 0) as number,
      growthMoM: (profile.momGrowth ?? profile.growthMoM ?? profile.mrrGrowthMoM ?? 0) as number,
      churnRate: (profile.churnRate ?? 5) as number,
      activeClients: (profile.activeClients ?? 0) as number,
      sector: normalizeSector(profile.sector),
      stage: normalizeStage(profile.stage),
      targetValuation: (profile.finalGoalValuation ?? 5_000_000) as number,
      secondaryPct: 15,
      founderSharePct: (profile.founderShare ?? profile.founderSharePct ?? 80) as number,
      fundraisingGoal: (profile.fundraisingGoal ?? profile.fundingNeeded ?? 500_000) as number,
      minCashoutTarget: 0,
      coFounders,
    };
  }, [profile]);

  const [simData, setSimData] = useState<SimData>(() => {
    try {
      const saved = localStorage.getItem('raisup_valuation_sim');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...profileDefaults, ...parsed };
      }
      return profileDefaults;
    } catch { return profileDefaults; }
  });

  const [pdfLoading, setPdfLoading] = useState(false);

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

  // Computed valuations
  const valo = useMemo(() => calculateCurrentValuation(simData, score.total), [simData, score.total]);
  const animatedMid = useAnimatedValue(valo.mid);

  const secondaryGross = useMemo(() => {
    const founderValue = valo.mid * (simData.founderSharePct / 100);
    return Math.round(founderValue * (simData.secondaryPct / 100));
  }, [valo.mid, simData.founderSharePct, simData.secondaryPct]);

  const secondaryNet = Math.round(secondaryGross * 0.7);

  // Cashout timing
  const cashoutValoNeeded = useMemo(() => {
    if (!simData.minCashoutTarget || simData.minCashoutTarget === 0) return null;
    // net = founderPct * valo * secondaryPct * 0.7 → valo = net / (founderPct * secondaryPct * 0.7)
    return Math.round(simData.minCashoutTarget / ((simData.founderSharePct / 100) * (simData.secondaryPct / 100) * 0.7));
  }, [simData.minCashoutTarget, simData.founderSharePct, simData.secondaryPct]);

  const cashoutMonthsNeeded = useMemo(() => {
    if (!cashoutValoNeeded || valo.mid <= 0 || simData.growthMoM <= 0) return null;
    // valoTarget = valo.mid * (1 + growthMoM/100)^months (ARR grows, so does valo)
    // months = ln(cashoutValoNeeded / valo.mid) / ln(1 + growthMoM/100)
    const ratio = cashoutValoNeeded / valo.mid;
    if (ratio <= 1) return 0;
    const months = Math.log(ratio) / Math.log(1 + simData.growthMoM / 100);
    return Math.round(months);
  }, [cashoutValoNeeded, valo.mid, simData.growthMoM]);

  const baseMultiple = MULTIPLES[simData.sector]?.[simData.stage] ?? 10;
  const stageRange = STAGE_RANGES[simData.stage] ?? { min: 0, max: 0 };
  const churnColor = simData.churnRate < 3 ? { bg: '#D8FFBD', text: '#2D6A00', label: 'Excellent' }
    : simData.churnRate <= 7 ? { bg: '#FFE8C2', text: '#92520A', label: 'Correct' }
    : { bg: '#FFB3B3', text: '#8F1A1A', label: 'Élevé' };

  const mrr12 = simData.currentMRR > 0 && simData.growthMoM > 0
    ? Math.round(simData.currentMRR * Math.pow(1 + simData.growthMoM / 100, 12))
    : null;

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

  // Eligibility checklist — chaque critère vérifié contre les vraies données du profil
  const founderCount = Number(
    profile.foundersCount ?? profile.foundersCount ?? 1
  );
  const hasCTO = !!(profile.hasCTO);
  const runwayMonths = Number(profile.runway ?? 0);
  const eligibility = [
    {
      label: 'Score Raisup ≥ 45/100',
      met: score.total >= 45,
      detail: `Votre score : ${score.total}/100`,
    },
    {
      label: 'MRR > 0 (traction prouvée)',
      met: simData.currentMRR > 0,
      detail: simData.currentMRR > 0 ? `${formatAmount(simData.currentMRR)}/mois` : 'Pré-revenu — ajoutez votre MRR dans la simulation',
    },
    {
      label: 'Runway ≥ 6 mois',
      met: runwayMonths >= 6,
      detail: runwayMonths > 0 ? `${runwayMonths} mois de runway` : 'Non renseigné dans votre profil',
    },
    {
      label: 'Fondateurs ≥ 2 ou CTO identifié',
      met: founderCount >= 2 || hasCTO,
      detail: hasCTO
        ? 'CTO identifié ✓'
        : founderCount >= 2
          ? `${founderCount} fondateurs ✓`
          : 'Fondateur solo sans CTO — risque dépendance',
    },
    {
      label: 'Valorisation > 1M€',
      met: valo.mid >= 1_000_000,
      detail: `Valorisation actuelle : ${formatAmount(valo.mid)}`,
    },
  ];
  const eligibilityCount = eligibility.filter(e => e.met).length;
  const isEligible = eligibilityCount >= 4;

  const sectorFavorable = ['ia', 'saas-b2b', 'fintech', 'deeptech'].includes(simData.sector);

  const handleDownloadPdf = () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210;
      const M = 15;
      let y = 0;

      const txt = (text: string, x: number, yy: number, size: number, bold = false, r = 50, g = 50, b = 50) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(r, g, b);
        doc.text(text, x, yy);
      };

      // ── Header dark band
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, W, 28, 'F');
      doc.setFillColor(244, 184, 204);
      doc.rect(0, 28, W, 2, 'F');
      txt('Ma Valorisation & Cash-out', M, 12, 16, true, 255, 255, 255);
      txt(`${profile.startupName || 'Ma Startup'}  ·  ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, M, 21, 9, false, 160, 160, 160);
      y = 38;

      // ── Trois métriques clés
      const cols = [
        { label: 'Valorisation actuelle', value: formatAmount(valo.mid), sub: `${formatAmount(valo.min)} – ${formatAmount(valo.max)}`, r: 244, g: 184, b: 204 },
        { label: 'Prochaine levée', value: formatAmount(simData.targetValuation), sub: `Stade ${STAGE_LABELS[simData.stage] ?? ''}`, r: 171, g: 197, b: 254 },
        { label: 'Secondary net', value: formatAmount(secondaryNet), sub: `Brut ${formatAmount(secondaryGross)}`, r: 216, g: 255, b: 189 },
      ];
      cols.forEach((col, i) => {
        const x = M + i * 60;
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(x, y, 57, 28, 3, 3, 'F');
        txt(col.label, x + 3, y + 7, 7, false, 100, 100, 100);
        txt(col.value, x + 3, y + 16, 13, true, 10, 10, 10);
        txt(col.sub, x + 3, y + 22, 7, false, 130, 130, 130);
      });
      y += 34;

      // ── Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(M, y, W - M, y);
      y += 8;

      // ── Données de simulation (2 colonnes)
      txt('Données de simulation', M, y, 11, true, 10, 10, 10);
      y += 7;
      const leftItems: [string, string][] = [
        ['MRR actuel', `${formatAmount(simData.currentMRR)}/mois`],
        ['Croissance MoM', `${simData.growthMoM}%`],
        ['Churn mensuel', `${simData.churnRate}%`],
        ['Clients actifs', `${simData.activeClients}`],
      ];
      const rightItems: [string, string][] = [
        ['Secteur', SECTOR_LABELS[simData.sector] ?? simData.sector],
        ['Stade', STAGE_LABELS[simData.stage] ?? simData.stage],
        ['Part fondatrice', `${simData.founderSharePct}%`],
        ['Score Raisup', `${score.total}/100 — ${scoreLevel.label}`],
      ];
      const startY = y;
      leftItems.forEach(([label, val], i) => {
        txt(label, M, startY + i * 7, 8.5, false, 100, 100, 100);
        txt(val, M + 38, startY + i * 7, 8.5, true, 10, 10, 10);
      });
      rightItems.forEach(([label, val], i) => {
        txt(label, W / 2 + 3, startY + i * 7, 8.5, false, 100, 100, 100);
        txt(val, W / 2 + 41, startY + i * 7, 8.5, true, 10, 10, 10);
      });
      y = startY + leftItems.length * 7 + 6;

      // ── Divider
      doc.line(M, y, W - M, y);
      y += 8;

      // ── Checklist
      txt('Checklist éligibilité au Secondary', M, y, 11, true, 10, 10, 10);
      const eligBadge = `${eligibilityCount}/${eligibility.length} critères${isEligible ? ' — Éligible ✓' : ''}`;
      txt(eligBadge, W - M - doc.getTextWidth(eligBadge), y, 9, true, isEligible ? 45 : 146, isEligible ? 106 : 82, isEligible ? 0 : 10);
      y += 7;
      eligibility.forEach(item => {
        const [ir, ig, ib] = item.met ? [45, 106, 0] : [200, 50, 50];
        txt(item.met ? '✓' : '✗', M, y, 9, true, ir, ig, ib);
        txt(item.label, M + 7, y, 8.5, false, 40, 40, 40);
        txt(item.detail, W - M - 55, y, 7.5, false, 120, 120, 120);
        y += 6.5;
      });
      y += 4;

      // ── Capital structure
      if (simData.coFounders.length > 0) {
        doc.line(M, y, W - M, y);
        y += 8;
        txt('Structure du capital', M, y, 11, true, 10, 10, 10);
        y += 7;
        const allFounders = [
          { name: profile.firstName ? `${profile.firstName} (vous)` : 'Vous', pct: simData.founderSharePct },
          ...simData.coFounders,
        ];
        allFounders.forEach(f => {
          txt(`${f.name}`, M, y, 8.5, false, 40, 40, 40);
          txt(`${f.pct}%  —  ${formatAmount(Math.round(valo.mid * f.pct / 100))}`, M + 50, y, 8.5, true, 10, 10, 10);
          y += 6;
        });
      }

      // ── Footer
      const footerY = 285;
      doc.setDrawColor(220, 220, 220);
      doc.line(M, footerY - 4, W - M, footerY - 4);
      txt('Simulation générée par Fundherz  ·  fundherz.com', M, footerY, 7, false, 150, 150, 150);
      txt('⚠ Estimation indicative — non contractuelle. Ne constitue pas un conseil financier.', M, footerY + 5, 7, false, 150, 150, 150);

      const filename = `valorisation-${(profile.startupName || 'startup').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } finally {
      setPdfLoading(false);
    }
  };

  const investorArgument = useMemo(() => {
    const mrr = simData.currentMRR;
    if (mrr === 0) return "Le cash-out est prématuré pour l'instant — concentrez-vous d'abord sur la traction.";
    if (score.total >= 60)
      return `Avec un score de ${score.total}/100 et ${formatAmount(mrr)}/mois de MRR, un secondary de ${simData.secondaryPct}% de vos parts vous permet de sécuriser ${formatAmount(secondaryNet)} net sans céder le contrôle. C'est un signal de confiance pour les futurs VCs : vous restez 100% focus, sans pression financière personnelle.`;
    return `Un secondary ciblé (${simData.secondaryPct}% de vos parts) vous sécurise sans dilution excessive. Argumentez auprès de vos VCs que cela renforce votre longévité et aligne vos intérêts sur le long terme.`;
  }, [simData, score.total, secondaryNet]);

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page title ───────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 leading-tight">Ma Valorisation & Cash-out</h1>
            <p className="text-[14px] text-gray-400 mt-1">
              Ce que vaut votre entreprise aujourd'hui, ce que vous pouvez sécuriser, et quand.
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
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-800">

            {/* Valorisation actuelle */}
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#F4B8CC' }}>
                Valorisation actuelle estimée
              </p>
              <p className="text-[32px] font-black text-white leading-none mb-2">{formatAmount(animatedMid)}</p>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                {valo.basis === 'arr'
                  ? `Calculée sur un multiple de ${valo.multiple}x votre ARR annuel (${formatAmount(valo.arr)}), ajusté à votre secteur ${SECTOR_LABELS[simData.sector] ?? ''} et votre traction.`
                  : `Estimée sur la base de votre stade ${STAGE_LABELS[simData.stage] ?? ''}, avant revenus. Elle augmentera fortement dès votre premier MRR.`}
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                Fourchette : <span className="text-gray-300">{formatAmount(valo.min)} – {formatAmount(valo.max)}</span>
              </p>
            </div>

            {/* Prochaine levée */}
            <div className="p-6 sm:pl-6">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#ABC5FE' }}>
                Prochaine levée recommandée à
              </p>
              <p className="text-[32px] font-black text-white leading-none mb-2">{formatAmount(simData.targetValuation)}</p>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                C'est la valorisation à laquelle vous devriez idéalement déclencher votre prochaine levée de fonds. En dessous, vous vous diluez trop. Au-dessus, vous risquez de retarder l'accès aux capitaux.
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                Fourchette {STAGE_LABELS[simData.stage] ?? ''} : <span className="text-gray-300">{formatAmount(stageRange.min)} – {formatAmount(stageRange.max)}</span>
              </p>
            </div>

            {/* Secondary */}
            <div className="p-6 sm:pl-6">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#D8FFBD' }}>
                Secondary potentiel (net 30%)
              </p>
              <p className="text-[32px] font-black text-white leading-none mb-2">{formatAmount(secondaryNet)}</p>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                Un secondary est la vente d'une partie de <em>vos parts existantes</em> à un investisseur, sans émettre de nouvelles actions. Vous encaissez de l'argent personnel sans diluer la valorisation de la boîte.
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                Brut : <span className="text-gray-300">{formatAmount(secondaryGross)}</span> · sur {simData.secondaryPct}% de vos parts
              </p>
            </div>
          </div>

          {/* Score bar */}
          <div className="border-t border-gray-800 px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: scoreLevel.color }} />
              <span className="text-[12px] font-bold" style={{ color: scoreLevel.color }}>
                Score Raisup {score.total}/100 — {scoreLevel.label}
              </span>
            </div>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${score.total}%`, backgroundColor: scoreLevel.color }}
              />
            </div>
            <span className="text-[11px] text-gray-500 whitespace-nowrap">{scoreLevel.advice.slice(0, 50)}…</span>
          </div>
        </div>

        {/* ── SECTION 2 — Données ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm">
          <h2 className="text-[18px] font-bold text-gray-900 mb-6">Vos données de simulation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <MetricInput
                label="MRR actuel"
                value={simData.currentMRR}
                onChange={v => setSim({ currentMRR: v })}
                unit="€/mois"
                placeholder="0 si pre-revenue"
                hint={simData.currentMRR === 0 ? (
                  <p className="text-[11px] text-gray-400">Pre-revenue — valorisation basée sur le stade</p>
                ) : mrr12 ? (
                  <p className="text-[11px] text-gray-400">
                    À ce rythme : <span className="font-semibold text-gray-600">{formatAmount(mrr12)}</span> MRR dans 12 mois
                  </p>
                ) : null}
              />
              <MetricInput
                label="Croissance MoM"
                value={simData.growthMoM}
                onChange={v => setSim({ growthMoM: v })}
                unit="%"
                min={0} max={200}
              />
              <MetricInput
                label="Churn mensuel"
                value={simData.churnRate}
                onChange={v => setSim({ churnRate: v })}
                unit="%"
                min={0} max={100} step={0.5}
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
                hint={simData.activeClients > 0 && simData.currentMRR > 0 ? (
                  <p className="text-[11px] text-gray-400">
                    Revenu moyen/client : <span className="font-semibold text-gray-600">{formatAmount(Math.round(simData.currentMRR / simData.activeClients))}/mois</span>
                  </p>
                ) : null}
              />
            </div>

            <div className="space-y-5">
              <MetricSelect
                label="Secteur"
                value={simData.sector}
                onChange={v => setSim({ sector: v })}
                options={Object.entries(SECTOR_LABELS).map(([value, label]) => ({ value, label }))}
                hint={
                  <p className="text-[11px] text-gray-400">
                    Multiple actuel : <span className="font-semibold text-gray-600">{baseMultiple}x ARR</span> pour {SECTOR_LABELS[simData.sector] ?? simData.sector}
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
                    Fourchette : <span className="font-semibold text-gray-600">{formatAmount(stageRange.min)} – {formatAmount(stageRange.max)}</span>
                  </p>
                }
              />
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Part fondatrice actuelle
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={1} max={100}
                    value={simData.founderSharePct}
                    onChange={e => setSim({ founderSharePct: Number(e.target.value) })}
                    className="flex-1 accent-gray-900"
                  />
                  <span className="text-[18px] font-black text-gray-900 w-14 text-right">{simData.founderSharePct}%</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Vos parts = <span className="font-semibold text-gray-600">{formatAmount(Math.round(valo.mid * simData.founderSharePct / 100))}</span> à la valo actuelle
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

          {/* Facteurs d'ajustement */}
          <div className="mt-6">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Facteurs d'ajustement du multiple</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {factors.map(f => <FactorBadge key={f.label} {...f} />)}
            </div>
          </div>

          {/* Fourchette de stade */}
          <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Positionnement dans la fourchette {STAGE_LABELS[simData.stage] ?? simData.stage}
            </p>
            <div className="relative h-3 rounded-full overflow-hidden bg-gray-200">
              <div className="absolute h-full rounded-full bg-blue-200" style={{ left: '0%', right: '0%' }} />
              {stageRange.max > 0 && (
                <div
                  className="absolute top-0 h-full w-1 rounded-full bg-gray-900 transition-all duration-500"
                  style={{ left: `${Math.min(95, Math.max(5, ((valo.mid - stageRange.min) / (stageRange.max - stageRange.min)) * 100))}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-2">
              <span>{formatAmount(stageRange.min)}</span>
              <span className="font-semibold text-gray-600">{formatAmount(valo.mid)} ←</span>
              <span>{formatAmount(stageRange.max)}</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 3 — Structure du capital & co-fondateurs ─────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ borderLeft: '4px solid #CDB4FF' }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5" style={{ color: '#7C3AED' }} />
            <h2 className="text-[18px] font-bold text-gray-900">Structure du capital</h2>
          </div>
          <p className="text-[13px] text-gray-500 mb-6">
            Vue complète de la répartition des parts et du potentiel de cash-out par fondateur.
          </p>

          {/* Founder rings */}
          <div className="flex flex-wrap gap-8 justify-center mb-6">
            <FounderRing
              pct={simData.founderSharePct}
              label={profile.firstName ? `${profile.firstName} (vous)` : 'Vous'}
              value={formatAmount(Math.round(valo.mid * simData.founderSharePct / 100))}
              color="#F4B8CC"
            />
            {simData.coFounders.map((cf, i) => (
              <FounderRing
                key={i}
                pct={cf.sharePct}
                label={cf.name}
                value={formatAmount(Math.round(valo.mid * cf.sharePct / 100))}
                color="#ABC5FE"
              />
            ))}
            {/* Investors */}
            {simData.founderSharePct + simData.coFounders.reduce((s, c) => s + c.sharePct, 0) < 100 && (
              <FounderRing
                pct={100 - simData.founderSharePct - simData.coFounders.reduce((s, c) => s + c.sharePct, 0)}
                label="Investisseurs"
                value={formatAmount(Math.round(valo.mid * (100 - simData.founderSharePct - simData.coFounders.reduce((s, c) => s + c.sharePct, 0)) / 100))}
                color="#D8FFBD"
              />
            )}
          </div>

          {/* Co-founder editor */}
          {simData.coFounders.length > 0 && (
            <div className="space-y-3">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Ajuster les parts des co-fondateurs</p>
              {simData.coFounders.map((cf, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={cf.name}
                    onChange={e => setSim(prev => {
                      const updated = [...(prev.coFounders ?? [])];
                      updated[i] = { ...updated[i], name: e.target.value };
                      return { coFounders: updated };
                    })}
                    placeholder={`Co-fondateur ${i + 1}`}
                    className="w-36 px-3 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-900 outline-none focus:border-gray-400"
                  />
                  <input
                    type="range" min={1} max={50}
                    value={cf.sharePct}
                    onChange={e => setSim(prev => {
                      const updated = [...(prev.coFounders ?? [])];
                      updated[i] = { ...updated[i], sharePct: Number(e.target.value) };
                      return { coFounders: updated };
                    })}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-[14px] font-black w-10 text-right text-gray-900">{cf.sharePct}%</span>
                  <span className="text-[12px] text-gray-400 w-20 text-right">{formatAmount(Math.round(valo.mid * cf.sharePct / 100))}</span>
                </div>
              ))}
            </div>
          )}

          {/* Add co-founder if none */}
          {simData.coFounders.length === 0 && (
            <button
              onClick={() => setSim(prev => ({ coFounders: [...prev.coFounders, { name: 'Co-fondateur', sharePct: 20 }] }))}
              className="text-[12px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1.5"
            >
              + Ajouter un co-fondateur
            </button>
          )}
        </div>

        {/* ── SECTION 4 — Qu'est-ce qu'un Secondary ? ──────────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ borderLeft: '4px solid #D8FFBD' }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h2 className="text-[18px] font-bold text-gray-900">Comprendre le Secondary (Cash-out)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              {
                icon: '💡',
                title: 'C\'est quoi ?',
                text: 'Un secondary vous permet de vendre une partie de vos actions existantes à un investisseur, sans créer de nouvelles actions. Vous touchez de l\'argent personnel immédiatement, sans affecter la valorisation de votre startup.',
              },
              {
                icon: '🎯',
                title: 'À quoi ça sert ?',
                text: 'Rembourser un crédit immobilier, sécuriser la famille, financer votre retraite. En bref : transformer du papier (vos actions) en argent réel, sans quitter l\'aventure ni perdre le contrôle de votre boîte.',
              },
              {
                icon: '⏰',
                title: 'Quand le faire ?',
                text: 'Au moment d\'une levée de fonds (Série A ou B), quand des investisseurs entrent au capital. Ils sont souvent prêts à racheter 10–20% de vos parts existantes en même temps. C\'est le meilleur moment — pas avant.',
              },
            ].map(item => (
              <div key={item.title} className="p-4 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-[13px] font-bold text-gray-900 mb-1">{item.title}</p>
                <p className="text-[12px] text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Secondary simulator */}
          <div className="mt-6 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <p className="text-[13px] font-bold text-gray-700 mb-4">Simulez votre secondary</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  % de vos parts à céder en secondary
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={5} max={25}
                    value={simData.secondaryPct}
                    onChange={e => setSim({ secondaryPct: Number(e.target.value) })}
                    className="flex-1 accent-green-600"
                  />
                  <span className="text-[18px] font-black text-gray-900 w-10">{simData.secondaryPct}%</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Au-delà de 25%, les VCs peuvent voir ça comme un manque de conviction.
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#D8FFBD' }}>
                  <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Vous encaissez (net fiscal ~30%)</p>
                  <p className="text-[36px] font-black text-green-900 leading-none my-1">{formatAmount(secondaryNet)}</p>
                  <p className="text-[11px] text-green-700">Brut : {formatAmount(secondaryGross)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 5 — Objectif cashout minimum ─────────────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ borderLeft: '4px solid #FFB96D' }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h2 className="text-[18px] font-bold text-gray-900">Quel est votre objectif de cash-out minimum ?</h2>
          </div>
          <p className="text-[13px] text-gray-500 mb-5">
            Définissez le montant minimum que vous voulez sécuriser en cash. On calcule à quelle valorisation vous pouvez l'atteindre et dans combien de temps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MetricInput
              label="Mon objectif cashout minimum (net)"
              value={simData.minCashoutTarget}
              onChange={v => setSim({ minCashoutTarget: v })}
              unit="€"
              placeholder="ex. 200000"
              hint={<p className="text-[11px] text-gray-400">Ce que vous souhaitez avoir en banque après impôts</p>}
            />

            {simData.minCashoutTarget > 0 && cashoutValoNeeded != null && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF7ED' }}>
                  <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">Valorisation nécessaire</p>
                  <p className="text-[28px] font-black text-orange-900 leading-none">{formatAmount(cashoutValoNeeded)}</p>
                  <p className="text-[11px] text-orange-600 mt-1">
                    Pour toucher {formatAmount(simData.minCashoutTarget)} net en cédant {simData.secondaryPct}% de vos parts
                  </p>
                </div>

                {cashoutMonthsNeeded != null && (
                  <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: cashoutMonthsNeeded <= 18 ? '#F0FDF4' : '#F8F8F8' }}>
                    <Clock className={`h-5 w-5 flex-shrink-0 ${cashoutMonthsNeeded <= 18 ? 'text-green-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">
                        {cashoutMonthsNeeded === 0
                          ? 'Vous pouvez le faire maintenant !'
                          : `Dans environ ${cashoutMonthsNeeded} mois`}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {cashoutMonthsNeeded === 0
                          ? 'Votre valorisation actuelle permet déjà d\'atteindre cet objectif.'
                          : simData.growthMoM > 0
                          ? `À votre rythme de croissance actuel (${simData.growthMoM}%/mois)`
                          : 'Renseignez votre croissance MoM pour une estimation précise'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 6 — Comparateur Vie Fondateur / Après Cash-out ───────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ borderLeft: '4px solid #F4B8CC' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5" style={{ color: '#F4B8CC' }} />
            <h2 className="text-[18px] font-bold text-gray-900">Vie de Fondateur vs. Après Cash-out</h2>
          </div>
          <p className="text-[13px] text-gray-500 mb-5">
            Le cash-out n'est pas une sortie. C'est le carburant pour tenir sur la durée — jusqu'à la licorne.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Avant */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="px-4 py-3 bg-gray-800">
                <p className="text-[13px] font-bold text-white">😰 Aujourd'hui — Vie de Fondateur</p>
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { icon: '💸', text: 'Salaire de survie ou zéro salaire' },
                  { icon: '😰', text: '100% du risque financier sur vos épaules' },
                  { icon: '🏠', text: 'Crédit immobilier non remboursé, pression familiale' },
                  { icon: '⚡', text: 'Décisions stratégiques influencées par l\'urgence financière' },
                  { icon: '😴', text: 'Stress chronique — risque de burn-out' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <p className="text-[12px] text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Après */}
            <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: '#D8FFBD' }}>
              <div className="px-4 py-3" style={{ backgroundColor: '#0A0A0A' }}>
                <p className="text-[13px] font-bold" style={{ color: '#D8FFBD' }}>
                  🏆 Après Raisup Cash-out — {formatAmount(secondaryNet)} sécurisé
                </p>
              </div>
              <div className="p-4 space-y-2.5" style={{ backgroundColor: '#F0FDF4' }}>
                {[
                  { icon: '🏠', text: 'Crédit immo remboursé — sécurité familiale garantie' },
                  { icon: '🎯', text: '90% du risque restant — toujours ultra motivé' },
                  { icon: '🧠', text: 'Décisions stratégiques prises avec clarté, sans panique' },
                  { icon: '⚡', text: 'Énergie préservée pour les 5–10 ans que ça prend vraiment' },
                  { icon: '🦄', text: 'Vous pouvez viser la licorne sans sacrifier votre vie' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <p className="text-[12px] text-gray-700 font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <InfoBox color="#FFF9F0">
            Ce comparateur est là pour vous rappeler que prendre soin de vous financièrement n'est pas de l'avidité — c'est de la stratégie. Les fondateurs qui tiennent 10 ans ont tous eu un moment où ils ont sécurisé quelque chose.
          </InfoBox>
        </div>

        {/* ── SECTION 7 — Check-list d'éligibilité ─────────────────────────── */}
        <div className="bg-white rounded-2xl p-7 shadow-sm" style={{ borderLeft: '4px solid #ABC5FE' }}>
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" style={{ color: '#1A3A8F' }} />
              <h2 className="text-[18px] font-bold text-gray-900">Check-list d'éligibilité au Secondary</h2>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${isEligible ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {eligibilityCount}/{eligibility.length} critères remplis
              {isEligible ? ' — Éligible ✓' : ' — Pas encore éligible'}
            </div>
          </div>

          <div className="space-y-2.5">
            {eligibility.map(item => (
              <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl ${item.met ? 'bg-green-50' : 'bg-gray-50'}`}>
                {item.met
                  ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <X className="h-4 w-4 text-red-400 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Market conditions */}
          <div className="mt-5 p-4 rounded-xl border" style={{ backgroundColor: sectorFavorable ? '#F0FDF4' : '#FFF7ED', borderColor: sectorFavorable ? '#D8FFBD' : '#FFE8C2' }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" style={{ color: sectorFavorable ? '#22c55e' : '#f97316' }} />
              <p className="text-[13px] font-bold text-gray-900">Conditions de marché</p>
            </div>
            <p className="text-[12px] text-gray-600">
              {sectorFavorable
                ? `Le secteur ${SECTOR_LABELS[simData.sector] ?? ''} est actuellement favorable aux opérations de secondary. Les investisseurs sont actifs et les valorisations soutenues.`
                : `Le secteur ${SECTOR_LABELS[simData.sector] ?? ''} est actuellement moins favorable. Un secondary reste possible mais nécessite un argumentaire solide sur votre traction.`}
            </p>
          </div>

          {/* VC argument */}
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#EEF2FF' }}>
            <p className="text-[12px] font-bold text-blue-800 uppercase tracking-wider mb-1">Argumentaire pour vos VCs</p>
            <p className="text-[13px] text-blue-900 leading-relaxed italic">"{investorArgument}"</p>
          </div>
        </div>

        {/* ── SECTION 8 — Télécharger le PDF ───────────────────────────────── */}
        {isPaid ? (
          <div className="rounded-2xl p-7" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)' }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-5 w-5" style={{ color: '#F4B8CC' }} />
                  <h2 className="text-[18px] font-bold text-white">Télécharger votre simulation complète</h2>
                </div>
                <p className="text-[13px] text-gray-400 max-w-md leading-relaxed">
                  Export PDF complet avec valorisation, checklist d'éligibilité, structure du capital et données de simulation. Idéal à partager avec vos co-fondateurs ou conseillers.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {simData.coFounders.length > 0 ? simData.coFounders.map((cf, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-white/10 text-gray-300">
                      {cf.name} — {cf.sharePct}% · {formatAmount(Math.round(valo.mid * cf.sharePct / 100))}
                    </div>
                  )) : (
                    <p className="text-[12px] text-gray-500 italic">Ajoutez vos co-fondateurs dans "Structure du capital" pour les inclure dans le PDF.</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[14px] transition-opacity hover:opacity-90 whitespace-nowrap disabled:opacity-50"
                style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}
              >
                <Download className="h-4 w-4" />
                {pdfLoading ? 'Génération…' : 'Télécharger le PDF'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 border border-dashed border-gray-200 flex items-center justify-between gap-4 bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Download className="h-4 w-4 text-gray-400" />
                <p className="text-[14px] font-bold text-gray-900">Export PDF — simulation & co-fondateurs</p>
              </div>
              <p className="text-[12px] text-gray-400">
                Téléchargez votre simulation complète en PDF et débloquez les modules avancés.
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing?from=valuation')}
              className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}
            >
              <Lock className="h-3.5 w-3.5" />
              Débloquer →
            </button>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};

export default ValuationPage;
