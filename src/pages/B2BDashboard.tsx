import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  Bell,
  ChevronRight,
  Mail,
  Plus,
  Eye,
  DollarSign,
  Building2,
  Target,
  AlertTriangle,
  Zap,
  Download,
  RefreshCw,
  X,
  Send,
  WifiOff,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import {
  getAgencyDashboardData,
  AgencyDashboardData,
  AgencyDossierRow,
  AgencyActivityRow,
  AgencyDeadlineRow,
} from '../services/agencyService';

type PartnerRequest = {
  id: string;
  startup_name: string;
  founder_name: string;
  founder_email: string;
  raisup_score: number;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M€`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K€`;
  return `${amount}€`;
};

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(new Date(dateString));

const formatRelativeTime = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "moins d'une heure";
  if (h < 24) return `${h} heure${h > 1 ? 's' : ''}`;
  return `${d} jour${d > 1 ? 's' : ''}`;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'levee':       return <DollarSign className="h-5 w-5" />;
    case 'nouveau':     return <Building2 className="h-5 w-5" />;
    case 'alerte':      return <AlertTriangle className="h-5 w-5" />;
    case 'echeance':    return <Calendar className="h-5 w-5" />;
    default:            return <Bell className="h-5 w-5" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'levee':    return 'bg-green-100 text-green-600';
    case 'nouveau':  return 'bg-purple-100 text-purple-600';
    case 'alerte':   return 'bg-orange-100 text-orange-600';
    case 'echeance': return 'bg-blue-100 text-blue-600';
    default:         return 'bg-gray-100 text-gray-600';
  }
};

// ─── Skeletons ────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-14 w-14 bg-gray-200 rounded-full" />
    </div>
  </div>
);

