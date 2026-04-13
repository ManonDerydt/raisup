import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { mockStartup } from '../../data/dashboardMock';

const STAGE_LABELS: Record<string, string> = {
  'pre-seed': 'Pre-seed', 'seed': 'Seed', 'series-a': 'Série A', 'series-b': 'Série B',
};

interface Props { darkMode: boolean }

const DashboardHeader: React.FC<Props> = ({ darkMode }) => {
  const { name, founderFirstName, stage, profileCompletion } = mockStartup;

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  // Capitalize first letter
  const dateStr = today.charAt(0).toUpperCase() + today.slice(1);

  const needsCompletion = profileCompletion < 80;

  return (
    <div className={clsx(
      'rounded-xl border p-6',
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left — greeting */}
        <div>
          <p className={clsx('text-sm mb-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>{dateStr}</p>
          <h1 className={clsx('text-2xl font-bold mb-1', darkMode ? 'text-white' : 'text-gray-900')}>
            Bonjour {founderFirstName} 👋
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx('text-sm font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
              {name}
            </span>
            <span className={clsx(
              'text-xs px-2.5 py-0.5 rounded-full font-medium',
              darkMode ? 'bg-gray-700 text-gray-200' : 'bg-secondary-light text-primary',
            )}>
              {STAGE_LABELS[stage] ?? stage}
            </span>
          </div>
        </div>

        {/* Right — profile completion */}
        <div className={clsx(
          'rounded-xl p-4 min-w-[220px]',
          needsCompletion
            ? darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
            : darkMode ? 'bg-gray-700/50' : 'bg-gray-50',
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-600')}>
              Complétion du profil
            </span>
            {needsCompletion
              ? <AlertCircle className="h-4 w-4 text-orange-500" />
              : <CheckCircle className="h-4 w-4 text-green-500" />
            }
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className={clsx('flex-1 h-2 rounded-full overflow-hidden', darkMode ? 'bg-gray-600' : 'bg-gray-200')}>
              <div
                className={clsx('h-full rounded-full transition-all duration-500', needsCompletion ? 'bg-orange-500' : 'bg-green-500')}
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className={clsx('text-sm font-bold w-10 text-right', darkMode ? 'text-white' : 'text-gray-900')}>
              {profileCompletion}%
            </span>
          </div>
          {needsCompletion && (
            <Link
              to="/register/startup"
              className="inline-flex items-center text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              Compléter mon profil →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
