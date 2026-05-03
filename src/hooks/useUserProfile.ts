import { useMemo, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { calculateScore, ScoreResult } from '../services/calculateScore';

// ─── Profile shape ─────────────────────────────────────────────────────────────

export interface TeamMemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  photo: string | null;
  experience: string;
  hasPreviousStartup: boolean;
  hadExit: boolean;
}

export interface UserProfile {
  // Identity
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Startup
  startupName: string;
  description: string;
  sector: string;
  businessModel: string;
  clientType: string;
  legalForm: string;
  founderShare: number | null;
  country: string;
  region: string;
  city: string;
  ambition: string;
  // Financials
  isPreRevenue: boolean;
  mrr: number | null;
  momGrowth: number | null;
  activeClients: number | null;
  runway: number | null;
  burnRate: number | null;
  teamSize: number | null;
  hasCTO: boolean;
  // Pitch
  problem: string;
  solution: string;
  competitiveAdvantage: string;
  // Team
  team: TeamMemberProfile[];
  // Funding
  fundraisingGoal: number | null;
  fundingTimeline: string;
  maxDilution: number | null;
  fundingPreference: string;
  finalGoalValuation: number | null;
  finalObjective: string;
  // Deck
  deckFileName: string;
  // Derived
  stage: 'pre-seed' | 'seed' | 'series-a';
  profileCompletion: number; // 0-100
}

export type RaisupScore = ScoreResult;

export interface ProfileKPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  goodIfUp: boolean;
  history: { month: string; value: number }[];
  lastUpdated: string;
  fromProfile: boolean; // true = from onboarding, no real history
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function deriveStage(p: Partial<UserProfile>): 'pre-seed' | 'seed' | 'series-a' {
  const mrr = p.mrr ?? 0;
  if (p.isPreRevenue || mrr === 0) return 'pre-seed';
  if (mrr >= 50_000) return 'series-a';
  return 'seed';
}

