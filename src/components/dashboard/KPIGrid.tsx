import React, { useState, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, X, AlertTriangle, Info, PenLine } from 'lucide-react';
import clsx from 'clsx';
import { ProfileKPI } from '../../hooks/useUserProfile';

// ─── Benchmark tooltips ───────────────────────────────────────────────────────
const BENCHMARKS: Record<string, { definition: string; benchmark: string }> = {
  mrr:    { definition: 'Monthly Recurring Revenue — revenus récurrents mensuels contractualisés.', benchmark: 'Benchmark SaaS seed : 8–15K€ · Complétez vos KPIs pour voir votre position.' },
  growth: { definition: 'Taux de croissance mensuel du MRR (Month-over-Month).', benchmark: 'Benchmark SaaS seed : 10–20% MoM · Au-dessus de 15% vous êtes excellent.' },
  clients:{ definition: 'Nombre de clients actifs ayant au moins une transaction ce mois.', benchmark: 'Benchmark seed : 20–60 clients actifs.' },
  runway: { definition: 'Nombre de mois avant épuisement de la trésorerie au rythme actuel.', benchmark: 'Standard investisseur : > 12 mois pour lever sereinement.' },
  burn:   { definition: 'Dépenses mensuelles totales de l\'entreprise.', benchmark: 'Dépend du stade — un burn < 30K€/mois est confortable en pre-seed.' },
  churn:  { definition: 'Taux d\'attrition mensuel — % de clients perdus.', benchmark: 'Benchmark SaaS : < 3% · Au-dessus de 5% c\'est préoccupant.' },
  cac:    { definition: 'Coût d\'Acquisition Client.', benchmark: 'Benchmark SaaS seed : 200–600€ selon le segment.' },
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; good: boolean }> = ({ data, good }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 28, pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={good ? '#22c55e' : '#f97316'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {(() => {
        const last = pts.split(' ').pop()!;
        const [lx, ly] = last.split(',').map(Number);
        return <circle cx={lx} cy={ly} r="2.5" fill={good ? '#22c55e' : '#f97316'} />;
      })()}
    </svg>
  );
};

