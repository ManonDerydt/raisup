import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ArrowLeft, Upload, CheckCircle, X,
  Mail, MapPin, User, Building2, Plus, Camera, Users, Check,
  TrendingUp, DollarSign,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Types ─────────────────────────────────────────────────────────────────

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
  // Step 1 — Profil
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2 — L'entreprise
  startupName: string;
  description: string;
  sector: string;
  businessModel: string;
  clientType: string;
  legalForm: string;
  country: string;
  region: string;
  city: string;
  ambition: string;
  founderShare: number | null;

  // Step 3 — Deck
  deckFileName: string;
  deckSize: number;
  deckBase64: string | null;

  // Step 4 — Situation actuelle
  isPreRevenue: boolean;
  mrr: number | null;
  momGrowth: number | null;
  activeClients: number | null;
  runway: number | null;
  burnRate: number | null;
  teamSize: number | null;
  hasCTO: boolean;
  problem: string;
  solution: string;
  competitiveAdvantage: string;

  // Step 5 — Équipe
  team: TeamMember[];

  // Step 6 — Financement
  fundraisingGoal: number | null;
  fundingTimeline: string;
  maxDilution: number | null;
  fundingPreference: string;
  finalGoalValuation: number | null;
  fundUsage: string[];
  finalObjective: string;
};

const DEFAULT: OnboardingFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  startupName: '', description: '', sector: '', businessModel: '',
  clientType: '', legalForm: '', country: 'France', region: '', city: '',
  ambition: '', founderShare: null,
  deckFileName: '', deckSize: 0, deckBase64: null,
  isPreRevenue: false, mrr: null, momGrowth: null, activeClients: null,
  runway: null, burnRate: null, teamSize: null, hasCTO: false,
  problem: '', solution: '', competitiveAdvantage: '',
  team: [],
  fundraisingGoal: null, fundingTimeline: '', maxDilution: null,
  fundingPreference: '', finalGoalValuation: null,
  fundUsage: [], finalObjective: '',
};

// ─── Constants ──────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'France',     label: '🇫🇷 France' },
  { value: 'Belgique',   label: '🇧🇪 Belgique' },
  { value: 'Irlande',    label: '🇮🇪 Irlande' },
  { value: 'Luxembourg', label: '🇱🇺 Luxembourg' },
  { value: 'Suisse',     label: '🇨🇭 Suisse' },
  { value: 'Autre EU',   label: '🇪🇺 Autre pays EU' },
  { value: 'Hors EU',    label: '🌍 Hors UE' },
];

const REGIONS_FRANCE = [
  'Île-de-France', 'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté',
  'Bretagne', 'Centre-Val de Loire', 'Corse', 'Grand Est',
  'Hauts-de-France', 'Normandie', 'Nouvelle-Aquitaine',
  'Occitanie', 'Pays de la Loire', "Provence-Alpes-Côte d'Azur",
];

const SECTORS = [
  { value: 'Fintech',       emoji: '💳' },
  { value: 'Healthtech',    emoji: '🏥' },
  { value: 'Edtech',        emoji: '🎓' },
  { value: 'Proptech',      emoji: '🏠' },
  { value: 'Greentech',     emoji: '🌿' },
  { value: 'SaaS B2B',      emoji: '⚙️' },
  { value: 'E-commerce',    emoji: '🛍️' },
  { value: 'IA & Data',     emoji: '🤖' },
  { value: 'Marketplace',   emoji: '🔄' },
  { value: 'Deeptech',      emoji: '🔬' },
  { value: 'Legaltech',     emoji: '⚖️' },
  { value: 'Foodtech',      emoji: '🍔' },
  { value: 'Autre',         emoji: '📦' },
];

