import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Send, PieChart, Shield, Settings,
  ArrowLeft, Calendar, Check,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ComingSoonProps {
  pageName: string;
  description: string;
  expectedDate?: string;
  icon?: string;
  bullets?: string[];
}

// ─── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  BarChart2: ({ size = 48, color }) => <BarChart2 width={size} height={size} color={color} />,
  Send:      ({ size = 48, color }) => <Send      width={size} height={size} color={color} />,
  PieChart:  ({ size = 48, color }) => <PieChart  width={size} height={size} color={color} />,
  Shield:    ({ size = 48, color }) => <Shield    width={size} height={size} color={color} />,
  Settings:  ({ size = 48, color }) => <Settings  width={size} height={size} color={color} />,
};

// ─── Component ─────────────────────────────────────────────────────────────────

const ComingSoon: React.FC<ComingSoonProps> = ({
  pageName,
  description,
  expectedDate,
  icon = 'Settings',
  bullets = [],
}) => {
  const navigate = useNavigate();
  const IconComponent = ICON_MAP[icon] ?? ICON_MAP['Settings'];

  return (
    <div
      className="flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: '#F8F8F8', minHeight: 'calc(100vh - 64px)' }}
    >
      <div
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: 520,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 48,
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center mb-5"
          style={{
            width: 80, height: 80,
            backgroundColor: '#FFD6E5',
            borderRadius: 20,
          }}
        >
          <IconComponent size={38} color="#C4728A" />
        </div>

        {/* Badge */}
        <span
          className="mb-5 font-semibold tracking-wide"
          style={{
            backgroundColor: '#FFD6E5',
            color: '#C4728A',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 12,
          }}
        >
          EN DÉVELOPPEMENT
        </span>

        {/* Title */}
        <h1
          className="font-bold text-center mb-3"
          style={{ fontSize: 22, color: '#0A0A0A', lineHeight: 1.3 }}
        >
          {pageName}
        </h1>

        {/* Description */}
        <p
          className="text-center mb-4"
          style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, maxWidth: 380 }}
        >
          {description}
        </p>

        {/* Expected date */}
        {expectedDate && (
          <div className="flex items-center gap-1.5 mb-4">
            <Calendar style={{ width: 14, height: 14, color: '#9CA3AF' }} />
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              Disponible {expectedDate}
            </span>
          </div>
        )}

        {/* Separator */}
        <div className="w-full my-6" style={{ height: 1, backgroundColor: '#F3F4F6' }} />

        {/* Bullets */}
        {bullets.length > 0 && (
          <div className="w-full mb-6">
            <p className="font-semibold mb-3" style={{ fontSize: 13, color: '#374151' }}>
              Ce que vous pourrez faire ici
            </p>
            <ul className="space-y-2.5">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full mt-0.5"
                    style={{ width: 18, height: 18, backgroundColor: '#FFD6E5' }}
                  >
                    <Check style={{ width: 10, height: 10, color: '#C4728A', strokeWidth: 3 }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 font-semibold transition-opacity hover:opacity-85"
          style={{
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            borderRadius: 50,
            padding: '13px 24px',
            fontSize: 14,
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Retour au dashboard →
        </button>

        {/* Notification note */}
        <p className="mt-4 text-center" style={{ fontSize: 12, color: '#9CA3AF' }}>
          Vous serez notifié par email dès que cette fonctionnalité est disponible
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;

// ─── Config par page ───────────────────────────────────────────────────────────

export const comingSoonConfig: Record<string, ComingSoonProps> = {
  '/dashboard/kpis': {
    pageName: 'Suivi des KPIs',
    icon: 'BarChart2',
    description: 'Saisissez vos métriques mensuelles et suivez leur évolution. Comparez-vous aux benchmarks de votre secteur.',
    expectedDate: 'Juillet 2026',
    bullets: [
      "MRR, croissance, churn et runway en un coup d'œil",
      'Comparaison avec les benchmarks sectoriels',
      "Graphiques d'évolution sur 12 mois",
    ],
  },
  '/dashboard/investor-update': {
    pageName: 'Investor Update',
    icon: 'Send',
    description: 'Générez automatiquement votre update mensuel investisseurs en 2 minutes à partir de vos KPIs.',
    expectedDate: 'Juillet 2026',
    bullets: [
      'Update mensuel généré par IA depuis vos données',
      'Template professionnel personnalisé',
      'Historique de tous vos updates envoyés',
    ],
  },
  '/dashboard/analytics': {
    pageName: 'Analyses',
    icon: 'PieChart',
    description: 'Analyses approfondies de votre dossier avec comparaisons sectorielles et recommandations détaillées.',
    expectedDate: 'Août 2026',
    bullets: [
      'Analyse comparative avec les startups de votre secteur',
      'Recommandations personnalisées par IA',
      'Rapport PDF exportable',
    ],
  },
  '/dashboard/non-dilutif': {
    pageName: 'Dossiers Non-dilutifs',
    icon: 'Shield',
    description: "Préparez et suivez vos dossiers de financement non-dilutif — BPI, CIR, Innov'up et plus encore.",
    expectedDate: 'Juin 2026',
    bullets: [
      'Dossiers pré-remplis automatiquement depuis votre profil',
      'Suivi du statut de chaque dossier',
      'Guides et contacts pour chaque dispositif',
    ],
  },
  '/dashboard/settings': {
    pageName: 'Paramètres',
    icon: 'Settings',
    description: 'Gérez votre compte, votre abonnement et vos préférences de notification.',
    expectedDate: 'Mai 2026',
    bullets: [
      "Gestion de l'abonnement et facturation",
      'Préférences de notifications',
      'Sécurité et données personnelles',
    ],
  },
};
