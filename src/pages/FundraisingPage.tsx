import React, { useState } from 'react';
import { Monitor, Zap, TrendingUp, Clock, Leaf, CheckCircle, ArrowRight, Star } from 'lucide-react';
import clsx from 'clsx';

// ─── Design system ────────────────────────────────────────────────────────────
const STAGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  'pre-seed': { label: 'Pre-seed', bg: '#D8FFBD', text: '#2D6A00' },
  'seed':     { label: 'Seed',     bg: '#ABC5FE', text: '#1A3A8F' },
  'series-a': { label: 'Série A',  bg: '#CDB4FF', text: '#3D0D8F' },
  'series-b': { label: 'Série B',  bg: '#FFB96D', text: '#7A3D00' },
};

const INVESTOR_TYPE_CONFIG: Record<string, { bg: string; text: string }> = {
  'VC':            { bg: '#EEF2FF', text: '#3730A3' },
  'Angel':         { bg: '#F5F3FF', text: '#5B21B6' },
  'Family Office': { bg: '#FFF7ED', text: '#9A3412' },
  'Non-dilutif':   { bg: '#F0FFF4', text: '#15803D' },
};

const NONDILUTIF_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  'Éligible':         { bg: '#D8FFBD', text: '#2D6A00' },
  'Dossier en cours': { bg: '#ABC5FE', text: '#1A3A8F' },
  'Déposé':           { bg: '#CDB4FF', text: '#3D0D8F' },
  'Deadline proche':  { bg: '#FFB96D', text: '#7A3D00' },
  'Refusé':           { bg: '#FFB3B3', text: '#8F1A1A' },
};

const SECTOR_ICONS: Record<string, string> = {
  'SaaS': '⚙️', 'HealthTech': '🏥', 'GreenTech': '🌱', 'IA': '🤖', 'FinTech': '💳',
};

// Score helpers — neutres (pas de vert dilutif)
const scoreBorder = (s: number) => s >= 80 ? '#6EE7B7' : s >= 50 ? '#FCD34D' : '#FCA5A5';
const scoreBadgeCfg = (s: number) => s >= 80
  ? { bg: '#ECFDF5', text: '#065F46' }
  : s >= 50
  ? { bg: '#FFFBEB', text: '#92400E' }
  : { bg: '#FEF2F2', text: '#991B1B' };

// ─── Logo avatar — tente une image, fallback initiales ───────────────────────
const LOGO_URLS: Record<string, string> = {
  'Kima Ventures':      'https://logo.clearbit.com/kimaventures.com',
  'Marc Ournac':        '',
  'Newfund':            'https://logo.clearbit.com/newfund.com',
  'ISAI':               'https://logo.clearbit.com/isai.fr',
  'Elaia':              'https://logo.clearbit.com/elaia.com',
  'Bpifrance':          'https://logo.clearbit.com/bpifrance.fr',
  'État':               '',
  'Région Île-de-France': '',
};

const LogoAvatar: React.FC<{ name: string; orgName?: string; bg?: string; text?: string }> = ({ name, orgName, bg = '#F3F4F6', text = '#374151' }) => {
  const [imgOk, setImgOk] = useState(true);
  const key = orgName ?? name;
  const url = LOGO_URLS[key];
  const letters = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  if (url && imgOk) {
    return (
      <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#E5E7EB] bg-white p-1.5">
        <img
          src={url}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setImgOk(false)}
        />
      </div>
    );
  }

  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: bg, color: text }}
    >
      {letters}
    </div>
  );
};

// ─── Mock data ────────────────────────────────────────────────────────────────
interface StartupProfile {
  id: string; name: string; sector: string;
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b';
  fundingAmount: number; mrr: number | null; location: string;
  description: string; teamSize: number; founded: string; traction: string;
  scoring: { secteur: number; stade: number; ticket: number; localisation: number };
  strategy: { dilutifPct: number; timeline: string };
}

