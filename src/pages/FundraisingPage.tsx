import React, { useState, useEffect } from 'react';
import {
  Zap,
  Building,
  Users,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Star,
  Sparkles,
  CheckCircle,
  Info,
  Calendar,
  Target,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import clsx from 'clsx';
import testStartups, { TestStartup } from '../data/testStartups';
import { matchInvestors, MatchResult, scoreBadgeColor, investorTypeLabel, formatTicket } from '../services/matchInvestors';

// ─── Score badge ───────────────────────────────────────────────────────────────
const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = scoreBadgeColor(score);
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
      color === 'green'  && 'bg-green-100 text-green-700',
      color === 'orange' && 'bg-orange-100 text-orange-700',
      color === 'red'    && 'bg-red-100 text-red-700',
    )}>
      {score}%
    </span>
  );
};

// ─── Investor card ─────────────────────────────────────────────────────────────
const InvestorCard: React.FC<{ result: MatchResult; darkMode: boolean }> = ({ result, darkMode }) => {
  const { investor, score, whyMatch } = result;
  const [expanded, setExpanded] = useState(false);
  const [applied, setApplied] = useState(false);
  const color = scoreBadgeColor(score);

  const handleApply = () => {
    window.open(investor.website, '_blank', 'noopener,noreferrer');
    setApplied(true);
  };

  return (
    <div className={clsx(
      'rounded-xl border transition-all duration-200',
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      color === 'green'  && 'border-l-4 border-l-green-400',
      color === 'orange' && 'border-l-4 border-l-orange-400',
      color === 'red'    && 'border-l-4 border-l-red-400',
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={clsx('text-sm font-semibold truncate', darkMode ? 'text-white' : 'text-gray-900')}>
                {investor.name}
              </span>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full', darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')}>
                {investorTypeLabel(investor.type)}
              </span>
              {applied && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Candidature envoyée
                </span>
              )}
            </div>
            <p className={clsx('text-xs mb-2', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              {investor.description}
            </p>
            {/* Why match */}
            <div className={clsx('flex items-start gap-1.5 text-xs rounded-lg px-2 py-1.5', darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600')}>
              <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <span>{whyMatch}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <ScoreBadge score={score} />
            <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
              {formatTicket(investor.ticketMin, investor.ticketMax)}
            </span>
          </div>
        </div>

        {/* Actions row */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setExpanded(p => !p)}
            className={clsx(
              'flex items-center gap-1 text-xs font-medium transition-colors',
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            <ChevronRight className={clsx('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
            {expanded ? 'Masquer' : 'Voir les détails'}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleApply}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              applied
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-primary text-white hover:bg-opacity-90 active:scale-95'
            )}
          >
            {applied
              ? <><CheckCircle className="h-3.5 w-3.5" /> Postulé</>
              : <><Send className="h-3.5 w-3.5" /> Postuler</>
            }
          </button>
        </div>

        {expanded && (
          <div className={clsx('mt-3 pt-3 border-t space-y-2', darkMode ? 'border-gray-700' : 'border-gray-100')}>
            {/* Sectors */}
            <div>
              <p className={clsx('text-xs font-medium mb-1', darkMode ? 'text-gray-300' : 'text-gray-600')}>Secteurs</p>
              <div className="flex flex-wrap gap-1">
                {investor.sectors.map(s => (
                  <span key={s} className={clsx('text-xs px-2 py-0.5 rounded-full', darkMode ? 'bg-gray-700 text-gray-300' : 'bg-secondary-light text-primary')}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Criteria */}
            <div>
              <p className={clsx('text-xs font-medium mb-1', darkMode ? 'text-gray-300' : 'text-gray-600')}>Critères clés</p>
              <ul className="space-y-0.5">
                {investor.criteria.map(c => (
                  <li key={c} className={clsx('text-xs flex items-center gap-1.5', darkMode ? 'text-gray-400' : 'text-gray-600')}>
                    <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stages */}
            <div className="flex items-center gap-2 flex-wrap">
              <p className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-600')}>Stades :</p>
              {investor.stages.map(s => (
                <span key={s} className={clsx('text-xs px-2 py-0.5 rounded-full border', darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600')}>
                  {s}
                </span>
              ))}
            </div>

            {/* Website */}
            <a href={investor.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" />
              {investor.website.replace('https://', '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Score breakdown bar ───────────────────────────────────────────────────────
const BreakdownBar: React.FC<{ label: string; value: number; max: number; darkMode: boolean }> = ({
  label, value, max, darkMode
}) => (
  <div className="flex items-center gap-2">
    <span className={clsx('text-xs w-14 flex-shrink-0', darkMode ? 'text-gray-400' : 'text-gray-500')}>{label}</span>
    <div className={clsx('flex-1 h-1.5 rounded-full', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className={clsx('text-xs w-8 text-right', darkMode ? 'text-gray-300' : 'text-gray-700')}>
      {value}/{max}
    </span>
  </div>
);

// ─── Funding strategy helpers ──────────────────────────────────────────────────
function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    'pre-seed': 'Pre-seed', 'seed': 'Seed', 'series-a': 'Série A', 'series-b': 'Série B',
  };
  return map[stage] ?? stage;
}

function stageTimeline(stage: string): string {
  const map: Record<string, string> = {
    'pre-seed': '3 – 5 mois', 'seed': '4 – 6 mois',
    'series-a': '6 – 9 mois', 'series-b': '9 – 12 mois',
  };
  return map[stage] ?? '4 – 6 mois';
}

function computeMix(startup: TestStartup, nonDilutiveResults: MatchResult[]) {
  // Sum of top-3 non-dilutive max tickets, capped at 40% of funding need
  const cap = startup.fundingAmount * 0.4;
  const ndPotential = Math.min(
    nonDilutiveResults.slice(0, 3).reduce((acc, r) => acc + r.investor.ticketMax, 0),
    cap
  );
  const dilutiveNeeded = startup.fundingAmount - ndPotential;
  const ndPct = Math.round((ndPotential / startup.fundingAmount) * 100);
  const dPct = 100 - ndPct;
  return { ndPotential, dilutiveNeeded, ndPct, dPct };
}

// ─── Funding strategy block ────────────────────────────────────────────────────
const FundingStrategy: React.FC<{
  startup: TestStartup;
  nonDilutiveResults: MatchResult[];
  darkMode: boolean;
}> = ({ startup, nonDilutiveResults, darkMode }) => {
  const { ndPotential, dilutiveNeeded, ndPct, dPct } = computeMix(startup, nonDilutiveResults);
  const fmt = (n: number) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M€`
    : `${Math.round(n / 1000)}K€`;

  const tile = clsx('flex-1 rounded-xl p-4', darkMode ? 'bg-gray-700/60' : 'bg-gray-50');

  return (
    <div className={clsx(
      'rounded-xl border p-5 mb-6',
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    )}>
      <div className="flex items-center gap-2 mb-5">
        <div className={clsx('p-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-secondary-light')}>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
          Stratégie de financement recommandée
        </h2>
      </div>

      {/* 3 KPI tiles */}
      <div className="flex gap-3 mb-5 flex-wrap sm:flex-nowrap">
        {/* Stage */}
        <div className={tile}>
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Stade actuel
            </span>
          </div>
          <p className={clsx('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
            {stageLabel(startup.stage)}
          </p>
          <p className={clsx('text-xs', darkMode ? 'text-gray-500' : 'text-gray-400')}>
            {startup.location}
          </p>
        </div>

        {/* Objective */}
        <div className={tile}>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
            <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Objectif de levée
            </span>
          </div>
          <p className={clsx('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
            {fmt(startup.fundingAmount)}
          </p>
          <p className={clsx('text-xs', darkMode ? 'text-gray-500' : 'text-gray-400')}>
            dont {fmt(ndPotential)} non-dilutif possible
          </p>
        </div>

        {/* Timeline */}
        <div className={tile}>
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Délai estimé
            </span>
          </div>
          <p className={clsx('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
            {stageTimeline(startup.stage)}
          </p>
          <p className={clsx('text-xs', darkMode ? 'text-gray-500' : 'text-gray-400')}>
            Pour boucler la levée
          </p>
        </div>
      </div>

      {/* Mix bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={clsx('text-xs font-medium', darkMode ? 'text-gray-300' : 'text-gray-700')}>
            Mix recommandé
          </span>
          <span className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            {fmt(dilutiveNeeded)} dilutif + {fmt(ndPotential)} non-dilutif
          </span>
        </div>
        <div className={clsx('w-full h-5 rounded-full overflow-hidden flex', darkMode ? 'bg-gray-700' : 'bg-gray-100')}>
          <div
            className="h-full bg-primary flex items-center justify-center transition-all duration-700"
            style={{ width: `${dPct}%` }}
          >
            {dPct > 15 && <span className="text-white text-xs font-bold">{dPct}%</span>}
          </div>
          <div
            className="h-full bg-green-400 flex items-center justify-center transition-all duration-700"
            style={{ width: `${ndPct}%` }}
          >
            {ndPct > 10 && <span className="text-white text-xs font-bold">{ndPct}%</span>}
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
            Dilutif ({dPct}% · {fmt(dilutiveNeeded)})
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />
            Non-dilutif ({ndPct}% · {fmt(ndPotential)})
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const FundraisingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<TestStartup | null>(null);
  const [activeTab, setActiveTab] = useState<'dilutive' | 'non-dilutive'>('dilutive');

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Compute match results whenever selected startup changes
  const matchResults = selectedStartup ? matchInvestors(selectedStartup) : null;

  const card = clsx(
    'rounded-xl border shadow-sm p-6',
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  );

  const labelCls = clsx('text-sm font-medium', darkMode ? 'text-gray-200' : 'text-gray-700');

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-full', darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900')}>
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={clsx('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
              Matching Investisseurs
            </h1>
            <p className={clsx('mt-1 text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              Algorithme de matching par secteur, stade, ticket et localisation
            </p>
          </div>

          {/* Demo mode toggle */}
          <button
            onClick={() => {
              setDemoMode(p => !p);
              if (!demoMode) setSelectedStartup(null);
            }}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              demoMode
                ? 'bg-primary text-white border-primary'
                : darkMode
                  ? 'bg-gray-800 border-gray-600 text-gray-200 hover:border-gray-400'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-primary'
            )}
          >
            {demoMode ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            Mode démo
          </button>
        </div>

        {/* ── Demo mode — startup selector ── */}
        {demoMode && (
          <div className={clsx(card, 'mb-6')}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                Testez avec 5 profils startups réels
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {testStartups.map(startup => (
                <button
                  key={startup.id}
                  onClick={() => setSelectedStartup(startup)}
                  className={clsx(
                    'text-left p-3 rounded-xl border transition-all duration-150',
                    selectedStartup?.id === startup.id
                      ? 'border-primary bg-secondary-light ring-1 ring-primary'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-400 bg-gray-700/50'
                        : 'border-gray-200 hover:border-primary bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{startup.emoji}</span>
                    <span className={clsx('text-sm font-semibold truncate', darkMode ? 'text-white' : 'text-gray-900')}>
                      {startup.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white border border-gray-200 text-gray-600')}>
                      {startup.sector}
                    </span>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded', darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white border border-gray-200 text-gray-600')}>
                      {startup.stage}
                    </span>
                  </div>
                  <p className={clsx('text-xs leading-snug', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                    {(startup.fundingAmount / 1000).toFixed(0)}K€ recherchés
                    {startup.mrr > 0 ? ` · ${(startup.mrr / 1000).toFixed(0)}K€ MRR` : ' · Pre-revenue'}
                  </p>
                </button>
              ))}
            </div>

            {!selectedStartup && (
              <p className={clsx('text-xs mt-3 flex items-center gap-1.5', darkMode ? 'text-gray-500' : 'text-gray-400')}>
                <Info className="h-3.5 w-3.5" />
                Sélectionne un profil pour voir les investisseurs matchés
              </p>
            )}
          </div>
        )}

        {/* ── No profile selected ── */}
        {!selectedStartup && (
          <div className={clsx(card, 'text-center py-16')}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary-light mb-4">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <h2 className={clsx('text-lg font-semibold mb-2', darkMode ? 'text-white' : 'text-gray-900')}>
              {demoMode ? 'Choisis un profil ci-dessus' : 'Active le mode démo'}
            </h2>
            <p className={clsx('text-sm max-w-sm mx-auto', darkMode ? 'text-gray-400' : 'text-gray-500')}>
              {demoMode
                ? 'Clique sur un des 5 profils pour lancer le matching et voir les investisseurs compatibles.'
                : 'Active le mode démo en haut à droite pour tester le matching avec 5 profils startups prédéfinis — sans remplir le formulaire complet.'}
            </p>
            {!demoMode && (
              <button
                onClick={() => setDemoMode(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition"
              >
                <ToggleRight className="h-4 w-4" />
                Activer le mode démo
              </button>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {selectedStartup && matchResults && (
          <>
            {/* Startup recap */}
            <div className={clsx(card, 'mb-6')}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{selectedStartup.emoji}</span>
                    <h2 className={clsx('text-lg font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
                      {selectedStartup.name}
                    </h2>
                  </div>
                  <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                    {selectedStartup.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Secteur', val: selectedStartup.sector },
                    { label: 'Stade', val: selectedStartup.stage },
                    { label: 'Besoin', val: `${(selectedStartup.fundingAmount / 1000).toFixed(0)}K€` },
                    { label: 'MRR', val: selectedStartup.mrr > 0 ? `${(selectedStartup.mrr / 1000).toFixed(0)}K€` : '0' },
                    { label: 'Ville', val: selectedStartup.location },
                  ].map(({ label, val }) => (
                    <div key={label} className={clsx('px-3 py-1.5 rounded-lg', darkMode ? 'bg-gray-700' : 'bg-gray-50')}>
                      <p className={clsx('text-xs', darkMode ? 'text-gray-400' : 'text-gray-500')}>{label}</p>
                      <p className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score breakdown of best match */}
              {matchResults.dilutive[0] && (
                <div className={clsx('mt-4 pt-4 border-t', darkMode ? 'border-gray-700' : 'border-gray-100')}>
                  <p className={clsx('text-xs font-medium mb-2', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                    Détail du scoring — meilleur match ({matchResults.dilutive[0].investor.name})
                  </p>
                  <div className="space-y-1.5">
                    <BreakdownBar label="Secteur" value={matchResults.dilutive[0].breakdown.sector} max={40} darkMode={darkMode} />
                    <BreakdownBar label="Stade" value={matchResults.dilutive[0].breakdown.stage} max={30} darkMode={darkMode} />
                    <BreakdownBar label="Ticket" value={matchResults.dilutive[0].breakdown.ticket} max={20} darkMode={darkMode} />
                    <BreakdownBar label="Localisation" value={matchResults.dilutive[0].breakdown.location} max={10} darkMode={darkMode} />
                  </div>
                </div>
              )}
            </div>

            {/* Funding strategy */}
            <FundingStrategy
              startup={selectedStartup}
              nonDilutiveResults={matchResults.nonDilutive}
              darkMode={darkMode}
            />

            {/* Tabs */}
            <div className={clsx('flex rounded-xl border overflow-hidden mb-4', darkMode ? 'border-gray-700' : 'border-gray-200')}>
              {(['dilutive', 'non-dilutive'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all',
                    activeTab === tab
                      ? darkMode ? 'bg-gray-800 text-white' : 'bg-white text-primary'
                      : darkMode ? 'bg-gray-700/50 text-gray-400 hover:text-gray-200' : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab === 'dilutive'
                    ? <><Users className="h-4 w-4" /> Dilutif ({matchResults.dilutive.length})</>
                    : <><Building className="h-4 w-4" /> Non dilutif ({matchResults.nonDilutive.length})</>
                  }
                </button>
              ))}
            </div>

            {/* Dilutive investors */}
            {activeTab === 'dilutive' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={clsx(labelCls, 'font-semibold')}>
                    Top {matchResults.dilutive.length} investisseurs matchés
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />≥ 80%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />50–79%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{'< 50%'}</span>
                  </div>
                </div>
                {matchResults.dilutive.length === 0 ? (
                  <div className={clsx(card, 'text-center py-10')}>
                    <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                      Aucun investisseur dilutif compatible pour ce profil.
                    </p>
                  </div>
                ) : (
                  matchResults.dilutive.map(result => (
                    <InvestorCard key={result.investor.id} result={result} darkMode={darkMode} />
                  ))
                )}
              </div>
            )}

            {/* Non-dilutive */}
            {activeTab === 'non-dilutive' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={clsx(labelCls, 'font-semibold')}>
                    Top {matchResults.nonDilutive.length} dispositifs non-dilutifs éligibles
                  </h3>
                  <span className={clsx('text-xs px-2 py-1 rounded-full', darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700')}>
                    Zéro dilution
                  </span>
                </div>
                {matchResults.nonDilutive.length === 0 ? (
                  <div className={clsx(card, 'text-center py-10')}>
                    <p className={clsx('text-sm', darkMode ? 'text-gray-400' : 'text-gray-500')}>
                      Aucun dispositif non-dilutif compatible pour ce profil.
                    </p>
                  </div>
                ) : (
                  matchResults.nonDilutive.map(result => (
                    <InvestorCard key={result.investor.id} result={result} darkMode={darkMode} />
                  ))
                )}

                {/* Info box */}
                <div className={clsx(
                  'flex gap-3 p-4 rounded-xl border mt-4',
                  darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'
                )}>
                  <TrendingUp className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-0.5">Conseil stratégique</p>
                    <p className="text-xs leading-relaxed opacity-90">
                      Combiner le CIR avec une levée dilutive permet de réduire le montant levé de 15–30%
                      et donc la dilution des fondateurs. C'est le white space que Raisup est le seul à combiner.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FundraisingPage;
