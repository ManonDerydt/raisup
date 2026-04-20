import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, CheckCircle, Clock, Building2, Mail, Send, X, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';

interface PartnerStartup {
  id: string;
  startup_name: string;
  founder_name: string;
  founder_email: string;
  raisup_score: number | null;
  status: string;
  created_at: string;
  startup_profile_id?: string | null;
  agency_name?: string;
}


const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [startups, setStartups] = useState<PartnerStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Resolve agency ID from Supabase
  useEffect(() => {
    const raw = localStorage.getItem('raisup_agency_profile');
    if (!raw) { setLoading(false); return; }
    try {
      const p = JSON.parse(raw);
      const localId = p.id || p.supabase_id || null;
      if (localId) { setAgencyId(localId); return; }
      const email = p.email || null;
      const query = email
        ? supabase.from('agency_accounts').select('id').eq('email', email).single()
        : supabase.from('agency_accounts').select('id').order('created_at', { ascending: false }).limit(1).single();
      query.then(({ data }) => {
        if (data) {
          localStorage.setItem('raisup_agency_profile', JSON.stringify({ ...p, id: data.id }));
          setAgencyId(data.id);
        } else setLoading(false);
      });
    } catch { setLoading(false); }
  }, []);

  useEffect(() => { if (agencyId) fetchStartups(); }, [agencyId]);

  const fetchStartups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partner_requests')
      .select('id, startup_name, founder_name, founder_email, raisup_score, status, created_at, startup_profile_id')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    if (!error && data) setStartups(data);
    setLoading(false);
  };

  const openDetail = async (startup: PartnerStartup) => {
    // Try to find the agency_dossiers entry for confirmed startups
    if (startup.status === 'confirmed' && agencyId) {
      const { data: dossier } = await supabase
        .from('agency_dossiers')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('startup_name', startup.startup_name)
        .maybeSingle();
      if (dossier?.id) {
        navigate(`/dashboard/b2b/dossier/${dossier.id}`);
        return;
      }
    }
    // Fallback: navigate with partner_request id
    navigate(`/dashboard/b2b/dossier/${startup.id}`);
  };

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    await supabase.from('partner_requests').update({ status: 'confirmed' }).eq('id', id);
    setStartups(prev => prev.map(s => s.id === id ? { ...s, status: 'confirmed' } : s));
    if (selectedStartup?.id === id) setSelectedStartup(prev => prev ? { ...prev, status: 'confirmed' } : null);
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    await supabase.from('partner_requests').update({ status: 'rejected' }).eq('id', id);
    setStartups(prev => prev.filter(s => s.id !== id));
    setSelectedStartup(null);
    setActionLoading(null);
  };

  const filtered = startups.filter(s => {
    const matchSearch = !searchTerm ||
      s.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.founder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.founder_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchView = viewMode === 'all' ||
      (viewMode === 'pending' && s.status === 'pending') ||
      (viewMode === 'confirmed' && s.status === 'confirmed');
    return matchSearch && matchView;
  });

  const pendingCount = startups.filter(s => s.status === 'pending').length;
  const confirmedCount = startups.filter(s => s.status === 'confirmed').length;
  const avgScore = startups.filter(s => s.raisup_score && s.raisup_score > 0).length > 0
    ? Math.round(startups.filter(s => s.raisup_score && s.raisup_score > 0).reduce((sum, s) => sum + (s.raisup_score ?? 0), 0) / startups.filter(s => s.raisup_score && s.raisup_score > 0).length)
    : null;

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending':   return 'bg-amber-100 text-amber-700';
      case 'rejected':  return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-700';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Accompagnée';
      case 'pending':   return 'En attente';
      case 'rejected':  return 'Refusée';
      default:          return status;
    }
  };

  const ScoreBar = ({ score }: { score: number | null }) => {
    if (!score || score === 0) return <span className="text-xs text-gray-400">Non calculé</span>;
    const badgeClass = score >= 70 ? 'bg-green-100 text-green-700'
      : score >= 50 ? 'bg-blue-100 text-blue-700'
      : score >= 30 ? 'bg-orange-100 text-orange-700'
      : 'bg-red-100 text-red-700';
    return (
      <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', badgeClass)}>
        {score}/100
      </span>
    );
  };

  const formatCurrency = (n?: number) => {
    if (!n) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M€`;
    if (n >= 1000) return `${Math.round(n / 1000)}K€`;
    return `${n}€`;
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portefeuille Startups</h1>
            <p className="mt-1 text-gray-500">Startups qui ont sélectionné votre structure à l'inscription</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button onClick={fetchStartups}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-200">
              <RefreshCw className="h-4 w-4 mr-2" />Actualiser
            </button>
            <button onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}>
              <Plus className="h-4 w-4 mr-2" />Inviter une startup
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: startups.length, icon: <Building2 className="h-5 w-5 text-purple-500" />, bg: 'bg-purple-50' },
            { label: 'En attente', value: pendingCount, icon: <Clock className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-50' },
            { label: 'Accompagnées', value: confirmedCount, icon: <CheckCircle className="h-5 w-5 text-green-500" />, bg: 'bg-green-50' },
            { label: 'Score moyen', value: avgScore ? `${avgScore}/100` : '—', icon: <span className="text-pink-500 font-bold text-sm">★</span>, bg: 'bg-pink-50' },
          ].map(kpi => (
            <div key={kpi.label} className="p-5 rounded-xl bg-white shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className={clsx('p-2.5 rounded-full', kpi.bg)}>{kpi.icon}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'Toutes', count: startups.length },
              { key: 'pending', label: 'En attente', count: pendingCount },
              { key: 'confirmed', label: 'Accompagnées', count: confirmedCount },
            ].map(tab => (
              <button key={tab.key} onClick={() => setViewMode(tab.key as any)}
                className={clsx('px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                  viewMode === tab.key ? 'border-pink-400 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-pink-300" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin mr-3" />
              <span className="text-sm text-gray-500">Chargement...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {startups.length === 0 ? 'Aucune startup inscrite pour le moment' : 'Aucun résultat'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {startups.length === 0 ? 'Les startups qui vous sélectionnent à l\'inscription apparaîtront ici.' : 'Modifiez vos critères.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Startup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fondateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score Raisup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(startup => (
                    <tr key={startup.id}
                      onClick={() => openDetail(startup)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: '#F4E6FF', color: '#7C3AED' }}>
                            {startup.startup_name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm text-gray-900">{startup.startup_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{startup.founder_name}</p>
                        <p className="text-xs text-gray-400">{startup.founder_email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ScoreBar score={startup.raisup_score} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadge(startup.status))}>
                          {getStatusLabel(startup.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{formatDate(startup.created_at)}</span>
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {startup.status === 'pending' && (
                            <>
                              <button onClick={() => handleConfirm(startup.id)}
                                disabled={actionLoading === startup.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}>
                                {actionLoading === startup.id ? '...' : 'Accepter'}
                              </button>
                              <button onClick={() => handleReject(startup.id)}
                                disabled={actionLoading === startup.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50">
                                Refuser
                              </button>
                            </>
                          )}
                          {startup.status === 'confirmed' && (
                            <a href={`mailto:${startup.founder_email}`}
                              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="Contacter">
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invite modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Inviter une startup</h3>
                <button onClick={() => { setShowInviteModal(false); setInviteSuccess(false); setInviteEmail(''); }}>
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {inviteSuccess ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Invitation envoyée !</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setInviteSuccess(true); }}>
                  <p className="text-sm text-gray-500 mb-4">Invitez une startup à rejoindre votre portefeuille.</p>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                  <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="startup@exemple.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 mb-4" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowInviteModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                      Annuler
                    </button>
                    <button type="submit"
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}>
                      <Send className="h-4 w-4" />Envoyer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
