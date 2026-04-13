import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Users } from 'lucide-react';
import clsx from 'clsx';
import { mockDilutivePipeline, TOTAL_MATCHED_INVESTORS, DilutiveStatus, DilutiveInvestor } from '../../data/dashboardMock';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<DilutiveStatus, { label: string; bg: string; text: string }> = {
  'to-contact':    { label: 'À contacter',   bg: 'bg-gray-100',    text: 'text-gray-600'   },
  'contacted':     { label: 'Contacté',      bg: 'bg-blue-100',    text: 'text-blue-700'   },
  'in-discussion': { label: 'En discussion', bg: 'bg-orange-100',  text: 'text-orange-700' },
  'meeting':       { label: 'RDV prévu',     bg: 'bg-violet-100',  text: 'text-violet-700' },
  'term-sheet':    { label: 'Term sheet',    bg: 'bg-green-100',   text: 'text-green-700'  },
  'refused':       { label: 'Refus',         bg: 'bg-red-100',     text: 'text-red-700'    },
};

const StatusBadge: React.FC<{ status: DilutiveStatus }> = ({ status }) => {
  const { label, bg, text } = STATUS_CONFIG[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', bg, text)}>
      {label}
    </span>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────
const InvestorRow: React.FC<{ inv: DilutiveInvestor; darkMode: boolean }> = ({ inv, darkMode }) => {
  const fmt = (n: number) => n >= 1_000_000 ? `${n / 1_000_000}M€` : `${(n / 1000).toFixed(0)}K€`;
  const dateStr = inv.lastContact
    ? new Date(inv.lastContact).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—';

  return (
    <tr className={clsx('border-t text-sm', darkMode ? 'border-gray-700' : 'border-gray-100')}>
      <td className="py-3 pr-3">
        <p className={clsx('font-medium', darkMode ? 'text-white' : 'text-gray-900')}>{inv.name}</p>
        <p className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{inv.type}</p>
      </td>
      <td className={clsx('py-3 pr-3 text-sm font-medium', darkMode ? 'text-gray-200' : 'text-gray-700')}>
        {fmt(inv.targetTicket)}
      </td>
      <td className="py-3 pr-3"><StatusBadge status={inv.status} /></td>
      <td className={clsx('py-3 pr-3 text-xs hidden sm:table-cell', darkMode ? 'text-gray-400' : 'text-gray-500')}>
        {dateStr}
      </td>
      <td className={clsx('py-3 text-xs', darkMode ? 'text-gray-300' : 'text-gray-600')}>
        {inv.nextAction}
      </td>
    </tr>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { darkMode: boolean }

const DilutivePipeline: React.FC<Props> = ({ darkMode }) => {
  const [showAll, setShowAll] = useState(false);
  const pipeline = mockDilutivePipeline;
  const visible = showAll ? pipeline : pipeline.slice(0, 5);
  const contacted = pipeline.filter(i => i.status !== 'to-contact').length;

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={clsx('p-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-secondary-light')}>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
            Pipeline dilutif
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/fundraising" className={clsx('text-xs font-medium hover:underline', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            Matchs recommandés →
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-opacity-90 transition">
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Counter + progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            <span className="font-semibold">{contacted}</span> investisseurs contactés sur{' '}
            <span className="font-semibold">{TOTAL_MATCHED_INVESTORS}</span> matchés
          </span>
          <span className={clsx('text-xs font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
            {Math.round((contacted / TOTAL_MATCHED_INVESTORS) * 100)}%
          </span>
        </div>
        <div className={clsx('w-full h-2 rounded-full overflow-hidden', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(contacted / TOTAL_MATCHED_INVESTORS) * 100}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['Investisseur', 'Ticket visé', 'Statut', 'Dernier contact', 'Prochaine action'].map(h => (
                <th key={h} className={clsx('text-left text-xs font-medium pb-2 pr-3', h === 'Dernier contact' ? 'hidden sm:table-cell' : '', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(inv => <InvestorRow key={inv.id} inv={inv} darkMode={darkMode} />)}
          </tbody>
        </table>
      </div>

      {pipeline.length > 5 && (
        <button
          onClick={() => setShowAll(p => !p)}
          className={clsx('mt-3 flex items-center gap-1 text-xs font-medium hover:underline', darkMode ? 'text-gray-400' : 'text-gray-500')}
        >
          <ChevronRight className={clsx('h-3.5 w-3.5 transition-transform', showAll && 'rotate-90')} />
          {showAll ? 'Masquer' : `Voir tout le pipeline (${pipeline.length})`}
        </button>
      )}
    </div>
  );
};

export default DilutivePipeline;
