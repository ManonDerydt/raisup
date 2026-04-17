import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ArrowLeft, Upload, CheckCircle, X,
  Mail, MapPin, User, Building2, Plus, Camera, Users, Check,
  TrendingUp, DollarSign, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  role: string;
  customRole: string;
  responsibilities: string;
  experience: string;
  linkedin: string;
  hasPreviousStartup: boolean;
  hadExit: boolean;
  isFounder: boolean;
};

export type OnboardingFormData = {
  // Step 1 — Identité
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  city: string;

  // Step 2 — Projet
  oneLiner: string;
  originStory: string;
  startupName: string;
  businessModel: string;
  sector: string;
  clientType: string;
  description: string;
  legalForm: string;
  founderShare: number | null;
  ambition: string;

  // Step 3 — Marché
  potentialCustomers: number;
  averagePrice: number;
  competitors: string[];
  targetMarkets: string[];

  // Step 4 — Chiffres
  bestMonthRevenue: number | null;
  bestMonthClients: number | null;
  isPreRevenue: boolean;
  mrr: number | null;
  hasLOI: boolean;
  loiCount: number | null;
  momGrowth: number | null;
  activeClients: number | null;
  churnRate: number | null;
  runway: number | null;
  burnRate: number | null;
  teamSize: number | null;
  hasCTO: boolean;
  problem: string;
  solution: string;
  competitiveAdvantage: string;
  previousFunding: string[];

  // Step 5 — Équipe
  whyYou: string;
  teamFailure: string;
  team: TeamMember[];
  hasAdvisors: boolean;

  // Step 6 — Ambition
  deckFileName: string;
  deckSize: number;
  deckBase64: string | null;
  fundraisingGoal: number | null;
  fundingTimeline: string;
  maxDilution: number | null;
  fundingPreference: string;
  finalGoalValuation: number | null;
  fundUsage: string[];
  finalObjective: string;
  freeText: string;
};

type LiveInsight = { icon: string; color: string; textColor: string; text: string };
type LiveAlert  = { type: 'warning' | 'danger'; text: string };
type LiveAnalysis = {
  detectedSector: string;
  detectedModel: string;
  estimatedTAM: number | null;
  scorePreview: number;
  alerts: LiveAlert[];
  insights: LiveInsight[];
};

const EMPTY_ANALYSIS: LiveAnalysis = {
  detectedSector: '', detectedModel: '', estimatedTAM: null,
  scorePreview: 0, alerts: [], insights: [],
};

// ─── Default ──────────────────────────────────────────────────────────────────

const DEFAULT: OnboardingFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  country: 'France', region: '', city: '',
  oneLiner: '', originStory: '',
  startupName: '', businessModel: '', sector: '', clientType: '',
  description: '', legalForm: '', founderShare: null, ambition: '',
  potentialCustomers: 0, averagePrice: 0,
  competitors: ['', '', ''],
  targetMarkets: [],
  bestMonthRevenue: null, bestMonthClients: null,
  isPreRevenue: false, mrr: null, hasLOI: false, loiCount: null,
  momGrowth: null, activeClients: null, churnRate: null,
  runway: null, burnRate: null, teamSize: null, hasCTO: false,
  problem: '', solution: '', competitiveAdvantage: '',
  previousFunding: [],
  whyYou: '', teamFailure: '', team: [], hasAdvisors: false,
  deckFileName: '', deckSize: 0, deckBase64: null,
  fundraisingGoal: null, fundingTimeline: '', maxDilution: null,
  fundingPreference: '', finalGoalValuation: null,
  fundUsage: [], finalObjective: '', freeText: '',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Belgique', label: '🇧🇪 Belgique' },
  { value: 'Irlande', label: '🇮🇪 Irlande' },
  { value: 'Luxembourg', label: '🇱🇺 Luxembourg' },
  { value: 'Suisse', label: '🇨🇭 Suisse' },
  { value: 'Autre EU', label: '🇪🇺 Autre pays EU' },
  { value: 'Hors EU', label: '🌍 Hors UE' },
];

const REGIONS_FRANCE = [
  'Île-de-France', 'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté',
  'Bretagne', 'Centre-Val de Loire', 'Corse', 'Grand Est',
  'Hauts-de-France', 'Normandie', 'Nouvelle-Aquitaine',
  'Occitanie', 'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
];

const SECTORS = [
  { value: 'Fintech', emoji: '💳' }, { value: 'Healthtech', emoji: '🏥' },
  { value: 'Edtech', emoji: '🎓' }, { value: 'Proptech', emoji: '🏠' },
  { value: 'Greentech', emoji: '🌿' }, { value: 'SaaS B2B', emoji: '⚙️' },
  { value: 'E-commerce', emoji: '🛍️' }, { value: 'IA & Data', emoji: '🤖' },
  { value: 'Marketplace', emoji: '🔄' }, { value: 'Deeptech', emoji: '🔬' },
  { value: 'Legaltech', emoji: '⚖️' }, { value: 'Foodtech', emoji: '🍔' },
  { value: 'Autre', emoji: '📦' },
];

const BUSINESS_MODELS = [
  { value: 'SaaS', desc: 'Abonnement logiciel mensuel/annuel' },
  { value: 'Marketplace', desc: 'Commission sur transactions' },
  { value: 'E-commerce', desc: 'Vente directe de produits' },
  { value: 'Freemium', desc: 'Gratuit + options premium' },
  { value: 'Hardware + services', desc: 'Matériel + récurrence' },
  { value: 'Licences', desc: 'Licences logicielles / IP' },
];

const CLIENT_TYPES = [
  { value: 'B2B', label: 'B2B', sub: 'Entreprises', color: '#ABC5FE', textColor: '#1A3A8F' },
  { value: 'B2C', label: 'B2C', sub: 'Particuliers', color: '#CDB4FF', textColor: '#3D0D8F' },
  { value: 'Les deux', label: 'B2B2C', sub: 'Les deux', color: '#FFB96D', textColor: '#7A3D00' },
];

const LEGAL_FORMS = ['SAS', 'SASU', 'SARL', 'EURL', 'SA', 'Auto-entrepreneur', 'Non encore créée'];

const AMBITIONS = [
  { value: 'Rentabilité et indépendance', label: 'Rentabilité', sub: 'Croissance organique, sans investisseurs', color: '#D8FFBD', textColor: '#2D6A00' },
  { value: 'Leader marché français', label: 'Leader France', sub: 'Conquérir le marché français', color: '#ABC5FE', textColor: '#1A3A8F' },
  { value: 'Expansion européenne', label: 'Expansion EU', sub: 'Scale en Europe dans 2-3 ans', color: '#CDB4FF', textColor: '#3D0D8F' },
  { value: 'Scale-up et exit', label: 'Exit / Cession', sub: 'Acquisition ou IPO visée', color: '#FFB96D', textColor: '#7C4010' },
  { value: 'Licorne', label: 'Licorne 🦄', sub: 'Valorisation > 1 milliard €', color: '#F4B8CC', textColor: '#9D2B5A' },
  { value: 'Je ne sais pas encore', label: 'À définir', sub: 'Je découvre mes options', color: '#F3F4F6', textColor: '#374151' },
];