function calcProfileCompletion(p: Partial<UserProfile>): number {
  const checks = [
    !!p.firstName,
    !!p.lastName,
    !!p.email,
    !!p.startupName,
    !!p.sector,
    !!p.businessModel,
    !!p.city,
    !!p.ambition,
    !!(p.mrr || p.isPreRevenue),
    !!(p.problem && p.problem.length > 20),
    !!(p.solution && p.solution.length > 20),
    !!(p.team && p.team.length > 0),
    !!p.fundraisingGoal,
    !!p.finalObjective,
    !!p.deckFileName,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}


// Generate a plausible 6-month synthetic history for a single current value
function syntheticHistory(currentValue: number, label: string): { month: string; value: number }[] {
  const months = ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'];
  // Slight downward trend from current to make current look like a peak
  return months.map((month, i) => ({
    month,
    value: Math.max(0, Math.round(currentValue * (0.6 + (i / months.length) * 0.4))),
  }));
}

function buildKPIs(p: Partial<UserProfile>): ProfileKPI[] {
  const today = new Date().toISOString().split('T')[0];
  const kpis: ProfileKPI[] = [];

  // MRR
  const mrr = p.mrr ?? 0;
  if (!p.isPreRevenue) {
    kpis.push({
      id: 'mrr', label: 'MRR', value: mrr, unit: '€',
      change: p.momGrowth ?? 0, goodIfUp: true,
      history: syntheticHistory(mrr, 'mrr'),
      lastUpdated: today, fromProfile: true,
    });
  }

  // Croissance MoM
  if (p.momGrowth != null) {
    kpis.push({
      id: 'growth', label: 'Croissance MoM', value: p.momGrowth, unit: '%',
      change: 0, goodIfUp: true,
      history: syntheticHistory(p.momGrowth, 'growth'),
      lastUpdated: today, fromProfile: true,
    });
  }

  // Clients actifs
  if (p.activeClients != null) {
    kpis.push({
      id: 'clients', label: 'Clients actifs', value: p.activeClients, unit: '',
      change: 0, goodIfUp: true,
      history: syntheticHistory(p.activeClients, 'clients'),
      lastUpdated: today, fromProfile: true,
    });
  }

  // Runway
  if (p.runway != null) {
    kpis.push({
      id: 'runway', label: 'Runway', value: p.runway, unit: ' mois',
      change: 0, goodIfUp: true,
      history: Array.from({ length: 6 }, (_, i) => ({
        month: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'][i],
        value: Math.max(0, p.runway! + (5 - i)), // runway decreasing naturally
      })),
      lastUpdated: today, fromProfile: true,
    });
  }

  // Burn rate
  if (p.burnRate != null) {
    kpis.push({
      id: 'burn', label: 'Burn rate', value: p.burnRate, unit: '€/mois',
      change: 0, goodIfUp: false,
      history: syntheticHistory(p.burnRate, 'burn'),
      lastUpdated: today, fromProfile: true,
    });
  }

  return kpis;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/** Dispatch this whenever you write profile data to localStorage (same-tab reactivity). */
export function notifyProfileUpdated() {
  window.dispatchEvent(new CustomEvent('raisup:profile-updated'));
}

export function useUserProfile() {
  const { user } = useAuth();
  const [dbData, setDbData] = useState<Partial<UserProfile> | null>(null);
  const [localTick, setLocalTick] = useState(0);

  // Re-read localStorage whenever another component saves the profile
  useEffect(() => {
    const handler = () => setLocalTick(t => t + 1);
    window.addEventListener('raisup:profile-updated', handler);
    return () => window.removeEventListener('raisup:profile-updated', handler);
  }, []);

  useEffect(() => {
    // Use auth user.id directly — works on any browser without relying on localStorage
    const userId = user?.id;
    if (!userId) return;
    supabase.from('profiles').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single().then(({ data }) => {
      if (!data) return;
      setDbData({
        startupName: data.startup_name,
        ambition: data.ambition,
        businessModel: data.business_model,
        sector: data.sector,
        clientType: data.client_type,
        country: data.country,
        region: data.region,
        city: data.city,
        mrr: data.mrr,
        momGrowth: data.growth_mom,
        activeClients: data.active_clients,
        runway: data.runway,
        burnRate: data.burn_rate,
        fundraisingGoal: data.fundraising_goal,
        maxDilution: data.max_dilution,
        fundingPreference: data.funding_preference,
        finalGoalValuation: data.final_goal_valuation,
        fundingTimeline: data.fundraising_timeline,
        hasCTO: data.has_cto,
        problem: data.problem,
        solution: data.solution,
        competitiveAdvantage: data.competitive_advantage,
        teamSize: data.team_size,
      });
    });
  }, [user?.id]);

  const profile = useMemo<UserProfile>(() => {
    let stored: Partial<UserProfile> = {};
    try {
      const a = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      const b = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
      // raisup_profile (new form) takes priority, then Supabase overrides
      stored = { ...b, ...a, ...(dbData || {}) };
    } catch { /* ignore */ }

    // Fill email from Supabase auth if not in localStorage
    const email = stored.email || user?.email || '';
    const firstName = stored.firstName || (stored as Record<string, unknown>).founderName as string || '';
    const lastName = stored.lastName || '';

    const raw: Partial<UserProfile> = {
      ...stored,
      email,
      firstName,
      lastName,
    };

    const stage = deriveStage(raw);
    const profileCompletion = calcProfileCompletion(raw);

    return {
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      email: raw.email || '',
      phone: raw.phone || '',
      startupName: raw.startupName || (raw as Record<string, unknown>).projectName as string || '',
      description: raw.description || '',
      sector: raw.sector || '',
      businessModel: raw.businessModel || '',
      clientType: raw.clientType || '',
      legalForm: raw.legalForm || '',
      founderShare: raw.founderShare ?? null,
      country: raw.country || 'France',
      region: raw.region || '',
      city: raw.city || '',
      ambition: raw.ambition || '',
      isPreRevenue: raw.isPreRevenue ?? false,
      mrr: raw.mrr ?? null,
      momGrowth: raw.momGrowth ?? null,
      activeClients: raw.activeClients ?? null,
      runway: raw.runway ?? null,
      burnRate: raw.burnRate ?? null,
      teamSize: raw.teamSize ?? null,
      hasCTO: raw.hasCTO ?? false,
      problem: raw.problem || '',
      solution: raw.solution || '',
      competitiveAdvantage: raw.competitiveAdvantage || '',
      team: raw.team ?? [],
      fundraisingGoal: raw.fundraisingGoal ?? null,
      fundingTimeline: raw.fundingTimeline || '',
      maxDilution: raw.maxDilution ?? null,
      fundingPreference: raw.fundingPreference || '',
      finalGoalValuation: raw.finalGoalValuation ?? null,
      finalObjective: raw.finalObjective || '',
      deckFileName: raw.deckFileName || '',
      stage,
      profileCompletion,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dbData, localTick]);

  const score = useMemo(() => calculateScore(profile), [profile]);
  const kpis = useMemo(() => buildKPIs(profile), [profile]);
  // Tout utilisateur authentifié est considéré premium (demo)
  // Sinon : fallback sur les clés localStorage posées par PricingPage
  const isPremium = useMemo(() =>
    !!user
    || localStorage.getItem('raisup_paid') === 'true'
    || localStorage.getItem('raisup_is_premium') === 'true'
  , [user]);

  return { profile, score, kpis, isPremium, user };
}