const BUSINESS_MODELS = ['SaaS', 'Marketplace', 'E-commerce', 'Freemium', 'Hardware + services', 'Abonnement', 'Commission', 'Licences', 'Autre'];
const CLIENT_TYPES = ['B2B', 'B2C', 'B2B2C', 'B2G', 'Mixte'];
const LEGAL_FORMS = ['SAS', 'SASU', 'SARL', 'EURL', 'SA', 'SNC', 'Auto-entrepreneur', 'Non encore créée'];
const FUNDING_TIMELINES = ['< 3 mois', '3-6 mois', '6-12 mois', '12-18 mois', '> 18 mois'];
const FUNDING_PREFERENCES = [
  { value: 'Equity (levée de fonds)', label: 'Equity', sub: 'Levée de fonds avec dilution', icon: '📈' },
  { value: 'Prêt / dette',            label: 'Prêt / dette', sub: 'Sans dilution, remboursable', icon: '🏦' },
  { value: 'Subventions',             label: 'Subventions', sub: 'BPI, régions, Europe', icon: '🏛️' },
  { value: 'Revenue-based financing', label: 'Revenue-based', sub: 'Remboursement sur revenus', icon: '💰' },
  { value: 'Mixte',                   label: 'Mixte', sub: 'Combiner plusieurs sources', icon: '🔀' },
];

const AMBITIONS = [
  { value: 'Rentabilité et indépendance', label: 'Rentabilité', sub: 'Croissance organique, sans investisseurs', color: '#D8FFBD', textColor: '#2D6A00' },
  { value: 'Leader marché français',      label: 'Leader France', sub: 'Conquérir le marché français', color: '#ABC5FE', textColor: '#1A3A8F' },
  { value: 'Expansion européenne',        label: 'Expansion EU', sub: 'Scale en Europe dans 2-3 ans', color: '#CDB4FF', textColor: '#3D0D8F' },
  { value: 'Scale-up et exit',            label: 'Exit / Cession', sub: 'Acquisition ou IPO visée', color: '#FFB96D', textColor: '#7C4010' },
  { value: 'Licorne',                     label: 'Licorne 🦄', sub: 'Valorisation > 1 milliard €', color: '#F4B8CC', textColor: '#9D2B5A' },
  { value: 'Je ne sais pas encore',       label: 'À définir', sub: 'Je découvre mes options', color: '#F3F4F6', textColor: '#374151' },
];

const FINAL_OBJECTIVES = [
  { value: 'Autofinancement', icon: '🔒', label: 'Autofinancement', desc: 'Atteindre la rentabilité sans dépendre d\'investisseurs', tag: 'Indépendance' },
  { value: 'Acquisition',     icon: '🤝', label: 'Être acquis', desc: 'Vendre l\'entreprise à un grand groupe ou concurrent', tag: 'Exit' },
  { value: 'IPO',             icon: '📊', label: 'Introduction en bourse', desc: 'Entrer sur les marchés financiers publics', tag: 'IPO' },
  { value: 'Impact social',   icon: '🌍', label: 'Impact social/environnemental', desc: 'Priorité à la mission plutôt qu\'au retour financier', tag: 'Impact' },
  { value: 'Licorne',         icon: '🦄', label: 'Licorne', desc: 'Atteindre 1Md€ de valorisation, leader mondial', tag: 'Ambition max' },
  { value: 'Lifestyle',       icon: '🌴', label: 'Lifestyle business', desc: 'Construire une entreprise profitable et épanouissante', tag: 'Liberté' },
];

const OBJECTIVE_MESSAGES: Record<string, string> = {
  Autofinancement: 'Excellent choix pour préserver votre capital. Nous allons prioriser les financements non-dilutifs et une stratégie de croissance organique.',
  Acquisition: 'Pour maximiser votre valeur à la cession, nous allons construire un parcours qui optimise vos métriques et votre attractivité pour les acquéreurs.',
  IPO: 'Un objectif IPO implique une croissance soutenue sur 5-10 ans. Nous allons construire un parcours de levées successives pour y parvenir.',
  'Impact social': 'Nous allons identifier les financements dédiés à l\'impact (BEI, fonds ESG, subventions européennes) et construire une stratégie hybride.',
  Licorne: 'Ambitieux et réalisable avec la bonne stratégie. Nous allons cartographier votre parcours de levées de fonds jusqu\'au stade Série C et au-delà.',
  Lifestyle: 'Nous allons prioriser les subventions, prêts d\'honneur et sources de revenus stables pour une croissance sereine sans pression investisseur.',
};

