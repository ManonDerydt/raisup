import React, { useState } from 'react';
import { Building, FileText, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { mockNonDilutivePipeline, TOTAL_ND_POTENTIAL, NonDilutiveStatus, NonDilutiveDevice } from '../../data/dashboardMock';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<NonDilutiveStatus, { label: string; bg: string; text: string }> = {
  'eligible':    { label: 'Éligible',          bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'in-progress': { label: 'Dossier en cours',  bg: 'bg-orange-100', text: 'text-orange-700' },
  'submitted':   { label: 'Déposé',            bg: 'bg-violet-100', text: 'text-violet-700' },
  'in-review':   { label: 'En instruction',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'granted':     { label: 'Accordé',           bg: 'bg-green-100',  text: 'text-green-700'  },
  'refused':     { label: 'Refusé',            bg: 'bg-red-100',    text: 'text-red-700'    },
};

const StatusBadge: React.FC<{ status: NonDilutiveStatus }> = ({ status }) => {
  const { label, bg, text } = STATUS_CONFIG[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', bg, text)}>
      {label}
    </span>
  );
};

// ─── Row ──────────────────────────────────────────────────────────────────────
const DeviceRow: React.FC<{ device: NonDilutiveDevice; darkMode: boolean }> = ({ device, darkMode }) => {
  const fmt = (n: number) => n >= 1_000_000 ? `${n / 1_000_000}M€` : `${(n / 1000).toFixed(0)}K€`;

  const deadlineStr = device.deadline
    ? new Date(device.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const daysLeft = device.deadline
    ? Math.ceil((new Date(device.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const urgentDeadline = daysLeft !== null && daysLeft <= 30 && device.status !== 'refused';

  return (
    <tr className={clsx('border-t text-sm', darkMode ? 'border-gray-700' : 'border-gray-100')}>
      <td className="py-3 pr-3">
        <p className={clsx('font-medium', darkMode ? 'text-white' : 'text-gray-900')}>{device.name}</p>
        <p className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{device.organism}</p>
      </td>
      <td className={clsx('py-3 pr-3 text-sm font-semibold', device.status === 'refused' ? 'text-gray-400 line-through' : darkMode ? 'text-green-400' : 'text-green-700')}>
        {device.status !== 'refused' ? fmt(device.potentialAmount) : fmt(device.potentialAmount)}
      </td>
      <td className="py-3 pr-3"><StatusBadge status={device.status} /></td>
      <td className="py-3 pr-3 hidden sm:table-cell">
        <span className={clsx('text-xs', urgentDeadline ? 'text-orange-500 font-semibold' : darkMode ? 'text-gray-400' : 'text-gray-500')}>
          {deadlineStr}{urgentDeadline && daysLeft !== null ? ` (J-${daysLeft})` : ''}
        </span>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <span className={clsx('text-xs hidden md:inline', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            {device.nextStep}
          </span>
          {device.status !== 'refused' && device.status !== 'granted' && (
            <button className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary text-white hover:bg-opacity-90 transition">
              <FileText className="h-3 w-3" />
              Dossier
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { darkMode: boolean }

const NonDilutivePipeline: React.FC<Props> = ({ darkMode }) => {
  const [showAll, setShowAll] = useState(false);
  const pipeline = mockNonDilutivePipeline;
  const visible = showAll ? pipeline : pipeline.slice(0, 4);

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M€` : `${(n / 1000).toFixed(0)}K€`;

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={clsx('p-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-secondary-light')}>
            <Building className="h-4 w-4 text-primary" />
          </div>
          <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
            Pipeline non-dilutif
          </h2>
        </div>
      </div>

      {/* Total potential banner */}
      <div className={clsx(
        'flex items-center gap-3 p-3 rounded-xl mb-4 border',
        darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100',
      )}>
        <div className="flex-1">
          <p className={clsx('text-xs font-medium', darkMode ? 'text-green-300' : 'text-green-700')}>
            Financements non-dilutifs disponibles pour votre profil
          </p>
          <p className={clsx('text-xl font-black', darkMode ? 'text-green-300' : 'text-green-700')}>
            Jusqu'à {fmt(TOTAL_ND_POTENTIAL)}
          </p>
        </div>
        <span className="text-2xl">🌱</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {['Dispositif', 'Montant potentiel', 'Statut', 'Deadline', 'Prochaine étape'].map(h => (
                <th key={h} className={clsx(
                  'text-left text-xs font-medium pb-2 pr-3',
                  h === 'Deadline' ? 'hidden sm:table-cell' : '',
                  h === 'Prochaine étape' ? '' : '',
                  darkMode ? 'text-gray-400' : 'text-gray-500',
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(d => <DeviceRow key={d.id} device={d} darkMode={darkMode} />)}
          </tbody>
        </table>
      </div>

      {pipeline.length > 4 && (
        <button
          onClick={() => setShowAll(p => !p)}
          className={clsx('mt-3 flex items-center gap-1 text-xs font-medium hover:underline', darkMode ? 'text-gray-400' : 'text-gray-500')}
        >
          <ChevronRight className={clsx('h-3.5 w-3.5 transition-transform', showAll && 'rotate-90')} />
          {showAll ? 'Masquer' : `Voir tout (${pipeline.length})`}
        </button>
      )}
    </div>
  );
};

export default NonDilutivePipeline;
