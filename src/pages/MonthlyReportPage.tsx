import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, FileText, ChevronRight, Send, Download, Loader2,
  Copy, Check, TrendingUp, Sparkles, AlertTriangle,
  CheckCircle2, Zap, BarChart3, ArrowUpRight, ArrowDownRight, X,
  Edit2, Pencil,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../hooks/useAuth';
import { calculateScore, getScoreLevel, ScoreResult } from '../services/calculateScore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportForm {
  revenue_encaisse: number;
  clients_signes: number;
  mrr_actuel: number;
  burn_rate: number;
  runway_mois: number;
  victoires_mois: string;
  blocage_principal: string;
  besoin_scale: string;
  points_complexes: string;
  fonds_recrutement: number;
  fonds_marketing: number;
  fonds_tech: number;
  fonds_ops: number;
  fonds_autre: number;
}

interface Report extends ReportForm {
  id?: string;
  profile_id?: string;
  user_email?: string;
  month: number;
  year: number;
  raisup_score: number;
  score_delta: number;
  analyse_ia: string;
  status: string;
  submitted_at?: string;
}

interface Analyse {
  score_momentum: number;
  score_commentaire: string;
  points_forts: string[];
  points_attention: string[];
  opportunites: string[];
  action_prioritaire: string;
  analyse_marche: string;
  message_investisseur: string;
  prediction_next_month: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProfile = Record<string, any>;

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const FONDS = [
  { key: 'fonds_recrutement' as keyof ReportForm, label: 'Recrutement', color: '#8B5CF6' },
  { key: 'fonds_marketing' as keyof ReportForm, label: 'Marketing', color: '#EC4899' },
  { key: 'fonds_tech' as keyof ReportForm, label: 'Tech', color: '#06B6D4' },
  { key: 'fonds_ops' as keyof ReportForm, label: 'Opérations', color: '#F59E0B' },
  { key: 'fonds_autre' as keyof ReportForm, label: 'Autre', color: '#6B7280' },
];

const EMPTY: ReportForm = {
  revenue_encaisse: 0, clients_signes: 0, mrr_actuel: 0,
  burn_rate: 0, runway_mois: 0, victoires_mois: '', blocage_principal: '',
  besoin_scale: '', points_complexes: '', fonds_recrutement: 0,
  fonds_marketing: 0, fonds_tech: 0, fonds_ops: 0, fonds_autre: 0,
};

const EMPTY_SCORE: ScoreResult = {
  total: 0, pilier1_fintech: 0, pilier2_tech: 0, pilier3_marche: 0,
  pilier4_risque: 0, pilier5_liquidite: 0, burnMultipleScore: 0,
  ltvCacScore: 0, moatScore: 0, ipScore: 0, tamScore: 0, conformiteScore: 0,
  equipeScore: 0, exitScore: 0, investissabilite: 'faible', probabiliteExit5ans: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k€`;
  return `${n}€`;
}

function pct(curr: number, prev?: number) {
  if (!prev || prev === 0) return null;
  return ((curr - prev) / prev * 100);
}

// ─── Export Modal ─────────────────────────────────────────────────────────────

function ExportModal({ analyse, form, score, month, year, startupName, onClose }: {
  analyse: Analyse; form: ReportForm; score: number; month: number; year: number;
  startupName: string; onClose: () => void;
}) {
  const [step, setStep] = useState<'confirm' | 'details' | 'done'>('confirm');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const momentum = analyse.score_momentum ?? 0;

  const downloadPDF = () => {
    const doc = new jsPDF();
    const mname = MONTHS[month - 1];
    doc.setFillColor(10, 10, 10); doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont('helvetica', 'bold');
    doc.text('Rapport Mensuel', 20, 30);
    doc.setFontSize(12); doc.setTextColor(150, 150, 150);
    doc.text(`${startupName} · ${mname} ${year}`, 20, 42);
    doc.setFillColor(20, 20, 20); doc.roundedRect(20, 55, 80, 38, 4, 4, 'F');
    doc.setTextColor(139, 92, 246); doc.setFontSize(30); doc.text(`${score}`, 32, 79);
    doc.setFontSize(9); doc.setTextColor(150, 150, 150); doc.text('Score Raisup / 100', 32, 88);
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.text('Métriques clés', 20, 112);
    ([
      ['Revenus encaissés', `${form.revenue_encaisse.toLocaleString('fr-FR')}€`],
      ['Clients signés', `${form.clients_signes}`],
      ['MRR actuel', `${form.mrr_actuel.toLocaleString('fr-FR')}€`],
      ['Runway', `${form.runway_mois} mois`],
    ] as [string, string][]).forEach(([k, v], i) => {
      doc.setFontSize(9); doc.setTextColor(150, 150, 150); doc.text(k, 20, 126 + i * 13);
      doc.setTextColor(255, 255, 255); doc.text(v, 120, 126 + i * 13);
    });
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.text('Message investisseur', 20, 182);
    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text(doc.splitTextToSize(analyse.message_investisseur ?? '', 170), 20, 195);
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.text('Victoires du mois', 20, 248);
    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text(doc.splitTextToSize(form.victoires_mois || '—', 170), 20, 260);
    doc.setTextColor(50, 50, 50); doc.setFontSize(7);
    doc.text('Généré par Raisup · raisup.co', 20, 289);
    doc.text(new Date().toLocaleDateString('fr-FR'), 165, 289);
    doc.save(`rapport-${startupName.toLowerCase().replace(/\s+/g, '-')}-${MONTHS[month - 1]}-${year}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10"
        style={{ backgroundColor: '#0A0A0A' }}>
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Exporter à mon investisseur</h2>
            <p className="text-sm text-gray-500 mt-0.5">{MONTHS[month - 1]} {year} · {startupName}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        {step === 'confirm' && (
          <div className="p-7 space-y-5">
            <div className="rounded-2xl p-5 border border-white/10 bg-white/5">
              <p className="text-xs font-bold tracking-widest uppercase mb-1 text-pink-400">Êtes-vous sûr ?</p>
              <p className="text-white font-bold text-lg mb-1">Envoyer ce rapport ?</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Votre investisseur recevra un rapport complet et professionnel avec toutes vos données du mois.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Votre investisseur recevra</p>
              {[
                { icon: BarChart3, text: `Score Raisup ${score}/100 (${momentum >= 0 ? '+' : ''}${momentum} pts ce mois)` },
                { icon: TrendingUp, text: `Métriques : ${fmt(form.mrr_actuel)} MRR · ${form.clients_signes} clients · ${form.runway_mois} mois runway` },
                { icon: Sparkles, text: 'Analyse IA : points forts, vigilances, action prioritaire' },
                { icon: FileText, text: 'PDF téléchargeable avec le rapport complet' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 bg-white/5 rounded-xl p-3.5 border border-white/5">
                  <Icon size={14} className="flex-shrink-0 mt-0.5 text-pink-400" />
                  <p className="text-sm text-gray-300">{text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-semibold text-gray-400 hover:border-white/20 transition-colors">
                Annuler
              </button>
              <button onClick={() => setStep('details')}
                className="flex-[2] py-3 rounded-xl text-sm font-bold text-black bg-white flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                Continuer <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="p-7 space-y-5">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Message généré automatiquement</p>
              <p className="text-sm text-gray-300 leading-relaxed italic">"{analyse.message_investisseur ?? ''}"</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email de l'investisseur</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="investisseur@fonds.com" autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/30 transition-colors" />
            </div>
            <div className="flex gap-2">
              <button onClick={downloadPDF}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold border border-white/10 text-gray-400 py-3 rounded-xl hover:border-white/20 hover:text-white transition-colors">
                <Download size={14} /> PDF
              </button>
              <button onClick={() => email ? setStep('done') : null} disabled={!email}
                className="flex-[2] flex items-center justify-center gap-2 text-sm font-bold text-black bg-white py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                <Send size={14} /> Confirmer l'envoi
              </button>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(analyse.message_investisseur ?? ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 py-1 transition-colors">
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? 'Message copié !' : 'Copier le message investisseur'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={30} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rapport envoyé !</h3>
            <p className="text-sm text-gray-500 mb-6">Votre investisseur a reçu le rapport de {MONTHS[month - 1]} {year}.</p>
            <button onClick={onClose}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-black bg-white hover:bg-gray-100 transition-colors">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type State = 'empty' | 'form' | 'generating' | 'dashboard';

export default function MonthlyReportPage() {
  const { profile: hookProfile } = useUserProfile();
  const { user } = useAuth();
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const isOpen = day >= 25;

  // ── Profile state (merged localStorage + Supabase) ─────────────────────────
  const [localProfile, setLocalProfile] = useState<AnyProfile>({});

  useEffect(() => {
    const loadProfile = async () => {
      let merged: AnyProfile = {};
      try {
        const raw1 = localStorage.getItem('raisup_profile');
        const raw2 = localStorage.getItem('raisupOnboardingData');
        if (raw1) merged = { ...merged, ...JSON.parse(raw1) };
        if (raw2) merged = { ...merged, ...JSON.parse(raw2) };
      } catch { /* ignore parse errors */ }

      if (!merged.startupName && !merged.startup_name && user?.id) {
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (data) {
            merged = { ...merged, ...data };
            localStorage.setItem('raisup_profile', JSON.stringify(merged));
          }
        } catch { /* Supabase not configured */ }
      }

      console.log('Profile chargé:', merged);
      console.log('Clés disponibles:', Object.keys(merged));

      setLocalProfile(merged);
      const scoreResult = calculateScore(merged);
      console.log('Score calculé:', scoreResult);
      setLiveScore(scoreResult);
    };
    loadProfile();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Report state ─────────────────────────────────────────────────────────────
  const [state, setState] = useState<State>(isOpen ? 'form' : 'empty');
  const [form, setForm] = useState<ReportForm>(EMPTY);
  const [prevReport, setPrevReport] = useState<Report | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [reportScore, setReportScore] = useState(0);
  const [liveScore, setLiveScore] = useState<ScoreResult>(EMPTY_SCORE);
  const [showExport, setShowExport] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live score update when form financial fields change
  useEffect(() => {
    if (!localProfile || Object.keys(localProfile).length === 0) return;
    const updated = {
      ...localProfile,
      mrr: form.mrr_actuel || localProfile.mrr,
      burnRate: form.burn_rate || localProfile.burnRate,
      burn_rate: form.burn_rate || localProfile.burn_rate,
      runway: form.runway_mois || localProfile.runway,
    };
    const newScore = calculateScore(updated);
    setLiveScore(newScore);
  }, [form.mrr_actuel, form.burn_rate, form.runway_mois, localProfile]);

  const profileId = useCallback((): string | null => {
    try { return JSON.parse(localStorage.getItem('raisup_profile') || '{}').supabase_id ?? user?.id ?? null; }
    catch { return null; }
  }, [user?.id]);

  const load = useCallback(async () => {
    const pid = profileId();
    if (!pid) return;
    try {
      const { data } = await supabase
        .from('monthly_reports').select('*').eq('profile_id', pid)
        .order('year', { ascending: false }).order('month', { ascending: false });
      if (!data?.length) return;
      setAllReports(data as Report[]);
      const cur = (data as Report[]).find(r => r.month === month && r.year === year);
      if (cur) {
        fillForm(cur);
        if (cur.status === 'submitted' && cur.analyse_ia) {
          try {
            setAnalyse(JSON.parse(cur.analyse_ia));
            setReportScore(cur.raisup_score || 0);
            setState('dashboard');
            return;
          } catch { /* fallthrough */ }
        }
      }
      const pm = month === 1 ? 12 : month - 1;
      const py = month === 1 ? year - 1 : year;
      const prev = (data as Report[]).find(r => r.month === pm && r.year === py);
      if (prev) setPrevReport(prev);
    } catch { /* Supabase not configured */ }
  }, [month, year, profileId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (state !== 'form') return;
    autoRef.current = setInterval(saveDraft, 30_000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [state, form]); // eslint-disable-line react-hooks/exhaustive-deps

  const fillForm = (r: Report) => setForm({
    revenue_encaisse: r.revenue_encaisse || 0, clients_signes: r.clients_signes || 0,
    mrr_actuel: r.mrr_actuel || 0, burn_rate: r.burn_rate || 0, runway_mois: r.runway_mois || 0,
    victoires_mois: r.victoires_mois || '', blocage_principal: r.blocage_principal || '',
    besoin_scale: r.besoin_scale || '', points_complexes: r.points_complexes || '',
    fonds_recrutement: r.fonds_recrutement || 0, fonds_marketing: r.fonds_marketing || 0,
    fonds_tech: r.fonds_tech || 0, fonds_ops: r.fonds_ops || 0, fonds_autre: r.fonds_autre || 0,
  });

  const saveDraft = useCallback(async () => {
    const pid = profileId();
    if (!pid) return;
    try {
      await supabase.from('monthly_reports').upsert(
        { profile_id: pid, user_email: hookProfile.email, month, year, ...form, status: 'draft', updated_at: new Date().toISOString() },
        { onConflict: 'profile_id,month,year' },
      );
      setLastSaved(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    } catch { /* ignore */ }
  }, [form, hookProfile.email, month, year, profileId]);

  const submit = async () => {
    setState('generating');
    const sc = calculateScore({
      ...localProfile,
      mrr: form.mrr_actuel || localProfile.mrr,
      burnRate: form.burn_rate || localProfile.burnRate,
      runway: form.runway_mois || localProfile.runway,
    });
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    const prev = allReports.find(r => r.month === pm && r.year === py) || prevReport;
    const dRev = prev?.revenue_encaisse ? ((form.revenue_encaisse - prev.revenue_encaisse) / prev.revenue_encaisse * 100).toFixed(1) : 'N/A';
    const dCli = prev?.clients_signes ? ((form.clients_signes - prev.clients_signes) / prev.clients_signes * 100).toFixed(1) : 'N/A';
    const dMrr = prev?.mrr_actuel ? ((form.mrr_actuel - prev.mrr_actuel) / prev.mrr_actuel * 100).toFixed(1) : 'N/A';

    const prompt = `Tu es un analyste expert en startups et levée de fonds. Analyse ce rapport mensuel.

STARTUP : ${localProfile.startupName || hookProfile.startupName || 'N/A'} | Secteur : ${localProfile.sector || hookProfile.sector || 'N/A'} | Stade : ${localProfile.stage || hookProfile.stage || 'N/A'}
Score Raisup : ${sc.total}/100 (Fintech ${sc.pilier1_fintech}/25 · Tech ${sc.pilier2_tech}/20 · Marché ${sc.pilier3_marche}/20 · Risque ${sc.pilier4_risque}/20 · Exit ${sc.pilier5_liquidite}/15)

MÉTRIQUES ${month}/${year} :
Revenus : ${form.revenue_encaisse}€ (${dRev}% vs M-1) | Clients : ${form.clients_signes} (${dCli}% vs M-1)
MRR : ${form.mrr_actuel}€ (${dMrr}% vs M-1) | Burn : ${form.burn_rate}€/mois | Runway : ${form.runway_mois} mois

FONDS : Recrutement ${form.fonds_recrutement}€ | Marketing ${form.fonds_marketing}€ | Tech ${form.fonds_tech}€ | Ops ${form.fonds_ops}€

NARRATIF :
Victoires : ${form.victoires_mois}
Blocage : ${form.blocage_principal}
Besoin scale : ${form.besoin_scale}
Points complexes : ${form.points_complexes}

Génère UNIQUEMENT ce JSON valide (sans markdown) :
{"score_momentum":0,"score_commentaire":"string","points_forts":["str","str","str"],"points_attention":["str","str","str"],"opportunites":["str","str"],"action_prioritaire":"string court","analyse_marche":"2-3 phrases","message_investisseur":"3-4 phrases professionnelles","prediction_next_month":"string"}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content?.[0]?.text || '{}') as Analyse;

      const pid = profileId();
      if (pid) {
        await supabase.from('monthly_reports').upsert(
          { profile_id: pid, user_email: hookProfile.email, month, year, ...form, analyse_ia: JSON.stringify(parsed), raisup_score: sc.total, score_delta: parsed.score_momentum ?? 0, status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { onConflict: 'profile_id,month,year' },
        );
        await supabase.from('profiles').update({ mrr: form.mrr_actuel, burn_rate: form.burn_rate, runway: form.runway_mois }).eq('id', pid);
      }

      setAnalyse(parsed);
      setReportScore(sc.total);
      setState('dashboard');
      load(); // refresh history in background
    } catch (e) {
      console.error(e);
      setState('form');
    }
  };

  const totalFonds = FONDS.reduce((s, f) => s + (form[f.key] as number), 0);
  const submitted = allReports.filter(r => r.status === 'submitted');
  const scoreLevel = getScoreLevel(liveScore.total);
  const startupName = localProfile.startupName || hookProfile.startupName || 'Startup';

  // Computed metrics for form preview
  const burnMultiple = form.mrr_actuel > 0 && form.burn_rate > 0
    ? (form.burn_rate / form.mrr_actuel) : 0;
  const mrrGrowth = prevReport?.mrr_actuel && form.mrr_actuel
    ? ((form.mrr_actuel - prevReport.mrr_actuel) / prevReport.mrr_actuel * 100) : 0;

  // Chart data for dashboard
  const chartData = submitted.slice(-8).reverse().map(r => ({
    month: `${r.month}/${String(r.year).slice(2)}`,
    score: r.raisup_score,
    mrr: r.mrr_actuel,
  }));

  // ─── Empty ─────────────────────────────────────────────────────────────────

  if (state === 'empty') {
    const daysLeft = 25 - day;
    return (
      <div className="min-h-full" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6 bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Calendar size={12} />
              Reporting mensuel
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Vous n'avez pas encore<br />
              <span className="text-pink-400">de rapport mensuel</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto mb-3 leading-relaxed">
              La fenêtre de reporting ouvre le <strong className="text-gray-200">25 de chaque mois</strong>.
            </p>
            <p className="text-gray-500 text-base mb-10">
              Prochaine ouverture dans{' '}
              <span className="font-bold text-gray-300">{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span>
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-gray-200 text-sm text-gray-400">
              <Calendar size={15} />
              Revenez le 25 {MONTHS[month - 1].toLowerCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {[
              { icon: BarChart3, title: 'Score Raisup', desc: 'Votre score investisseur sur 100, mis à jour chaque mois avec analyse IA', color: '#8B5CF6', bg: 'bg-purple-500/10 border-purple-500/20' },
              { icon: TrendingUp, title: 'Courbes d\'évolution', desc: 'Suivez vos KPIs et votre attractivité investisseur mois après mois', color: '#22C55E', bg: 'bg-green-500/10 border-green-500/20' },
              { icon: Send, title: 'Rapport investisseur', desc: 'Exportez un rapport professionnel prêt à envoyer en un clic', color: '#EC4899', bg: 'bg-pink-500/10 border-pink-500/20' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`rounded-2xl border p-6 text-center ${bg}`} style={{ backgroundColor: 'white' }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${bg}`}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {submitted.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-4">Rapports précédents</p>
              <div className="space-y-2">
                {submitted.slice(0, 4).map(r => (
                  <div key={r.id}
                    onClick={() => { fillForm(r); if (r.analyse_ia) { try { setAnalyse(JSON.parse(r.analyse_ia)); setReportScore(r.raisup_score); setState('dashboard'); } catch { /* */ } } }}
                    className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all group border border-gray-100 hover:border-gray-300"
                    style={{ backgroundColor: 'white' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                        <FileText size={15} className="text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{MONTHS[r.month - 1]} {r.year}</p>
                        <p className="text-xs text-gray-500">{fmt(r.mrr_actuel || 0)} MRR · {r.clients_signes || 0} clients</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${(r.score_delta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(r.score_delta || 0) >= 0 ? '+' : ''}{r.score_delta || 0}pts
                      </span>
                      <span className="text-xl font-black text-white">{r.raisup_score}</span>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  if (state === 'form') {
    const up = (key: keyof ReportForm, val: number | string) =>
      setForm(prev => ({ ...prev, [key]: val }));

    return (
      <div className="min-h-full" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl border border-gray-100" style={{ backgroundColor: 'white' }}>
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={18} className="text-pink-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">Rapport {MONTHS[month - 1]} {year}</h1>
              <p className="text-sm text-gray-500">Fenêtre ouverte jusqu'au 31 {MONTHS[month - 1].toLowerCase()}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400">
              À compléter
            </span>
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT — Inputs */}
            <div className="space-y-4">

              {/* Section 1 */}
              <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Métriques financières
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'revenue_encaisse' as keyof ReportForm, label: 'Revenus encaissés', prefix: '€', prev: prevReport?.revenue_encaisse },
                    { key: 'clients_signes' as keyof ReportForm, label: 'Clients signés', suffix: 'clients', prev: prevReport?.clients_signes },
                    { key: 'mrr_actuel' as keyof ReportForm, label: 'MRR actuel', prefix: '€', prev: prevReport?.mrr_actuel },
                    { key: 'burn_rate' as keyof ReportForm, label: 'Burn rate mensuel', prefix: '€' },
                  ].map(f => {
                    const d = f.prev ? pct(form[f.key] as number, f.prev) : null;
                    return (
                      <div key={f.key} className="bg-white/5 rounded-xl border border-gray-200 p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-gray-500 font-medium">{f.label}</label>
                          {d !== null && (
                            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${d >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {d >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                              {Math.abs(d).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {f.prefix && <span className="text-gray-500 text-sm">{f.prefix}</span>}
                          <input type="number" value={(form[f.key] as number) || ''} placeholder="0"
                            onChange={e => up(f.key, Number(e.target.value) || 0)}
                            className="bg-transparent text-lg font-bold text-white w-full outline-none" />
                          {f.suffix && <span className="text-sm text-gray-500">{f.suffix}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <div className="bg-white/5 rounded-xl border p-3.5"
                    style={{ borderColor: form.runway_mois <= 4 ? 'rgba(239,68,68,0.3)' : form.runway_mois <= 8 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.2)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-gray-500 font-medium">Runway restant</label>
                      {form.runway_mois > 0 && form.runway_mois < 6 && (
                        <span className="text-[10px] font-bold text-orange-400 flex items-center gap-0.5">
                          <AlertTriangle size={10} /> Critique
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input type="number" value={form.runway_mois || ''} placeholder="0"
                        onChange={e => up('runway_mois', Number(e.target.value) || 0)}
                        className="bg-transparent text-lg font-bold text-white w-full outline-none"
                        style={{ color: form.runway_mois <= 4 ? '#EF4444' : form.runway_mois <= 8 ? '#F59E0B' : '#22C55E' }} />
                      <span className="text-sm text-gray-500">mois</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Utilisation des fonds
                </h3>
                <div className="space-y-4">
                  {FONDS.map(item => (
                    <div key={item.key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-white font-mono">{(form[item.key] as number).toLocaleString('fr-FR')}€</span>
                      </div>
                      <input type="range" min="0" max="50000" step="500" value={form[item.key] as number}
                        onChange={e => up(item.key, Number(e.target.value))}
                        style={{ accentColor: item.color }} className="w-full" />
                    </div>
                  ))}
                  {totalFonds > 0 && (
                    <div className="h-1.5 rounded-full overflow-hidden flex mt-2">
                      {FONDS.map(f => (form[f.key] as number) > 0 && (
                        <div key={f.key} style={{ width: `${(form[f.key] as number) / totalFonds * 100}%`, background: f.color }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3 */}
              <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  Narratif du mois
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'victoires_mois' as keyof ReportForm, label: '🏆 Victoires du mois', placeholder: 'Vos 3 plus grandes victoires : clients signés, metrics atteintes, partenariats...', rows: 3 },
                    { key: 'blocage_principal' as keyof ReportForm, label: '⚡ Principal blocage', placeholder: "L'obstacle numéro 1 qui ralentit votre croissance", rows: 2 },
                    { key: 'besoin_scale' as keyof ReportForm, label: '🚀 Ce qu\'il faut pour scaler', placeholder: 'Cash, recrue clé, partenariat spécifique ?', rows: 2 },
                    { key: 'points_complexes' as keyof ReportForm, label: '🧩 Points complexes', placeholder: 'Décisions difficiles, situations complexes, apprentissages...', rows: 2 },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
                      <textarea value={form[f.key] as string} onChange={e => up(f.key, e.target.value)}
                        placeholder={f.placeholder} rows={f.rows}
                        className="w-full bg-white/5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-gray-400 resize-none transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={saveDraft}
                  className="flex-1 border border-gray-200 text-gray-400 font-semibold py-3.5 rounded-xl hover:border-gray-300 hover:text-white transition-colors text-sm">
                  Sauvegarder brouillon
                </button>
                <button onClick={submit}
                  className="flex-[2] bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                  <Sparkles size={15} className="text-pink-500" />
                  Sauvegarder et analyser
                </button>
              </div>

              {lastSaved && (
                <p className="text-center text-xs text-gray-600">Brouillon sauvegardé à {lastSaved}</p>
              )}
            </div>

            {/* RIGHT — Live score preview (sticky) */}
            <div className="space-y-4 lg:sticky lg:top-6 lg:h-fit">

              {/* Score temps réel */}
              <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-4">Score Raisup · temps réel</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black text-white">{liveScore.total}</span>
                  <span className="text-gray-500 text-xl">/100</span>
                  {prevReport && liveScore.total !== prevReport.raisup_score && (
                    <span className={`text-sm font-bold ${liveScore.total > prevReport.raisup_score ? 'text-green-400' : 'text-red-400'}`}>
                      {liveScore.total > prevReport.raisup_score ? '+' : ''}{liveScore.total - prevReport.raisup_score} pts
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold mb-4" style={{ color: scoreLevel.color }}>{scoreLevel.label}</p>

                <div className="space-y-2.5">
                  {[
                    { label: 'Fintech & Data', val: liveScore.pilier1_fintech, max: 25 },
                    { label: 'Tech & IP', val: liveScore.pilier2_tech, max: 20 },
                    { label: 'Marché', val: liveScore.pilier3_marche, max: 20 },
                    { label: 'Risque', val: liveScore.pilier4_risque, max: 20 },
                    { label: 'Exit', val: liveScore.pilier5_liquidite, max: 15 },
                  ].map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">{p.label}</span>
                        <span className="text-white font-mono">{p.val}/{p.max}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(p.val / p.max) * 100}%`, backgroundColor: '#EC4899', opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métriques calculées */}
              <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-4">Métriques calculées</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Burn Multiple</span>
                    <span className={`text-sm font-mono font-bold ${burnMultiple > 0 && burnMultiple < 1 ? 'text-green-400' : burnMultiple < 2 ? 'text-orange-400' : 'text-red-400'}`}>
                      {burnMultiple > 0 ? `${burnMultiple.toFixed(1)}x` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Croissance MoM</span>
                    <span className={`text-sm font-mono font-bold ${mrrGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {prevReport?.mrr_actuel ? `${mrrGrowth >= 0 ? '+' : ''}${mrrGrowth.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total fonds</span>
                    <span className="text-sm font-mono text-white">{fmt(totalFonds)}</span>
                  </div>
                </div>
              </div>

              {/* Rapports précédents miniature */}
              {submitted.length > 0 && (
                <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Historique</p>
                  <div className="space-y-2">
                    {submitted.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-1">
                        <span className="text-sm text-gray-400">{MONTHS[r.month - 1].slice(0, 3)} {r.year}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${(r.score_delta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(r.score_delta || 0) >= 0 ? '+' : ''}{r.score_delta || 0}
                          </span>
                          <span className="text-sm font-bold text-white">{r.raisup_score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Generating ─────────────────────────────────────────────────────────────

  if (state === 'generating') return (
    <div className="min-h-full flex flex-col items-center justify-center gap-5" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="w-20 h-20 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-pink-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Analyse en cours…</h2>
        <p className="text-gray-500 text-sm">Raisup génère votre rapport personnalisé</p>
      </div>
    </div>
  );

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  if (state === 'dashboard' && analyse) {
    const momentum = analyse.score_momentum ?? 0;
    const currentReport = submitted.find(r => r.month === month && r.year === year) ?? submitted[0];
    const dashPrev = currentReport
      ? submitted.find(r => r.year < currentReport.year || (r.year === currentReport.year && r.month < currentReport.month))
      : prevReport;

    const kpis = [
      { label: 'Score Raisup', value: String(reportScore), unit: '/100', delta: momentum !== 0 ? String(momentum) : null, positive: momentum >= 0 },
      { label: 'MRR', value: fmt(form.mrr_actuel), delta: dashPrev?.mrr_actuel ? pct(form.mrr_actuel, dashPrev.mrr_actuel) : null, positive: true },
      { label: 'Clients signés', value: String(form.clients_signes), delta: dashPrev?.clients_signes ? pct(form.clients_signes, dashPrev.clients_signes) : null, positive: true },
      { label: 'Runway', value: `${form.runway_mois} mois`, delta: null, positive: form.runway_mois >= 12 },
      { label: 'Revenus', value: fmt(form.revenue_encaisse), delta: dashPrev?.revenue_encaisse ? pct(form.revenue_encaisse, dashPrev.revenue_encaisse) : null, positive: true },
    ];

    return (
      <div className="min-h-full" style={{ backgroundColor: '#F8F8F8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 p-5 rounded-2xl border border-gray-100" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">
                Rapport {MONTHS[month - 1]} {year}
              </h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Soumis
              </span>
            </div>
            <div className="flex gap-2">
              {isOpen && (
                <button onClick={() => setState('form')}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-400 border border-gray-200 px-3.5 py-2 rounded-xl hover:border-gray-300 hover:text-white transition-colors">
                  <Pencil size={13} /> Modifier
                </button>
              )}
              <button onClick={() => setShowExport(true)}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-black bg-white hover:bg-gray-100 transition-colors">
                <Send size={13} /> Exporter à mon investisseur
              </button>
            </div>
          </div>

          {/* Row 1 — 5 KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.label} className="rounded-xl p-4 border border-gray-100" style={{ backgroundColor: 'white' }}>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">{kpi.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-white">{kpi.value}</p>
                  {kpi.unit && <span className="text-xs text-gray-500">{kpi.unit}</span>}
                </div>
                {kpi.delta !== null && kpi.delta !== undefined && (
                  <p className={`text-xs mt-1 font-semibold ${kpi.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {typeof kpi.delta === 'string'
                      ? (Number(kpi.delta) >= 0 ? `+${kpi.delta}pts` : `${kpi.delta}pts`)
                      : (kpi.delta >= 0 ? `↑ +${(kpi.delta as number).toFixed(1)}%` : `↓ ${(kpi.delta as number).toFixed(1)}%`)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Row 2 — Chart (2/3) + Score analyse (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl p-6 border border-gray-100" style={{ backgroundColor: 'white' }}>
              <p className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                <TrendingUp size={15} className="text-pink-400" />
                Évolution MRR & Score Raisup
              </p>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={chartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="mrr" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="score" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                    <Bar yAxisId="mrr" dataKey="mrr" fill="rgba(236,72,153,0.15)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="score" type="monotone" dataKey="score" stroke="#EC4899" strokeWidth={2} dot={{ r: 3, fill: '#EC4899' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <BarChart3 size={24} className="text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">Le graphique s'affiche à partir du 2e rapport</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={13} className="text-pink-400" />
                Analyse Raisup
              </p>
              <div className="flex items-baseline gap-2 mb-1 pb-4 border-b border-gray-100">
                <span className="text-4xl font-black text-white">{reportScore}</span>
                <span className="text-gray-500">/100</span>
                {momentum !== 0 && (
                  <span className={`text-sm font-bold ${momentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {momentum > 0 ? '+' : ''}{momentum}pts
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{analyse.score_commentaire}</p>
              <div className="space-y-2">
                {(analyse.points_forts ?? []).slice(0, 2).map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    <p className="text-xs text-gray-300 leading-snug">{p}</p>
                  </div>
                ))}
                {(analyse.points_attention ?? []).slice(0, 2).map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    <p className="text-xs text-gray-300 leading-snug">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 — 3 analysis cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Check size={11} className="text-green-400" />
                </div>
                <span className="text-sm font-semibold text-white">Points d'amélioration</span>
              </div>
              {(analyse.points_forts ?? []).map((p, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 leading-snug">{p}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <AlertTriangle size={11} className="text-orange-400" />
                </div>
                <span className="text-sm font-semibold text-white">Points de vigilance</span>
              </div>
              {(analyse.points_attention ?? []).map((p, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 leading-snug">{p}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 border border-gray-100" style={{ backgroundColor: 'white' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Zap size={11} className="text-pink-400" />
                </div>
                <span className="text-sm font-semibold text-white">Action prioritaire</span>
              </div>
              <p className="text-sm text-white font-medium mb-4">{analyse.action_prioritaire}</p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Si rien ne change…</p>
                <p className="text-xs text-gray-400 italic leading-relaxed">{analyse.prediction_next_month}</p>
              </div>
            </div>
          </div>

          {/* Row 4 — Narratif */}
          {[form.victoires_mois, form.blocage_principal, form.besoin_scale, form.points_complexes].some(Boolean) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { key: 'victoires_mois', icon: '🏆', label: 'Victoires du mois' },
                { key: 'blocage_principal', icon: '⚡', label: 'Blocage principal' },
                { key: 'besoin_scale', icon: '🚀', label: 'Besoin pour scaler' },
                { key: 'points_complexes', icon: '🧩', label: 'Points complexes' },
              ].filter(f => (form as Record<string, unknown>)[f.key]).map(f => (
                <div key={f.key} className="rounded-xl p-4 border border-gray-100" style={{ backgroundColor: 'white' }}>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide font-medium">
                    <span>{f.icon}</span>{f.label}
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {(form as Record<string, unknown>)[f.key] as string}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Historique */}
          {submitted.filter(r => !(r.month === month && r.year === year)).length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Rapports précédents</p>
              <div className="space-y-2">
                {submitted.filter(r => !(r.month === month && r.year === year)).map(r => (
                  <div key={r.id}
                    onClick={() => { if (r.analyse_ia) { try { fillForm(r); setAnalyse(JSON.parse(r.analyse_ia)); setReportScore(r.raisup_score); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* */ } } }}
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all group border border-gray-100 hover:border-gray-200"
                    style={{ backgroundColor: 'white' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                        <FileText size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{MONTHS[r.month - 1]} {r.year}</p>
                        <p className="text-xs text-gray-500">{fmt(r.mrr_actuel || 0)} MRR · {r.clients_signes || 0} clients</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${(r.score_delta || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(r.score_delta || 0) >= 0 ? '+' : ''}{r.score_delta || 0}pts
                      </span>
                      <span className="text-xl font-black text-white">{r.raisup_score}</span>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {showExport && (
          <ExportModal
            analyse={analyse}
            form={form}
            score={reportScore}
            month={month}
            year={year}
            startupName={startupName}
            onClose={() => setShowExport(false)}
          />
        )}
      </div>
    );
  }

  return null;
}
