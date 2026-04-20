import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Star, TrendingUp, Target, Clock,
  UserCheck, BarChart2, FileText, Users, Send, Calendar, FileCheck,
  Trophy, RefreshCw, StickyNote, Activity, AlertTriangle, X, Plus,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';
import {
  AgencyDossierRow,
  updateDossierStatut,
  updateDossierNotes,
} from '../../services/agencyService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityRow {
  id?: string;
  type: string;
  description: string;
  created_at: string;
}

interface DeadlineRow {
  id: string;
  label: string;
  date_echeance: string;
  done: boolean;
  priority: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  'Onboarding en cours',
  'Analyse en cours',
  'Dossier prêt',
  'En prospection',
  'RDV investisseurs',
  'Term sheet',
  'Closé ✓',
  'En pause',
];

const STATUS_COLORS: Record<string, string> = {
  'Onboarding en cours': 'bg-gray-100 text-gray-700',
  'Analyse en cours':    'bg-blue-100 text-blue-700',
  'Dossier prêt':        'bg-purple-100 text-purple-700',
  'En prospection':      'bg-amber-100 text-amber-700',
  'RDV investisseurs':   'bg-orange-100 text-orange-700',
  'Term sheet':          'bg-green-100 text-green-700',
  'Closé ✓':             'bg-emerald-100 text-emerald-700',
  'En pause':            'bg-red-100 text-red-700',
};

const ACTIVITY_COLORS: Record<string, string> = {
  statut:   'bg-blue-100 text-blue-600',
  rdv:      'bg-purple-100 text-purple-600',
  document: 'bg-green-100 text-green-600',
  levee:    'bg-emerald-100 text-emerald-600',
  alerte:   'bg-red-100 text-red-600',
  note:     'bg-amber-100 text-amber-600',
  default:  'bg-gray-100 text-gray-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAmount = (n?: number | null) => {
  if (!n) return '0€';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
};

const formatDateLong = (d: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d));

const formatDateShort = (d: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'statut':   return <RefreshCw className="h-4 w-4" />;
    case 'rdv':      return <Calendar className="h-4 w-4" />;
    case 'document': return <FileText className="h-4 w-4" />;
    case 'levee':    return <TrendingUp className="h-4 w-4" />;
    case 'alerte':   return <AlertTriangle className="h-4 w-4" />;
    case 'note':     return <StickyNote className="h-4 w-4" />;
    default:         return <Activity className="h-4 w-4" />;
  }
};

// ─── Timeline steps ───────────────────────────────────────────────────────────