const TEST_PROFILES: StartupProfile[] = [
  {
    id: 'saas-b2b', name: 'FlowSync', sector: 'SaaS B2B', stage: 'seed',
    fundingAmount: 500_000, mrr: 10_000, location: 'Paris',
    description: 'Outil de synchronisation no-code pour équipes commerciales B2B. 45 clients actifs, croissance 18% MoM.',
    teamSize: 6, founded: '2023', traction: '45 clients · 18% MoM',
    scoring: { secteur: 92, stade: 85, ticket: 78, localisation: 90 },
    strategy: { dilutifPct: 60, timeline: '4–6 mois' },
  },
  {
    id: 'healthtech', name: 'MedIA', sector: 'HealthTech', stage: 'pre-seed',
    fundingAmount: 300_000, mrr: null, location: 'Lyon',
    description: "IA de détection précoce des cancers cutanés. Validée sur 5 000 images, en attente de marquage CE.",
    teamSize: 3, founded: '2024', traction: '5K images testées · Marquage CE Q3',
    scoring: { secteur: 88, stade: 70, ticket: 82, localisation: 65 },
    strategy: { dilutifPct: 50, timeline: '5–8 mois' },
  },
  {
    id: 'greentech', name: 'CarbonLoop', sector: 'GreenTech', stage: 'series-a',
    fundingAmount: 3_000_000, mrr: 200_000, location: 'Paris',
    description: 'Plateforme de compensation carbone vérifiée pour ETI. 30 clients grands comptes, 200K€ MRR stable.',
    teamSize: 18, founded: '2021', traction: '30 grands comptes · ARR 2,4M€',
    scoring: { secteur: 85, stade: 90, ticket: 75, localisation: 95 },
    strategy: { dilutifPct: 75, timeline: '6–9 mois' },
  },
  {
    id: 'deeptech-ia', name: 'NeuralEdge', sector: 'IA', stage: 'seed',
    fundingAmount: 1_000_000, mrr: 50_000, location: 'Paris',
    description: 'LLM spécialisé pour le droit français. Spinoff INRIA, 3 brevets déposés. Déployé chez 12 cabinets.',
    teamSize: 8, founded: '2023', traction: '12 cabinets · 3 brevets déposés',
    scoring: { secteur: 80, stade: 82, ticket: 68, localisation: 90 },
    strategy: { dilutifPct: 65, timeline: '4–6 mois' },
  },
  {
    id: 'fintech', name: 'PayLater Pro', sector: 'FinTech', stage: 'pre-seed',
    fundingAmount: 200_000, mrr: null, location: 'Bordeaux',
    description: 'BNPL B2B pour artisans et TPE. MVP live, 12 pilotes en cours, fondateur ex-Crédit Agricole.',
    teamSize: 2, founded: '2024', traction: '12 pilotes · MVP live',
    scoring: { secteur: 74, stade: 68, ticket: 80, localisation: 58 },
    strategy: { dilutifPct: 55, timeline: '6–10 mois' },
  },
];

interface Investor {
  id: string; name: string; type: string; score: number;
  ticket: string; description: string; reasons: [string, string, string];
}

const INVESTORS: Investor[] = [
  { id: 'kima', name: 'Kima Ventures', type: 'VC', score: 90, ticket: '150K–500K€',
    description: 'Le fonds le plus actif en Europe — 2 deals par semaine.',
    reasons: ['Investit activement en SaaS B2B', 'Ticket aligné sur le stade seed', 'Décision rapide sous 2 semaines'] },
  { id: 'ournac', name: 'Marc Ournac', type: 'Angel', score: 80, ticket: '25K–150K€',
    description: 'Ex-DG Boursorama, investisseur FinTech et SaaS.',
    reasons: ['Portfolio SaaS B2B majoritaire', 'Accompagnement opérationnel fort', 'Réseau commercial Europe'] },
  { id: 'newfund', name: 'Newfund', type: 'VC', score: 70, ticket: '500K–5M€',
    description: 'Fonds franco-américain early-stage.',
    reasons: ['Investit dès le seed', 'Fourchette couvre votre besoin', 'Présence Paris et NYC'] },
  { id: 'isai', name: 'ISAI', type: 'Family Office', score: 65, ticket: '200K–2M€',
    description: 'Club de business angels fondateurs.',
    reasons: ['Fondateurs SaaS dans le réseau', 'Ticket flexible', 'Accompagnement go-to-market'] },
  { id: 'elaia', name: 'Elaia', type: 'VC', score: 55, ticket: '1M–10M€',
    description: 'Fonds deep tech et B2B SaaS européen.',
    reasons: ['Portfolio B2B compatible', 'Ticket légèrement supérieur au besoin', 'Délai de décision plus long'] },
];

interface NonDilutif {
  id: string; name: string; organisme: string; amount: number;
  status: string; description: string;
  conditions: [string, string]; deadline?: string;
}

