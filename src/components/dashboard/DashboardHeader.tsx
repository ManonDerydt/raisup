import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MapPin, Mail } from 'lucide-react';
import clsx from 'clsx';
import { UserProfile } from '../../hooks/useUserProfile';

const STAGE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  'pre-seed': { label: 'Pre-seed', bg: '#D8FFBD', color: '#2D6A00' },
  'seed':     { label: 'Seed',     bg: '#ABC5FE', color: '#1A3A8F' },
  'series-a': { label: 'Série A',  bg: '#CDB4FF', color: '#3D0D8F' },
};

interface Props {
  darkMode: boolean;
  profile: UserProfile;
}

const DashboardHeader: React.FC<Props> = ({ darkMode, profile }) => {
  const { firstName, lastName, email, startupName, sector, stage, profileCompletion, city, country } = profile;

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const dateStr = today.charAt(0).toUpperCase() + today.slice(1);

  const stageBadge = STAGE_LABELS[stage] ?? STAGE_LABELS['pre-seed'];
  const needsCompletion = profileCompletion < 80;
  const initials = `${firstName[0] ?? '?'}${lastName[0] ?? ''}`.toUpperCase();
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Fondateur';
  const location = [city, country].filter(Boolean).join(', ');

  return (
    <div className={clsx('rounded-xl border p-6', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Left — greeting + identity */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black flex-shrink-0"
            style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}
          >
            {initials}
          </div>

          <div>
            <p className={clsx('text-xs mb-1', darkMode ? 'text-gray-400' : 'text-gray-400')}>{dateStr}</p>
            <h1 className={clsx('text-2xl font-bold leading-tight', darkMode ? 'text-white' : 'text-gray-900')}>
              Bonjour, {firstName || 'Fondateur'}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {startupName && (
                <span className={clsx('text-sm font-semibold', darkMode ? 'text-gray-300' : 'text-gray-700')}>
                  {startupName}
                </span>
              )}
              {sector && (
                <span className={clsx('text-xs', darkMode ? 'text-gray-500' : 'text-gray-400')}>· {sector}</span>
              )}
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: stageBadge.bg, color: stageBadge.color }}
              >
                {stageBadge.label}
              </span>
            </div>
            {/* Contact info */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {email && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Mail className="h-3 w-3" /> {email}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" /> {location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right — profile completion */}
        <div className={clsx(
          'rounded-xl p-4 min-w-[220px]',
          needsCompletion
            ? darkMode ? 'bg-pink-900/10 border border-pink-700/30' : 'bg-pink-50 border border-pink-200'
            : darkMode ? 'bg-gray-700/50' : 'bg-gray-50',
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-600')}>
              Complétion du profil
            </span>
            {!needsCompletion
              ? <CheckCircle className="h-4 w-4 text-green-500" />
              : <span className="w-4 h-4 rounded-full border-2 border-pink-400" />
            }
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className={clsx('flex-1 h-2 rounded-full overflow-hidden', darkMode ? 'bg-gray-600' : 'bg-gray-200')}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${profileCompletion}%`, backgroundColor: needsCompletion ? '#F4B8CC' : '#22c55e' }}
              />
            </div>
            <span className={clsx('text-sm font-bold w-10 text-right', darkMode ? 'text-white' : 'text-gray-900')}>
              {profileCompletion}%
            </span>
          </div>
          {needsCompletion && (
            <Link
              to="/register/startup"
              className="inline-flex items-center text-xs font-semibold hover:underline"
              style={{ color: '#C4728A' }}
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
