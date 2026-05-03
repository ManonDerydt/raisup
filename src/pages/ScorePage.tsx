import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import clsx from 'clsx';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface ScoreSnapshot {
  month: string;
  label: string;
  total: number;
  pilier1_fintech: number;
  pilier2_tech: number;
  pilier3_marche: number;
  pilier4_risque: number;
  pilier5_liquidite: number;
}

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

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center w-44 h-44">
        <svg className="-rotate-90" width="176" height="176">
          <circle cx="88" cy="88" r={radius} fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="14" />
          <circle cx="88" cy="88" r={radius} fill="none" stroke={color} strokeWidth="14"
            strokeDasharray={circ} strokeDashoffset={circ - (animated / 100) * circ}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
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
const SubPanel: React.FC<{ label: string; value: number; max: number; color: string; recs: string[]; darkMode: boolean }> = ({ label, value, max, color, recs, darkMode }) => (
  <div className={clsx('rounded-xl border p-4', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
    <div className="flex justify-between items-center mb-2">
      <span className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}<span className="font-normal text-xs ml-0.5 text-gray-400">/{max}</span></span>
    </div>
    <div className={clsx('h-2 rounded-full overflow-hidden mb-4', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
    </div>
    <ul className="space-y-2">
      {recs.map((r, i) => (
        <li key={i} className={clsx('text-xs flex gap-2 leading-snug', darkMode ? 'text-gray-300' : 'text-gray-600')}>
          <span className="flex-shrink-0 text-primary font-bold mt-0.5">→</span>{r}
        </li>
      ))}
    </ul>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ScorePage: React.FC = () => {
  const [darkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const { user } = useAuth();
  const { score: officialScore } = useUserProfile();
  const { total, pilier1_fintech, pilier2_tech, pilier3_marche, pilier4_risque, pilier5_liquidite } = officialScore;

  const [history, setHistory] = useState<ScoreSnapshot[]>([]);

  // Upsert current score + load history
  useEffect(() => {
    if (!user?.id) return;
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const label = now.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

    // Save current month's score
    supabase.from('score_history').upsert({
      user_id:           user.id,
      month,
      label,
      total,
      pilier1_fintech,
      pilier2_tech,
      pilier3_marche,
      pilier4_risque,
      pilier5_liquidite,
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'user_id,month' }).then(() => {
      // Load full history
      supabase.from('score_history')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
        .then(({ data }) => { if (data) setHistory(data as ScoreSnapshot[]); });
    });
  }, [user?.id, total]);

  const chartData = useMemo(() => history.map(h => ({
    label:   h.label,
    total:   h.total,
    fintech: h.pilier1_fintech,
    tech:    h.pilier2_tech,
    marche:  h.pilier3_marche,
    risque:  h.pilier4_risque,
  })), [history]);

  const interpretation = total >= 70
    ? 'Votre dossier est solide. Vous pouvez commencer à prospecter activement.'
    : total >= 40
    ? "Votre dossier est en bonne voie. Voici ce qui peut encore l'améliorer."
    : 'Votre dossier nécessite des améliorations importantes avant de contacter des investisseurs.';

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-full', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ backgroundColor: '#0A0A0A' }}>
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: '#F4B8CC' }}>SCORE RAISUP</p>
            <h1 className="text-[22px] font-black text-white leading-tight">Solidité de votre dossier investisseur</h1>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{interpretation}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[40px] font-black leading-none" style={{ color: total >= 70 ? '#D8FFBD' : total >= 40 ? '#FFB96D' : '#FFB3B3' }}>{total}</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>/100</p>
          </div>
        </div>

        {/* Gauge + piliers */}
        <div className={clsx('rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-8', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <CircularGauge score={total} darkMode={darkMode} />
          <div className="flex-1 w-full">
            <p className={clsx('text-base font-medium mb-4', darkMode ? 'text-gray-200' : 'text-gray-700')}>{interpretation}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Fintech & Data', value: pilier1_fintech,   max: 25, color: '#3b82f6' },
                { label: 'Tech & IP',      value: pilier2_tech,      max: 20, color: '#22c55e' },
                { label: 'Marché',         value: pilier3_marche,    max: 20, color: '#a855f7' },
                { label: 'Risque',         value: pilier4_risque,    max: 20, color: '#f97316' },
                { label: 'Exit',           value: pilier5_liquidite, max: 15, color: '#ec4899' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{value}/{max}</span>
                  </div>
                  <div className={clsx('h-1.5 rounded-full overflow-hidden', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
                    <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, backgroundColor: color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SubPanel label="Fintech & Data" value={pilier1_fintech} max={25} color="#3b82f6" darkMode={darkMode}
            recs={pilier1_fintech < 10 ? ['Documentez votre MRR et ARR', 'Ajoutez vos métriques de croissance MoM', 'Renseignez votre CAC et LTV'] : pilier1_fintech < 20 ? ['Augmentez votre MRR au-delà de 20k€', 'Ciblez un burn multiple < 1,5'] : ['Métriques financières solides — continuez']} />
          <SubPanel label="Tech & IP" value={pilier2_tech} max={20} color="#22c55e" darkMode={darkMode}
            recs={pilier2_tech < 8 ? ['Documentez votre avantage technologique', 'Précisez si vous utilisez de la tech propriétaire', 'Identifiez vos données uniques'] : pilier2_tech < 15 ? ['Renforcez votre moat technologique', 'Envisagez un dépôt de brevet si pertinent'] : ['Avantage tech bien documenté']} />
          <SubPanel label="Marché & Momentum" value={pilier3_marche} max={20} color="#a855f7" darkMode={darkMode}
            recs={pilier3_marche < 8 ? ['Documentez la taille de votre TAM', 'Précisez le taux de croissance de votre marché', 'Confirmez votre secteur'] : pilier3_marche < 15 ? ['Sourcez votre TAM avec des données tierces', 'Montrez l\'accélération du marché'] : ['Vision marché convaincante']} />
          <SubPanel label="Risque & Conformité" value={pilier4_risque} max={20} color="#f97316" darkMode={darkMode}
            recs={pilier4_risque < 8 ? ['Recrutez un CTO si absent', 'Étendez votre runway à 12+ mois', 'Mettez en place une conformité RGPD'] : pilier4_risque < 15 ? ['Réduisez la dépendance aux fondateurs', 'Documentez votre conformité AI Act'] : ['Profil de risque maîtrisé']} />
          <SubPanel label="Liquidité & Exit" value={pilier5_liquidite} max={15} color="#ec4899" darkMode={darkMode}
            recs={pilier5_liquidite < 5 ? ['Définissez votre stratégie de sortie', 'Identifiez des partenaires stratégiques', 'Précisez votre valorisation cible'] : pilier5_liquidite < 10 ? ['Visez une valorisation > 50M€', 'Contactez des acquéreurs potentiels'] : ['Stratégie de sortie bien définie']} />
        </div>

        {/* Score history chart */}
        <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <h2 className={clsx('text-sm font-semibold mb-1', darkMode ? 'text-white' : 'text-gray-900')}>
            Évolution du score
          </h2>
          <p className={clsx('text-xs mb-4', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            {history.length <= 1
              ? 'L\'historique se construit à chaque visite mensuelle.'
              : `${history.length} mois d'historique réel`}
          </p>
          {history.length > 1 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
                <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="total"   name="Score global"   stroke="#1d1d1b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="fintech" name="Fintech & Data"  stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="tech"    name="Tech & IP"       stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="marche"  name="Marché"          stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="risque"  name="Risque"          stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={clsx('rounded-xl p-8 text-center', darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
              <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                Revenez le mois prochain — le graphique apparaîtra dès 2 mois de données.
              </p>
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className={clsx('rounded-xl border p-5', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>Comment est calculé votre score ?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Fintech & Data (25 pts)', desc: 'MRR, ARR, croissance MoM, burn multiple, ratio LTV/CAC.' },
              { label: 'Tech & IP (20 pts)',       desc: 'Technologie propriétaire, données uniques, brevets, moat détecté.' },
              { label: 'Marché & Momentum (20 pts)', desc: 'TAM, taux de croissance du marché, secteur porteur.' },
              { label: 'Risque & Conformité (20 pts)', desc: 'Structure équipe, CTO, runway, conformité RGPD / AI Act.' },
              { label: 'Liquidité & Exit (15 pts)', desc: 'Stratégie de sortie, partenaires stratégiques, valorisation cible.' },
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