const FINAL_OBJECTIVES = [
  { value: 'Autofinancement', icon: '🔒', label: 'Autofinancement', desc: "Atteindre la rentabilité sans dépendre d'investisseurs", tag: 'Indépendance' },
  { value: 'Acquisition', icon: '🤝', label: 'Être acquis', desc: 'Vendre à un grand groupe ou concurrent', tag: 'Exit' },
  { value: 'IPO', icon: '📊', label: 'Introduction en bourse', desc: 'Entrer sur les marchés financiers publics', tag: 'IPO' },
  { value: 'Impact social', icon: '🌍', label: 'Impact social', desc: "Priorité à la mission plutôt qu'au retour financier", tag: 'Impact' },
  { value: 'Licorne', icon: '🦄', label: 'Licorne', desc: 'Atteindre 1Md€ de valorisation', tag: 'Ambition max' },
  { value: 'Lifestyle', icon: '🌴', label: 'Lifestyle business', desc: 'Entreprise profitable et épanouissante', tag: 'Liberté' },
];

const FUNDING_PREFERENCES = [
  { value: 'Equity', label: 'Equity', sub: 'Levée avec dilution', icon: '📈' },
  { value: 'Prêt / dette', label: 'Prêt', sub: 'Sans dilution, remboursable', icon: '🏦' },
  { value: 'Subventions', label: 'Subventions', sub: 'BPI, régions, Europe', icon: '🏛️' },
  { value: 'Mixte', label: 'Mixte', sub: 'Combiner plusieurs sources', icon: '🔀' },
];

const FUND_USAGE = [
  { value: 'Recrutement', icon: '👥' }, { value: 'Produit / Tech', icon: '⚙️' },
  { value: 'Marketing / Growth', icon: '📣' }, { value: 'Commercial / Sales', icon: '🤝' },
  { value: 'R&D', icon: '🔬' }, { value: 'Infrastructure', icon: '🏗️' },
  { value: 'Internationalisation', icon: '🌍' }, { value: 'Stock / Inventaire', icon: '📦' },
];

const TARGET_MARKETS = ['France', 'Europe', 'USA', 'Asie', 'Monde entier'];
const PREV_FUNDING_OPTIONS = ['Fonds propres', 'Love money', 'BPI', 'Angels', 'Amorçage VC', 'Subventions', 'Aucun'];
const EXPERIENCES = ['< 1 an dans le secteur', '1 à 3 ans', '3 à 10 ans', '> 10 ans — expert reconnu'];
const ROLES = [
  'CEO / Co-fondateur', 'CTO / Directeur Technique', 'CFO / Directeur Financier',
  'CMO / Directeur Marketing', 'COO / Directeur Opérations', 'CPO / Directeur Produit',
  'Lead Developer', 'Head of Sales', 'Head of Growth', 'Associé', 'Advisor / Mentor', 'Autre',
];
const AVATAR_COLORS = [
  { bg: '#D8FFBD', text: '#2D6A00' }, { bg: '#ABC5FE', text: '#1A3A8F' },
  { bg: '#CDB4FF', text: '#3D0D8F' }, { bg: '#FFB96D', text: '#7C4010' },
];
const STEP_LABELS = ['Identité', 'Projet', 'Marché', 'Chiffres', 'Équipe', 'Ambition'];

// Log sliders
const CUSTOMERS_SCALE = [100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000];
const CUSTOMERS_LABELS = ['100', '1K', '10K', '100K', '1M', '10M', '100M+'];
const PRICE_SCALE = [10, 50, 100, 500, 1_000, 5_000, 10_000, 50_000, 100_000];
const PRICE_LABELS = ['10€', '50€', '100€', '500€', '1K€', '5K€', '10K€', '50K€', '100K€'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function getInitials(f: string, l: string): string {
  return `${(f[0] ?? '?')}${(l[0] ?? '')}`.toUpperCase();
}

function newMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: Math.random().toString(36).slice(2),
    firstName: '', lastName: '', photo: null,
    role: '', customRole: '', responsibilities: '',
    experience: '', linkedin: '',
    hasPreviousStartup: false, hadExit: false, isFounder: false,
    ...overrides,
  };
}

