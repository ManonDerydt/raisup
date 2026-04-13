import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Save, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import mockKPIs, { currentKPIs, previousKPIs, KPIEntry } from '../data/mockKPIs';
import { getBenchmark } from '../data/benchmarks';

const SECTOR = 'SaaS B2B' as const;
const STAGE  = 'seed' as const;

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const W = 96, H = 32, p = 3;
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (W - p * 2);
    const y = H - p - ((v - min) / range) * (H - p * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {(() => {
        const last = pts.split(' ').pop()!.split(',').map(Number);
        return <circle cx={last[0]} cy={last[1]} r="3" fill={color} />;
      })()}
    </svg>
  );
};

// ─── KPI card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  current: number;
  previous: number;
  unit: string;
  prefix?: string;
  goodIfUp: boolean;
  history: number[];
  color: string;
  darkMode: boolean;
  benchmarkLabel?: string;
  benchmarkValue?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  label, current, previous, unit, prefix = '', goodIfUp,
  history, color, darkMode, benchmarkLabel, benchmarkValue,
}) => {
  const diff = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isGood = goodIfUp ? diff >= 0 : diff <= 0;
  const fmt = (v: number) =>
    unit === '€' && v >= 1000 ? `${(v / 1000).toFixed(1)}K€` : `${prefix}${v.toLocaleString('fr-FR')}${unit}`;

  return (
    <div className={clsx('rounded-xl border p-4', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      <div className="flex justify-between items-start mb-2">
        <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-400' : 'text-gray-500')}>{label}</span>
        <span className={clsx('flex items-center gap-0.5 text-xs font-semibold', isGood ? 'text-green-500' : 'text-red-500')}>
          {isGood ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(diff).toFixed(1)}%
        </span>
      </div>
      <p className={clsx('text-2xl font-black mb-2', darkMode ? 'text-white' : 'text-gray-900')}>{fmt(current)}</p>
      <Sparkline data={history} color={color} />
      {benchmarkValue !== undefined && (
        <div className={clsx('mt-2 pt-2 border-t text-xs flex justify-between', darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500')}>
          <span>{benchmarkLabel}</span>
          <span className="font-medium">{fmt(benchmarkValue)}</span>
        </div>
      )}
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const KPIsPage: React.FC = () => {
  const [darkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [saved, setSaved] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<('mrr' | 'active_customers')[]>(['mrr', 'active_customers']);
  const [form, setForm] = useState({
    mrr: String(currentKPIs.mrr),
    growth_mom: String(currentKPIs.growth_mom),
    active_customers: String(currentKPIs.active_customers),
    churn: String(currentKPIs.churn),
    runway: String(currentKPIs.runway),
    cac: String(currentKPIs.cac),
  });

  const benchmark = getBenchmark(SECTOR, STAGE);
  const now = new Date();
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleMetric = (m: 'mrr' | 'active_customers') => {
    setActiveMetrics(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const inputCls = clsx(
    'w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-primary',
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900',
  );

  const kpiHistory = (key: keyof KPIEntry) => mockKPIs.map(k => k[key] as number);

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8', darkMode ? 'bg-gray-900 min-h-full' : 'bg-gray-50 min-h-full')}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Title ── */}
        <div>
          <h1 className={clsx('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>KPIs</h1>
          <p className={clsx('text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            Suivi mensuel de vos métriques clés
          </p>
        </div>

        {/* ── Monthly form ── */}
        <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <h2 className={clsx('text-sm font-semibold mb-4', darkMode ? 'text-white' : 'text-gray-900')}>
            Saisie mensuelle — {monthLabel}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {[
              { key: 'mrr',              label: 'MRR',             suffix: '€' },
              { key: 'growth_mom',       label: 'Croissance MoM',  suffix: '%' },
              { key: 'active_customers', label: 'Clients actifs',  suffix: ''  },
              { key: 'churn',            label: 'Churn mensuel',   suffix: '%' },
              { key: 'runway',           label: 'Runway',          suffix: ' mois' },
              { key: 'cac',              label: 'CAC',             suffix: '€' },
            ].map(({ key, label, suffix }) => (
              <div key={key}>
                <label className={clsx('block text-xs font-medium mb-1', darkMode ? 'text-gray-300' : 'text-gray-600')}>
                  {label} {suffix && <span className="text-gray-400">({suffix})</span>}
                </label>
                <input
                  type="number"
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition"
            >
              <Save className="h-4 w-4" />
              Sauvegarder ce mois
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle className="h-4 w-4" />
                KPIs de {monthLabel} sauvegardés
              </span>
            )}
          </div>
        </div>

        {/* ── KPI cards grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KPICard
            label="MRR" current={currentKPIs.mrr} previous={previousKPIs.mrr}
            unit="€" goodIfUp color="#22c55e" history={kpiHistory('mrr')} darkMode={darkMode}
            benchmarkLabel={`Médiane ${SECTOR} ${STAGE}`} benchmarkValue={benchmark.mrr_median}
          />
          <KPICard
            label="Croissance MoM" current={currentKPIs.growth_mom} previous={previousKPIs.growth_mom}
            unit="%" goodIfUp color="#22c55e" history={kpiHistory('growth_mom')} darkMode={darkMode}
            benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.growth_mom_median}
          />
          <KPICard
            label="Clients actifs" current={currentKPIs.active_customers} previous={previousKPIs.active_customers}
            unit="" goodIfUp color="#22c55e" history={kpiHistory('active_customers')} darkMode={darkMode}
            benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.active_customers_median}
          />
          <KPICard
            label="Churn mensuel" current={currentKPIs.churn} previous={previousKPIs.churn}
            unit="%" goodIfUp={false}
            color={currentKPIs.churn > benchmark.churn_median ? '#ef4444' : '#22c55e'}
            history={kpiHistory('churn')} darkMode={darkMode}
            benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.churn_median}
          />
          <KPICard
            label="Runway" current={currentKPIs.runway} previous={previousKPIs.runway}
            unit=" mois" goodIfUp
            color={currentKPIs.runway < 6 ? '#f97316' : '#22c55e'}
            history={kpiHistory('runway')} darkMode={darkMode}
          />
          <KPICard
            label="CAC" current={currentKPIs.cac} previous={previousKPIs.cac}
            unit="€" goodIfUp={false}
            color={currentKPIs.cac > benchmark.cac_median ? '#ef4444' : '#22c55e'}
            history={kpiHistory('cac')} darkMode={darkMode}
            benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.cac_median}
          />
        </div>

        {/* ── 12-month chart ── */}
        <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
              Évolution sur 12 mois
            </h2>
            <div className="flex gap-2">
              {(['mrr', 'active_customers'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => toggleMetric(m)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition',
                    activeMetrics.includes(m)
                      ? m === 'mrr' ? 'bg-green-500 text-white border-green-500' : 'bg-blue-500 text-white border-blue-500'
                      : darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500',
                  )}
                >
                  {m === 'mrr' ? 'MRR' : 'Clients'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mockKPIs} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              {activeMetrics.includes('mrr') && (
                <YAxis yAxisId="mrr" orientation="left" tick={{ fontSize: 11, fill: '#22c55e' }}
                  tickFormatter={v => v >= 1000 ? `${v / 1000}K€` : `${v}€`} />
              )}
              {activeMetrics.includes('active_customers') && (
                <YAxis yAxisId="customers" orientation="right" tick={{ fontSize: 11, fill: '#3b82f6' }} />
              )}
              <Tooltip
                contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: darkMode ? '#f9fafb' : '#111' }}
              />
              <Legend />
              {activeMetrics.includes('mrr') && (
                <Line yAxisId="mrr" type="monotone" dataKey="mrr" name="MRR (€)"
                  stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              )}
              {activeMetrics.includes('active_customers') && (
                <Line yAxisId="customers" type="monotone" dataKey="active_customers" name="Clients actifs"
                  stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KPIsPage;
