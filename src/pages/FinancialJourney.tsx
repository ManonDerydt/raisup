import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Clock, Star, Zap, Target,
  TrendingUp, Users, AlertCircle, ChevronRight, Trophy,
} from 'lucide-react';
import clsx from 'clsx';
import mockFinancialJourney, { JourneyStep } from '../data/mockFinancialJourney';

// ─── useInView ────────────────────────────────────────────────────────────────
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

// ─── FadeSlide wrapper ────────────────────────────────────────────────────────
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
      className={clsx(
        'transition-all duration-700',
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${translate}`,
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Probability badge ────────────────────────────────────────────────────────
const ProbaBadge: React.FC<{ value: number; stepId: string }> = ({ value, stepId }) => {
  const [open, setOpen] = useState(false);
  const color = value >= 60 ? 'bg-green-100 text-green-700' : value >= 30 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-600';
  const factors: Record<string, string[]> = {
    'series-a': ['Croissance MRR +14%/mois', 'Score Raisup 74/100', '10 mois de runway'],
    'series-b': ['Dépend de la Série A', 'Marché adressable validé', 'Efficacité CAC à prouver'],
    'series-c': ['Probabilité conditionnelle', 'Leadership marché requis', 'Rentabilité opérationnelle'],
  };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx('px-2.5 py-1 rounded-full text-xs font-bold transition-all', color)}
      >
        {value}% de probabilité
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Facteurs clés :</p>
          <ul className="space-y-1">
            {(factors[stepId] ?? []).map((f) => (
              <li key={f} className="text-xs text-gray-500 flex gap-1.5">
                <ChevronRight className="h-3 w-3 text-rose-400 flex-shrink-0 mt-0.5" />
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

// ─── Mix bar ──────────────────────────────────────────────────────────────────
const MixBar: React.FC<{ dilutif: number }> = ({ dilutif }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 mb-1.5">Mix de financement recommandé</p>
    <div className="flex h-2 rounded-full overflow-hidden">
      <div className="bg-rose-400 transition-all duration-700" style={{ width: `${dilutif}%` }} />
      <div className="bg-gray-200 flex-1" />
    </div>
    <div className="flex justify-between text-xs text-gray-400 mt-1">
      <span>Dilutif {dilutif}%</span>
      <span>Non-dilutif {100 - dilutif}%</span>
    </div>
  </div>
);

// ─── Capital bar ──────────────────────────────────────────────────────────────
const CapitalBar: React.FC<{ founders: number; current: number; newI: number }> = ({ founders, current, newI }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 mb-1.5">Structure du capital après levée</p>
    <div className="flex h-2 rounded-full overflow-hidden">
      <div className="bg-primary" style={{ width: `${founders}%` }} />
      <div className="bg-blue-400" style={{ width: `${current}%` }} />
      <div className="bg-rose-400" style={{ width: `${newI}%` }} />
    </div>
    <div className="flex gap-4 mt-1.5">
      {[
        { label: `Fondateurs ${founders}%`, color: 'bg-primary' },
        { label: `Actuels ${current}%`, color: 'bg-blue-400' },
        { label: `Nouveaux ${newI}%`, color: 'bg-rose-400' },
      ].map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1">
          <div className={clsx('w-2 h-2 rounded-full', color)} />
          <span className="text-xs text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Step card ────────────────────────────────────────────────────────────────
const StepCard: React.FC<{ step: JourneyStep; side: 'left' | 'right' }> = ({ step, side }) => {
  const isCurrent = step.status === 'current';
  const isGoal = step.id === 'series-c';

  if (isGoal) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)' }}>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-10 w-10 text-rose-400" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-rose-400 block mb-2">Objectif atteint</span>
          <h3 className="text-3xl font-black text-white mb-2">Valorisation 50M€</h3>
          <p className="text-gray-400 text-sm mb-6">Série C ou Pre-exit · 2029-2030</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {step.kpis?.map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>
          {step.probability !== undefined && (
            <div className="flex justify-center mb-5">
              <ProbaBadge value={step.probability} stepId={step.id} />
            </div>
          )}
          <p className="text-rose-400 italic text-sm max-w-sm mx-auto">
            "À ce stade, vous aurez le choix : continuer à croître, ouvrir le capital à un fonds Growth, ou préparer un exit stratégique."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-2xl bg-white border shadow-sm transition-shadow hover:shadow-md relative',
      isCurrent ? 'border-l-4 border-l-rose-400 border-gray-100' : 'border-gray-100',
    )}>
      {isCurrent && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-400 text-white text-xs font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Vous êtes ici
          </span>
        </div>
      )}
      <div className="p-6 pt-7">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-primary text-base">{step.title}</h3>
            <p className="text-gray-400 text-sm">{step.subtitle}</p>
          </div>
          {step.probability !== undefined && (
            <ProbaBadge value={step.probability} stepId={step.id} />
          )}
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.description}</p>

        {/* KPIs */}
        {step.kpis && (
          <div className="flex gap-3 flex-wrap mb-4">
            {step.kpis.map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">{label} </span>
                <span className="text-primary font-semibold text-xs">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Equity badges (current step) */}
        {step.equityBadges && (
          <div className="flex gap-2 mb-4">
            {step.equityBadges.map(({ label, color }) => (
              <span
                key={label}
                className={clsx(
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  color === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Conditions */}
        {step.conditions && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Ce qu'il faut atteindre avant cette étape</p>
            <ul className="space-y-1.5">
              {step.conditions.map((c) => (
                <li key={c} className="flex items-start gap-2 text-xs text-gray-500">
                  <ChevronRight className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mix + Capital */}
        {step.dilutiveMix !== undefined && (
          <div className="space-y-3 mb-4">
            <MixBar dilutif={step.dilutiveMix} />
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

        {/* CTA */}
        {step.status === 'future' && (
          <Link
            to="/dashboard/fundraising"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 px-3 py-2 rounded-lg"
          >
            Voir les investisseurs matchés pour cette étape
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, label: 'Atteindre 15K€ MRR', priority: 'high', done: false },
    { id: 2, label: 'Recruter un Head of Sales', priority: 'high', done: false },
    { id: 3, label: 'Finaliser le pitch deck Série A', priority: 'medium', done: true },
    { id: 4, label: 'Contacter 5 investisseurs Série A', priority: 'medium', done: false },
    { id: 5, label: 'Réduire le churn sous 4%', priority: 'low', done: false },
  ]);

  const toggle = (id: number) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-100 text-red-600' : p === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500';

  return (
    <div className="space-y-4">
      {/* Actions prioritaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-primary text-sm mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-rose-400" />
          Prochaines actions prioritaires
        </h3>
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-3">
              <button
                onClick={() => toggle(t.id)}
                className={clsx(
                  'mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors',
                  t.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-rose-400',
                )}
              >
                {t.done && <CheckCircle className="h-3 w-3 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={clsx('text-xs leading-snug', t.done ? 'line-through text-gray-400' : 'text-gray-700')}>
                  {t.label}
                </p>
              </div>
              <span className={clsx('px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0', priorityColor(t.priority))}>
                {t.priority === 'high' ? 'Urgent' : t.priority === 'medium' ? 'Moyen' : 'Faible'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommandation IA */}
      <div className="bg-green-50 rounded-2xl border-l-4 border-green-500 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-green-600" />
          <h3 className="font-bold text-green-800 text-sm">Recommandation Raisup</h3>
        </div>
        <p className="text-green-700 text-xs leading-relaxed mb-3">
          À votre stade, concentrez 80% de votre énergie sur l'acquisition client. Atteindre 20K€ MRR en 4 mois déclencherait 3 conversations investisseurs supplémentaires selon nos données.
        </p>
        <button className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center gap-1">
          Voir le plan détaillé <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Raccourcis */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-primary text-sm mb-3">Raccourcis</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Générer mon deck', to: '/dashboard/generate', icon: Zap },
            { label: 'Investisseurs matchés', to: '/dashboard/fundraising', icon: Users },
            { label: 'Mettre à jour mes KPIs', to: '/dashboard/kpis', icon: TrendingUp },
          ].map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const FinancialJourney: React.FC = () => {
  const { goal, current, steps, globalProgress } = mockFinancialJourney;
  const [lineHeight, setLineHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { ref: progressRef, visible: progressVisible } = useInView(0.3);

  // Animate the vertical line drawing
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start: number;
        const total = timelineRef.current?.scrollHeight ?? 0;
        const animate = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1200, 1);
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

  const runwayColor = current.runway >= 12 ? 'text-green-600' : current.runway >= 6 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="min-h-full bg-gray-50">

      {/* ── Section 1 — Objectif final ── */}
      <div style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #111827 100%)' }} className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

          {/* Left — goal */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-rose-400 mb-2">Votre objectif</p>
            <p className="text-4xl font-black text-white mb-2">Valorisation {goal.valuation}</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Horizon estimé : {goal.horizon} · Montant total à lever : {goal.totalRaise} · Dilution totale acceptée : {goal.maxDilution}
            </p>
          </div>

          {/* Center — progress bar */}
          <div className="text-center">
            <div className="bg-white/10 rounded-full h-3 w-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${globalProgress}%`, background: 'linear-gradient(90deg, #F4B8CC, #a855f7)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-3">
              <span>Aujourd'hui</span>
              <span>{goal.valuation}</span>
            </div>
            <div className="inline-block bg-rose-400/10 border border-rose-400/30 rounded-full px-4 py-1.5">
              <p className="text-rose-300 text-xs font-medium">
                Vous êtes ici — {current.stage} · {(current.mrr / 1000).toFixed(0)}K€ MRR · Valo estimée : {current.valuation}
              </p>
            </div>
          </div>

          {/* Right — score */}
          <div className="flex flex-col items-center lg:items-end">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="-rotate-90" width="80" height="80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(244,184,204,0.15)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke="#F4B8CC" strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - current.raisupScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-lg leading-none">{current.raisupScore}</span>
                  <span className="text-gray-500 text-xs">/100</span>
                </div>
              </div>
              <div>
                <p className="text-gray-300 text-xs font-medium">Score Raisup</p>
                <p className="text-rose-400 italic text-sm mt-0.5">Vous êtes sur la<br />bonne trajectoire</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2 — 3 KPIs stratégiques ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dilution max */}
          <FadeSlide delay={0}>
            <div className="bg-white rounded-2xl border-l-4 border-blue-400 border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-medium text-gray-400 mb-1">Dilution max recommandée</p>
              <p className="text-3xl font-black text-primary mb-1">20%</p>
              <p className="text-xs text-gray-400">pour votre prochaine levée Série A</p>
              <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-400" style={{ width: '20%' }} />
              </div>
            </div>
          </FadeSlide>

          {/* Valo estimée */}
          <FadeSlide delay={100}>
            <div className="bg-white rounded-2xl border-l-4 border-rose-400 border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-medium text-gray-400 mb-1">Valorisation estimée — Série A</p>
              <p className="text-3xl font-black text-primary mb-1">12-15M€</p>
              <p className="text-xs text-gray-400">basée sur vos métriques actuelles</p>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs text-rose-500 font-medium">×5 vs valo actuelle</span>
              </div>
            </div>
          </FadeSlide>

          {/* Runway */}
          <FadeSlide delay={200}>
            <div className={clsx(
              'bg-white rounded-2xl border-l-4 border border-gray-100 shadow-sm p-5',
              current.runway >= 12 ? 'border-l-green-400' : current.runway >= 6 ? 'border-l-orange-400' : 'border-l-red-400',
            )}>
              <p className="text-xs font-medium text-gray-400 mb-1">Runway actuel</p>
              <p className={clsx('text-3xl font-black mb-1', runwayColor)}>{current.runway} mois</p>
              <p className="text-xs text-gray-400">
                {current.runway >= 12 ? 'Runway confortable — bon timing pour lever' : current.runway >= 6 ? 'À surveiller — commencez à pitcher maintenant' : 'Attention — levée urgente requise'}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                {current.runway >= 12
                  ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  : <AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
                <span className={clsx('text-xs font-medium', runwayColor)}>
                  {current.runway >= 12 ? 'Situation saine' : 'Action recommandée'}
                </span>
              </div>
            </div>
          </FadeSlide>
        </div>
      </div>

      {/* ── Section 3+4 — Timeline + Sidebar ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex gap-8 items-start">

          {/* Timeline */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-primary mb-8 flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-400" />
              Votre feuille de route vers {goal.valuation}
            </h2>

            {/* Vertical timeline */}
            <div ref={timelineRef} className="relative">
              {/* Animated line */}
              <div className="absolute left-6 top-0 w-0.5 bg-gray-100" style={{ height: '100%' }} />
              <div
                className="absolute left-6 top-0 w-0.5"
                style={{
                  height: `${lineHeight}px`,
                  background: 'linear-gradient(to bottom, #22c55e 20%, #F4B8CC 40%, #e5e7eb 60%)',
                  transition: 'height 0.05s linear',
                }}
              />

              <div className="space-y-10">
                {steps.map((step, i) => {
                  const isRight = i % 2 === 1;
                  const isGoal = step.id === 'series-c';
                  const badgeBg = step.status === 'current'
                    ? 'bg-rose-400 text-white ring-4 ring-rose-200 animate-pulse'
                    : step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : isGoal
                    ? 'bg-primary text-white ring-4 ring-gray-200'
                    : 'bg-white border-2 border-gray-200 text-gray-500';

                  return (
                    <div key={step.id} className="relative pl-16">
                      {/* Badge on the line */}
                      <div className={clsx(
                        'absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-black z-10',
                        badgeBg,
                      )}>
                        {isGoal ? <Trophy className="h-5 w-5" /> : step.badge.slice(0, 3)}
                      </div>

                      <FadeSlide from={isRight ? 'right' : 'left'} delay={i * 120}>
                        <StepCard step={step} side={isRight ? 'right' : 'left'} />
                      </FadeSlide>
                    </div>
                  );
                })}

                {/* Final destination badge */}
                <div className="relative pl-16">
                  <div className="absolute left-0 w-12 h-12 rounded-full bg-rose-400 flex items-center justify-center z-10 ring-4 ring-rose-100">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <FadeSlide from="up" delay={steps.length * 120}>
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
                      <p className="text-rose-500 font-black text-lg">OBJECTIF : {goal.valuation}</p>
                      <p className="text-rose-400 text-sm">{goal.horizon} · {goal.totalRaise} levés</p>
                    </div>
                  </FadeSlide>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-6">
              <Sidebar />
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className="xl:hidden mt-10">
          <Sidebar />
        </div>
      </div>

      {/* ── Section 5 — Barre de progression globale ── */}
      <div ref={progressRef} className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-primary">Votre progression vers {goal.valuation}</h3>
            <span className="text-xs text-gray-400">Étape 1 sur 4 complétée</span>
          </div>

          {/* Thick progress bar with milestones */}
          <div className="relative mb-3">
            <div className="h-3.5 rounded-full bg-gray-100 overflow-visible relative">
              <div
                className="h-full rounded-full transition-all duration-1000 delay-300"
                style={{
                  width: progressVisible ? `${globalProgress}%` : '0%',
                  background: 'linear-gradient(90deg, #F4B8CC, #a855f7)',
                }}
              />
            </div>
            {/* Milestone dots */}
            {[0, 33, 66, 100].map((pct, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${pct}%` }}
              >
                <div className={clsx(
                  'w-4 h-4 rounded-full border-2 border-white',
                  pct <= globalProgress ? 'bg-rose-400' : 'bg-gray-200',
                  pct === globalProgress && 'animate-pulse ring-2 ring-rose-300',
                )} />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span>Seed · {current.valuation}</span>
            <span>Série A</span>
            <span>Série B</span>
            <span>{goal.valuation}</span>
          </div>

          <p className="text-sm text-gray-500">
            Valorisation actuelle estimée : <strong className="text-primary">{current.valuation}</strong> sur <strong className="text-primary">{goal.valuation}</strong> visés
          </p>
        </div>
      </div>

    </div>
  );
};

export default FinancialJourney;