function numOrNull(v: string): number | null {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function fmtAmount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}Md€`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M€`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K€`;
  return `${n}€`;
}

function detectSectorFromText(text: string): string {
  if (!text || text.length < 15) return '';
  const t = text.toLowerCase();
  if (/sant[eé]|médic|health|patient|hôpital|pharmac|clinique|médecin/.test(t)) return 'HealthTech';
  if (/financ|paiement|banque|assur|crédit|fintech|invest|crypto/.test(t)) return 'FinTech';
  if (/\bia\b|intelligence artificielle|machine learning|deep learning|nlp|llm|gpt|data/.test(t)) return 'IA & Data';
  if (/formation|apprentissage|[eé]ducation|cours|[eé]cole|[eé]tudiant/.test(t)) return 'EdTech';
  if (/immobilier|logement|habitat|proptech|location immob/.test(t)) return 'PropTech';
  if (/climat|environnement|[eé]nergie|carbone|renouvelable|[eé]cologie/.test(t)) return 'GreenTech';
  if (/rh\b|recrutement|talent|emploi|ressources humaines/.test(t)) return 'HRTech';
  if (/marketplace|place de march[eé]|vendeur.*acheteur/.test(t)) return 'Marketplace';
  if (/saas|b2b|logiciel.*entreprise|automatisation|workflow/.test(t)) return 'SaaS B2B';
  if (/alimentaire|restauration|foodtech|nourriture|repas/.test(t)) return 'FoodTech';
  if (/robotique|iot|capteur|deeptech|quantum|spatial/.test(t)) return 'DeepTech';
  if (/juridique|legal|avocat|contrat|conformit[eé]/.test(t)) return 'LegalTech';
  return '';
}

function getMRRPercentile(mrr: number, stage: string): number {
  if (stage === 'pre-seed') {
    if (mrr > 10_000) return 5; if (mrr > 5_000) return 15;
    if (mrr > 1_000) return 30; return 50;
  }
  if (mrr > 50_000) return 10; if (mrr > 20_000) return 25;
  if (mrr > 10_000) return 40; return 60;
}

function calcLiveScore(f: OnboardingFormData): number {
  let score = 0;
  // Pitch (0-25)
  const pitchText = f.oneLiner + f.originStory + f.problem + f.solution;
  if (pitchText.length > 200) score += 20; else if (pitchText.length > 80) score += 12; else if (pitchText.length > 20) score += 6;
  if ((f.competitiveAdvantage?.length ?? 0) > 30) score += 5; else if ((f.competitiveAdvantage?.length ?? 0) > 10) score += 2;
  // Traction (0-25)
  const mrr = f.mrr ?? 0;
  if (!f.isPreRevenue && mrr > 0) score += mrr >= 50_000 ? 18 : mrr >= 10_000 ? 14 : mrr >= 1_000 ? 9 : 4;
  if (f.isPreRevenue && f.hasLOI) score += 5;
  if (f.momGrowth) score += f.momGrowth >= 20 ? 5 : f.momGrowth >= 10 ? 3 : 1;
  if ((f.runway ?? 0) >= 12) score += 2;
  // Team (0-25)
  if (f.hasCTO || f.team.some(m => m.role.includes('CTO'))) score += 5;
  if (f.team.some(m => m.hadExit)) score += 10; else if (f.team.some(m => m.hasPreviousStartup)) score += 6;
  if (f.team.length >= 2) score += 5; if ((f.whyYou?.length ?? 0) > 80) score += 5;
  // Market (0-25)
  if (f.businessModel) score += 5; if (f.sector) score += 5;
  if (f.clientType) score += 4; if (f.ambition) score += 4;
  if (f.potentialCustomers > 0 && f.averagePrice > 0) score += 7;

  return Math.min(100, score);
}

function analyzeFormDataLive(f: OnboardingFormData): LiveAnalysis {
  const insights: LiveInsight[] = [];
  const alerts: LiveAlert[] = [];

  // Sector detection
  const detectedSector = f.sector || detectSectorFromText(f.oneLiner + ' ' + f.originStory);
  const detectedModel = f.businessModel;

  // Welcome insight
  if (f.firstName && f.email) {
    insights.push({ icon: '👋', color: '#D8FFBD', textColor: '#2D6A00', text: `Bienvenue ${f.firstName} — votre profil Raisup est en cours de création` });
  }

  // Sector insight
  if (detectedSector && detectedSector !== f.sector && f.oneLiner.length > 20) {
    insights.push({ icon: '🔍', color: '#EDE9FE', textColor: '#5B21B6', text: `Secteur probable détecté : ${detectedSector}` });
  } else if (f.sector) {
    insights.push({ icon: '✓', color: '#D8FFBD', textColor: '#2D6A00', text: `Secteur confirmé : ${f.sector}` });
  }

  // Business model
  if (f.businessModel === 'SaaS') {
    insights.push({ icon: '⚙️', color: '#ABC5FE', textColor: '#1A3A8F', text: `Modèle SaaS — récurrence prévisible, LTV élevée. Les VCs adorent.` });
  } else if (f.businessModel === 'Marketplace') {
    insights.push({ icon: '🔄', color: '#CDB4FF', textColor: '#3D0D8F', text: `Marketplace — scalable mais effet réseau critique à construire tôt` });
  } else if (f.businessModel) {
    insights.push({ icon: '💡', color: '#FEF3C7', textColor: '#92400E', text: `Modèle ${f.businessModel} détecté — un bon storytelling rendra ça clair pour les investisseurs` });
  }

  // MRR insight
  const mrr = f.mrr ?? 0;
  const stage = f.isPreRevenue ? 'pre-seed' : mrr >= 50_000 ? 'series-a' : mrr > 0 ? 'seed' : 'pre-seed';
  if (mrr > 0) {
    const pct = getMRRPercentile(mrr, stage);
    insights.push({ icon: '📈', color: '#D8FFBD', textColor: '#2D6A00', text: `Votre MRR de ${fmtAmount(mrr)} vous place dans le top ${pct}% des startups ${stage} françaises` });
  }

  // LOI
  if (f.isPreRevenue && f.hasLOI && (f.loiCount ?? 0) > 0) {
    insights.push({ icon: '📄', color: '#D8FFBD', textColor: '#2D6A00', text: `${f.loiCount} lettre${(f.loiCount ?? 0) > 1 ? 's' : ''} d'intention — preuve de marché solide même sans revenus` });
  }

  // Competitors = market validation
  const realComps = f.competitors.filter(c => c.length > 1);
  if (realComps.length > 0) {
    insights.push({ icon: '🎯', color: '#CDB4FF', textColor: '#3D0D8F', text: `Marché validé — ${realComps[0]} confirme l'existence du problème` });
  }

  // TAM
  const estimatedTAM = f.potentialCustomers > 0 && f.averagePrice > 0
    ? f.potentialCustomers * f.averagePrice
    : null;
  if (estimatedTAM !== null) {
    const tamLabel = estimatedTAM >= 1_000_000_000 ? 'massif' : estimatedTAM >= 100_000_000 ? 'significatif' : 'de niche';
    const vcReady = estimatedTAM >= 500_000_000;
    insights.push({
      icon: '🌐', color: '#FFB96D', textColor: '#7A3D00',
      text: `TAM estimé : ${fmtAmount(estimatedTAM)} · Marché ${tamLabel}${vcReady ? ' · ✓ Taille suffisante pour les VCs Seed' : ' · Marché de niche peut suffire si premium'}`,
    });
  }

  // Team strength
  if (f.team.some(m => m.hadExit)) {
    insights.push({ icon: '🏆', color: '#D8FFBD', textColor: '#2D6A00', text: `Exit précédent dans l'équipe — votre argument le plus fort. Mentionnez-le en premier dans chaque pitch` });
  } else if (f.team.some(m => m.hasPreviousStartup)) {
    insights.push({ icon: '💪', color: '#ABC5FE', textColor: '#1A3A8F', text: `Expérience startup dans l'équipe — signal de résilience apprécié des investisseurs` });
  }

  // CTO
  if (f.hasCTO) {
    insights.push({ icon: '👨‍💻', color: '#D8FFBD', textColor: '#2D6A00', text: `CTO identifié — les équipes tech+biz lèvent 2x plus vite en moyenne` });
  }

  // WhyYou
  if ((f.whyYou?.length ?? 0) > 80) {
    insights.push({ icon: '✨', color: '#EDE9FE', textColor: '#5B21B6', text: `Légitimité fondateur bien articulée — c'est souvent ce qui fait la différence en early-stage` });
  }

  // Deck
  if (f.deckFileName) {
    insights.push({ icon: '📑', color: '#D8FFBD', textColor: '#2D6A00', text: `Pitch deck uploadé — notre IA l'analysera pour enrichir votre stratégie` });
  }

  // ── Alertes de cohérence ──

  const goal = f.fundraisingGoal ?? 0;
  if (goal > 2_000_000 && mrr === 0 && f.isPreRevenue) {
    alerts.push({ type: 'warning', text: `Lever ${fmtAmount(goal)} sans revenus en pre-seed est difficile — envisagez 300K–500K€` });
  }

  if ((f.runway ?? 0) > 0 && (f.runway ?? 0) < 6 && f.fundingTimeline?.includes('12')) {
    alerts.push({ type: 'danger', text: `${f.runway} mois de runway avec une levée dans 6-12 mois — risque de rupture de trésorerie` });
  }

  if (f.businessModel === 'Services / Conseil' && (f.finalGoalValuation ?? 0) >= 100_000_000) {
    alerts.push({ type: 'warning', text: `Modèle de conseil non scalable pour atteindre ${fmtAmount(f.finalGoalValuation ?? 0)}` });
  }

  if (mrr > 0 && (f.momGrowth ?? 0) < 0) {
    alerts.push({ type: 'danger', text: `Croissance MoM négative — à expliquer proactivement aux investisseurs` });
  }

  if ((f.churnRate ?? 0) > 10) {
    alerts.push({ type: 'warning', text: `Churn de ${f.churnRate}%/mois est élevé — les VCs Seed veulent < 3-5%/mois` });
  }

  const scorePreview = calcLiveScore(f);

  return { detectedSector, detectedModel, estimatedTAM, scorePreview, insights, alerts };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string }> = ({ value, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
    <div onClick={() => onChange(!value)}
      className="relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ backgroundColor: value ? '#F4B8CC' : '#E5E7EB' }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(4px)' }} />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const Label: React.FC<{ children: React.ReactNode; optional?: boolean; bold?: boolean }> = ({ children, optional, bold = true }) => (
  <label className={clsx('block text-sm mb-1.5', bold ? 'font-bold text-gray-800' : 'font-semibold text-gray-700')}>
    {children}
    {optional && <span className="text-gray-300 font-normal ml-1 text-xs">(optionnel)</span>}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props}
    className={clsx(
      'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none',
      'focus:border-gray-900 placeholder-gray-300 transition-colors',
      props.disabled && 'bg-gray-50 text-gray-500',
      props.className,
    )}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { maxLen?: number }> = ({ maxLen, ...props }) => {
  const val = (props.value as string) || '';
  return (
    <div>
      <textarea {...props}
        className={clsx(
          'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none',
          'focus:border-gray-900 placeholder-gray-300 transition-colors',
          props.className,
        )}
      />
      {maxLen && (
        <p className={clsx('text-xs text-right mt-0.5', val.length > maxLen * 0.9 ? 'text-orange-400' : 'text-gray-300')}>
          {val.length}/{maxLen}
        </p>
      )}
    </div>
  );
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select {...props}
    className={clsx(
      'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-white',
      'focus:border-gray-900 transition-colors',
      props.className,
    )}>
    {children}
  </select>
);

function LogSlider({ value, scale, labels, onChange, label }: {
  value: number; scale: number[]; labels: string[];
  onChange: (v: number) => void; label: string;
}) {
  const idx = value > 0 ? Math.max(0, scale.findIndex(v => v >= value)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">{label}</span>
        <span className="text-sm font-black" style={{ color: '#C4728A' }}>
          {value > 0 ? (labels[idx] ?? labels[labels.length - 1]) : '—'}
        </span>
      </div>
      <input type="range" min={0} max={scale.length - 1} step={1}
        value={value > 0 ? idx : 0}
        onChange={e => onChange(scale[parseInt(e.target.value)])}
        className="w-full accent-pink-400 cursor-pointer"
        style={{ accentColor: '#C4728A' }}
      />
      <div className="flex justify-between mt-1">
        {labels.filter((_, i) => i === 0 || i === Math.floor(labels.length / 2) || i === labels.length - 1).map((l, i) => (
          <span key={i} className="text-[10px] text-gray-300">{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Analysis Panel ───────────────────────────────────────────────────────────

function AnalysisPanel({ analysis, step }: { analysis: LiveAnalysis; step: number }) {
  const score = analysis.scorePreview;

  return (
    <div className="rounded-2xl p-6 h-full" style={{ backgroundColor: '#0A0A0A', minHeight: 500 }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="h-4 w-4" style={{ color: '#F4B8CC' }} />
        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Analyse Raisup</span>
      </div>

      {/* Score gauge */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <p className="text-xs text-white/40 font-medium">Score en construction</p>
          {score > 10 && (
            <span className="text-3xl font-black text-white leading-none">
              {score}<span className="text-sm text-white/30 font-medium">/100</span>
            </span>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${score}%`, background: 'linear-gradient(90deg, #F4B8CC, #CDB4FF)' }} />
        </div>
        {score <= 10 && <p className="text-xs text-white/25 mt-1">Répondez aux questions pour voir votre score...</p>}
        {score > 10 && score < 40 && <p className="text-xs text-white/40 mt-1">Profil en construction — continuez</p>}
        {score >= 40 && score < 70 && <p className="text-xs text-white/40 mt-1">Profil solide — encore quelques données</p>}
        {score >= 70 && <p className="text-xs mt-1" style={{ color: '#D8FFBD' }}>Excellent profil investisseur</p>}
      </div>

      {/* Detected tags */}
      {(analysis.detectedSector || analysis.detectedModel) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {analysis.detectedSector && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
              {analysis.detectedSector}
            </span>
          )}
          {analysis.detectedModel && (
            <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: '#ABC5FE', color: '#1A3A8F' }}>
              {analysis.detectedModel}
            </span>
          )}
        </div>
      )}

      {/* TAM highlight */}
      {analysis.estimatedTAM !== null && (
        <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'rgba(255, 185, 109, 0.12)', border: '1px solid rgba(255,185,109,0.2)' }}>
          <p className="text-[11px] text-white/40 mb-1 uppercase tracking-wider">Marché adressable estimé</p>
          <p className="text-2xl font-black" style={{ color: '#FFB96D' }}>{fmtAmount(analysis.estimatedTAM)}</p>
          <p className="text-[11px] text-white/40 mt-1">
            {analysis.estimatedTAM >= 500_000_000 ? '✓ Taille cible pour les VCs Seed' : 'Marché de niche — premium pricing recommandé'}
          </p>
        </div>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="space-y-2 mb-4">
          {analysis.insights.slice(0, 5).map((ins, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-sm shrink-0 mt-px">{ins.icon}</span>
              <p className="text-[12px] text-white/70 leading-relaxed">{ins.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {analysis.alerts.length > 0 && (
        <div className="space-y-2">
          {analysis.alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
              style={{
                backgroundColor: alert.type === 'danger' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${alert.type === 'danger' ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              }}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" style={{ color: alert.type === 'danger' ? '#FCA5A5' : '#FCD34D' }} />
              <p className="text-[12px] leading-relaxed" style={{ color: alert.type === 'danger' ? '#FCA5A5' : '#FCD34D' }}>{alert.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Step progress hint */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2">Étape {step}/6</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div key={s} className="flex-1 h-0.5 rounded-full transition-all duration-300"
              style={{ backgroundColor: s <= step ? '#F4B8CC' : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile score strip ───────────────────────────────────────────────────────

function MobileScoreStrip({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 mb-4 rounded-xl" style={{ backgroundColor: '#0A0A0A' }}>
      <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: '#F4B8CC' }} />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: 'linear-gradient(90deg,#F4B8CC,#CDB4FF)' }} />
      </div>
      {score > 10 && <span className="text-xs font-black text-white shrink-0">{score}<span className="text-white/40">/100</span></span>}
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

interface AuthModalProps {
  defaultEmail: string;
  onSuccess: () => void;
  onClose: () => void;
}

function AuthModal({ defaultEmail, onSuccess, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const supabaseReady = isSupabaseConfigured;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    if (mode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess('Compte créé — vérifiez votre email pour confirmer, puis accédez à vos résultats.');
      setTimeout(onSuccess, 1800);
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : err.message);
        setLoading(false); return;
      }
      onSuccess();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    // Profile already saved to localStorage — will survive the OAuth redirect
    await signInWithGoogle(window.location.origin + '/loading-strategy');
    setGoogleLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotLoading(true);
    const { error: err } = await resetPassword(email);
    setForgotLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setForgotSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
              <span className="font-black text-lg tracking-wide text-gray-900">RAISUP</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
              <X className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-[22px] font-bold text-gray-900 mb-1">
            {mode === 'signup' ? 'Créez votre compte' : 'Bon retour !'}
          </h2>
          <p className="text-[13px] text-gray-500 mb-6">
            {mode === 'signup'
              ? 'Votre stratégie est prête — créez un compte pour y accéder'
              : 'Connectez-vous pour accéder à vos résultats'}
          </p>

          {/* Tab switcher — masqué en mode mot de passe oublié */}
          {!showForgot && (
            <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: '#F3F4F6' }}>
              {(['signup', 'login'] as const).map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                  className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                    mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
                  {m === 'signup' ? 'Créer un compte' : 'Se connecter'}
                </button>
              ))}
            </div>
          )}
          {showForgot && (
            <div className="mb-4">
              <h2 className="text-[22px] font-bold text-gray-900 mb-1">Mot de passe oublié</h2>
              <p className="text-[13px] text-gray-500">On vous envoie un lien de réinitialisation</p>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 space-y-4">

          {/* ── Vue mot de passe oublié ── */}
          {showForgot && (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="rounded-xl p-4 bg-green-50 border border-green-100 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Email envoyé !</p>
                    <p className="text-sm text-green-700 mt-0.5">Vérifiez votre boite mail et cliquez sur le lien pour réinitialiser votre mot de passe.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-3">
                  <p className="text-[13px] text-gray-500">Saisissez votre email pour recevoir un lien de réinitialisation.</p>
                  {error && <div className="rounded-xl p-3 text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="vous@startup.com"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 placeholder-gray-300 transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={forgotLoading}
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: '#0A0A0A' }}>
                    {forgotLoading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Envoyer le lien de réinitialisation'}
                  </button>
                </form>
              )}
              <button type="button" onClick={() => { setShowForgot(false); setForgotSent(false); setError(null); }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                ← Retour à la connexion
              </button>
            </div>
          )}

          {/* Formulaire principal — masqué en mode mot de passe oublié */}
          {!showForgot && (
            <>
              {/* Google button */}
              {supabaseReady ? (
                <button type="button" onClick={handleGoogle} disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold text-gray-700 disabled:opacity-50">
                  {googleLoading
                    ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    : <GoogleIcon />}
                  Continuer avec Google
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                  <GoogleIcon /> Google (Supabase requis)
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">ou</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Error / Success */}
              {error && (
                <div className="rounded-xl p-3 text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>
              )}
              {success && (
                <div className="rounded-xl p-3 text-sm text-green-700 bg-green-50 border border-green-100 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="vous@startup.com"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 placeholder-gray-300 transition-colors" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-600">Mot de passe</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => { setShowForgot(true); setError(null); }}
                        className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} required value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 placeholder-gray-300 transition-colors pr-10" />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmer le mot de passe</label>
                    <input type={showPwd ? 'text' : 'password'} required value={confirm}
                      onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                      className={clsx(
                        'w-full px-4 py-3 border rounded-xl text-sm outline-none placeholder-gray-300 transition-colors',
                        confirm && confirm !== password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-900',
                      )} />
                    {confirm && confirm !== password && <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>}
                  </div>
                )}

                <button type="submit" disabled={loading || !!success}
                  className="w-full py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#0A0A0A' }}>
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : mode === 'signup' ? <><Sparkles className="h-4 w-4" /> Créer mon compte et accéder</> : <><ArrowRight className="h-4 w-4" /> Se connecter</>}
                </button>
              </form>

              {/* Skip link */}
              <button type="button" onClick={onSuccess}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                Continuer sans compte →
              </button>

              <p className="text-center text-[11px] text-gray-300">
                En créant un compte vous acceptez nos{' '}
                <span className="underline cursor-pointer">conditions d'utilisation</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SimplifiedOnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [form, setForm] = useState<OnboardingFormData>(() => {
    try {
      const saved = localStorage.getItem('raisup_onboarding_v2');
      if (saved) return { ...DEFAULT, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT;
  });
  const [liveAnalysis, setLiveAnalysis] = useState<LiveAnalysis>(EMPTY_ANALYSIS);
  const [dragOver, setDragOver] = useState(false);
  const [deckLoading, setDeckLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoTargetIdx, setPhotoTargetIdx] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist on change (debounced, exclude blobs)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const toSave = { ...form, deckBase64: null, team: form.team.map(m => ({ ...m, photo: null })) };
      localStorage.setItem('raisup_onboarding_v2', JSON.stringify(toSave));
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form]);

  // Live analysis
  useEffect(() => {
    setLiveAnalysis(analyzeFormDataLive(form));
  }, [form]);

  // Initialize founder at step 5
  useEffect(() => {
    if (step === 5 && form.team.length === 0 && form.firstName) {
      setForm(prev => ({
        ...prev,
        team: [newMember({ id: 'founder', firstName: prev.firstName, lastName: prev.lastName, role: 'CEO / Co-fondateur', isFounder: true })],
      }));
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: keyof OnboardingFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateMember = (idx: number, field: keyof TeamMember, value: unknown) => {
    setForm(prev => {
      const team = [...prev.team];
      team[idx] = { ...team[idx], [field]: value };
      return { ...prev, team };
    });
  };

  const addMember = () => {
    if (form.team.length >= 10) return;
    setForm(prev => ({ ...prev, team: [...prev.team, newMember()] }));
  };

  const removeMember = (idx: number) => {
    setForm(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }));
  };

  const handleFile = useCallback(async (file: File) => {
    const allowed = ['application/pdf', 'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|ppt|pptx)$/i)) return;
    if (file.size > 10 * 1024 * 1024) { alert('Fichier trop lourd — maximum 10 MB'); return; }
    setDeckLoading(true);
    try {
      const base64 = await fileToBase64(file);
      setForm(prev => ({ ...prev, deckFileName: file.name, deckSize: file.size, deckBase64: base64 }));
    } finally { setDeckLoading(false); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || photoTargetIdx === null) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image trop lourde — maximum 5 MB'); return; }
    const base64 = await fileToBase64(file);
    updateMember(photoTargetIdx, 'photo', base64);
    setPhotoTargetIdx(null);
    e.target.value = '';
  };

  const triggerPhotoUpload = (idx: number) => {
    setPhotoTargetIdx(idx);
    setTimeout(() => photoInputRef.current?.click(), 0);
  };

  const saveAndNavigate = () => {
    localStorage.setItem('raisup_profile', JSON.stringify(form));
    navigate('/loading-strategy');
  };

  const handleSubmit = () => {
    // Always persist profile first (survives Google OAuth redirect)
    localStorage.setItem('raisup_profile', JSON.stringify(form));
    if (user) {
      // Already authenticated — go straight to results
      navigate('/loading-strategy');
    } else {
      // Show auth modal
      setShowAuthModal(true);
    }
  };

  const goNext = () => setStep(s => Math.min(6, s + 1));
  const goBack = () => setStep(s => Math.max(1, s - 1));

  const step1Valid = !!(form.firstName && form.lastName && form.email && form.city);
  const step2Valid = !!(form.oneLiner.length > 10 && form.startupName && form.sector && form.businessModel && form.clientType);

  const progress = (step / 6) * 100;
  const coFoundersCount = form.team.filter(m => m.role.includes('fondateur') || m.role === 'Associé').length;

  const NavButtons = ({ canNext = true, isLast = false }: { canNext?: boolean; isLast?: boolean }) => (
    <div className="flex items-center justify-between pt-6">
      {step > 1 ? (
        <button type="button" onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
      ) : <div />}
      {isLast ? (
        <button type="button" onClick={handleSubmit}
          className="flex items-center gap-2 text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}>
          <Sparkles className="h-4 w-4" /> Générer ma stratégie
        </button>
      ) : (
        <button type="button" onClick={goNext} disabled={!canNext}
          className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full transition-all disabled:opacity-40"
          style={{ backgroundColor: '#0A0A0A' }}>
          Continuer <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
            <span className="font-black text-lg tracking-wide text-gray-900">RAISUP</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={clsx('text-xs font-medium transition-colors',
                i + 1 === step ? 'text-gray-900 font-bold' : i + 1 < step ? 'text-gray-400' : 'text-gray-200')}>
                {i + 1 < step ? '✓ ' : ''}{label}
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-400 sm:hidden">Étape {step}/6</span>
        </div>
        <div className="h-0.5 bg-gray-100">
          <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#F4B8CC' }} />
        </div>
      </header>

      {/* ── 2-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Left: form (60%) ── */}
          <div className="lg:col-span-3">

            {/* Mobile score strip */}
            <div className="lg:hidden mb-4">
              <MobileScoreStrip score={liveAnalysis.scorePreview} />
            </div>

            {/* ═══ STEP 1 — Identité ═══ */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Commençons par faire connaissance</h1>
                  <p className="text-gray-400 mt-1 text-sm">Votre profil Raisup en 6 étapes — moins de 12 minutes</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label><User className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Prénom</Label>
                    <Input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Votre prénom" autoFocus />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Votre nom" />
                  </div>
                </div>

                <div>
                  <Label><Mail className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Email professionnel</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@startup.com" />
                </div>

                <div>
                  <Label optional>Téléphone</Label>
                  <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+33 6 00 00 00 00" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label><MapPin className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Pays du siège</Label>
                    <Select value={form.country} onChange={e => { set('country', e.target.value); set('region', ''); }}>
                      {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Ville</Label>
                    <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Paris, Lyon, Bruxelles..." />
                  </div>
                </div>

                {form.country === 'France' && (
                  <div>
                    <Label optional>Région</Label>
                    <Select value={form.region} onChange={e => set('region', e.target.value)}>
                      <option value="">Sélectionnez votre région</option>
                      {REGIONS_FRANCE.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </div>
                )}

                <NavButtons canNext={step1Valid} />
              </div>
            )}

            {/* ═══ STEP 2 — Projet ═══ */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 space-y-7">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Parlez-nous de votre projet</h1>
                  <p className="text-gray-400 mt-1 text-sm">Les bonnes questions font les bons pitchs</p>
                </div>

                <div>
                  <Label>Si vous deviez expliquer votre projet à votre grand-mère en 2 phrases, que diriez-vous ?</Label>
                  <Textarea rows={4} maxLen={300} value={form.oneLiner}
                    onChange={e => set('oneLiner', e.target.value.slice(0, 300))}
                    placeholder="Soyez simple et concret — c'est cette formulation que vous utiliserez avec les investisseurs" />
                  {form.oneLiner.length > 15 && liveAnalysis.detectedSector && !form.sector && (
                    <p className="text-xs mt-1" style={{ color: '#C4728A' }}>
                      🔍 Secteur probable détecté : <strong>{liveAnalysis.detectedSector}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <Label optional>Quel est le moment exact où vous avez réalisé que ce problème existait vraiment ?</Label>
                  <Textarea rows={3} maxLen={300} value={form.originStory}
                    onChange={e => set('originStory', e.target.value.slice(0, 300))}
                    placeholder="L'histoire d'origine de votre projet — les investisseurs adorent ça" />
                </div>

                <div>
                  <Label><Building2 className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Nom de la startup</Label>
                  <Input value={form.startupName} onChange={e => set('startupName', e.target.value)} placeholder="Ex: MediScan, GreenFlow, Klaro..." />
                </div>

                {/* Modèle économique — cards */}
                <div>
                  <Label>Modèle économique</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BUSINESS_MODELS.map(bm => (
                      <button key={bm.value} type="button" onClick={() => set('businessModel', bm.value)}
                        className={clsx(
                          'flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all',
                          form.businessModel === bm.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 hover:border-gray-300',
                        )}>
                        <p className={clsx('text-sm font-bold', form.businessModel === bm.value ? 'text-white' : 'text-gray-800')}>{bm.value}</p>
                        <p className={clsx('text-[11px]', form.businessModel === bm.value ? 'text-white/60' : 'text-gray-400')}>{bm.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secteur */}
                <div>
                  <Label>Secteur</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {SECTORS.map(s => (
                      <button key={s.value} type="button" onClick={() => set('sector', s.value)}
                        className={clsx(
                          'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all',
                          form.sector === s.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 hover:border-gray-300',
                        )}>
                        <span className="text-lg">{s.emoji}</span>
                        <span className={clsx('text-[10px] font-medium leading-tight', form.sector === s.value ? 'text-white' : 'text-gray-600')}>{s.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type client */}
                <div>
                  <Label>Type de client</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {CLIENT_TYPES.map(ct => (
                      <button key={ct.value} type="button" onClick={() => set('clientType', ct.value)}
                        className={clsx(
                          'flex flex-col items-center gap-1 py-4 rounded-xl border-2 text-center transition-all',
                          form.clientType === ct.value ? 'border-gray-900' : 'border-gray-100 hover:border-gray-300',
                        )}
                        style={form.clientType === ct.value ? { backgroundColor: ct.color } : {}}>
                        <p className="text-sm font-black" style={{ color: form.clientType === ct.value ? ct.textColor : '#374151' }}>{ct.label}</p>
                        <p className="text-xs text-gray-500">{ct.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <NavButtons canNext={step2Valid} />
              </div>
            )}

            {/* ═══ STEP 3 — Marché ═══ */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Parlons de votre marché</h1>
                  <p className="text-gray-400 mt-1 text-sm">Ces données calculent votre TAM en temps réel</p>
                </div>

                <LogSlider
                  value={form.potentialCustomers}
                  scale={CUSTOMERS_SCALE}
                  labels={CUSTOMERS_LABELS}
                  label="Combien d'entreprises ou de personnes ont ce problème aujourd'hui ?"
                  onChange={v => set('potentialCustomers', v)}
                />

                <LogSlider
                  value={form.averagePrice}
                  scale={PRICE_SCALE}
                  labels={PRICE_LABELS}
                  label="Combien paieraient-ils par an pour le résoudre ?"
                  onChange={v => set('averagePrice', v)}
                />

                {/* TAM display */}
                {form.potentialCustomers > 0 && form.averagePrice > 0 && (
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF8F0', border: '1px solid #FFD6AD' }}>
                    <p className="text-xs text-gray-500 mb-1">TAM estimé (marché total)</p>
                    <p className="text-2xl font-black" style={{ color: '#C4728A' }}>
                      {fmtAmount(form.potentialCustomers * form.averagePrice)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      SAM réaliste (10% de pénétration) :{' '}
                      <strong>{fmtAmount(form.potentialCustomers * form.averagePrice * 0.1)}</strong>
                      {' · '}
                      {form.potentialCustomers * form.averagePrice >= 500_000_000
                        ? '✓ Marché suffisant pour un VC Seed'
                        : 'Marché de niche — misez sur le premium'}
                    </p>
                  </div>
                )}

                {/* Competitors */}
                <div>
                  <Label>Nommez 3 alternatives que vos clients utilisent aujourd'hui sans vous</Label>
                  <p className="text-xs text-gray-400 mb-3">Leur existence prouve que le problème est réel</p>
                  <div className="space-y-2">
                    {[0, 1, 2].map(i => (
                      <Input key={i}
                        value={form.competitors[i] || ''}
                        onChange={e => {
                          const c = [...form.competitors];
                          c[i] = e.target.value;
                          set('competitors', c);
                        }}
                        placeholder={['Ex: Excel', 'Ex: email / prestataire externe', 'Ex: concurrent direct'][i]}
                      />
                    ))}
                  </div>
                </div>

                {/* Target markets */}
                <div>
                  <Label>Dans quel pays comptez-vous vous développer en priorité ?</Label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_MARKETS.map(m => {
                      const active = form.targetMarkets.includes(m);
                      return (
                        <button key={m} type="button"
                          onClick={() => set('targetMarkets', active
                            ? form.targetMarkets.filter(x => x !== m)
                            : [...form.targetMarkets, m])}
                          className={clsx(
                            'px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all',
                            active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400',
                          )}>
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <NavButtons />
              </div>
            )}

            {/* ═══ STEP 4 — Chiffres ═══ */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 space-y-7">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Où en êtes-vous vraiment ?</h1>
                  <p className="text-gray-400 mt-1 text-sm">Des données réelles valent mieux que des projections optimistes</p>
                </div>

                {/* Pre-revenue */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
                  <Toggle value={form.isPreRevenue} onChange={v => set('isPreRevenue', v)} label="Startup pre-revenue (0€ de revenus récurrents)" />
                </div>

                {form.isPreRevenue ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
                      <Toggle value={form.hasLOI} onChange={v => set('hasLOI', v)} label="Avez-vous des lettres d'intention (LOI) de clients ?" />
                    </div>
                    {form.hasLOI && (
                      <div>
                        <Label>Combien de LOI signées ?</Label>
                        <Input type="number" min={1} placeholder="Ex: 3" value={form.loiCount ?? ''} onChange={e => set('loiCount', numOrNull(e.target.value))} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label><TrendingUp className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Meilleur mois (€)</Label>
                        <Input type="number" min={0} placeholder="Ex: 25 000" value={form.bestMonthRevenue ?? ''} onChange={e => set('bestMonthRevenue', numOrNull(e.target.value))} />
                      </div>
                      <div>
                        <Label optional>Clients ce mois-là</Label>
                        <Input type="number" min={0} placeholder="Ex: 12" value={form.bestMonthClients ?? ''} onChange={e => set('bestMonthClients', numOrNull(e.target.value))} />
                      </div>
                    </div>
                    <div>
                      <Label><DollarSign className="inline h-3.5 w-3.5 text-gray-400 mr-1" />MRR actuel (€)</Label>
                      <Input type="number" min={0} placeholder="Ex: 15 000"
                        value={form.mrr ?? ''} onChange={e => set('mrr', numOrNull(e.target.value))} />
                      {form.mrr !== null && form.mrr > 0 && (
                        <p className="text-xs mt-1" style={{ color: '#C4728A' }}>
                          Top {getMRRPercentile(form.mrr, form.stage || 'seed')}% des startups {form.sector || ''} françaises
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label optional>Croissance MoM (%)</Label>
                    <Input type="number" placeholder="Ex: 15" value={form.momGrowth ?? ''} onChange={e => set('momGrowth', numOrNull(e.target.value))} />
                  </div>
                  <div>
                    <Label optional>Clients actifs</Label>
                    <Input type="number" min={0} placeholder="Ex: 45" value={form.activeClients ?? ''} onChange={e => set('activeClients', numOrNull(e.target.value))} />
                  </div>
                  <div>
                    <Label optional>Churn mensuel (%)</Label>
                    <Input type="number" min={0} placeholder="0 si inconnu" value={form.churnRate ?? ''} onChange={e => set('churnRate', numOrNull(e.target.value))} />
                  </div>
                  <div>
                    <Label optional>Runway (mois)</Label>
                    <Input type="number" min={0} placeholder="Ex: 18" value={form.runway ?? ''} onChange={e => set('runway', numOrNull(e.target.value))} />
                    {form.runway !== null && form.runway < 6 && (
                      <p className="text-xs mt-1 text-red-500">{form.runway} mois — attention, priorité absolue</p>
                    )}
                  </div>
                  <div>
                    <Label optional>Burn rate mensuel (€)</Label>
                    <Input type="number" min={0} placeholder="Ex: 30 000" value={form.burnRate ?? ''} onChange={e => set('burnRate', numOrNull(e.target.value))} />
                  </div>
                  <div>
                    <Label optional>Taille de l'équipe</Label>
                    <Input type="number" min={1} placeholder="Ex: 4" value={form.teamSize ?? ''} onChange={e => set('teamSize', numOrNull(e.target.value))} />
                  </div>
                </div>

                <div><Toggle value={form.hasCTO} onChange={v => set('hasCTO', v)} label="L'équipe a un CTO ou profil technique dédié" /></div>

                {/* Pitch */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pitch</p>
                  <div>
                    <Label optional>Problème résolu</Label>
                    <Textarea rows={2} value={form.problem} onChange={e => set('problem', e.target.value)} placeholder="Quel problème concret résolvez-vous ? Pour qui ?" />
                  </div>
                  <div>
                    <Label optional>Solution proposée</Label>
                    <Textarea rows={2} value={form.solution} onChange={e => set('solution', e.target.value)} placeholder="Comment le résolvez-vous ? Qu'est-ce qui vous différencie ?" />
                  </div>
                  <div>
                    <Label optional>Avantage concurrentiel</Label>
                    <Textarea rows={2} value={form.competitiveAdvantage} onChange={e => set('competitiveAdvantage', e.target.value)} placeholder="En quoi êtes-vous différent(e) de la concurrence ?" />
                  </div>
                </div>

                {/* Previous funding */}
                <div>
                  <Label optional bold={false}>Financements déjà reçus</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {PREV_FUNDING_OPTIONS.map(opt => {
                      const active = form.previousFunding.includes(opt);
                      return (
                        <button key={opt} type="button"
                          onClick={() => set('previousFunding', active
                            ? form.previousFunding.filter(x => x !== opt)
                            : [...form.previousFunding, opt])}
                          className={clsx(
                            'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                            active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400',
                          )}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <NavButtons />
              </div>
            )}

            {/* ═══ STEP 5 — Équipe ═══ */}
            {step === 5 && (
              <div className="space-y-4">
                {/* Header card */}
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Votre équipe</h1>
                      <p className="text-gray-400 mt-1 text-sm">Les investisseurs financent des personnes autant que des projets</p>
                    </div>
                    {form.team.length < 10 && (
                      <button type="button" onClick={addMember}
                        className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0 ml-4"
                        style={{ backgroundColor: '#0A0A0A' }}>
                        <Plus className="h-3.5 w-3.5" /> Ajouter
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label>Pourquoi vous êtes LA bonne équipe pour résoudre ce problème précisément ?</Label>
                      <Textarea rows={4} maxLen={400} value={form.whyYou}
                        onChange={e => set('whyYou', e.target.value.slice(0, 400))}
                        placeholder="Votre expérience unique, votre réseau, votre vécu — ce que personne d'autre n'a" />
                    </div>
                    <div>
                      <Label optional>Y a-t-il quelqu'un dans votre équipe qui a déjà échoué sur un projet ? Qu'est-ce que ça a changé ?</Label>
                      <Textarea rows={3} maxLen={300} value={form.teamFailure}
                        onChange={e => set('teamFailure', e.target.value.slice(0, 300))}
                        placeholder="Les investisseurs valorisent l'expérience des échecs — soyez honnête" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Toggle value={form.hasCTO} onChange={v => set('hasCTO', v)} label="CTO ou profil technique dédié dans l'équipe" />
                      <Toggle value={form.hasAdvisors} onChange={v => set('hasAdvisors', v)} label="Advisors / Mentors actifs" />
                    </div>
                  </div>
                </div>

                {/* Team member cards */}
                <div className="space-y-3">
                  {form.team.map((member, idx) => {
                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const initials = member.firstName || member.lastName
                      ? getInitials(member.firstName || '?', member.lastName || '?') : '?';
                    return (
                      <div key={member.id} className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #E5E7EB', padding: 20 }}>
                        <div className="flex items-start gap-4">
                          <div onClick={() => triggerPhotoUpload(idx)}
                            className="flex-shrink-0 relative cursor-pointer group" style={{ width: 72, height: 72 }}>
                            {member.photo ? (
                              <img src={member.photo} alt="photo" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              <div className="w-full h-full rounded-xl flex items-center justify-center border-2 border-dashed transition-all group-hover:opacity-80"
                                style={{ backgroundColor: avatarColor.bg, borderColor: avatarColor.bg }}>
                                <span className="text-lg font-bold" style={{ color: avatarColor.text }}>{initials}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                              <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Input value={member.firstName} onChange={e => updateMember(idx, 'firstName', e.target.value)} placeholder="Prénom" disabled={member.isFounder} />
                              <Input value={member.lastName} onChange={e => updateMember(idx, 'lastName', e.target.value)} placeholder="Nom" disabled={member.isFounder} />
                            </div>
                            <Select value={member.role} onChange={e => updateMember(idx, 'role', e.target.value)}>
                              <option value="">Rôle dans l'entreprise</option>
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </Select>
                          </div>
                          {!member.isFounder && (
                            <button type="button" onClick={() => removeMember(idx)}
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-red-400">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {member.isFounder && (
                          <div className="mt-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>Fondateur principal</span>
                          </div>
                        )}

                        <div className="mt-4 space-y-3 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                          <Select value={member.experience} onChange={e => updateMember(idx, 'experience', e.target.value)}>
                            <option value="">Expérience sectorielle</option>
                            {EXPERIENCES.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                          </Select>
                          <div className="space-y-2">
                            <Toggle value={member.hasPreviousStartup}
                              onChange={v => { updateMember(idx, 'hasPreviousStartup', v); if (!v) updateMember(idx, 'hadExit', false); }}
                              label="A déjà créé une startup" />
                            {member.hasPreviousStartup && (
                              <div className="ml-6">
                                <Toggle value={member.hadExit} onChange={v => updateMember(idx, 'hadExit', v)} label="Avec exit (acquisition / IPO)" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {form.team.length < 10 && (
                  <button type="button" onClick={addMember}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-white transition-all flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Ajouter un membre
                  </button>
                )}

                {form.team.length > 0 && (
                  <div className="bg-white rounded-xl p-4 flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      <strong>{form.team.length}</strong> membre{form.team.length > 1 ? 's' : ''}{' '}
                      · <strong>{coFoundersCount}</strong> co-fondateur{coFoundersCount > 1 ? 's' : ''}
                      {form.team.some(m => m.hadExit) && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>✓ Exit</span>}
                    </p>
                  </div>
                )}

                <NavButtons />
              </div>
            )}

            {/* ═══ STEP 6 — Ambition ═══ */}
            {step === 6 && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl shadow-sm p-8 space-y-7">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Votre vision et stratégie</h1>
                    <p className="text-gray-400 mt-1 text-sm">La dernière ligne droite — et les questions les plus importantes</p>
                  </div>

                  {/* Deck upload */}
                  <div>
                    <Label optional>Votre pitch deck</Label>
                    {!form.deckFileName ? (
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                          'rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center py-8',
                          dragOver ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300',
                        )}>
                        <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                        {deckLoading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">Lecture...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-300 mb-3" />
                            <p className="text-sm font-bold text-gray-700">Glissez votre deck ici</p>
                            <p className="text-xs text-gray-400 mt-1">PDF · PPT · Max 10MB</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0" style={{ color: '#2D6A00' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{form.deckFileName}</p>
                          <p className="text-xs text-gray-400">{formatBytes(form.deckSize)}</p>
                        </div>
                        <button type="button"
                          onClick={() => setForm(prev => ({ ...prev, deckFileName: '', deckSize: 0, deckBase64: null }))}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#FFF0F0', color: '#EF4444' }}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fundraising goal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label><DollarSign className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Montant recherché (€)</Label>
                      <Input type="number" min={0} placeholder="Ex: 500 000"
                        value={form.fundraisingGoal ?? ''} onChange={e => set('fundraisingGoal', numOrNull(e.target.value))} />
                    </div>
                    <div>
                      <Label optional>Dilution max (%)</Label>
                      <Input type="number" min={0} max={100} placeholder="Ex: 20" value={form.maxDilution ?? ''} onChange={e => set('maxDilution', numOrNull(e.target.value))} />
                    </div>
                  </div>

                  {/* Fund usage */}
                  <div>
                    <Label optional>Usage des fonds</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {FUND_USAGE.map(u => {
                        const active = form.fundUsage.includes(u.value);
                        return (
                          <button key={u.value} type="button"
                            onClick={() => set('fundUsage', active ? form.fundUsage.filter(x => x !== u.value) : [...form.fundUsage, u.value])}
                            className={clsx(
                              'flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all',
                              active ? 'border-gray-900 bg-gray-900' : 'border-gray-100 hover:border-gray-300',
                            )}>
                            <span className="text-lg">{u.icon}</span>
                            <span className={clsx('text-[10px] font-semibold leading-tight', active ? 'text-white' : 'text-gray-600')}>{u.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Funding preference */}
                  <div>
                    <Label optional>Préférence de financement</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {FUNDING_PREFERENCES.map(fp => (
                        <button key={fp.value} type="button" onClick={() => set('fundingPreference', fp.value)}
                          className={clsx(
                            'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                            form.fundingPreference === fp.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300',
                          )}>
                          <span className="text-xl">{fp.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{fp.label}</p>
                            <p className="text-xs text-gray-500">{fp.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Final objective */}
                  <div>
                    <Label>Votre objectif ultime</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {FINAL_OBJECTIVES.map(obj => (
                        <button key={obj.value} type="button" onClick={() => set('finalObjective', obj.value)}
                          className={clsx(
                            'flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all relative',
                            form.finalObjective === obj.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300',
                          )}>
                          {form.finalObjective === obj.value && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <span className="text-2xl">{obj.icon}</span>
                          <p className="text-sm font-bold text-gray-900">{obj.label}</p>
                          <p className="text-xs text-gray-500 leading-snug">{obj.desc}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>{obj.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Free text — dark card */}
                <div className="rounded-2xl" style={{ backgroundColor: '#0A0A0A', padding: 28 }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C4728A' }}>Une dernière chose</p>
                  <p className="text-white font-bold text-[17px] mb-2">
                    Y a-t-il quelque chose d'important sur votre projet que vous n'avez pas pu exprimer ?
                  </p>
                  <p className="text-white/50 text-[13px] mb-4 leading-relaxed">
                    Un contexte particulier, une vision, une contrainte, une opportunité unique — cette réponse sera analysée par notre IA pour enrichir votre stratégie.
                  </p>
                  <div>
                    <textarea
                      value={form.freeText}
                      onChange={e => set('freeText', e.target.value.slice(0, 600))}
                      rows={5}
                      placeholder="Exprimez-vous librement — il n'y a pas de mauvaise réponse..."
                      className="w-full text-sm outline-none resize-none rounded-xl px-4 py-3 leading-relaxed placeholder-white/20 text-white"
                      style={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: 12 }}
                    />
                    <p className="text-[11px] text-right mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {form.freeText.length}/600
                    </p>
                  </div>
                </div>

                <NavButtons isLast />
              </div>
            )}
          </div>

          {/* ── Right: analysis panel (40%) — sticky, desktop only ── */}
          <div className="hidden lg:block lg:col-span-2 sticky top-24 self-start">
            <AnalysisPanel analysis={liveAnalysis} step={step} />
          </div>

        </div>
      </div>

      {/* ── Auth modal ── */}
      {showAuthModal && (
        <AuthModal
          defaultEmail={form.email}
          onSuccess={saveAndNavigate}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default SimplifiedOnboardingForm;
