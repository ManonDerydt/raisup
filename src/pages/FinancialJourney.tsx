import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import {
  ArrowRight, CheckCircle, Clock, Target,
  TrendingUp, Users, AlertCircle, ChevronRight, Trophy, Lock,
  FileText, Lightbulb, X,
} from 'lucide-react';
import clsx from 'clsx';
import {
  generateTimeline, calculateScore, recommendedDilution, sectorBenchmarkDilution,
  nextRoundValuation, getRaisupRecommendation, getObjectiveMessage, formatAmount,
  type Profile, type TimelineStage, type TimelineResult,
} from '../services/generateTimeline';

// ─── useInView ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── FadeSlide ─────────────────────────────────────────────────────────────────

const FadeSlide: React.FC<{
  children: React.ReactNode;
  from?: 'left' | 'right' | 'up';
  delay?: number;
  className?: string;
}> = ({ children, from = 'up', delay = 0, className }) => {
  const { ref, visible } = useInView();
  const translate = from === 'left' ? 'translate-x-[-32px]'
    : from === 'right' ? 'translate-x-[32px]'
    : 'translate-y-6';
  return (
    <div
      ref={ref}
      className={clsx('transition-all duration-700', visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${translate}`, className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Animated circle gauge ─────────────────────────────────────────────────────

const CircleGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 300); return () => clearTimeout(t); }, [score]);
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#FFB96D' : '#FFB3B3';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(244,184,204,0.15)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F4B8CC" strokeWidth="8"
          strokeDasharray={circ} strokeLinecap="round"
          strokeDashoffset={circ - (anim / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-white font-black leading-none" style={{ fontSize: size * 0.22 }}>{score}</span>
        <span className="text-gray-500" style={{ fontSize: size * 0.12 }}>/100</span>
      </div>
    </div>
  );
};

// ─── Mix bar ───────────────────────────────────────────────────────────────────

const MixBar: React.FC<{ dilutif: number; nonDilutif: number }> = ({ dilutif, nonDilutif }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 mb-1.5">Mix de financement recommandé</p>
    <div className="flex h-2 rounded-full overflow-hidden">
      <div className="transition-all duration-700" style={{ width: `${dilutif}%`, backgroundColor: '#F4B8CC' }} />
      <div className="flex-1" style={{ backgroundColor: '#D8FFBD' }} />
    </div>
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>Dilutif {dilutif}%</span>
      <span>Non-dilutif {nonDilutif}%</span>
    </div>
  </div>
);

// ─── Capital bar ───────────────────────────────────────────────────────────────

const CapitalBar: React.FC<{ founders: number; current: number; newI: number }> = ({ founders, current, newI }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 mb-1.5">Structure du capital après levée</p>
    <div className="flex h-2 rounded-full overflow-hidden">
      <div style={{ width: `${founders}%`, backgroundColor: '#0A0A0A' }} />
      <div style={{ width: `${current}%`, backgroundColor: '#ABC5FE' }} />
      <div style={{ width: `${newI}%`, backgroundColor: '#F4B8CC' }} />
    </div>
    <div className="flex gap-3 mt-1.5 flex-wrap">
      {[
        { label: `Fondateurs ${founders}%`, color: '#0A0A0A' },
        { label: `Actuels ${current}%`, color: '#ABC5FE' },
        { label: `Nouveaux ${newI}%`, color: '#F4B8CC' },
      ].map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Probability badge ─────────────────────────────────────────────────────────

const ProbaBadge: React.FC<{ value: number; factors?: string[] }> = ({ value, factors = [] }) => {
  const [open, setOpen] = useState(false);
  const color = value >= 60 ? 'bg-green-100 text-green-700' : value >= 30 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600';
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={clsx('px-2.5 py-1 rounded-full text-xs font-bold transition-all', color)}>
        {value}% de probabilité
      </button>
      {open && factors.length > 0 && (
        <div className="absolute right-0 top-8 z-20 w-60 bg-white rounded-xl shadow-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Facteurs clés :</p>
          <ul className="space-y-1">
            {factors.map(f => (
              <li key={f} className="text-xs text-gray-500 flex gap-1.5">
                <ChevronRight className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: '#F4B8CC' }} />
                {f}
              </li>
            ))}
          </ul>
          <button onClick={() => setOpen(false)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">Fermer</button>
        </div>
      )}
    </div>
  );
};

// ─── Condition checker ─────────────────────────────────────────────────────────

function isConditionMet(condition: string, profile: Profile): boolean {
  const c = condition.toLowerCase();
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profile as any;

  if (c.includes('premiers revenus')) return mrr > 0;
  if (c.includes('mrr')) return mrr > 0;
  if (c.includes('cto')) return !!(profile.hasCTO);
  if (c.includes('pitch deck') || c.includes('executive summary')) return !!(profile.deckFileName);
  if (c.includes('churn < 5')) return (p.churnRate ?? 100) < 5;
  if (c.includes('équipe') && /\d/.test(c)) return (p.teamSize ?? 0) >= 8;
  if (c.includes('arr')) return mrr * 12 >= 1_000_000;
  if (c.includes('pays')) return (p.targetMarkets?.length ?? 0) >= 2;
  if (c.includes('ltv/cac') || c.includes('unit economics')) return (p.ltvCacRatio ?? 0) > 3;
  if (c.includes('cash flow opérationnel positif')) return (profile.runway ?? 0) >= 24;
  return false;
}

// ─── Step card ─────────────────────────────────────────────────────────────────

const StepCard: React.FC<{
  step: TimelineStage;
  profile: Profile;
  score: ReturnType<typeof calculateScore>;
  isFuture?: boolean;
  isNearFuture?: boolean;
}> = ({
  step, profile, score, isFuture = false, isNearFuture = false,
}) => {
  const isCurrent = step.status === 'current';
  const isObjective = step.isObjective;
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;

  const probabilityFactors = useMemo(() => {
    const factors: string[] = [];
    if (score.total > 70) factors.push(`Score Raisup fort : ${score.total}/100`);
    else factors.push(`Score Raisup : ${score.total}/100 — à améliorer`);
    if (mrr > 0) factors.push(`MRR actuel : ${formatAmount(mrr)}`);
    else factors.push('Pre-revenue — traction à prouver');
    if ((profile.runway ?? 0) >= 12) factors.push(`Runway confortable : ${profile.runway} mois`);
    else factors.push(`Runway court : ${profile.runway ?? '?'} mois`);
    return factors;
  }, [score, mrr, profile]);

  if (isObjective) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)' }}>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-10 w-10" style={{ color: '#F4B8CC' }} />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase block mb-2" style={{ color: '#F4B8CC' }}>
            Objectif atteint
          </span>
          <h3 className="text-3xl font-black text-white mb-2">{step.title}</h3>
          {step.description && (
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">{step.description}</p>
          )}
          {step.kpis && step.kpis.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {step.kpis.map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          )}
          {step.conditions && step.conditions.length > 0 && (
            <div className="text-left bg-white/5 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-xs font-semibold text-gray-400 mb-2">Conditions</p>
              <ul className="space-y-1">
                {step.conditions.map(c => (
                  <li key={c} className="text-xs text-gray-300 flex gap-1.5">
                    <ChevronRight className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: '#F4B8CC' }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm mt-6 italic" style={{ color: '#F4B8CC' }}>
            {getObjectiveMessage(profile)}
          </p>
        </div>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = isCurrent
    ? { borderLeft: '4px solid #F4B8CC' }
    : isFuture && !isNearFuture
    ? { opacity: 0.6 }
    : isNearFuture
    ? { opacity: 0.85 }
    : {};

  return (
    <div
      className="rounded-2xl bg-white border border-gray-100 shadow-sm transition-shadow hover:shadow-md relative"
      style={cardStyle}
    >
      {isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold animate-pulse"
            style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            Vous êtes ici
          </span>
        </div>
      )}
      <div className="p-6 pt-7">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">{step.title}</h3>
            {step.estimatedDate && !isCurrent && (
              <p className="text-gray-400 text-sm">{step.estimatedDate}</p>
            )}
            {step.amount != null && step.amount > 0 && (
              <p className="text-sm font-semibold mt-0.5" style={{ color: '#F4B8CC' }}>
                {formatAmount(step.amount)}
              </p>
            )}
          </div>
          {step.probability != null && (
            <ProbaBadge value={step.probability} factors={probabilityFactors} />
          )}
        </div>

        {step.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.description}</p>
        )}

        {/* KPIs */}
        {step.kpis && step.kpis.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {step.kpis.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">{label} </span>
                <span className="text-gray-900 font-semibold text-xs">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Equity badges for current */}
        {isCurrent && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Fondateurs {profile.founderSharePct ?? 85}%
            </span>
            {(profile.founderSharePct ?? 85) < 100 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Investisseurs {100 - (profile.founderSharePct ?? 85)}%
              </span>
            )}
          </div>
        )}

        {/* Conditions */}
        {step.conditions && step.conditions.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Ce qu'il faut atteindre avant cette étape</p>
            <ul className="space-y-1.5">
              {step.conditions.map(c => {
                const met = isConditionMet(c, profile);
                return (
                  <li key={c} className="flex items-start gap-2 text-xs">
                    {met
                      ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-green-500" />
                      : <X className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-red-400" />}
                    <span className={met ? 'text-gray-700 line-through decoration-green-400' : 'text-gray-500'}>{c}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Mix + Capital */}
        {step.mix && !isCurrent && (
          <div className="space-y-3 mb-4">
            <MixBar dilutif={step.mix.dilutif} nonDilutif={step.mix.nonDilutif} />
            {step.capitalAfter && (
              <CapitalBar
                founders={step.capitalAfter.founders}
                current={step.capitalAfter.current}
                newI={step.capitalAfter.new}
              />
            )}
          </div>
        )}

        {/* Time to next */}
        {step.timeToNext && (
          <p className="text-xs text-gray-400 italic mt-2">{step.timeToNext}</p>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────

const Sidebar: React.FC<{
  profile: Profile;
  score: ReturnType<typeof calculateScore>;
  timeline: TimelineResult;
  isPaid: boolean;
}> = ({ profile, score, timeline, isPaid }) => {
  const navigate = useNavigate();
  const recommendation = getRaisupRecommendation(profile, score, timeline);
  const isUrgent = (profile.runway ?? 12) < 6;
  const recColor = isUrgent ? '#EF4444' : score.total < 50 ? '#FFB96D' : '#22C55E';
  const recBg = isUrgent ? '#FFF5F5' : score.total < 50 ? '#FFFBF5' : '#F0FFF4';
  const recBorder = isUrgent ? '#EF4444' : score.total < 50 ? '#FFB96D' : '#22C55E';

  const actions = useMemo(() => {
    const mrr = profile.mrr ?? profile.currentRevenue ?? 0;
    const list: { label: string; priority: 'high' | 'medium' | 'low' }[] = [];
    if ((profile.runway ?? 12) < 6) list.push({ label: 'Sécuriser un financement pont immédiat', priority: 'high' });
    if (mrr === 0) list.push({ label: 'Obtenir les 3 premiers clients payants', priority: 'high' });
    if (!profile.hasCTO && (profile.businessModel ?? '').toLowerCase().includes('saas'))
      list.push({ label: 'Recruter un CTO co-fondateur', priority: 'high' });
    if (score.total < 60) list.push({ label: 'Compléter le profil Raisup pour améliorer le score', priority: 'medium' });
    list.push({ label: 'Finaliser le pitch deck', priority: 'medium' });
    list.push({ label: 'Contacter 5 investisseurs matchés', priority: 'low' });
    return list.slice(0, 5);
  }, [profile, score]);

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-100 text-red-600' : p === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500';
  const priorityLabel = (p: string) =>
    p === 'high' ? 'Urgent' : p === 'medium' ? 'Moyen' : 'Faible';

  return (
    <div className="space-y-4">
      {/* Actions prioritaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" style={{ color: '#F4B8CC' }} />
          Prochaines actions prioritaires
        </h3>
        <ul className="space-y-3">
          {actions.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
              <p className="flex-1 text-xs text-gray-700 leading-snug">{t.label}</p>
              <span className={clsx('px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0', priorityColor(t.priority))}>
                {priorityLabel(t.priority)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommandation Raisup */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: recBg, borderLeft: `4px solid ${recBorder}` }}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4" style={{ color: recColor }} />
          <h3 className="font-bold text-sm" style={{ color: recColor }}>Recommandation Raisup</h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: recColor }}>
          {recommendation}
        </p>
      </div>

      {/* Raccourcis */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Raccourcis</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Générer mon deck', icon: FileText, link: isPaid ? '/dashboard/documents' : '/pricing' },
            { label: 'Investisseurs matchés', icon: Users, link: isPaid ? '/dashboard/fundraising' : '/pricing' },
            { label: 'Mettre à jour mes KPIs', icon: TrendingUp, link: '/dashboard/kpis' },
          ].map(({ label, icon: Icon, link }) => (
            <button
              key={label}
              onClick={() => navigate(link)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all text-left"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {!isPaid && link === '/pricing' && <Lock className="h-3 w-3 ml-auto text-gray-300" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Dilution ring gauge ───────────────────────────────────────────────────────

const DilutionGauge: React.FC<{ value: number; max?: number; size?: number }> = ({ value, max = 30, size = 120 }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(value), 400); return () => clearTimeout(t); }, [value]);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(anim / max, 1);
  const color = pct < 0.5 ? '#22c55e' : pct < 0.75 ? '#FFB96D' : '#EF4444';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0FDF4" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeLinecap="round"
          strokeDashoffset={circ - pct * circ}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-black leading-none" style={{ fontSize: size * 0.24, color }}>{anim}%</span>
        <span className="text-gray-400 font-medium" style={{ fontSize: size * 0.11 }}>dilution</span>
      </div>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────

const FinancialJourney: React.FC = () => {
  const navigate = useNavigate();

  const { isPremium } = useUserProfile();
  const isPaid = isPremium;

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

  // Même calculateScore que DashboardWelcome (/dashboard/score)
  const score = useMemo(() => calculateScore(profile), [profile]);
  const timeline = useMemo(() => generateTimeline(profile), [profile]);

  const [lineHeight, setLineHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { ref: progressRef, visible: progressVisible } = useInView(0.3);

  const startupName = profile.startupName || profile.projectName || 'Votre startup';
  const mrr = profile.mrr ?? profile.currentRevenue ?? 0;

  // Animated timeline line
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start: number;
        const total = timelineRef.current?.scrollHeight ?? 0;
        const animate = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1400, 1);
          setLineHeight(p * total);
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    if (timelineRef.current) obs.observe(timelineRef.current);
    return () => obs.disconnect();
  }, []);

  // KPIs
  const dilution = recommendedDilution(profile);
  const benchmarkDilution = sectorBenchmarkDilution(profile.sector ?? '');
  const nextValo = nextRoundValuation(profile, timeline);
  const runway = profile.runway ?? 0;
  const runwayColor = runway >= 12 ? '#22C55E' : runway >= 6 ? '#FFB96D' : '#FFB3B3';
  const runwayBorder = runway >= 12 ? '#22C55E' : runway >= 6 ? '#FFB96D' : '#EF4444';

  // Index of current stage for visual distinction
  const currentStageIndex = timeline.stages.findIndex(s => s.status === 'current');

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F8F8F8' }}>

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div
          className="rounded-2xl px-6 py-5 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          {/* Col 1 : objectif */}
          <div className="lg:col-span-1">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: '#F4B8CC' }}>
              OBJECTIF FINAL
            </p>
            <h1 className="text-[20px] font-black text-white leading-tight mb-1">
              {timeline.finalObjective}
            </h1>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Valo visée <span className="text-white font-semibold">{formatAmount(timeline.finalGoalValuation)}</span>
              {' · '}Horizon <span className="text-white font-semibold">{timeline.estimatedTotalDuration} mois</span>
            </p>
          </div>

          {/* Col 2 : barre de progression */}
          <div className="lg:col-span-1">
            <p className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {startupName} · Étape 1/{timeline.stages.length - 1}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${timeline.globalProgress}%`, backgroundColor: '#F4B8CC' }}
              />
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {timeline.globalProgress}% accompli
            </p>
          </div>

          {/* Col 3 : Score Raisup */}
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <CircleGauge score={score.total} size={52} />
            <div>
              <p className="text-white font-black text-[22px] leading-none">{score.total}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Score Raisup</p>
            </div>
          </div>

          {/* Col 4 : Dilution max recommandée */}
          <div className="flex items-center gap-3 justify-center lg:justify-end">
            <DilutionGauge value={dilution} max={30} size={52} />
            <div>
              <p className="text-white font-black text-[22px] leading-none">{dilution}%</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Dilution max</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPIs stratégiques ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Valorisation prochaine levée */}
          <FadeSlide delay={100}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" style={{ borderLeft: '4px solid #ABC5FE' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-400">Valorisation prochaine levée</p>
              </div>
              <p className="text-3xl font-black text-gray-900 mb-1">{formatAmount(nextValo)}</p>
              <p className="text-xs text-gray-400">
                Fourchette : {formatAmount(nextValo * 0.8)} à {formatAmount(nextValo * 1.3)}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" style={{ color: '#ABC5FE' }} />
                <span className="text-xs font-medium" style={{ color: '#1A3A8F' }}>
                  ×{Math.round(nextValo / (timeline.currentValuation || 1))} vs valo actuelle
                </span>
              </div>
            </div>
          </FadeSlide>

          {/* Runway */}
          <FadeSlide delay={150}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" style={{ borderLeft: `4px solid ${runwayBorder}` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-medium text-gray-400">Runway actuel</p>
              </div>
              <p className="text-3xl font-black mb-1" style={{ color: runwayColor }}>
                {runway > 0 ? `${runway} mois` : '—'}
              </p>
              <p className="text-xs text-gray-400">
                {runway >= 12 ? 'Confortable — bonne position de négociation' : runway >= 6 ? 'Acceptable — commencez les démarches' : '⚠ Critique — levée urgente'}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                {runway >= 6
                  ? <CheckCircle className="h-3.5 w-3.5" style={{ color: runwayColor }} />
                  : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                <span className="text-xs font-medium" style={{ color: runwayColor }}>
                  {runway >= 12 ? 'Situation saine' : runway >= 6 ? 'Action recommandée' : 'Urgence absolue'}
                </span>
              </div>
            </div>
          </FadeSlide>
        </div>
      </div>

      {/* ── Timeline + Sidebar ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8 items-start">

          {/* Timeline */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Target className="h-5 w-5" style={{ color: '#F4B8CC' }} />
              Votre feuille de route vers {formatAmount(timeline.finalGoalValuation)}
            </h2>

            <div ref={timelineRef} className="relative">
              {/* Background line */}
              <div className="absolute left-6 top-0 w-0.5 bg-gray-200" style={{ height: '100%' }} />
              {/* Animated line */}
              <div
                className="absolute left-6 top-0 w-0.5"
                style={{
                  height: `${lineHeight}px`,
                  background: 'linear-gradient(to bottom, #F4B8CC 30%, #CDB4FF 60%, #e5e7eb)',
                  transition: 'height 0.05s linear',
                }}
              />

              <div className="space-y-10">
                {timeline.stages.map((step, i) => {
                  const isObjective = step.isObjective;
                  const isCurrent = step.status === 'current';
                  const distanceFromCurrent = i - currentStageIndex;
                  const isNearFuture = distanceFromCurrent === 1;
                  const isFarFuture = distanceFromCurrent > 1 && !isObjective;
                  // Blur future steps if not paid (after index 1)
                  const isLocked = !isPaid && i > 1;

                  const badgeBg = isCurrent
                    ? 'ring-4 ring-rose-100 animate-pulse'
                    : isObjective
                    ? ''
                    : step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : '';

                  return (
                    <div key={step.id} className="relative pl-16">
                      {/* Badge on the line */}
                      <div
                        className={clsx('absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-black z-10', badgeBg)}
                        style={{
                          backgroundColor: isCurrent ? '#F4B8CC' : isObjective ? '#0A0A0A' : '#F3F4F6',
                          color: isCurrent ? '#0A0A0A' : isObjective ? '#F4B8CC' : '#6B7280',
                          border: isObjective ? 'none' : '2px solid #E5E7EB',
                        }}
                      >
                        {isObjective ? <Trophy className="h-5 w-5" /> : step.label.slice(0, 4)}
                      </div>

                      {isLocked ? (
                        <FadeSlide from={i % 2 === 1 ? 'right' : 'left'} delay={i * 100}>
                          <div className="relative rounded-2xl overflow-hidden">
                            <div className="opacity-30 pointer-events-none select-none">
                              <StepCard step={step} profile={profile} score={score} isFuture isNearFuture={isNearFuture} />
                            </div>
                            <div className="absolute inset-0 backdrop-blur-[3px] bg-white/40 flex items-center justify-center rounded-2xl">
                              <div className="text-center p-6">
                                <Lock className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                                <p className="text-sm font-bold text-gray-900 mb-3">
                                  Étape verrouillée
                                </p>
                                <button
                                  onClick={() => navigate('/pricing?from=journey')}
                                  className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-full mx-auto"
                                  style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}
                                >
                                  Débloquer le parcours complet <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </FadeSlide>
                      ) : (
                        <FadeSlide from={i % 2 === 1 ? 'right' : 'left'} delay={i * 100}>
                          <StepCard
                            step={step}
                            profile={profile}
                            score={score}
                            isFuture={isFarFuture}
                            isNearFuture={isNearFuture}
                          />
                        </FadeSlide>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar desktop */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-6">
              <Sidebar profile={profile} score={score} timeline={timeline} isPaid={isPaid} />
            </div>
          </div>
        </div>

        {/* Sidebar mobile */}
        <div className="xl:hidden mt-10">
          <Sidebar profile={profile} score={score} timeline={timeline} isPaid={isPaid} />
        </div>
      </div>

      {/* ── Barre de progression globale ────────────────────────────────────── */}
      <div ref={progressRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Votre progression vers {formatAmount(timeline.finalGoalValuation)}</h3>
            <span className="text-xs text-gray-400">
              Étape 1 sur {timeline.stages.length - 1} complétée
            </span>
          </div>

          {/* Thick progress bar with milestones */}
          <div className="relative mb-4">
            <div className="h-3.5 rounded-full bg-gray-100 overflow-visible relative">
              <div
                className="h-full rounded-full transition-all duration-1000 delay-300"
                style={{
                  width: progressVisible ? `${timeline.globalProgress}%` : '0%',
                  background: 'linear-gradient(90deg, #F4B8CC, #CDB4FF)',
                }}
              />
            </div>
            {/* Milestone dots at equal intervals */}
            {timeline.stages.map((s, i) => {
              const pct = i === 0 ? 0 : i === timeline.stages.length - 1 ? 100 : Math.round((i / (timeline.stages.length - 1)) * 100);
              return (
                <div key={s.id} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pct}%` }}>
                  <div className={clsx(
                    'w-4 h-4 rounded-full border-2 border-white transition-colors duration-700',
                    pct <= timeline.globalProgress ? 'animate-pulse' : '',
                  )} style={{ backgroundColor: pct <= timeline.globalProgress ? '#F4B8CC' : '#E5E7EB' }} />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-gray-400 mb-4 flex-wrap gap-1">
            {timeline.stages.map(s => (
              <span key={s.id}>{s.label}</span>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            {startupName} · {profile.stage ?? 'Pre-seed'} · Valo estimée{' '}
            <strong className="text-gray-900">{formatAmount(timeline.currentValuation)}</strong>{' '}
            sur <strong className="text-gray-900">{formatAmount(timeline.finalGoalValuation)}</strong> visés
          </p>

          {/* CTA */}
          {!isPaid && (
            <button
              onClick={() => navigate('/pricing?from=journey')}
              className="mt-5 w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#F4B8CC', color: '#0A0A0A' }}
            >
              <Lock className="h-4 w-4" />
              Débloquez votre parcours financier complet
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default FinancialJourney;