const getEtapes = (dossier: AgencyDossierRow) => [
  {
    id: 1,
    label: 'Onboarding complété',
    description: 'Profil Raisup rempli et données sauvegardées',
    done: true,
    date: dossier.created_at,
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    id: 2,
    label: 'Diagnostic Raisup effectué',
    description: 'Score calculé et analyse générée',
    done: (dossier.raisup_score ?? 0) > 0,
    date: (dossier.raisup_score ?? 0) > 0 ? dossier.created_at : null,
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    id: 3,
    label: 'Documents générés',
    description: 'Deck, Business Plan et Executive Summary prêts',
    done: false,
    date: null,
    action: 'Générer les documents →',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 4,
    label: 'Investisseurs identifiés',
    description: 'Matching investisseurs effectué et liste validée',
    done: ['En prospection', 'RDV investisseurs', 'Term sheet', 'Closé ✓'].includes(dossier.statut),
    date: null,
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 5,
    label: 'Campagne de prospection lancée',
    description: 'Emails envoyés aux investisseurs matchés',
    done: ['RDV investisseurs', 'Term sheet', 'Closé ✓'].includes(dossier.statut),
    date: null,
    icon: <Send className="h-4 w-4" />,
  },
  {
    id: 6,
    label: 'RDV investisseurs obtenus',
    description: 'Au moins un rendez-vous avec un investisseur',
    done: ['Term sheet', 'Closé ✓'].includes(dossier.statut),
    date: null,
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: 7,
    label: 'Term sheet reçu',
    description: "Offre d'investissement formelle reçue",
    done: dossier.statut === 'Closé ✓',
    date: null,
    icon: <FileCheck className="h-4 w-4" />,
  },
  {
    id: 8,
    label: 'Closing',
    description: `${formatAmount(dossier.montant_cible)} levés avec succès`,
    done: dossier.statut === 'Closé ✓',
    date: null,
    icon: <Trophy className="h-4 w-4" />,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

const B2BDossierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<AgencyDossierRow | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState('note');
  const [activityDesc, setActivityDesc] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);

  const loadDossier = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    try {
      // 1. Try agency_dossiers directly
      const { data: dossierData } = await supabase
        .from('agency_dossiers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (dossierData) {
        setDossier(dossierData as AgencyDossierRow);
        setNotes(dossierData.notes_partenaire || '');
        const { data: actData } = await supabase
          .from('agency_activities')
          .select('*')
          .eq('dossier_id', dossierData.id)
          .order('created_at', { ascending: false });
        setActivities(actData || []);
        setLoading(false);
        return;
      }

      // 2. Try partner_requests then look up associated agency_dossier
      const { data: prData } = await supabase
        .from('partner_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (prData) {
        const { data: agDossier } = await supabase
          .from('agency_dossiers')
          .select('*')
          .eq('agency_id', prData.agency_id)
          .eq('startup_name', prData.startup_name)
          .maybeSingle();

        if (agDossier) {
          setDossier(agDossier as AgencyDossierRow);
          setNotes(agDossier.notes_partenaire || '');
          const { data: actData } = await supabase
            .from('agency_activities')
            .select('*')
            .eq('dossier_id', agDossier.id)
            .order('created_at', { ascending: false });
          setActivities(actData || []);
        } else {
          // Synthetic dossier from partner_request data
          const synthetic: AgencyDossierRow = {
            id: prData.id,
            agency_id: prData.agency_id,
            startup_name: prData.startup_name,
            sector: '',
            stage: '',
            statut: prData.status === 'confirmed' ? 'Dossier prêt' : 'Onboarding en cours',
            raisup_score: prData.raisup_score || 0,
            montant_cible: 0,
            montant_leve: 0,
            mrr: 0,
            runway: 0,
            fondateur: prData.founder_name,
            derniere_action: '',
            notes_partenaire: '',
            created_at: prData.created_at,
            updated_at: prData.created_at,
          };
          setDossier(synthetic);
        }
      } else {
        setNotFound(true);
      }
    } catch (e) {
      console.error('B2BDossierDetail loadDossier error:', e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDossier(); }, [loadDossier]);

  // Debounced notes autosave
  useEffect(() => {
    if (!dossier || notes === (dossier.notes_partenaire || '')) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await updateDossierNotes(dossier.id, notes);
        setDossier(prev => prev ? { ...prev, notes_partenaire: notes } : prev);
      } catch { /* silent */ }
      setSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [notes, dossier]);

  const handleStatusChange = async (newStatut: string) => {
    if (!dossier || statusUpdating) return;
    setStatusUpdating(true);
    try {
      await updateDossierStatut(dossier.id, newStatut);
      const newAct: ActivityRow = {
        type: 'statut',
        description: `Statut mis à jour : ${newStatut}`,
        created_at: new Date().toISOString(),
      };
      await supabase.from('agency_activities').insert({
        dossier_id: dossier.id,
        agency_id: dossier.agency_id,
        type: 'statut',
        description: `Statut mis à jour : ${newStatut}`,
      });
      setDossier(prev => prev ? { ...prev, statut: newStatut } : prev);
      setActivities(prev => [newAct, ...prev]);
    } catch { /* silent */ }
    setStatusUpdating(false);
  };

  const handleAddActivity = async () => {
    if (!dossier || !activityDesc.trim()) return;
    setAddingActivity(true);
    try {
      const { data } = await supabase
        .from('agency_activities')
        .insert({
          dossier_id: dossier.id,
          agency_id: dossier.agency_id,
          type: activityType,
          description: activityDesc.trim(),
        })
        .select()
        .single();
      if (data) setActivities(prev => [data as ActivityRow, ...prev]);
    } catch { /* silent */ }
    setActivityDesc('');
    setShowActivityModal(false);
    setAddingActivity(false);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-10 px-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded mb-8" />
        <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-12 bg-gray-200 rounded-xl mb-6" />
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (notFound || !dossier) {
    return (
      <div className="py-10 px-6 max-w-4xl mx-auto text-center">
        <p className="text-gray-500 text-sm mb-4">Dossier introuvable.</p>
        <button
          onClick={() => navigate('/dashboard/b2b/portfolio')}
          className="text-pink-500 text-sm hover:underline"
        >
          ← Retour au portefeuille
        </button>
      </div>
    );
  }

  // ── Computed values ───────────────────────────────────────────────────────

  const etapes = getEtapes(dossier);
  const currentStep = etapes.find(e => !e.done);
  const completedCount = etapes.filter(e => e.done).length;
  const progressPct = Math.round((completedCount / etapes.length) * 100);

  const score = dossier.raisup_score ?? 0;
  const scoreColor = score >= 70 ? '#D8FFBD' : score >= 50 ? '#ABC5FE' : '#FFB3B3';
  const runwayVal = dossier.runway ?? 12;
  const runwayColor = runwayVal <= 4 ? '#FFB3B3' : runwayVal <= 8 ? '#FFB96D' : '#D8FFBD';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => navigate('/dashboard/b2b/portfolio')}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Portefeuille
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-700 font-medium">{dossier.startup_name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{dossier.startup_name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className={clsx(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
              STATUS_COLORS[dossier.statut] ?? 'bg-gray-100 text-gray-700'
            )}>
              {dossier.statut}
            </span>
            <span className="text-xs text-gray-400">
              Entré le {formatDateLong(dossier.created_at)}
            </span>
            {dossier.fondateur && (
              <span className="text-xs text-gray-500">· {dossier.fondateur}</span>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Score Raisup',
              value: score > 0 ? `${score}/100` : '—',
              bg: scoreColor,
              icon: <Star className="h-4 w-4 text-gray-600" />,
            },
            {
              label: 'MRR actuel',
              value: (dossier.mrr ?? 0) > 0 ? formatAmount(dossier.mrr) : 'Pre-revenue',
              bg: '#ABC5FE',
              icon: <TrendingUp className="h-4 w-4 text-gray-600" />,
            },
            {
              label: 'Objectif levée',
              value: formatAmount(dossier.montant_cible),
              bg: '#CDB4FF',
              icon: <Target className="h-4 w-4 text-gray-600" />,
            },
            {
              label: 'Runway',
              value: dossier.runway ? `${dossier.runway} mois` : '—',
              bg: runwayColor,
              icon: <Clock className="h-4 w-4 text-gray-600" />,
            },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">{card.label}</span>
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: card.bg + '60' }}>
                  {card.icon}
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">Progression du parcours</h2>
            <span className="text-sm font-bold text-gray-700">{progressPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #F4B8CC, #CDB4FF)' }}
            />
          </div>
          <p className="text-xs text-gray-400">{completedCount}/{etapes.length} étapes complétées</p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Timeline de progression</h2>
          <div>
            {etapes.map((etape, idx) => {
              const isCurrent = etape === currentStep;
              const isLast = idx === etapes.length - 1;
              return (
                <div key={etape.id} className="flex gap-4">
                  {/* Circle + connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      etape.done ? 'bg-green-500 text-white'
                        : isCurrent ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    )}>
                      {etape.icon}
                    </div>
                    {!isLast && (
                      <div className={clsx(
                        'w-0.5 flex-1 my-1',
                        etape.done ? 'bg-green-200' : 'bg-gray-200'
                      )} style={{ minHeight: '32px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={clsx(
                    'flex-1 pb-4',
                    isLast ? 'pb-0' : '',
                    isCurrent ? 'bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3' : ''
                  )}>
                    {isCurrent && (
                      <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                        Prochaine étape
                      </span>
                    )}
                    <p className={clsx('text-sm font-semibold',
                      etape.done ? 'text-gray-900'
                        : isCurrent ? 'text-blue-800'
                        : 'text-gray-400'
                    )}>
                      {etape.label}
                    </p>
                    <p className={clsx('text-xs mt-0.5',
                      etape.done ? 'text-gray-500'
                        : isCurrent ? 'text-blue-600'
                        : 'text-gray-300'
                    )}>
                      {etape.description}
                    </p>
                    {etape.date && (
                      <p className="text-xs text-gray-400 mt-1">{formatDateShort(etape.date)}</p>
                    )}
                    {'action' in etape && etape.action && !etape.done && !isCurrent && (
                      <button className="text-xs text-blue-500 hover:underline mt-1">{etape.action}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

          {/* Status selector */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Statut du dossier</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleStatusChange(opt)}
                  disabled={statusUpdating}
                  className={clsx(
                    'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    dossier.statut === opt
                      ? clsx('ring-2 ring-pink-400', STATUS_COLORS[opt] ?? 'bg-gray-100 text-gray-700')
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50'
                  )}
                >
                  {opt}
                  {dossier.statut === opt && (
                    <span className="float-right text-pink-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div
            className="rounded-xl shadow-sm p-6 flex flex-col"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-900">Notes partenaire</h2>
              </div>
              {saving && <span className="text-[11px] text-gray-400">Sauvegarde auto...</span>}
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ajoutez vos notes sur ce dossier..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-700 placeholder-gray-400 min-h-[220px]"
            />
          </div>
        </div>

        {/* Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-900">Historique des activités</h2>
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Aucune activité enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act, idx) => (
                <div key={act.id ?? idx} className="flex items-start gap-3">
                  <div className={clsx('p-2 rounded-full flex-shrink-0', ACTIVITY_COLORS[act.type] ?? ACTIVITY_COLORS.default)}>
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{act.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateLong(act.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View full Raisup analysis */}
        <button
          onClick={() => navigate(`/dashboard/b2b/dossier/${id}/raisup-view`)}
          className="w-full flex items-center justify-between p-4 bg-black text-white rounded-2xl hover:opacity-90 transition-opacity mb-8"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-pink-300" />
            <div className="text-left">
              <p className="font-semibold text-sm">Voir l'analyse complète Raisup</p>
              <p className="text-xs text-gray-400">Score, vigilances, opportunités, stratégie financière</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

      </div>

      {/* Add activity modal */}
      {showActivityModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowActivityModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Ajouter une activité</h3>
              <button onClick={() => setShowActivityModal(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries({
                  note: 'Note', rdv: 'RDV', document: 'Document',
                  alerte: 'Alerte', levee: 'Levée', statut: 'Statut',
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActivityType(key)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      activityType === key
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={activityDesc}
              onChange={e => setActivityDesc(e.target.value)}
              placeholder="Description de l'activité..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 resize-none min-h-[100px] mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddActivity}
                disabled={addingActivity || !activityDesc.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}
              >
                {addingActivity ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BDossierDetail;