// ─── KPI update modal ─────────────────────────────────────────────────────────
const KPIModal: React.FC<{
  kpis: ProfileKPI[];
  darkMode: boolean;
  onClose: () => void;
  onSave: (updated: Record<string, number>) => void;
}> = ({ kpis, darkMode, onClose, onSave }) => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(kpis.map(k => [k.id, k.value > 0 ? String(k.value) : '']))
  );

  const handleSave = () => {
    const updated: Record<string, number> = {};
    for (const [key, val] of Object.entries(values)) {
      const n = parseFloat(val);
      if (!isNaN(n)) updated[key] = n;
    }
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={clsx('w-full max-w-md rounded-2xl p-6 shadow-xl', darkMode ? 'bg-gray-800' : 'bg-white')}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={clsx('text-base font-bold', darkMode ? 'text-white' : 'text-gray-900')}>Mettre à jour mes KPIs</h3>
          <button onClick={onClose} className={clsx('p-1 rounded-lg', darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className={clsx('text-xs mb-4', darkMode ? 'text-gray-400' : 'text-gray-500')}>
          Ces données sont sauvegardées localement et mises à jour dans votre score.
        </p>
        <div className="space-y-3">
          {kpis.map(k => (
            <div key={k.id} className="flex items-center gap-3">
              <label className={clsx('text-sm w-36 flex-shrink-0 font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                {k.label}
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  value={values[k.id]}
                  onChange={e => setValues(p => ({ ...p, [k.id]: e.target.value }))}
                  placeholder="—"
                  className={clsx(
                    'flex-1 rounded-xl px-3 py-2.5 text-sm border focus:outline-none',
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900',
                  )}
                />
                <span className={clsx('text-sm w-12 flex-shrink-0', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                  {k.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className={clsx('px-4 py-2 rounded-xl text-sm', darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}>
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: '#0A0A0A' }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KPICard: React.FC<{ kpi: ProfileKPI; darkMode: boolean }> = ({ kpi, darkMode }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPositive = kpi.goodIfUp ? kpi.change >= 0 : kpi.change <= 0;
  const absChange = Math.abs(kpi.change);
  const hasChange = absChange > 0;

  const formatted = kpi.unit === '€' || kpi.unit === '€/mois'
    ? kpi.value >= 1_000_000 ? `${(kpi.value / 1_000_000).toFixed(1)}M${kpi.unit === '€/mois' ? '€/m' : '€'}`
    : kpi.value >= 1_000 ? `${(kpi.value / 1_000).toFixed(1)}K${kpi.unit === '€/mois' ? '€/m' : '€'}`
    : `${kpi.value}${kpi.unit}`
    : `${kpi.value}${kpi.unit}`;

  const tip = BENCHMARKS[kpi.id];

  return (
    <div
      className={clsx('relative rounded-xl border p-4 cursor-default', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}
      onMouseEnter={() => { timerRef.current = setTimeout(() => setShowTooltip(true), 300); }}
      onMouseLeave={() => { if (timerRef.current) clearTimeout(timerRef.current); setShowTooltip(false); }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-400' : 'text-gray-500')}>{kpi.label}</span>
          {tip && <Info className={clsx('h-3 w-3', darkMode ? 'text-gray-600' : 'text-gray-300')} />}
        </div>
        {hasChange ? (
          <span className={clsx('inline-flex items-center text-xs font-semibold gap-0.5', isPositive ? 'text-green-500' : 'text-red-500')}>
            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {absChange}{kpi.id === 'growth' || kpi.id === 'churn' ? 'pts' : '%'}
          </span>
        ) : (
          <span className="text-[10px] text-gray-300 italic">profil</span>
        )}
      </div>

      <p className={clsx('text-xl font-black mb-2', darkMode ? 'text-white' : 'text-gray-900')}>{formatted}</p>

      {kpi.history.length > 1 && (
        <>
          <Sparkline data={kpi.history.map(h => h.value)} good={isPositive} />
          <p className={clsx('text-xs mt-1', darkMode ? 'text-gray-500' : 'text-gray-400')}>
            {kpi.history.map(h => h.month).join(' · ')}
          </p>
        </>
      )}

      {kpi.fromProfile && (
        <p className="text-[10px] mt-1.5 text-gray-300">
          Depuis votre profil · Mettez à jour pour suivre l'évolution
        </p>
      )}

      {/* Tooltip */}
      {tip && showTooltip && (
        <div className={clsx(
          'absolute z-20 bottom-full left-0 mb-2 w-64 rounded-xl shadow-xl p-3 text-xs pointer-events-none',
          darkMode ? 'bg-gray-900 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-700',
        )}>
          <p className="font-semibold mb-1">{kpi.label}</p>
          <p className="mb-2 text-gray-400">{tip.definition}</p>
          <p className="font-medium" style={{ color: '#C4728A' }}>{tip.benchmark}</p>
          <div className={clsx('absolute -bottom-1.5 left-4 w-3 h-3 rotate-45', darkMode ? 'bg-gray-900 border-b border-r border-gray-700' : 'bg-white border-b border-r border-gray-200')} />
        </div>
      )}
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyKPIs: React.FC<{ darkMode: boolean; onAdd: () => void }> = ({ darkMode, onAdd }) => (
  <div className={clsx(
    'flex flex-col items-center justify-center text-center py-10 rounded-xl border-2 border-dashed',
    darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400',
  )}>
    <PenLine className="h-8 w-8 mb-3 opacity-40" />
    <p className="text-sm font-medium mb-1">Aucune métrique renseignée</p>
    <p className="text-xs mb-4 max-w-xs">Saisissez vos KPIs pour les afficher ici et améliorer votre score Raisup</p>
    <button
      onClick={onAdd}
      className="px-4 py-2 rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      Renseigner mes KPIs
    </button>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  darkMode: boolean;
  kpis: ProfileKPI[];
}

const KPIGrid: React.FC<Props> = ({ darkMode, kpis: initialKpis }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [kpis, setKpis] = useState<ProfileKPI[]>(initialKpis);

  // Sync if prop changes
  React.useEffect(() => { setKpis(initialKpis); }, [initialKpis]);

  const handleSave = (updated: Record<string, number>) => {
    setKpis(prev => prev.map(k => {
      if (updated[k.id] !== undefined) {
        const newVal = updated[k.id];
        // Persist to localStorage profile
        try {
          const stored = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
          const fieldMap: Record<string, string> = { mrr: 'mrr', growth: 'momGrowth', clients: 'activeClients', runway: 'runway', burn: 'burnRate' };
          if (fieldMap[k.id]) { stored[fieldMap[k.id]] = newVal; localStorage.setItem('raisup_profile', JSON.stringify(stored)); }
        } catch { /* ignore */ }
        return { ...k, value: newVal, fromProfile: false };
      }
      return k;
    }));
  };

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>KPIs de la startup</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-80 transition"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Mettre à jour
        </button>
      </div>

      {/* Runway warning */}
      {kpis.some(k => k.id === 'runway' && k.value < 6 && k.value > 0) && (
        <div className={clsx(
          'flex items-start gap-2 p-3 rounded-xl mb-4 text-xs',
          darkMode ? 'bg-orange-900/20 border border-orange-800 text-orange-300' : 'bg-orange-50 border border-orange-200 text-orange-700',
        )}>
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Runway critique — moins de 6 mois. Lancez vos démarches de financement immédiatement.</span>
        </div>
      )}

      {/* Grid or empty */}
      {kpis.length === 0 ? (
        <EmptyKPIs darkMode={darkMode} onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {kpis.map(kpi => <KPICard key={kpi.id} kpi={kpi} darkMode={darkMode} />)}
        </div>
      )}

      {modalOpen && (
        <KPIModal
          kpis={kpis.length > 0 ? kpis : [
            { id: 'mrr', label: 'MRR', value: 0, unit: '€', change: 0, goodIfUp: true, history: [], lastUpdated: new Date().toISOString(), fromProfile: true },
            { id: 'growth', label: 'Croissance MoM', value: 0, unit: '%', change: 0, goodIfUp: true, history: [], lastUpdated: new Date().toISOString(), fromProfile: true },
            { id: 'clients', label: 'Clients actifs', value: 0, unit: '', change: 0, goodIfUp: true, history: [], lastUpdated: new Date().toISOString(), fromProfile: true },
            { id: 'runway', label: 'Runway', value: 0, unit: ' mois', change: 0, goodIfUp: true, history: [], lastUpdated: new Date().toISOString(), fromProfile: true },
            { id: 'burn', label: 'Burn rate', value: 0, unit: '€/mois', change: 0, goodIfUp: false, history: [], lastUpdated: new Date().toISOString(), fromProfile: true },
          ]}
          darkMode={darkMode}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default KPIGrid;
