import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { matchInvestors, formatTicket, investorTypeLabel, scoreBadgeColor } from '../services/matchInvestors';
import type { MatchResult } from '../services/matchInvestors';
import { Download, Monitor, TrendingUp, Shield, Users, ChevronRight } from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

function normalizeSectorForMatch(sector: string): string {
  const map: Record<string, string> = {
    'SaaS B2B': 'SaaS', 'SaaS B2C': 'SaaS', 'Logiciel': 'SaaS',
    'IA & Data': 'IA', 'Intelligence artificielle': 'IA',
    'HealthTech / MedTech': 'HealthTech', 'MedTech': 'HealthTech', 'BioTech': 'HealthTech',
    'GreenTech / CleanTech': 'GreenTech', 'CleanTech': 'GreenTech', 'AgriTech': 'GreenTech',
    'EdTech / HRTech': 'EdTech', 'HRTech': 'EdTech',
    'FinTech / InsurTech': 'FinTech', 'InsurTech': 'FinTech',
    'Marketplace / E-commerce': 'Marketplace', 'E-commerce': 'Marketplace',
    'Deep Tech': 'DeepTech', 'Robotique': 'DeepTech',
    'PropTech / Construction': 'PropTech',
  };
  return map[sector] ?? sector;
}

function getSectorStyle(sector: string): { bg: string; text: string } {
  const s = normalizeSectorForMatch(sector);
  if (['SaaS', 'FinTech', 'Marketplace'].includes(s)) return { bg: '#ABC5FE', text: '#1A3A8F' };
  if (['IA', 'DeepTech'].includes(s))                 return { bg: '#CDB4FF', text: '#3D0D8F' };
  if (['HealthTech', 'BioTech'].includes(s))          return { bg: '#FFB3B3', text: '#8F1A1A' };
  if (['GreenTech', 'AgriTech'].includes(s))          return { bg: '#D8FFBD', text: '#2D6A00' };
  if (['EdTech', 'PropTech'].includes(s))             return { bg: '#FFB96D', text: '#7A3D00' };
  return { bg: '#F3F4F6', text: '#374151' };
}

function getStageLabel(stage: string): { label: string; desc: string } {
  switch (stage) {
    case 'pre-seed': return { label: 'Pre-seed', desc: 'Amorçage — validation du marché' };
    case 'seed':     return { label: 'Seed', desc: 'Construction produit & premières ventes' };
    case 'serie-a':  return { label: 'Série A', desc: 'Croissance accélérée — scale' };
    case 'serie-b':  return { label: 'Série B+', desc: 'Expansion — leadership marché' };
    default:         return { label: stage || '—', desc: 'Stade de développement' };
  }
}

function getMRRBadge(mrr: number | null, isPreRevenue: boolean): { bg: string; text: string; label: string } {
  if (isPreRevenue || !mrr || mrr === 0) return { bg: '#FFB3B3', text: '#8F1A1A', label: 'Pré-revenu' };
  if (mrr >= 10_000) return { bg: '#D8FFBD', text: '#2D6A00', label: `MRR ${fmtMoney(mrr)}` };
  return { bg: '#FFB96D', text: '#7A3D00', label: `MRR ${fmtMoney(mrr)}` };
}