const ROLES = [
  'CEO / Co-fondateur', 'CTO / Directeur Technique', 'CFO / Directeur Financier',
  'CMO / Directeur Marketing', 'COO / Directeur Opérations', 'CPO / Directeur Produit',
  'Lead Developer', 'Head of Sales', 'Head of Growth', 'Associé', 'Advisor / Mentor', 'Autre',
];

const EXPERIENCES = [
  '< 1 an dans le secteur', '1 à 3 ans', '3 à 10 ans', '> 10 ans — expert reconnu',
];

const AVATAR_COLORS = [
  { bg: '#D8FFBD', text: '#2D6A00' },
  { bg: '#ABC5FE', text: '#1A3A8F' },
  { bg: '#CDB4FF', text: '#3D0D8F' },
  { bg: '#FFB96D', text: '#7C4010' },
];

const STEP_LABELS = ['Profil', 'Entreprise', 'Deck', 'Situation', 'Équipe', 'Financement'];

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName[0] ?? '?')}${(lastName[0] ?? '')}`.toUpperCase();
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

// ─── Sub-components ─────────────────────────────────────────────────────────

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string }> = ({ value, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
    <div
      onClick={() => onChange(!value)}
      className="relative w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ backgroundColor: value ? '#F4B8CC' : '#E5E7EB' }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(4px)' }}
      />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const Label: React.FC<{ children: React.ReactNode; optional?: boolean }> = ({ children, optional }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
    {children}
    {optional && <span className="text-gray-300 font-normal ml-1">(optionnel)</span>}
  </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={clsx(
      'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none',
      'focus:border-gray-900 placeholder-gray-300 transition-colors',
      props.disabled && 'bg-gray-50 text-gray-500',
      props.className,
    )}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select
    {...props}
    className={clsx(
      'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none bg-white',
      'focus:border-gray-900 transition-colors',
      props.className,
    )}
  >
    {children}
  </select>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const SimplifiedOnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OnboardingFormData>(() => {
    try {
      const saved = localStorage.getItem('raisup_onboarding_v2');
      if (saved) return { ...DEFAULT, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return DEFAULT;
  });
  const [dragOver, setDragOver] = useState(false);
  const [deckLoading, setDeckLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoTargetIdx, setPhotoTargetIdx] = useState<number | null>(null);

  // Persist on change (exclude base64 blobs)
  useEffect(() => {
    const toSave = {
      ...form,
      deckBase64: null,
      team: form.team.map(m => ({ ...m, photo: null })),
    };
    localStorage.setItem('raisup_onboarding_v2', JSON.stringify(toSave));
  }, [form]);

  // Initialize founder when reaching step 5
  useEffect(() => {
    if (step === 5 && form.team.length === 0 && form.firstName) {
      setForm(prev => ({
        ...prev,
        team: [newMember({
          id: 'founder',
          firstName: prev.firstName,
          lastName: prev.lastName,
          role: 'CEO / Co-fondateur',
          isFounder: true,
        })],
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

  // ─── Validations ──────────────────────────────────────────────────────────
  const step1Valid = form.firstName && form.lastName && form.email;
  const step2Valid = form.startupName && form.sector && form.businessModel && form.clientType && form.legalForm && form.city && form.ambition;

  // ─── Deck file handling ───────────────────────────────────────────────────
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ─── Photo handling for team members ─────────────────────────────────────
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

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    localStorage.setItem('raisup_profile', JSON.stringify(form));
    navigate('/loading-strategy');
  };

  const progress = (step / 6) * 100;

  const coFoundersCount = form.team.filter(m =>
    m.role.includes('fondateur') || m.role === 'Associé'
  ).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
            <span className="font-black text-lg tracking-wide text-gray-900">RAISUP</span>
          </div>
          <span className="text-sm text-gray-400">Étape {step} sur 6</span>
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#F4B8CC' }} />
        </div>
        <div className="max-w-2xl mx-auto px-4 py-2 flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={clsx('text-xs transition-colors font-medium',
              i + 1 <= step ? 'text-gray-900' : 'text-gray-300')}>
              {label}
            </span>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 1 — Profil personnel
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur Raisup</h1>
              <p className="text-gray-400 mt-1 text-sm">Créez votre profil en 6 étapes — moins de 12 minutes</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label><User className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Prénom</Label>
                <Input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Votre prénom" />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Votre nom de famille" />
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

            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#0A0A0A' }}>
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 2 — L'entreprise
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">L'entreprise</h1>
              <p className="text-gray-400 mt-1 text-sm">Décrivez votre startup, votre marché et vos ambitions</p>
            </div>

            {/* Nom + Description */}
            <div>
              <Label><Building2 className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Nom de la startup</Label>
              <Input value={form.startupName} onChange={e => set('startupName', e.target.value)} placeholder="Ex: MediScan, GreenTech Solutions..." />
            </div>

            <div>
              <Label optional>Description courte</Label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="En une phrase, décrivez votre produit ou service..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 placeholder-gray-300 resize-none transition-colors"
              />
            </div>

            {/* Secteur — grid de cards */}
            <div>
              <Label>Secteur</Label>
              <div className="grid grid-cols-4 gap-2">
                {SECTORS.map(s => (
                  <button key={s.value} type="button"
                    onClick={() => set('sector', s.value)}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all text-xs font-medium',
                      form.sector === s.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300',
                    )}>
                    <span className="text-base">{s.emoji}</span>
                    <span className="leading-tight">{s.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modèle économique + Type client */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Modèle économique</Label>
                <Select value={form.businessModel} onChange={e => set('businessModel', e.target.value)}>
                  <option value="">Sélectionner</option>
                  {BUSINESS_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
              <div>
                <Label>Type de client</Label>
                <Select value={form.clientType} onChange={e => set('clientType', e.target.value)}>
                  <option value="">Sélectionner</option>
                  {CLIENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
            </div>

            {/* Forme juridique + Part fondateur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Forme juridique</Label>
                <Select value={form.legalForm} onChange={e => set('legalForm', e.target.value)}>
                  <option value="">Sélectionner</option>
                  {LEGAL_FORMS.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
              </div>
              <div>
                <Label optional>Part du fondateur (%)</Label>
                <Input type="number" min={0} max={100} placeholder="Ex: 60"
                  value={form.founderShare ?? ''}
                  onChange={e => set('founderShare', numOrNull(e.target.value))} />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-3">
              <div>
                <Label><MapPin className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Pays du siège</Label>
                <Select value={form.country}
                  onChange={e => { set('country', e.target.value); set('region', ''); }}>
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
              {form.country === 'France' && (
                <div>
                  <Label>Région</Label>
                  <Select value={form.region} onChange={e => set('region', e.target.value)}>
                    <option value="">Sélectionnez votre région</option>
                    {REGIONS_FRANCE.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>
              )}
              <div>
                <Label>Ville</Label>
                <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Paris, Lyon, Bruxelles..." />
              </div>
            </div>

            {/* Ambition */}
            <div>
              <Label>Quelle est votre ambition ?</Label>
              <div className="grid grid-cols-2 gap-2">
                {AMBITIONS.map(a => (
                  <button key={a.value} type="button" onClick={() => set('ambition', a.value)}
                    className={clsx(
                      'flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                      form.ambition === a.value ? 'border-gray-900' : 'border-gray-100 hover:border-gray-300',
                    )}
                    style={form.ambition === a.value ? { backgroundColor: a.color } : {}}>
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5',
                      form.ambition === a.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300')}>
                      {form.ambition === a.value && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{a.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!step2Valid}
                className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full disabled:opacity-40"
                style={{ backgroundColor: '#0A0A0A' }}>
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 3 — Upload du deck
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Uploadez votre deck</h1>
              <p className="text-gray-400 mt-1 text-sm">
                PDF ou PowerPoint · Max 10MB · Notre IA l'analysera pour personnaliser votre stratégie
              </p>
            </div>

            {!form.deckFileName ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  'rounded-2xl border-2 border-dashed transition-all cursor-pointer',
                  'flex flex-col items-center justify-center text-center',
                  dragOver ? 'border-gray-400 bg-gray-100' : 'border-gray-200 hover:border-gray-300',
                )}
                style={{ padding: 48, backgroundColor: dragOver ? undefined : '#F8F8F8' }}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx" className="hidden" onChange={onFileChange} />
                {deckLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Lecture du fichier...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-300 mb-4" />
                    <p className="text-base font-bold text-gray-700 mb-1">Glissez votre deck ici</p>
                    <p className="text-sm text-gray-400 mb-5">ou cliquez pour sélectionner</p>
                    <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="text-white text-sm font-semibold px-5 py-2.5 rounded-full"
                      style={{ backgroundColor: '#0A0A0A' }}>
                      Choisir un fichier
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#D8FFBD' }}>
                  <CheckCircle className="h-5 w-5" style={{ color: '#2D6A00' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{form.deckFileName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatBytes(form.deckSize)}</p>
                </div>
                <button type="button"
                  onClick={() => setForm(prev => ({ ...prev, deckFileName: '', deckSize: 0, deckBase64: null }))}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#FFF0F0', color: '#EF4444' }}>
                  <X className="h-3.5 w-3.5" /> Supprimer
                </button>
              </div>
            )}

            <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
              <span className="font-semibold">IA :</span> Votre deck sera analysé par notre IA après la création de votre compte.
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <div className="flex items-center gap-4">
                {!form.deckFileName && (
                  <button type="button" onClick={() => setStep(4)}
                    className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
                    Continuer sans deck
                  </button>
                )}
                <button type="button" onClick={() => setStep(4)} disabled={deckLoading}
                  className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full disabled:opacity-50"
                  style={{ backgroundColor: '#0A0A0A' }}>
                  Continuer <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 4 — Situation actuelle
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Situation actuelle</h1>
              <p className="text-gray-400 mt-1 text-sm">Métriques clés et pitch — ces données calculent votre score Raisup</p>
            </div>

            {/* Pre-revenue toggle */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
              <Toggle value={form.isPreRevenue} onChange={v => set('isPreRevenue', v)} label="Startup pre-revenue (pas encore de chiffre d'affaires)" />
            </div>

            {/* Métriques financières */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Métriques financières</p>
              <div className="grid grid-cols-2 gap-4">
                {!form.isPreRevenue && (
                  <div className="col-span-2">
                    <Label><TrendingUp className="inline h-3.5 w-3.5 text-gray-400 mr-1" />MRR — Monthly Recurring Revenue (€)</Label>
                    <Input type="number" min={0} placeholder="Ex: 15 000"
                      value={form.mrr ?? ''} onChange={e => set('mrr', numOrNull(e.target.value))} />
                  </div>
                )}
                <div>
                  <Label optional>Croissance MoM (%)</Label>
                  <Input type="number" placeholder="Ex: 15" value={form.momGrowth ?? ''} onChange={e => set('momGrowth', numOrNull(e.target.value))} />
                </div>
                <div>
                  <Label optional>Clients actifs</Label>
                  <Input type="number" min={0} placeholder="Ex: 45" value={form.activeClients ?? ''} onChange={e => set('activeClients', numOrNull(e.target.value))} />
                </div>
                <div>
                  <Label optional>Runway (mois)</Label>
                  <Input type="number" min={0} placeholder="Ex: 18" value={form.runway ?? ''} onChange={e => set('runway', numOrNull(e.target.value))} />
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
              <div className="mt-4">
                <Toggle value={form.hasCTO} onChange={v => set('hasCTO', v)} label="L'équipe a un CTO ou profil technique dédié" />
              </div>
            </div>

            {/* Pitch */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Pitch</p>
              <div className="space-y-4">
                <div>
                  <Label optional>Problème résolu</Label>
                  <textarea value={form.problem} onChange={e => set('problem', e.target.value)}
                    placeholder="Quel problème concret résolvez-vous ? Pour qui ?"
                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 placeholder-gray-300 resize-none" />
                </div>
                <div>
                  <Label optional>Solution proposée</Label>
                  <textarea value={form.solution} onChange={e => set('solution', e.target.value)}
                    placeholder="Comment le résolvez-vous ? Qu'est-ce qui vous différencie ?"
                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 placeholder-gray-300 resize-none" />
                </div>
                <div>
                  <Label optional>Avantage concurrentiel</Label>
                  <textarea value={form.competitiveAdvantage} onChange={e => set('competitiveAdvantage', e.target.value)}
                    placeholder="En quoi êtes-vous différent(e) de la concurrence ?"
                    rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 placeholder-gray-300 resize-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button type="button" onClick={() => setStep(5)}
                className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full"
                style={{ backgroundColor: '#0A0A0A' }}>
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 5 — L'équipe
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-4">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Votre équipe</h1>
                  <p className="text-gray-400 mt-1 text-sm max-w-lg">
                    Les investisseurs financent autant les personnes que le projet.
                  </p>
                  {form.team.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        <strong className="text-gray-600">{form.team.length}</strong> membre{form.team.length > 1 ? 's' : ''}{' '}
                        · <strong className="text-gray-600">{coFoundersCount}</strong> co-fondateur{coFoundersCount > 1 ? 's' : ''}
                      </span>
                    </p>
                  )}
                </div>
                {form.team.length < 10 && (
                  <button type="button" onClick={addMember}
                    className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-full flex-shrink-0 ml-4"
                    style={{ backgroundColor: '#0A0A0A' }}>
                    <Plus className="h-3.5 w-3.5" /> Ajouter un membre
                  </button>
                )}
              </div>
            </div>

            {/* Member cards */}
            <div className="space-y-3">
              {form.team.map((member, idx) => {
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const initials = member.firstName || member.lastName
                  ? getInitials(member.firstName || '?', member.lastName || '?')
                  : '?';
                return (
                  <div key={member.id} className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #E5E7EB', padding: 20 }}>
                    <div className="flex items-start gap-4">
                      {/* Avatar / Photo */}
                      <div onClick={() => triggerPhotoUpload(idx)}
                        className="flex-shrink-0 relative cursor-pointer group"
                        style={{ width: 80, height: 80 }}>
                        {member.photo ? (
                          <img src={member.photo} alt="photo" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-xl flex items-center justify-center border-2 border-dashed transition-all group-hover:opacity-80"
                            style={{ backgroundColor: avatarColor.bg, borderColor: avatarColor.bg }}>
                            <span className="text-xl font-bold" style={{ color: avatarColor.text }}>{initials}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                          <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Name + role */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input value={member.firstName} onChange={e => updateMember(idx, 'firstName', e.target.value)}
                            placeholder="Prénom" disabled={member.isFounder} />
                          <Input value={member.lastName} onChange={e => updateMember(idx, 'lastName', e.target.value)}
                            placeholder="Nom" disabled={member.isFounder} />
                        </div>
                        <Select value={member.role} onChange={e => updateMember(idx, 'role', e.target.value)}>
                          <option value="">Rôle dans l'entreprise</option>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                        {member.role === 'Autre' && (
                          <Input value={member.customRole} onChange={e => updateMember(idx, 'customRole', e.target.value)}
                            placeholder="Précisez le rôle..." />
                        )}
                      </div>

                      {/* Delete */}
                      {!member.isFounder && (
                        <button type="button" onClick={() => removeMember(idx)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                          style={{ color: '#EF4444' }}>
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {member.isFounder && (
                      <div className="mt-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                          Fondateur principal
                        </span>
                      </div>
                    )}

                    <div className="mt-4 space-y-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Responsabilités</label>
                        <textarea value={member.responsibilities}
                          onChange={e => { if (e.target.value.length <= 150) updateMember(idx, 'responsibilities', e.target.value); }}
                          placeholder="Ex: Développement produit, architecture technique, recrutement tech"
                          rows={2}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-900 placeholder-gray-300 resize-none" />
                        <p className="text-xs text-gray-300 text-right mt-1">{member.responsibilities.length}/150</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Expérience</label>
                          <Select value={member.experience} onChange={e => updateMember(idx, 'experience', e.target.value)}>
                            <option value="">Sélectionner...</option>
                            {EXPERIENCES.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                            LinkedIn <span className="text-gray-300 font-normal normal-case">(optionnel)</span>
                          </label>
                          <Input type="url" value={member.linkedin} onChange={e => updateMember(idx, 'linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/..." />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Toggle value={member.hasPreviousStartup} onChange={v => { updateMember(idx, 'hasPreviousStartup', v); if (!v) updateMember(idx, 'hadExit', false); }}
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

            <div className="flex items-center justify-between pt-2 pb-4">
              <button type="button" onClick={() => setStep(4)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button type="button" onClick={() => setStep(6)}
                className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full"
                style={{ backgroundColor: '#0A0A0A' }}>
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 6 — Stratégie de financement
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stratégie de financement</h1>
              <p className="text-gray-400 mt-1 text-sm">Ces informations génèrent votre parcours financier personnalisé</p>
            </div>

            {/* Montant + Timeline */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Objectifs de levée</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label><DollarSign className="inline h-3.5 w-3.5 text-gray-400 mr-1" />Montant recherché (€)</Label>
                  <Input type="number" min={0} placeholder="Ex: 500 000"
                    value={form.fundraisingGoal ?? ''} onChange={e => set('fundraisingGoal', numOrNull(e.target.value))} />
                </div>
                <div>
                  <Label>Timeline souhaitée</Label>
                  <Select value={form.fundingTimeline} onChange={e => set('fundingTimeline', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {FUNDING_TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div>
                  <Label optional>Dilution max acceptée (%)</Label>
                  <Input type="number" min={0} max={100} placeholder="Ex: 20"
                    value={form.maxDilution ?? ''} onChange={e => set('maxDilution', numOrNull(e.target.value))} />
                </div>
                <div>
                  <Label optional>Valorisation finale visée (€)</Label>
                  <Input type="number" min={0} placeholder="Ex: 5 000 000"
                    value={form.finalGoalValuation ?? ''} onChange={e => set('finalGoalValuation', numOrNull(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Préférence de financement */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Préférence de financement</p>
              <div className="grid grid-cols-1 gap-2">
                {FUNDING_PREFERENCES.map(fp => (
                  <button key={fp.value} type="button" onClick={() => set('fundingPreference', fp.value)}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      form.fundingPreference === fp.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300',
                    )}>
                    <span className="text-2xl flex-shrink-0">{fp.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{fp.label}</p>
                      <p className="text-xs text-gray-500">{fp.sub}</p>
                    </div>
                    {form.fundingPreference === fp.value && <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#2D6A00' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Objectif ultime */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quel est votre objectif ultime ?</p>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
                      {obj.tag}
                    </span>
                  </button>
                ))}
              </div>

              {/* Message dynamique */}
              {form.finalObjective && OBJECTIVE_MESSAGES[form.finalObjective] && (
                <div className="mt-4 p-4 rounded-xl text-sm" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                  <Sparkles className="inline h-3.5 w-3.5 mr-1" />
                  {OBJECTIVE_MESSAGES[form.finalObjective]}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(5)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button type="button" onClick={handleSubmit}
                className="flex items-center gap-2 text-white text-sm font-semibold px-8 py-3.5 rounded-full"
                style={{ background: 'linear-gradient(135deg, #F4B8CC 0%, #CDB4FF 100%)' }}>
                <Sparkles className="h-4 w-4" /> Générer ma stratégie
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SimplifiedOnboardingForm;
