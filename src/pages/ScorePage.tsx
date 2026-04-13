import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import clsx from 'clsx';
import mockScoreHistory, { currentScore } from '../data/mockScore';
import { getPitchRecs, getTractionRecs, getTeamRecs, getMarketRecs } from '../services/calculateScore';

// ─── Circular gauge ───────────────────────────────────────────────────────────
const CircularGauge: React.FC<{ score: number; darkMode: boolean }> = ({ score, darkMode }) => {
  const [animated, setAnimated] = useState(0);
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444';

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - (animated / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center w-44 h-44">
        <svg className="-rotate-90" width="176" height="176">
          <circle cx="88" cy="88" r={radius} fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="14" />
          <circle
            cx="88" cy="88" r={radius} fill="none"
            stroke={color} strokeWidth="14"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-black" style={{ color }}>{score}</span>
          <span className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>/100</span>
        </div>
      </div>
      <p className={clsx('text-sm font-semibold mt-1', score >= 70 ? 'text-green-500' : score >= 40 ? 'text-orange-500' : 'text-red-500')}>
        {score >= 70 ? 'Dossier solide' : score >= 40 ? 'En bonne voie' : 'À améliorer'}
      </p>
    </div>
  );
};

// ─── Sub-score panel ──────────────────────────────────────────────────────────
interface SubPanelProps {
  label: string;
  value: number;
  color: string;
  recs: string[];
  darkMode: boolean;
}

const SubPanel: React.FC<SubPanelProps> = ({ label, value, color, recs, darkMode }) => (
  <div className={clsx('rounded-xl border p-4', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
    <div className="flex justify-between items-center mb-2">
      <span className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}<span className={clsx('font-normal text-xs ml-0.5', darkMode ? 'text-gray-400' : 'text-gray-400')}>/25</span></span>
    </div>
    <div className={clsx('h-2 rounded-full overflow-hidden mb-4', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / 25) * 100}%`, backgroundColor: color }} />
    </div>
    <ul className="space-y-2">
      {recs.map((r, i) => (
        <li key={i} className={clsx('text-xs flex gap-2 leading-snug', darkMode ? 'text-gray-300' : 'text-gray-600')}>
          <span className="flex-shrink-0 text-primary font-bold mt-0.5">→</span>
          {r}
        </li>
      ))}
    </ul>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const ScorePage: React.FC = () => {
  const [darkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const { total, pitch, traction, team, market } = currentScore;

  const interpretation = total >= 70
    ? 'Votre dossier est solide. Vous pouvez commencer à prospecter activement.'
    : total >= 40
    ? 'Votre dossier est en bonne voie. Voici ce qui peut encore l\'améliorer.'
    : 'Votre dossier nécessite des améliorations importantes avant de contacter des investisseurs.';

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-full', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Title */}
        <div>
          <h1 className={clsx('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>Score Raisup</h1>
          <p className={clsx('text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            Évaluation de la solidité de votre dossier investisseur
          </p>
        </div>

        {/* Score + interpretation */}
        <div className={clsx('rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-8', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <CircularGauge score={total} darkMode={darkMode} />
          <div className="flex-1">
            <p className={clsx('text-base font-medium mb-4', darkMode ? 'text-gray-200' : 'text-gray-700')}>
              {interpretation}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pitch',    value: pitch,    color: '#3b82f6' },
                { label: 'Traction', value: traction, color: '#22c55e' },
                { label: 'Équipe',   value: team,     color: '#a855f7' },
                { label: 'Marché',   value: market,   color: '#f97316' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{value}/25</span>
                  </div>
                  <div className={clsx('h-1.5 rounded-full overflow-hidden', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
                    <div className="h-full rounded-full" style={{ width: `${(value / 25) * 100}%`, backgroundColor: color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-score panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SubPanel label="Pitch"    value={pitch}    color="#3b82f6" recs={getPitchRecs(pitch)}       darkMode={darkMode} />
          <SubPanel label="Traction" value={traction} color="#22c55e" recs={getTractionRecs(traction)} darkMode={darkMode} />
          <SubPanel label="Équipe"   value={team}     color="#a855f7" recs={getTeamRecs(team)}         darkMode={darkMode} />
          <SubPanel label="Marché"   value={market}   color="#f97316" recs={getMarketRecs(market)}     darkMode={darkMode} />
        </div>

        {/* Score history chart */}
        <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <h2 className={clsx('text-sm font-semibold mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
            Évolution du score sur 6 mois
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={mockScoreHistory} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="total"    name="Score global" stroke="#1d1d1b" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pitch"    name="Pitch"        stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="traction" name="Traction"     stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="team"     name="Équipe"       stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="market"   name="Marché"       stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Methodology */}
        <div className={clsx('rounded-xl border p-5', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>Comment est calculé votre score ?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Pitch (25 pts)', desc: 'Qualité de la description problème, solution, proposition de valeur et différenciation.' },
              { label: 'Traction (25 pts)', desc: 'MRR actuel, croissance MoM, nombre de clients actifs, taux de churn.' },
              { label: 'Équipe (25 pts)', desc: 'Nombre de fondateurs, présence d\'un CTO, expérience secteur, nombre d\'advisors.' },
              { label: 'Marché (25 pts)', desc: 'TAM défini et sourcé, concurrents identifiés, go-to-market défini.' },
            ].map(({ label, desc }) => (
              <div key={label}>
                <p className={clsx('text-xs font-semibold mb-0.5', darkMode ? 'text-gray-200' : 'text-gray-800')}>{label}</p>
                <p className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScorePage;