function getMixRecommendation(profile: { fundingPreference?: string; stage?: string }): { dilutif: number; nonDilutif: number } {
  if (profile.fundingPreference === 'Non-dilutif en priorité') return { dilutif: 30, nonDilutif: 70 };
  if (profile.fundingPreference === 'Dilutif en priorité')     return { dilutif: 75, nonDilutif: 25 };
  const stageMix: Record<string, { dilutif: number; nonDilutif: number }> = {
    'pre-seed': { dilutif: 35, nonDilutif: 65 },
    'seed':     { dilutif: 55, nonDilutif: 45 },
    'serie-a':  { dilutif: 75, nonDilutif: 25 },
    'serie-b':  { dilutif: 85, nonDilutif: 15 },
  };
  return stageMix[profile.stage ?? ''] ?? { dilutif: 50, nonDilutif: 50 };
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'VC':           return '#1D4ED8';
    case 'angel':        return '#6D28D9';
    case 'family-office':return '#92400E';
    case 'non-dilutif':  return '#2D6A00';
    default:             return '#6B7280';
  }
}
function getTypeBg(type: string): string {
  switch (type) {
    case 'VC':           return '#EFF6FF';
    case 'angel':        return '#F5F3FF';
    case 'family-office':return '#FFFBEB';
    case 'non-dilutif':  return '#F0FFF4';
    default:             return '#F3F4F6';
  }
}
function scoreColor(score: number): string {
  if (score >= 80) return '#2D6A00';
  if (score >= 50) return '#7A3D00';
  return '#8F1A1A';
}
function scoreBg(score: number): string {
  if (score >= 80) return '#D8FFBD';
  if (score >= 50) return '#FFB96D';
  return '#FFB3B3';
}

// ─── Fade-in observer ──────────────────────────────────────────────────────────

function useFadeIn(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

// ─── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#F4B8CC' }} />
      </div>
      <span className="text-[11px] font-semibold text-gray-700 w-10 text-right">{value}/{max}</span>
    </div>
  );
}

// ─── Investor card (existing — to be redesigned in step 2) ────────────────────

