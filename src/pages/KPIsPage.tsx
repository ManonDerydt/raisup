import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Save, CheckCircle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { getBenchmark } from '../data/benchmarks';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

const SECTOR = 'SaaS B2B' as const;
const STAGE  = 'seed' as const;

interface KPIEntry {
  month: string;
  label: string;
  mrr: number;
  growth_mom: number;
  active_customers: number;
  churn: number;
  runway: number;
  cac: number;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (data.length < 2) return <div className="h-8" />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const W = 96, H = 32, p = 3;
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (W - p * 2);
    const y = H - p - ((v - min) / range) * (H - p * 2);
    return `${x},${y}`;
  }).join(' ');
  const last = pts.split(' ').pop()!.split(',').map(Number);
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
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
        {previous > 0 && (
          <span className={clsx('flex items-center gap-0.5 text-xs font-semibold', isGood ? 'text-green-500' : 'text-red-500')}>
            {isGood ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(diff).toFixed(1)}%
          </span>
        )}
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
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const [history, setHistory] = useState<KPIEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState<('mrr' | 'active_customers')[]>(['mrr', 'active_customers']);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const currentKPIs = history[history.length - 1];
  const previousKPIs = history[history.length - 2];

  const [form, setForm] = useState({
    mrr:              String(profile.mrr ?? 0),
    growth_mom:       String(profile.momGrowth ?? 0),
    active_customers: String(profile.activeClients ?? 0),
    churn:            '0',
    runway:           String(profile.runway ?? 0),
    cac:              '0',
  });

  // Load history from Supabase
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    supabase
      .from('kpi_history')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setHistory(data as KPIEntry[]);
          const last = data[data.length - 1];
          setForm({
            mrr:              String(last.mrr),
            growth_mom:       String(last.growth_mom),
            active_customers: String(last.active_customers),
            churn:            String(last.churn),
            runway:           String(last.runway),
            cac:              String(last.cac),
          });
        }
        setLoading(false);
      });
  }, [user?.id]);

  // Prefill form from profile when no history
  useEffect(() => {
    if (history.length === 0 && profile.mrr) {
      setForm(f => ({
        ...f,
        mrr:              String(profile.mrr ?? f.mrr),
        growth_mom:       String(profile.momGrowth ?? f.growth_mom),
        active_customers: String(profile.activeClients ?? f.active_customers),
        runway:           String(profile.runway ?? f.runway),
      }));
    }
  }, [profile, history.length]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const entry = {
      user_id:          user.id,
      month:            currentMonth,
      label:            monthLabel,
      mrr:              Number(form.mrr),
      growth_mom:       Number(form.growth_mom),
      active_customers: Number(form.active_customers),
      churn:            Number(form.churn),
      runway:           Number(form.runway),
      cac:              Number(form.cac),
    };
    const { error } = await supabase
      .from('kpi_history')
      .upsert(entry, { onConflict: 'user_id,month' });

    if (!error) {
      setHistory(prev => {
        const idx = prev.findIndex(h => h.month === currentMonth);
        if (idx >= 0) { const next = [...prev]; next[idx] = entry; return next; }
        return [...prev, entry];
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const benchmark = getBenchmark(SECTOR, STAGE);
  const kpiHistory = (key: keyof KPIEntry) => history.map(h => h[key] as number);

  const inputCls = clsx(
    'w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-primary',
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900',
  );

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8', darkMode ? 'bg-gray-900 min-h-full' : 'bg-gray-50 min-h-full')}>
      <div className="max-w-7xl mx-auto space-y-6">

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
              { key: 'mrr',              label: 'MRR',            suffix: '€' },
              { key: 'growth_mom',       label: 'Croissance MoM', suffix: '%' },
              { key: 'active_customers', label: 'Clients actifs', suffix: ''  },
              { key: 'churn',            label: 'Churn mensuel',  suffix: '%' },
              { key: 'runway',           label: 'Runway',         suffix: ' mois' },
              { key: 'cac',             label: 'CAC',            suffix: '€' },
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
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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

        {/* ── KPI cards ── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : history.length === 0 ? (
          <div className={clsx('rounded-xl border p-10 text-center', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
            <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Aucun historique. Saisissez vos KPIs du mois et sauvegardez.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KPICard
                label="MRR" current={currentKPIs.mrr} previous={previousKPIs?.mrr ?? 0}
                unit="€" goodIfUp color="#22c55e" history={kpiHistory('mrr')} darkMode={darkMode}
                benchmarkLabel={`Médiane ${SECTOR} ${STAGE}`} benchmarkValue={benchmark.mrr_median}
              />
              <KPICard
                label="Croissance MoM" current={currentKPIs.growth_mom} previous={previousKPIs?.growth_mom ?? 0}
                unit="%" goodIfUp color="#22c55e" history={kpiHistory('growth_mom')} darkMode={darkMode}
                benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.growth_mom_median}
              />
              <KPICard
                label="Clients actifs" current={currentKPIs.active_customers} previous={previousKPIs?.active_customers ?? 0}
                unit="" goodIfUp color="#22c55e" history={kpiHistory('active_customers')} darkMode={darkMode}
                benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.active_customers_median}
              />
              <KPICard
                label="Churn mensuel" current={currentKPIs.churn} previous={previousKPIs?.churn ?? 0}
                unit="%" goodIfUp={false}
                color={currentKPIs.churn > benchmark.churn_median ? '#ef4444' : '#22c55e'}
                history={kpiHistory('churn')} darkMode={darkMode}
                benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.churn_median}
              />
              <KPICard
                label="Runway" current={currentKPIs.runway} previous={previousKPIs?.runway ?? 0}
                unit=" mois" goodIfUp
                color={currentKPIs.runway < 6 ? '#f97316' : '#22c55e'}
                history={kpiHistory('runway')} darkMode={darkMode}
              />
              <KPICard
                label="CAC" current={currentKPIs.cac} previous={previousKPIs?.cac ?? 0}
                unit="€" goodIfUp={false}
                color={currentKPIs.cac > benchmark.cac_median ? '#ef4444' : '#22c55e'}
                history={kpiHistory('cac')} darkMode={darkMode}
                benchmarkLabel="Médiane secteur" benchmarkValue={benchmark.cac_median}
              />
            </div>

            {/* ── Chart ── */}
            {history.length > 1 && (
              <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                    Évolution sur {history.length} mois
                  </h2>
                  <div className="flex gap-2">
                    {(['mrr', 'active_customers'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setActiveMetrics(prev =>
                          prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                        )}
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
                  <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KPIsPage;
