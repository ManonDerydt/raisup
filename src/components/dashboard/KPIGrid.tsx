import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { mockKPIs, KPI } from '../../data/dashboardMock';

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
      {/* Last dot */}
      {(() => {
        const [lx, ly] = pts.split(' ').pop()!.split(',').map(Number);
        return <circle cx={lx} cy={ly} r="2.5" fill={good ? '#22c55e' : '#f97316'} />;
      })()}
    </svg>
  );
};

// ─── KPI update modal ─────────────────────────────────────────────────────────
const KPIModal: React.FC<{ kpis: KPI[]; darkMode: boolean; onClose: () => void }> = ({ kpis, darkMode, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(kpis.map(k => [k.id, String(k.value)]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={clsx('w-full max-w-md rounded-2xl p-6 shadow-xl', darkMode ? 'bg-gray-800' : 'bg-white')}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={clsx('text-base font-bold', darkMode ? 'text-white' : 'text-gray-900')}>Mettre à jour mes KPIs</h3>
          <button onClick={onClose} className={clsx('p-1 rounded-lg', darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {kpis.map(k => (
            <div key={k.id} className="flex items-center gap-3">
              <label className={clsx('text-sm w-32 flex-shrink-0', darkMode ? 'text-gray-300' : 'text-gray-600')}>
                {k.label}
              </label>
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="number"
                  value={values[k.id]}
                  onChange={e => setValues(p => ({ ...p, [k.id]: e.target.value }))}
                  className={clsx(
                    'flex-1 rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-primary',
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900',
                  )}
                />
                {k.unit && <span className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>{k.unit}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className={clsx('px-4 py-2 rounded-lg text-sm', darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')}>
            Annuler
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-opacity-90 transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KPICard: React.FC<{ kpi: KPI; darkMode: boolean }> = ({ kpi, darkMode }) => {
  const isPositive = kpi.goodIfUp ? kpi.change >= 0 : kpi.change <= 0;
  const absChange = Math.abs(kpi.change);
  const formatted = kpi.unit === '€'
    ? kpi.value >= 1000 ? `${(kpi.value / 1000).toFixed(1)}K${kpi.unit}` : `${kpi.value}${kpi.unit}`
    : `${kpi.value}${kpi.unit}`;

  return (
    <div className={clsx('rounded-xl border p-4', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      <div className="flex items-start justify-between mb-2">
        <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-400' : 'text-gray-500')}>{kpi.label}</span>
        <span className={clsx(
          'inline-flex items-center text-xs font-semibold gap-0.5',
          isPositive ? 'text-green-500' : 'text-red-500',
        )}>
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {absChange}{kpi.id === 'growth' || kpi.id === 'churn' ? 'pts' : '%'}
        </span>
      </div>
      <p className={clsx('text-xl font-black mb-2', darkMode ? 'text-white' : 'text-gray-900')}>{formatted}</p>
      <Sparkline data={kpi.history.map(h => h.value)} good={isPositive} />
      <p className={clsx('text-xs mt-1', darkMode ? 'text-gray-500' : 'text-gray-400')}>
        {kpi.history.map(h => h.month).join(' · ')}
      </p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
interface Props { darkMode: boolean }

const KPIGrid: React.FC<Props> = ({ darkMode }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const kpis = mockKPIs;

  const lastUpdated = new Date(kpis[0].lastUpdated);
  const daysSince = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = daysSince > 30;

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>KPIs de la startup</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-opacity-90 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Mettre à jour
        </button>
      </div>

      {/* Stale alert */}
      {isStale && (
        <div className={clsx(
          'flex items-start gap-2 p-3 rounded-lg mb-4 text-xs',
          darkMode ? 'bg-orange-900/20 border border-orange-800 text-orange-300' : 'bg-orange-50 border border-orange-200 text-orange-700',
        )}>
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Vos KPIs ne sont plus à jour — les investisseurs consultent cette page. Dernière mise à jour il y a {daysSince} jours.</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpis.map(kpi => <KPICard key={kpi.id} kpi={kpi} darkMode={darkMode} />)}
      </div>

      {modalOpen && <KPIModal kpis={kpis} darkMode={darkMode} onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default KPIGrid;
