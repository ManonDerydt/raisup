import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Calendar, ArrowRight, Zap } from 'lucide-react';
import clsx from 'clsx';
import { mockDocuments, mockInvestorUpdate, mockNextMeeting, mockRecommendedActions } from '../../data/dashboardMock';

// ─── Quick action card ────────────────────────────────────────────────────────
const ActionCard: React.FC<{
  icon: React.ElementType;
  title: string;
  meta: string;
  ctaLabel: string;
  ctaHref: string;
  darkMode: boolean;
}> = ({ icon: Icon, title, meta, ctaLabel, ctaHref, darkMode }) => (
  <div className={clsx('rounded-xl border p-4 flex flex-col gap-3', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
    <div className="flex items-center gap-2">
      <div className={clsx('p-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-secondary-light')}>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>{title}</span>
    </div>
    <p className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{meta}</p>
    <Link
      to={ctaHref}
      className="mt-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-raisup-black text-white text-xs font-semibold hover:opacity-80 transition"
    >
      {ctaLabel}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

// ─── Recommended action item ──────────────────────────────────────────────────
const RecommendedActionItem: React.FC<{
  action: typeof mockRecommendedActions[0];
  darkMode: boolean;
}> = ({ action, darkMode }) => {
  const priorityColors = {
    high:   darkMode ? 'border-l-red-500 bg-red-900/10'    : 'border-l-red-400 bg-red-50',
    medium: darkMode ? 'border-l-orange-500 bg-orange-900/10' : 'border-l-orange-400 bg-orange-50',
    low:    darkMode ? 'border-l-blue-500 bg-blue-900/10'  : 'border-l-blue-400 bg-blue-50',
  };

  return (
    <div className={clsx('flex items-start gap-3 p-3 rounded-xl border-l-4', priorityColors[action.priority])}>
      <span className="text-xl flex-shrink-0">{action.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-semibold mb-0.5', darkMode ? 'text-white' : 'text-gray-900')}>{action.title}</p>
        <p className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-600')}>{action.description}</p>
      </div>
      <Link
        to={action.href}
        className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-raisup-pink-dark hover:underline transition whitespace-nowrap"
      >
        {action.cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
interface Props { darkMode: boolean }

const DocumentsActions: React.FC<Props> = ({ darkMode }) => {
  const docs = mockDocuments;
  const update = mockInvestorUpdate;
  const meeting = mockNextMeeting;
  const actions = mockRecommendedActions;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-4">
      {/* 3 quick cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard
          icon={FileText}
          title="Mes documents"
          meta={`${docs.count} documents générés · Dernière génération le ${fmtDate(docs.lastGenerated)}`}
          ctaLabel="Générer / Mettre à jour"
          ctaHref="/dashboard/generate"
          darkMode={darkMode}
        />
        <ActionCard
          icon={Mail}
          title="Investor Update"
          meta={`Dernier envoi le ${fmtDate(update.lastSent)} · Envoi mensuel recommandé`}
          ctaLabel="Générer l'update du mois"
          ctaHref="/dashboard/generate"
          darkMode={darkMode}
        />
        <ActionCard
          icon={Calendar}
          title="Prochain rendez-vous"
          meta={`${fmtDate(meeting.date)} avec ${meeting.investor} — ${meeting.type}`}
          ctaLabel="Planifier un RDV"
          ctaHref="/dashboard/fundraising"
          darkMode={darkMode}
        />
      </div>

      {/* Recommended actions */}
      <div className={clsx('rounded-xl border p-5', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
            Prochaines actions recommandées par Raisup
          </h3>
        </div>
        <div className="space-y-2">
          {actions.map(a => <RecommendedActionItem key={a.id} action={a} darkMode={darkMode} />)}
        </div>
      </div>
    </div>
  );
};

export default DocumentsActions;