const SkeletonList = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="h-11 w-11 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-60 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: '#FFD6E5' }}>
      <Building2 className="h-9 w-9" style={{ color: '#C4728A' }} />
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun dossier pour le moment</h2>
    <p className="text-sm text-gray-500 mb-8 max-w-sm">
      Ajoutez votre première startup pour commencer à suivre votre portefeuille et accéder aux analyses.
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-[14px] text-white"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <Plus className="h-4 w-4" /> Ajouter un dossier
    </button>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const B2BDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [data, setData] = useState<AgencyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState('Mon espace partenaire');
  const [pendingRequests, setPendingRequests] = useState<PartnerRequest[]>([]);
  const [allRequests, setAllRequests] = useState<PartnerRequest[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem('raisup_agency_profile');
        let profile: Record<string, string> = raw ? JSON.parse(raw) : {};
        if (profile.name) setAgencyName(profile.name);

        // Toujours vérifier Supabase par email pour avoir l'id canonique
        const email = profile.email || null;
        const { data: dbAgency } = await (
          email
            ? supabase.from('agency_accounts').select('*').eq('email', email).single()
            : supabase.from('agency_accounts').select('*').order('created_at', { ascending: false }).limit(1).single()
        );

        console.log('[B2BDashboard] dbAgency from Supabase:', dbAgency);

        if (dbAgency) {
          const id = dbAgency.id;
          setAgencyName(dbAgency.name || profile.name || 'Mon agence');
          localStorage.setItem('raisup_agency_profile', JSON.stringify({ ...profile, ...dbAgency, id }));
          setAgencyId(id);
        } else {
          // Dernier recours : id local
          const localId = profile.id || profile.supabase_id || null;
          console.warn('[B2BDashboard] agency not found in Supabase, using local id:', localId);
          if (localId) setAgencyId(localId);
          else setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!agencyId) return;
    setSyncError(false);
    setLoading(true);
    getAgencyDashboardData(agencyId)
      .then(setData)
      .catch(() => setSyncError(true))
      .finally(() => setLoading(false));

    // Fetch all partner_requests for real KPIs
    supabase
      .from('partner_requests')
      .select('id, startup_name, founder_name, founder_email, raisup_score, created_at, status')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .then(({ data: reqs }) => {
        if (reqs) {
          setAllRequests(reqs as PartnerRequest[]);
          setPendingRequests(reqs.filter(r => r.status === 'pending') as PartnerRequest[]);
        }
      });
  }, [agencyId]);

  // Real stats computed from partner_requests
  const realStats = {
    totalDossiers: allRequests.filter(r => r.status === 'confirmed').length,
    dossiersActifs: allRequests.filter(r => ['pending', 'confirmed'].includes(r.status)).length,
    montantLeveTotal: data?.stats?.montantLeveTotal ?? 0,
    tauxSucces: data?.stats?.tauxSucces ?? 0,
    alertesCritiques: data?.stats?.alertesCritiques ?? 0,
    scoreMoyen: allRequests.length > 0
      ? Math.round(allRequests.filter(r => r.raisup_score).reduce((s, r) => s + (r.raisup_score ?? 0), 0) / allRequests.filter(r => r.raisup_score).length) || 0
      : 0,
  };

  // Performance chart data computed from real agency_dossiers
  const performanceData = React.useMemo(() => {
    const dossiers = data?.dossiers ?? [];
    if (dossiers.length === 0) return null;

    const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const groups: Record<string, { label: string; count: number; amount: number }> = {};

    dossiers.forEach(d => {
      const date = new Date(d.created_at);
      let key: string;
      let label: string;
      if (selectedPeriod === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        label = `${MONTH_LABELS[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
      } else if (selectedPeriod === 'quarterly') {
        const q = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-${q}`;
        label = `Q${q} ${date.getFullYear()}`;
      } else {
        key = `${date.getFullYear()}`;
        label = `${date.getFullYear()}`;
      }
      if (!groups[key]) groups[key] = { label, count: 0, amount: 0 };
      groups[key].count += 1;
      groups[key].amount += d.montant_leve ?? 0;
    });

    const keys = Object.keys(groups).sort().slice(-6);
    if (keys.length === 0) return null;

    const labels = keys.map(k => groups[k].label);
    const amountsRaised = keys.map(k => groups[k].amount);
    const newStartups = keys.map(k => groups[k].count);
    const maxAmount = Math.max(...amountsRaised, 1);
    return { labels, amountsRaised, newStartups, maxAmount };
  }, [data?.dossiers, selectedPeriod]);

  const handleInviteStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setTimeout(() => {
      setInviteLoading(false);
      setInviteSuccess(true);
      setTimeout(() => { setShowInviteModal(false); setInviteEmail(''); setInviteSuccess(false); }, 2000);
    }, 1000);
  };

  const stats = data?.stats;
  const activities: AgencyActivityRow[] = data?.activities ?? [];
  const deadlines: AgencyDeadlineRow[] = data?.deadlines ?? [];

  // ── No agency ID: onboarding not completed ───────────────────────────────────
  if (!loading && !agencyId) {
    return (
      <div className="py-10 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto">
        <EmptyState onAdd={() => setShowInviteModal(true)} />
      </div>
    );
  }

  return (
    <div className="py-10 px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto relative pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{agencyName}</h1>
          <p className="text-base text-gray-500">Vue d'ensemble du portefeuille</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
          <button
            onClick={() => navigate('/dashboard/b2b/funding-synthesis')}
            className="btn-secondary bg-secondary-lighter hover:bg-opacity-80 flex items-center justify-center px-6 py-3"
          >
            <FileText className="h-5 w-5 mr-2" />
            Synthèse d'aides
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center justify-center px-6 py-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une startup
          </button>
        </div>
      </div>

      {/* ── Demandes partenaires en attente ──────────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{pendingRequests.length}</span>
            </div>
            <span className="text-sm font-semibold text-amber-800">
              {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente de confirmation
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-amber-100">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-sm font-bold text-pink-600 flex-shrink-0">
                  {req.startup_name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{req.startup_name}</p>
                  <p className="text-xs text-gray-500">
                    {req.founder_name} · {req.founder_email}
                    {req.raisup_score ? ` · Score Raisup ${req.raisup_score}/100` : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Demande reçue le {new Date(req.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={async () => {
                      await supabase
                        .from('partner_requests')
                        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
                        .eq('id', req.id);
                      await supabase.from('agency_dossiers').insert({
                        agency_id: agencyId,
                        startup_name: req.startup_name,
                        fondateur: req.founder_name,
                        raisup_score: req.raisup_score,
                        statut: 'Dossier prêt',
                        derniere_action: 'Liaison confirmée depuis Raisup',
                      });
                      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                      if (agencyId) getAgencyDashboardData(agencyId).then(setData).catch(() => {});
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full hover:bg-green-200 transition-colors"
                  >
                    Confirmer ✓
                  </button>
                  <button
                    onClick={async () => {
                      await supabase
                        .from('partner_requests')
                        .update({ status: 'rejected', updated_at: new Date().toISOString() })
                        .eq('id', req.id);
                      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                    }}
                    className="px-4 py-2 text-red-400 text-sm font-medium hover:text-red-600 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4 KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Dossiers */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Startups accompagnées</p>
                  <p className="text-3xl font-bold text-gray-900">{realStats.totalDossiers}</p>
                  <p className="text-sm text-gray-400 mt-1">{realStats.dossiersActifs} actives</p>
                </div>
                <div className="bg-secondary-light p-4 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Montant levé */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Montant levé total</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(realStats.montantLeveTotal)}
                  </p>
                  {realStats.tauxSucces > 0 && (
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500">{realStats.tauxSucces}% de taux de succès</span>
                    </div>
                  )}
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Score moyen */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Score moyen portfolio</p>
                  <p className="text-3xl font-bold text-gray-900">{realStats.scoreMoyen > 0 ? realStats.scoreMoyen : '—'}</p>
                  <p className="text-sm text-gray-400 mt-1">/ 100 · score Raisup</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Alertes */}
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Alertes runway</p>
                  <p className={clsx('text-3xl font-bold', realStats.alertesCritiques > 0 ? 'text-orange-500' : 'text-gray-900')}>
                    {realStats.alertesCritiques}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Runway ≤ 4 mois</p>
                </div>
                <div className={clsx('p-4 rounded-full', realStats.alertesCritiques > 0 ? 'bg-orange-100' : 'bg-gray-100')}>
                  <AlertTriangle className={clsx('h-6 w-6', realStats.alertesCritiques > 0 ? 'text-orange-500' : 'text-gray-400')} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Performance chart */}
      <div className="bg-white rounded-xl shadow-sm p-10 mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Performance du portefeuille</h2>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[{ key: 'monthly', label: 'Mensuel' }, { key: 'quarterly', label: 'Trimestriel' }, { key: 'annual', label: 'Annuel' }].map(p => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key as any)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  selectedPeriod === p.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {!performanceData ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-2">Aucune donnée de performance encore</p>
            <p className="text-gray-400 text-xs max-w-xs">
              Les graphiques apparaîtront dès que vos startups auront des dossiers enregistrés
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Montants levés</h3>
              <div className="space-y-4">
                {performanceData.labels.map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className="w-20 text-sm font-medium text-gray-700">{label}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ff99d8] transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                          style={{ width: `${(performanceData.amountsRaised[i] / performanceData.maxAmount) * 100}%` }}
                        >
                          {performanceData.amountsRaised[i] > 0 && (
                            <span className="text-white text-xs font-semibold">{formatCurrency(performanceData.amountsRaised[i])}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-semibold text-gray-900">{formatCurrency(performanceData.amountsRaised[i])}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Nouvelles startups accompagnées</h3>
              <div className="space-y-4">
                {performanceData.labels.map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className="w-20 text-sm font-medium text-gray-700">{label}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#acc5ff] transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                          style={{ width: `${(performanceData.newStartups[i] / Math.max(...performanceData.newStartups, 1)) * 100}%` }}
                        >
                          <span className="text-primary text-xs font-semibold">{performanceData.newStartups[i]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-semibold text-gray-900">{performanceData.newStartups[i]} startup{performanceData.newStartups[i] > 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Voir le portefeuille', sub: `Gérer vos ${stats?.totalDossiers ?? 0} dossiers`, icon: Eye, colorBg: 'bg-blue-100', colorIcon: 'text-blue-600', href: '/dashboard/b2b/portfolio' },
          { label: 'Rapports stratégiques', sub: 'Analytics et exports détaillés', icon: BarChart3, colorBg: 'bg-purple-100', colorIcon: 'text-purple-600', href: '/dashboard/b2b/reports' },
          { label: 'Calendrier', sub: `${deadlines.length} échéances à venir`, icon: Calendar, colorBg: 'bg-orange-100', colorIcon: 'text-orange-600', href: '/dashboard/b2b/calendar' },
          { label: "Synthèse d'aides", sub: 'Nouvelles opportunités', icon: FileText, colorBg: 'bg-green-100', colorIcon: 'text-green-600', href: '/dashboard/b2b/funding-synthesis' },
        ].map(({ label, sub, icon: Icon, colorBg, colorIcon, href }) => (
          <button
            key={label}
            onClick={() => navigate(href)}
            className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={clsx('p-3 rounded-full group-hover:scale-110 transition-transform duration-200', colorBg)}>
                <Icon className={clsx('h-6 w-6', colorIcon)} />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
            <p className="text-sm text-gray-500">{sub}</p>
          </button>
        ))}
      </div>

      {/* Activities + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Activités récentes</h2>
              <button onClick={() => navigate('/dashboard/b2b/portfolio')} className="text-sm font-medium text-primary hover:underline">
                Voir tout
              </button>
            </div>

            {loading ? (
              <SkeletonList rows={4} />
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune activité récente.</p>
            ) : (
              <div className="space-y-4">
                {activities.map(activity => {
                  const startupName = activity.agency_dossiers?.startup_name ?? '';
                  return (
                    <div key={activity.id} className="flex items-start p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                      <div className={clsx('rounded-full p-3 mr-4 flex-shrink-0', getActivityColor(activity.type))}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            {startupName && (
                              <p className="font-semibold text-gray-900">{startupName}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            Il y a {formatRelativeTime(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-10">

          {/* Deadlines */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Échéances</h2>
              <span className="text-sm text-gray-400">{deadlines.length} à venir</span>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
              </div>
            ) : deadlines.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune échéance à venir.</p>
            ) : (
              <div className="space-y-4">
                {deadlines.map(deadline => {
                  const startupName = deadline.agency_dossiers?.startup_name;
                  const isHigh = deadline.priority === 'high';
                  return (
                    <div
                      key={deadline.id}
                      className={clsx(
                        'p-4 rounded-xl border-l-4',
                        isHigh ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{deadline.label}</p>
                          {startupName && <p className="text-xs text-gray-500 mt-0.5">{startupName}</p>}
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(deadline.date_echeance)}</p>
                        </div>
                        <span className={clsx(
                          'text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap',
                          isHigh ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        )}>
                          {isHigh ? 'Urgent' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Actions rapides</h2>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/dashboard/b2b/portfolio?action=diagnostic')}
                className="w-full p-4 bg-secondary-light rounded-xl hover:bg-opacity-80 transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-primary mr-3" />
                  <div>
                    <p className="font-semibold text-primary">Diagnostic IA groupé</p>
                    <p className="text-sm text-gray-500">Analyser tout le portefeuille</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/b2b/reports?type=monthly')}
                className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Export rapport mensuel</p>
                    <p className="text-sm text-gray-500">Générer le rapport automatique</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
              <button
                onClick={() => navigate('/dashboard/b2b/funding-synthesis?filter=expiring')}
                className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 text-left group"
              >
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Actualiser la veille</p>
                    <p className="text-sm text-gray-500">Nouvelles aides disponibles</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync error banner */}
      {syncError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg text-sm font-medium"
          style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', color: '#92400E' }}>
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          Erreur de synchronisation — données locales affichées
          <button onClick={() => setSyncError(false)} className="ml-1 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-secondary-light p-2 rounded-full mr-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Inviter une startup</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="text-center py-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Invitation envoyée !</h4>
                <p className="text-sm text-gray-500">La startup recevra un email pour rejoindre votre portefeuille.</p>
              </div>
            ) : (
              <form onSubmit={handleInviteStartup}>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-4">Envoyez une invitation à une startup pour qu'elle s'inscrive et rejoigne votre portefeuille.</p>
                  <label htmlFor="inviteEmail" className="form-label">Email de la startup</label>
                  <input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="input-field"
                    placeholder="startup@exemple.com"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">Annuler</button>
                  <button type="submit" disabled={inviteLoading || !inviteEmail} className="btn-primary flex-1 flex items-center justify-center">
                    {inviteLoading
                      ? <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />Envoi...</>
                      : <><Send className="h-4 w-4 mr-2" />Envoyer l'invitation</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BDashboard;
