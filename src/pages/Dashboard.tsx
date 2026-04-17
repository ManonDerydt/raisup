import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import clsx from 'clsx';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import RaisupScore from '../components/dashboard/RaisupScore';
import KPIGrid from '../components/dashboard/KPIGrid';
import DilutivePipeline from '../components/dashboard/DilutivePipeline';
import NonDilutivePipeline from '../components/dashboard/NonDilutivePipeline';
import DocumentsActions from '../components/dashboard/DocumentsActions';
import SkeletonCard from '../components/dashboard/SkeletonCard';
import { useUserProfile } from '../hooks/useUserProfile';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatGoal(n?: number | null): string {
  if (!n) return 'Objectif non défini';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

// Stage label for display in the banner
const STAGE_MAP: Record<string, string> = {
  'pre-seed': 'Pre-seed', 'seed': 'Seed', 'series-a': 'Série A',
};

// ─── Bandeau objectif ─────────────────────────────────────────────────────────
interface GoalBannerProps {
  startupName: string;
  finalGoalValuation: number | null;
  finalObjective: string;
  stage: string;
  score: number;
  isPremium: boolean;
}

const GoalBanner: React.FC<GoalBannerProps> = ({
  finalGoalValuation, finalObjective, stage, score, isPremium,
}) => {
  const navigate = useNavigate();
  // Score-based "progress towards goal" — rough approximation
  const progress = Math.max(5, Math.min(95, Math.round(score * 0.8)));

  const goalLabel = finalGoalValuation
    ? `Valorisation ${formatGoal(finalGoalValuation)}`
    : finalObjective || 'Objectif à définir';

  const stageLabel = STAGE_MAP[stage] ?? 'Pre-seed';

  const handleClick = () => {
    if (!isPremium) navigate('/pricing?from=welcome&type=parcours');
    else navigate('/dashboard/financial-journey');
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold tracking-widest uppercase text-pink-300 whitespace-nowrap">
          Objectif final
        </span>
        <span className="text-white/30">·</span>
        <span className="text-white font-bold text-lg truncate">{goalLabel}</span>
      </div>

      {/* Center */}
      <div className="text-center">
        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-visible mb-2">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: '#F4B8CC' }} />
          <div
            className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 shadow"
            style={{
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              borderColor: '#F4B8CC',
            }}
          />
        </div>
        <p className="text-white/50 text-xs">{stageLabel} · Progression vers l'objectif</p>
      </div>

      {/* Right */}
      <div className="flex items-center justify-end gap-3">
        <div className="text-right">
          <p className="text-white/50 text-xs">Score Raisup</p>
          <p className="font-black text-xl leading-none" style={{ color: '#F4B8CC' }}>
            {score}<span className="text-white/30 text-sm font-normal">/100</span>
          </p>
        </div>
        <span className="text-xs font-medium flex items-center gap-1 whitespace-nowrap" style={{ color: '#F4B8CC' }}>
          {!isPremium && <Lock className="h-3 w-3" />}
          Voir mon parcours <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const { profile, score, kpis, isPremium } = useUserProfile();

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 space-y-5 max-w-5xl mx-auto', darkMode ? 'bg-gray-900' : '')}>
        {[4, 3, 3, 4, 4, 3].map((lines, i) => (
          <SkeletonCard key={i} darkMode={darkMode} lines={lines} />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-full', darkMode ? 'bg-gray-900' : 'bg-[#F8F8F8]')}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Bandeau objectif — données réelles */}
        <GoalBanner
          startupName={profile.startupName}
          finalGoalValuation={profile.finalGoalValuation}
          finalObjective={profile.finalObjective}
          stage={profile.stage}
          score={score.total}
          isPremium={isPremium}
        />

        {/* Section 1 — Header */}
        <DashboardHeader darkMode={darkMode} profile={profile} />

        {/* Section 2 — Score Raisup */}
        <RaisupScore darkMode={darkMode} score={score} />

        {/* Section 3 — KPIs */}
        <KPIGrid darkMode={darkMode} kpis={kpis} />

        {/* Section 4 — Pipeline dilutif */}
        <DilutivePipeline darkMode={darkMode} />

        {/* Section 5 — Pipeline non-dilutif */}
        <NonDilutivePipeline darkMode={darkMode} />

        {/* Section 6 — Documents & actions */}
        <DocumentsActions darkMode={darkMode} />

      </div>
    </div>
  );
};

export default Dashboard;