const NON_DILUTIF: NonDilutif[] = [
  { id: 'bpi', name: 'BPI Bourse French Tech', organisme: 'Bpifrance', amount: 90_000,
    status: 'Éligible',
    description: "Aide à la maturation pour startups innovantes de moins d'un an.",
    conditions: ["Startup < 1 an avec projet innovant", "Moins de 50 salariés"] },
  { id: 'cir', name: 'CIR Crédit Impôt Recherche', organisme: 'État', amount: 180_000,
    status: 'Dossier en cours',
    description: '30% des dépenses R&D récupérables sur la déclaration fiscale.',
    conditions: ['Dépenses R&D documentées', 'Déclaration via formulaire 2069-A'] },
  { id: 'innovup', name: "Innov'up IDF", organisme: 'Région Île-de-France', amount: 70_000,
    status: 'Deadline proche',
    description: "Subvention pour projets d'innovation en Île-de-France.",
    conditions: ['Siège social en IDF', "Projet d'innovation technologique"],
    deadline: '28 avr' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtAmount = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M€` : `${(n / 1000).toFixed(0)}K€`;

// ─── Badges ───────────────────────────────────────────────────────────────────
const StageBadge: React.FC<{ stage: string; small?: boolean }> = ({ stage, small }) => {
  const cfg = STAGE_CONFIG[stage] ?? { label: stage, bg: '#E5E7EB', text: '#374151' };
  return (
    <span
      className={clsx('inline-flex items-center font-semibold rounded-full', small ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5')}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
};

const SectorBadge: React.FC<{ sector: string; small?: boolean }> = ({ sector, small }) => (
  <span
    className={clsx('inline-flex items-center font-medium rounded-full border', small ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5')}
    style={{ backgroundColor: '#F8F8F8', color: '#6B7280', borderColor: '#E5E7EB' }}
  >
    {sector}
  </span>
);

// ─── Scoring bar ──────────────────────────────────────────────────────────────
const ScoringBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-bold text-gray-700">{value}%</span>
    </div>
    <div className="h-2 rounded-full overflow-hidden bg-[#F3F4F6]">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  </div>
);

// ─── ProfileCard ──────────────────────────────────────────────────────────────
const ProfileCard: React.FC<{ profile: StartupProfile; selected: boolean; onClick: () => void }> = ({ profile, selected, onClick }) => {
  const icon = SECTOR_ICONS[profile.sector.split(' ')[0]] ?? '🚀';
  const mrrStr = profile.mrr ? `${fmtAmount(profile.mrr)} MRR` : 'Pre-revenue';

  return (
    <button
      onClick={onClick}
      className={clsx('w-full text-left rounded-2xl p-4 transition-all duration-200 flex flex-col gap-2', selected ? 'border-2 border-[#0A0A0A] bg-[#F8F8F8] shadow-md' : 'border-2 border-[#E5E7EB] bg-white hover:border-gray-300 hover:shadow-sm')}
    >
      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-gray-100">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">{profile.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{profile.location}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        <StageBadge stage={profile.stage} small />
        <SectorBadge sector={profile.sector} small />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-700">{fmtAmount(profile.fundingAmount)}</span>
        <span className="text-[11px] text-gray-400">{mrrStr}</span>
      </div>
    </button>
  );
};

// ─── InvestorCard ─────────────────────────────────────────────────────────────
const InvestorCard: React.FC<{ inv: Investor }> = ({ inv }) => {
  const border = scoreBorder(inv.score);
  const badge = scoreBadgeCfg(inv.score);
  const typeCfg = INVESTOR_TYPE_CONFIG[inv.type] ?? { bg: '#F3F4F6', text: '#374151' };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4" style={{ borderLeft: `4px solid ${border}` }}>
      {/* Top */}
      <div className="flex items-start gap-3">
        <LogoAvatar name={inv.name} bg={typeCfg.bg} text={typeCfg.text} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 leading-tight">{inv.name}</p>
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: typeCfg.bg, color: typeCfg.text }}>{inv.type}</span>
          <p className="text-[13px] text-gray-500 mt-1.5 line-clamp-2">{inv.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: badge.bg, color: badge.text }}>
            {inv.score}%
          </span>
          <p className="text-[11px] text-gray-400 mt-1">{inv.ticket}</p>
        </div>
      </div>

      {/* Reasons */}
      <div className="flex flex-wrap gap-1.5">
        {inv.reasons.map((r, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
            <CheckCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
            {r}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
        <button className="text-xs text-gray-400 hover:text-gray-600 transition">Voir les détails &gt;</button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-80 transition" style={{ backgroundColor: '#0A0A0A' }}>
          Postuler <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

// ─── NonDilutifCard ───────────────────────────────────────────────────────────
const NonDilutifCard: React.FC<{ dispositif: NonDilutif }> = ({ dispositif: d }) => {
  const statusCfg = NONDILUTIF_STATUS_CONFIG[d.status] ?? { bg: '#E5E7EB', text: '#374151' };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <LogoAvatar name={d.name} orgName={d.organisme} bg="#D8FFBD" text="#2D6A00" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 leading-tight">{d.name}</p>
          <p className="text-[13px] text-gray-500">{d.organisme}</p>
          <p className="text-[13px] text-gray-600 mt-1">{d.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-[18px] font-bold" style={{ color: '#2D6A00' }}>{fmtAmount(d.amount)}</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-1" style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}>
            {d.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {d.conditions.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>✓</span>
            {c}
          </span>
        ))}
      </div>

      {d.deadline && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit text-xs font-semibold" style={{ backgroundColor: '#FFB96D', color: '#7A3D00' }}>
          <Clock className="h-3.5 w-3.5" />
          Deadline : {d.deadline}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
        <button className="text-xs text-gray-400 hover:text-gray-600 transition">Voir les détails &gt;</button>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold hover:opacity-80 transition" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
          Préparer le dossier <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const FundraisingPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(TEST_PROFILES[0].id);
  const [demoMode, setDemoMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'dilutif' | 'non-dilutif'>('dilutif');

  const selected = TEST_PROFILES.find(p => p.id === selectedId)!;
  const dilutifAmt = Math.round(selected.fundingAmount * (selected.strategy.dilutifPct / 100));
  const nonDilutifAmt = selected.fundingAmount - dilutifAmt;
  const totalNonDilutif = NON_DILUTIF.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 bg-[#F8F8F8]">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── 1. Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">Levée de fonds</h1>
            <p className="text-sm text-gray-500 mt-1">Matching intelligent dilutif et non-dilutif pour votre profil</p>
          </div>
          <button
            onClick={() => setDemoMode(d => !d)}
            className={clsx('inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition border-[1.5px]', demoMode ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-transparent text-[#0A0A0A] border-[#0A0A0A] hover:bg-gray-50')}
          >
            <Monitor className="h-4 w-4" />
            {demoMode ? 'Mode démo actif' : 'Mode démo'}
          </button>
        </div>

        {/* ── 2. Sélecteur 5 profils ── */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100">
              <Zap className="h-4 w-4 text-gray-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Testez avec 5 profils startups réels</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TEST_PROFILES.map(profile => (
              <ProfileCard key={profile.id} profile={profile} selected={selectedId === profile.id} onClick={() => setSelectedId(profile.id)} />
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Profil sélectionné : <span className="font-semibold text-gray-600">{selected.name}</span> · {selected.sector} · {fmtAmount(selected.fundingAmount)} recherchés
          </p>
        </div>

        {/* ── 3. Card profil sélectionné ── */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-[20px] font-bold text-gray-900 mb-1">{selected.name}</h2>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{selected.description}</p>
              <div className="flex flex-wrap gap-2">
                <StageBadge stage={selected.stage} />
                <SectorBadge sector={selected.sector} />
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border bg-[#F8F8F8] text-gray-500 border-[#E5E7EB]">
                  📍 {selected.location}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-60 flex-shrink-0">
              {[
                { label: 'Secteur',  value: selected.sector },
                { label: 'Stade',    value: STAGE_CONFIG[selected.stage]?.label ?? selected.stage },
                { label: 'Besoin',   value: fmtAmount(selected.fundingAmount) },
                { label: 'MRR',      value: selected.mrr ? fmtAmount(selected.mrr) : 'Pre-revenue' },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-3 bg-[#F8F8F8]">
                  <p className="text-[11px] text-gray-400 mb-0.5">{m.label}</p>
                  <p className="text-sm font-bold text-gray-900">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-[#F3F4F6]">
            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Détail du scoring — meilleur match</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <ScoringBar label="Secteur"      value={selected.scoring.secteur}      color="#D8FFBD" />
              <ScoringBar label="Stade"        value={selected.scoring.stade}        color="#ABC5FE" />
              <ScoringBar label="Ticket"       value={selected.scoring.ticket}       color="#CDB4FF" />
              <ScoringBar label="Localisation" value={selected.scoring.localisation} color="#FFB96D" />
            </div>
          </div>
        </div>

        {/* ── 4. Stratégie ── */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-bold text-gray-900">Stratégie de financement recommandée</h2>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] mb-6">
            {[
              { label: 'Stade actuel',    value: STAGE_CONFIG[selected.stage]?.label, icon: '📍', color: '#EEF2FF' },
              { label: 'Objectif',        value: fmtAmount(selected.fundingAmount),    icon: '🎯', color: '#F0FDF4' },
              { label: 'Délai estimé',    value: selected.strategy.timeline,           icon: '⏱', color: '#FFFBEB' },
            ].map(m => (
              <div key={m.label} className="flex flex-col items-center gap-1 py-2 px-4 text-center">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-1" style={{ backgroundColor: m.color }}>
                  {m.icon}
                </span>
                <p className="text-[11px] text-gray-400">{m.label}</p>
                <p className="text-base font-bold text-gray-900">{m.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Mix recommandé</p>
            <div className="flex h-[14px] rounded-lg overflow-hidden w-full">
              <div
                className="flex items-center justify-center text-[11px] font-bold text-white"
                style={{ width: `${selected.strategy.dilutifPct}%`, backgroundColor: '#0A0A0A' }}
              >
                {selected.strategy.dilutifPct}%
              </div>
              <div
                className="flex items-center justify-center text-[11px] font-bold"
                style={{ width: `${100 - selected.strategy.dilutifPct}%`, backgroundColor: '#D8FFBD', color: '#2D6A00' }}
              >
                {100 - selected.strategy.dilutifPct}%
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm inline-block bg-[#0A0A0A]" />
                Dilutif {selected.strategy.dilutifPct}% · {fmtAmount(dilutifAmt)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#D8FFBD' }} />
                Non-dilutif {100 - selected.strategy.dilutifPct}% · {fmtAmount(nonDilutifAmt)}
              </span>
            </div>
          </div>
        </div>

        {/* ── 5. Onglets ── */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('dilutif')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold transition"
            style={activeTab === 'dilutif'
              ? { backgroundColor: '#0A0A0A', color: '#ffffff' }
              : { backgroundColor: '#ffffff', color: '#6B7280', border: '1px solid #E5E7EB' }}
          >
            Dilutif (capital)
          </button>
          <button
            onClick={() => setActiveTab('non-dilutif')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-semibold transition"
            style={activeTab === 'non-dilutif'
              ? { backgroundColor: '#D8FFBD', color: '#2D6A00' }
              : { backgroundColor: '#ffffff', color: '#6B7280', border: '1px solid #E5E7EB' }}
          >
            Non-dilutif (aides)
          </button>
        </div>

        {/* ── 6. Dilutif ── */}
        {activeTab === 'dilutif' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900">Top 5 investisseurs matchés</h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-200" />
                  ≥ 80%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-amber-200" />
                  50–79%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block bg-red-200" />
                  &lt; 50%
                </span>
              </div>
            </div>
            {INVESTORS.map(inv => <InvestorCard key={inv.id} inv={inv} />)}
          </div>
        )}

        {/* ── 7. Non-dilutif ── */}
        {activeTab === 'non-dilutif' && (
          <div className="space-y-4">
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl"
              style={{ backgroundColor: '#F6FFF0', border: '1px solid #D8FFBD' }}
            >
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 flex-shrink-0" style={{ color: '#2D6A00' }} />
                <p className="text-sm font-semibold" style={{ color: '#2D6A00' }}>
                  Financement sans dilution · {fmtAmount(totalNonDilutif)} identifiés pour votre profil
                </p>
              </div>
              <p className="text-[20px] font-bold" style={{ color: '#2D6A00' }}>
                {fmtAmount(totalNonDilutif)} potentiel
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-900">3 dispositifs éligibles</h3>
            {NON_DILUTIF.map(d => <NonDilutifCard key={d.id} dispositif={d} />)}
          </div>
        )}

      </div>
    </div>
  );
};

export default FundraisingPage;
