import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { ScoreResult as ScoreType } from '../../services/calculateScore';

const PINK = '#F4B8CC';

function getScoreText(total: number): string {
  if (total >= 70) return 'Votre dossier est solide. Vous pouvez prospecter activement.';
  if (total >= 40) return "Votre dossier est en bonne voie. Voici ce qui peut encore l'améliorer.";
  return 'Votre dossier nécessite des améliorations importantes.';
}

function getSubColor(v: number): string {
  if (v < 10) return '#ef4444';
  if (v < 18) return '#f97316';
  return '#22c55e';
}

interface SubScoreProps {
  label: string;
  value: number;
  max: number;
  darkMode: boolean;
  analysis?: string;
}

const SubScore: React.FC<SubScoreProps> = ({ label, value, max, darkMode, analysis }) => {
  const color = getSubColor(value);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-600')}>{label}</span>
        <span className="text-xs font-black" style={{ color }}>
          {value}<span className="font-normal text-gray-400">/{max}</span>
        </span>
      </div>
      <div className={clsx('h-2 rounded-full overflow-hidden', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      {analysis && (
        <p className="text-[11px] mt-1 leading-snug text-gray-400">{analysis}</p>
      )}
    </div>
  );
};

const CircularScore: React.FC<{ score: number; darkMode: boolean }> = ({ score, darkMode }) => {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 200); return () => clearTimeout(t); }, [score]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (anim / 100) * circumference;

  const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36">
      <svg className="-rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="12" />
        <circle
          cx="72" cy="72" r={radius} fill="none"
          stroke={PINK} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color: scoreColor }}>{score}</span>
        <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>/100</span>
      </div>
    </div>
  );
};

interface Props {
  darkMode: boolean;
  score: ScoreType;
}

const RaisupScore: React.FC<Props> = ({ darkMode, score }) => {
  const { total, pilier1_fintech, pilier2_tech, pilier3_marche, pilier4_risque, pilier5_liquidite } = score;
  const text = getScoreText(total);

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      <div className="flex items-center gap-2 mb-5">
        <div className={clsx('p-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-pink-50')}>
          <TrendingUp className="h-4 w-4" style={{ color: '#C4728A' }} />
        </div>
        <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>Score Raisup</h2>
        <span className="ml-auto text-[10px] text-gray-400">Calculé en temps réel depuis votre profil</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* Circular gauge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <CircularScore score={total} darkMode={darkMode} />
          <p className="text-xs text-center max-w-[160px] font-medium" style={{ color: '#C4728A' }}>{text}</p>
          <Link
            to="/dashboard/score"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold hover:opacity-80 transition"
            style={{ backgroundColor: '#0A0A0A' }}
          >
            Améliorer mon score →
          </Link>
        </div>

        {/* Sub-scores */}
        <div className="flex-1 w-full space-y-4">
          <SubScore label="Fintech & Data"      value={pilier1_fintech}   max={25} darkMode={darkMode} analysis={pilier1_fintech < 10 ? 'Métriques financières à documenter' : pilier1_fintech < 18 ? 'Traction en cours' : 'Métriques solides'} />
          <SubScore label="Tech & IP"           value={pilier2_tech}      max={20} darkMode={darkMode} analysis={pilier2_tech < 8 ? 'Avantage tech à préciser' : pilier2_tech < 15 ? 'Tech correcte' : 'Moat technologique fort'} />
          <SubScore label="Marché & Momentum"   value={pilier3_marche}    max={20} darkMode={darkMode} analysis={pilier3_marche < 8 ? 'TAM à documenter' : pilier3_marche < 15 ? 'Vision marché à affiner' : 'Marché bien documenté'} />
          <SubScore label="Risque & Conformité" value={pilier4_risque}    max={20} darkMode={darkMode} analysis={pilier4_risque < 8 ? 'Risques structurels à adresser' : pilier4_risque < 15 ? 'Quelques risques à réduire' : 'Profil de risque maîtrisé'} />
          <SubScore label="Liquidité & Exit"    value={pilier5_liquidite} max={15} darkMode={darkMode} analysis={pilier5_liquidite < 5 ? 'Stratégie de sortie à définir' : pilier5_liquidite < 10 ? 'Exit à préciser' : 'Stratégie solide'} />

          <div className={clsx('text-xs pt-2 border-t', darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400')}>
            Score calculé depuis votre profil onboarding · Complétez-le pour améliorer votre score
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaisupScore;