function InvestorCard({ match, isLocked, delay = 0 }: { match: MatchResult; isLocked: boolean; delay?: number }) {
  const ref = useFadeIn([match.investor.id]);
  const inv = match.investor;
  const initials = inv.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      ref={ref}
      style={{
        opacity: 0, transform: 'translateY(16px)', transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
        ...(isLocked ? { filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' } : {}),
      }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Colored header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100" style={{ backgroundColor: getTypeBg(inv.type) }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
          style={{ backgroundColor: getTypeColor(inv.type) + '22', color: getTypeColor(inv.type) }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-gray-900 truncate">{inv.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: getTypeColor(inv.type) + '18', color: getTypeColor(inv.type) }}>
              {investorTypeLabel(inv.type)}
            </span>
            <span className="text-[11px] text-gray-400">{formatTicket(inv.ticketMin, inv.ticketMax)}</span>
          </div>
        </div>
        <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-[14px]"
          style={{ backgroundColor: scoreBg(match.score), color: scoreColor(match.score) }}>
          {match.score}%
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-[12px] text-gray-500 mb-4 leading-relaxed line-clamp-2">{inv.description}</p>
        <div className="rounded-xl px-3 py-2 mb-4" style={{ backgroundColor: '#FFF5F8' }}>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            <span className="font-semibold" style={{ color: '#C4728A' }}>Pourquoi ce match — </span>
            {match.whyMatch}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {inv.criteria.slice(0, 3).map((c: string, i: number) => (
            <span key={i} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">{c}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100" style={{ backgroundColor: '#FAFAFA' }}>
        <a href={inv.website} target="_blank" rel="noopener noreferrer"
          className="text-[12px] font-semibold hover:underline" style={{ color: '#C4728A' }}>
          Voir le profil →
        </a>
        <a href={inv.website} target="_blank" rel="noopener noreferrer"
          className="px-4 py-1.5 rounded-full text-[12px] font-bold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#0A0A0A' }}>
          Contacter →
        </a>
      </div>
    </div>
  );
}

// ─── Non-dilutif card ─────────────────────────────────────────────────────────

function NonDilutifCard({ match, delay = 0 }: { match: MatchResult; delay?: number }) {
  const ref = useFadeIn([match.investor.id]);
  const inv = match.investor;
  const initials = inv.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      ref={ref}
      style={{ opacity: 0, transform: 'translateY(16px)', transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms` }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header vert */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: '#F6FFF4', borderBottom: '1px solid #D8FFBD' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
          style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-gray-900 truncate">{inv.name}</p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: '#2D6A00' }}>{formatTicket(inv.ticketMin, inv.ticketMax)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[18px] font-black" style={{ color: '#2D6A00' }}>{fmtMoney(inv.ticketMax)}</p>
          <p className="text-[10px] text-gray-400">potentiel max</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">{inv.description}</p>
        <div className="space-y-1.5 mb-3">
          {inv.criteria.slice(0, 3).map((c: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: '#2D6A00' }}>✓</span>
              <span className="text-[11px] text-gray-600">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
        <span className="text-[11px] font-bold rounded-full px-3 py-1" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
          {match.score}% éligible
        </span>
        <button className="px-4 py-1.5 rounded-full text-[12px] font-bold transition-colors hover:opacity-90"
          style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
          Préparer le dossier →
        </button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FundraisingPage() {
  const { profile, score, isPremium } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'dilutif' | 'nonDilutif'>('dilutif');

  const startup = useMemo(() => ({
    id: 'user',
    name: profile.startupName || 'Ma Startup',
    sector: normalizeSectorForMatch(profile.sector),
    stage: profile.stage,
    fundingAmount: profile.fundraisingGoal ?? 0,
    mrr: profile.mrr ?? 0,
    location: profile.city || profile.region || profile.country || 'France',
    description: profile.description,
    emoji: '🚀',
  }), [profile]);

  const matches = useMemo(() => {
    if (!profile.sector && !profile.fundraisingGoal) return null;
    return matchInvestors(startup, 10);
  }, [startup, profile.sector, profile.fundraisingGoal]);

  const dilutiveMatches = matches?.dilutive ?? [];
  const nonDilutiveMatches = matches?.nonDilutive ?? [];
  const visibleDilutive = isPremium ? dilutiveMatches : dilutiveMatches.slice(0, 3);
  const lockedCount = isPremium ? 0 : Math.max(0, dilutiveMatches.length - 3);

  const hasProfile = !!(profile.sector || profile.stage);
  const isIncomplete = !profile.sector || !profile.fundraisingGoal;

  const mix = getMixRecommendation(profile);
  const stageInfo = getStageLabel(profile.stage);
  const sectorStyle = getSectorStyle(profile.sector);
  const mrrBadge = getMRRBadge(profile.mrr, profile.isPreRevenue);

  const initials = ((profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')).toUpperCase()
    || (profile.startupName?.[0] ?? 'S').toUpperCase();

  const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const headerRef  = useFadeIn([]);
  const bannerRef  = useFadeIn([]);
  const gaugeRef   = useFadeIn([]);

  return (
    <div style={{ backgroundColor: '#F8F8F8', minHeight: '100vh' }} className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* CHANGEMENT 1 — Header                                                 */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <div
          ref={headerRef}
          style={{ opacity: 0, transform: 'translateY(12px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-[28px] font-bold leading-tight" style={{ color: '#0A0A0A' }}>
              Votre stratégie de financement
            </h1>
            <p className="text-[13px] mt-1" style={{ color: '#6B7280' }}>
              Matchs calculés en temps réel selon votre profil · Mis à jour le {todayStr}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: '#0A0A0A', color: '#0A0A0A' }}>
              <Monitor className="h-4 w-4" />
              Mode démo
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#0A0A0A' }}>
              <Download className="h-4 w-4" />
              Exporter →
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* CHANGEMENT 2 — Bandeau profil dark                                    */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        {hasProfile && (
          <div
            ref={bannerRef}
            style={{
              backgroundColor: '#0A0A0A', borderRadius: 16, padding: '24px',
              opacity: 0, transform: 'translateY(12px)', transition: 'opacity 0.45s ease 80ms, transform 0.45s ease 80ms',
            }}
          >
            {/* 4 colonnes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">

              {/* Col 1 — Identité */}
              <div className="flex flex-col gap-3 lg:pr-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[16px] shrink-0"
                    style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[16px] text-white truncate">{profile.startupName || 'Ma Startup'}</p>
                  </div>
                </div>
                {profile.sector && (
                  <span className="self-start text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: sectorStyle.bg, color: sectorStyle.text }}>
                    {profile.sector}
                  </span>
                )}
              </div>

              {/* Séparateur */}
              <div className="hidden lg:block w-px self-stretch" style={{ backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 24 }} />

              {/* Col 2 — Stade */}
              <div className="flex flex-col gap-1 lg:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#F4B8CC' }}>Stade</p>
                <p className="text-[22px] font-bold text-white leading-tight">{stageInfo.label}</p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{stageInfo.desc}</p>
              </div>

              {/* Séparateur */}
              <div className="hidden lg:block w-px self-stretch" style={{ backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 24 }} />

              {/* Col 3 — Objectif */}
              <div className="flex flex-col gap-1 lg:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#F4B8CC' }}>Objectif levée</p>
                <p className="text-[22px] font-bold text-white leading-tight">
                  {profile.fundraisingGoal ? fmtMoney(profile.fundraisingGoal) : '—'}
                </p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Dilution max : {profile.maxDilution ? `${profile.maxDilution}%` : 'Non renseignée'}
                </p>
              </div>

              {/* Séparateur */}
              <div className="hidden lg:block w-px self-stretch" style={{ backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 24 }} />

              {/* Col 4 — MRR */}
              <div className="flex flex-col gap-1 lg:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#F4B8CC' }}>MRR actuel</p>
                <p className="text-[22px] font-bold text-white leading-tight">
                  {profile.isPreRevenue ? 'Pré-revenu' : profile.mrr ? fmtMoney(profile.mrr) : '—'}
                </p>
                <span className="self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: mrrBadge.bg, color: mrrBadge.text }}>
                  {mrrBadge.label}
                </span>
              </div>
            </div>

            {/* Footer barre de stats */}
            <div className="mt-6 pt-4 flex justify-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-[12px] text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Score Raisup <span className="text-white font-semibold">{score.total}/100</span>
                {' · '}
                <span className="text-white font-semibold">{dilutiveMatches.length}</span> investisseurs identifiés
                {' · '}
                <span className="text-white font-semibold">{nonDilutiveMatches.length}</span> dispositifs éligibles
              </p>
            </div>
          </div>
        )}

        {/* Profil incomplet */}
        {isIncomplete && (
          <div className="rounded-2xl border-2 border-dashed p-5 flex items-start gap-3"
            style={{ borderColor: '#FFB96D', backgroundColor: '#FFFBEB' }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-[14px]" style={{ color: '#92400E' }}>Profil incomplet</p>
              <p className="text-[13px] mt-0.5" style={{ color: '#92400E' }}>
                Complétez au minimum votre {!profile.sector ? "secteur d'activité" : 'objectif de levée'} pour voir vos matchs.
              </p>
              <a href="/dashboard/settings" className="inline-block mt-3 px-4 py-1.5 rounded-full text-[12px] font-bold text-white"
                style={{ backgroundColor: '#0A0A0A' }}>
                Compléter mon profil →
              </a>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* CHANGEMENT 3 — Jauge Mix de financement                               */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        {hasProfile && (
          <div
            ref={gaugeRef}
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 16, padding: '28px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              opacity: 0, transform: 'translateY(12px)', transition: 'opacity 0.45s ease 160ms, transform 0.45s ease 160ms',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-6">
              <div>
                <p className="text-[18px] font-bold" style={{ color: '#0A0A0A' }}>Mix de financement recommandé</p>
                <p className="text-[13px] mt-0.5" style={{ color: '#6B7280' }}>Basé sur votre stade et vos objectifs</p>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
                {stageInfo.label}
              </span>
            </div>

            {/* Les deux grandes cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

              {/* Card Dilutif */}
              <div style={{
                backgroundColor: '#F0F4FF', border: '1.5px solid #ABC5FE',
                borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <TrendingUp style={{ width: 32, height: 32, color: '#1A3A8F' }} />
                <div className="text-center">
                  <p className="text-[52px] font-black leading-none" style={{ color: '#1A3A8F' }}>{mix.dilutif}%</p>
                  <p className="text-[12px] font-bold uppercase tracking-widest mt-1" style={{ color: '#1A3A8F' }}>Dilutif</p>
                  <p className="text-[12px] mt-1" style={{ color: '#4B5563' }}>VCs, Angels, Family Offices</p>
                </div>
                {profile.fundraisingGoal && (
                  <p className="text-[16px] font-bold" style={{ color: '#1A3A8F' }}>
                    {fmtMoney(Math.round(profile.fundraisingGoal * mix.dilutif / 100))}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {['Décision rapide', 'Réseau investisseur', 'Smart money'].map(t => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#ABC5FE', color: '#1A3A8F' }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Card Non-dilutif */}
              <div style={{
                backgroundColor: '#F0FFF4', border: '1.5px solid #D8FFBD',
                borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <Shield style={{ width: 32, height: 32, color: '#2D6A00' }} />
                <div className="text-center">
                  <p className="text-[52px] font-black leading-none" style={{ color: '#2D6A00' }}>{mix.nonDilutif}%</p>
                  <p className="text-[12px] font-bold uppercase tracking-widest mt-1" style={{ color: '#2D6A00' }}>Non-dilutif</p>
                  <p className="text-[12px] mt-1" style={{ color: '#4B5563' }}>BPI, CIR, Subventions</p>
                </div>
                {profile.fundraisingGoal && (
                  <p className="text-[16px] font-bold" style={{ color: '#2D6A00' }}>
                    {fmtMoney(Math.round(profile.fundraisingGoal * mix.nonDilutif / 100))}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {['Sans dilution', 'Remboursable ou non', 'Cumulable'].map(t => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: '#F3F4F6' }}>
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${mix.dilutif}%`, backgroundColor: '#ABC5FE', borderRadius: '8px 0 0 8px' }}
                />
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${mix.nonDilutif}%`, backgroundColor: '#D8FFBD', borderRadius: '0 8px 8px 0' }}
                />
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#ABC5FE' }} />
                  <span className="text-[11px] text-gray-500">Dilutif — {mix.dilutif}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#D8FFBD' }} />
                  <span className="text-[11px] text-gray-500">Non-dilutif — {mix.nonDilutif}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* CHANGEMENT 4 — Onglets Dilutif / Non-dilutif                          */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        {hasProfile && (
          <div className="space-y-6">
            {/* Tab switcher */}
            <div className="inline-flex p-1.5 rounded-xl gap-1" style={{ backgroundColor: '#F3F4F6' }}>
              <button
                onClick={() => setActiveTab('dilutif')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-[14px] font-semibold transition-all"
                style={activeTab === 'dilutif'
                  ? { backgroundColor: '#0A0A0A', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#6B7280' }}
              >
                <Users className="h-4 w-4" />
                Dilutif
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={activeTab === 'dilutif'
                    ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                    : { backgroundColor: '#E5E7EB', color: '#374151' }}>
                  {dilutiveMatches.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('nonDilutif')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-[14px] font-semibold transition-all"
                style={activeTab === 'nonDilutif'
                  ? { backgroundColor: '#D8FFBD', color: '#2D6A00' }
                  : { backgroundColor: 'transparent', color: '#6B7280' }}
              >
                <Shield className="h-4 w-4" />
                Non-dilutif
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={activeTab === 'nonDilutif'
                    ? { backgroundColor: 'rgba(45,106,0,0.15)', color: '#2D6A00' }
                    : { backgroundColor: '#E5E7EB', color: '#374151' }}>
                  {nonDilutiveMatches.length}
                </span>
              </button>
            </div>

            {/* Légende scores */}
            <div className="flex flex-wrap gap-2">
              {[
                { bg: '#D8FFBD', text: '#2D6A00', label: '≥ 80% — Excellent match' },
                { bg: '#FFB96D', text: '#7A3D00', label: '50-79% — Bon match' },
                { bg: '#FFB3B3', text: '#8F1A1A', label: '< 50% — Match partiel' },
              ].map(s => (
                <span key={s.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: s.bg, color: s.text }}>
                  ● {s.label}
                </span>
              ))}
            </div>

            {/* ── Tab content */}
            {activeTab === 'dilutif' && (
              <div className="space-y-4">
                {dilutiveMatches.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="font-bold text-gray-700">Aucun match trouvé</p>
                    <p className="text-[13px] text-gray-500 mt-1">Complétez votre secteur, stade et objectif.</p>
                  </div>
                ) : (
                  <>
                    {visibleDilutive.map((match, i) => (
                      <InvestorCard key={match.investor.id} match={match} isLocked={false} delay={i * 80} />
                    ))}
                    {lockedCount > 0 && (
                      <div className="relative">
                        <div className="space-y-4">
                          {dilutiveMatches.slice(3, 5).map((match, i) => (
                            <InvestorCard key={match.investor.id} match={match} isLocked delay={(i + visibleDilutive.length) * 80} />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                          style={{ backgroundColor: 'rgba(255,255,255,0.88)' }}>
                          <p className="text-3xl mb-2">🔒</p>
                          <p className="font-bold text-[16px]" style={{ color: '#0A0A0A' }}>+{lockedCount} investisseurs</p>
                          <p className="text-[12px] text-gray-500 mb-4 text-center px-6">
                            Débloquez tous vos matchs pour accéder aux profils complets
                          </p>
                          <a href="/pricing" className="px-6 py-2 rounded-full text-[13px] font-bold text-white"
                            style={{ backgroundColor: '#0A0A0A' }}>
                            Débloquez mes matchs →
                          </a>
                        </div>
                      </div>
                    )}
                    {/* Bandeau premium */}
                    {!isPremium && dilutiveMatches.length > 3 && (
                      <div className="rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
                        style={{ backgroundColor: '#FFD6E5' }}>
                        <p className="text-[13px] font-medium" style={{ color: '#0A0A0A' }}>
                          Vous avez <strong>{dilutiveMatches.length} investisseurs compatibles</strong> — débloquez-les tous pour 49€/mois
                        </p>
                        <a href="/pricing" className="shrink-0 px-5 py-2 rounded-full text-[13px] font-bold text-white whitespace-nowrap"
                          style={{ backgroundColor: '#0A0A0A' }}>
                          Voir tous mes matchs →
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'nonDilutif' && (
              <div className="space-y-4">
                {nonDilutiveMatches.length === 0 ? (
                  <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#F0FFF4' }}>
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-bold text-gray-700">Aucun dispositif trouvé</p>
                    <p className="text-[13px] text-gray-500 mt-1">Renseignez votre secteur pour voir les subventions éligibles.</p>
                  </div>
                ) : (
                  nonDilutiveMatches.map((match, i) => (
                    <NonDilutifCard key={match.investor.id} match={match} delay={i * 80} />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state global */}
        {!hasProfile && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center"
            style={{ borderRadius: 16 }}>
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-[18px] font-bold text-gray-900 mb-2">Complétez votre profil pour voir vos matchs</p>
            <p className="text-[14px] text-gray-500 mb-6 max-w-md mx-auto">
              Renseignez votre secteur, stade et objectif de levée pour accéder à vos investisseurs personnalisés.
            </p>
            <a href="/onboarding/raisup" className="inline-block px-8 py-3 rounded-full text-[14px] font-bold text-white"
              style={{ backgroundColor: '#0A0A0A' }}>
              Compléter mon profil →
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
