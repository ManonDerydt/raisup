import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { mockRaisupScore } from '../../data/dashboardMock';

interface SubScoreProps {
  label: string;
  value: number;
  max: number;
  color: string;
  darkMode: boolean;
}

const SubScore: React.FC<SubScoreProps> = ({ label, value, max, color, darkMode }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-600')}>{label}</span>
      <span className={clsx('text-xs font-bold', darkMode ? 'text-white' : 'text-gray-900')}>{value}<span className="font-normal text-gray-400">/{max}</span></span>
    </div>
    <div className={clsx('h-2 rounded-full overflow-hidden', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
      <div className={clsx('h-full rounded-full transition-all duration-700', color)} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

// Circular progress SVG
const CircularScore: React.FC<{ score: number; darkMode: boolean }> = ({ score, darkMode }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg className="-rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="12" />
        <circle
          cx="72" cy="72" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={clsx('text-3xl font-black', darkMode ? 'text-white' : 'text-gray-900')} style={{ color }}>
          {score}
        </span>
        <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>/100</span>
      </div>
    </div>
  );
};

function interpretation(score: number): { text: string; color: string } {
  if (score < 40) return {
    text: 'Votre dossier nécessite des améliorations importantes avant de contacter des investisseurs.',
    color: 'text-red-500',
  };
  if (score < 70) return {
    text: 'Votre dossier est en bonne voie. Voici ce qui peut encore l\'améliorer.',
    color: 'text-orange-500',
  };
  return {
    text: 'Votre dossier est solide. Vous pouvez commencer à prospecter activement.',
    color: 'text-green-500',
  };
}

interface Props { darkMode: boolean }

const RaisupScore: React.FC<Props> = ({ darkMode }) => {
  const { total, pitch, traction, team, market } = mockRaisupScore;
  const { text, color } = interpretation(total);

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      <div className="flex items-center gap-2 mb-5">
        <div className={clsx('p-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-secondary-light')}>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>Score Raisup</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Circular gauge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <CircularScore score={total} darkMode={darkMode} />
          <p className={clsx('text-xs text-center max-w-[160px] font-medium', color)}>{text}</p>
          <Link
            to="/dashboard/generate"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-opacity-90 transition"
          >
            Améliorer mon score →
          </Link>
        </div>

        {/* Sub-scores */}
        <div className="flex-1 w-full space-y-3">
          <SubScore label="Pitch"    value={pitch}    max={25} color="bg-blue-500"   darkMode={darkMode} />
          <SubScore label="Traction" value={traction} max={25} color="bg-green-500"  darkMode={darkMode} />
          <SubScore label="Équipe"   value={team}     max={25} color="bg-purple-500" darkMode={darkMode} />
          <SubScore label="Marché"   value={market}   max={25} color="bg-orange-500" darkMode={darkMode} />

          {/* Legend */}
          <div className={clsx('text-xs pt-2 border-t', darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500')}>
            Score calculé sur : pitch deck, traction, profil équipe, taille de marché adressable.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaisupScore;
