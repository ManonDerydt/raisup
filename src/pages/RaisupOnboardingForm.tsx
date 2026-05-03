import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, Check, Search, Building2, Mail, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import clsx from 'clsx';

export type RaisupFormData = {
  // Step 1 - Ambition
  ambition: string;

  // Step 2 - L'entreprise
  startupName: string;
  founderName: string;
  description: string;
  businessModel: string;
  sector: string;
  clientType: string;

  // Step 3 - Siège social
  country: string;
  region: string;
  city: string;
  legalForm: string;
  founderShare: number | null;

  // Step 4 - Situation actuelle
  isPreRevenue: boolean;
  mrr: number | null;
  momGrowth: number | null;
  activeClients: number | null;
  runway: number | null;
  burnRate: number | null;
  teamSize: number | null;
  hasCTO: boolean;

  // Step 5 - Équipe
  sectorExperience: string;
  previousStartup: string;
  hadExit: string;
  advisors: number | null;
  problem: string;
  solution: string;
  competitiveAdvantage: string;

  // Step 6 - Stratégie de financement
  fundingTimeline: string;
  fundraisingGoal: number | null;
  maxDilution: number | null;
  fundingPreference: string;
  finalGoalValuation: number | null;

  // Partenaire
  partnerId: string | null;
  partnerName: string | null;
  partnerEmail: string | null;
  partnerOnRaisup: boolean;
  partnerConfirmed: boolean;
};

const defaultFormData: RaisupFormData = {
  ambition: '',
  startupName: '',
  founderName: '',
  description: '',
  businessModel: '',
  sector: '',
  clientType: '',
  country: 'France',
  region: '',
  city: '',
  legalForm: '',
  founderShare: null,
  isPreRevenue: false,
  mrr: null,
  momGrowth: null,
  activeClients: null,
  runway: null,
  burnRate: null,
  teamSize: null,
  hasCTO: false,
  sectorExperience: '',
  previousStartup: '',
  hadExit: '',
  advisors: null,
  problem: '',
  solution: '',
  competitiveAdvantage: '',
  fundingTimeline: '',
  fundraisingGoal: null,
  maxDilution: null,
  fundingPreference: '',
  finalGoalValuation: null,
  partnerId: null,
  partnerName: null,
  partnerEmail: null,
  partnerOnRaisup: false,
  partnerConfirmed: false,
};

const AMBITIONS = [
  { value: 'Rentabilité et indépendance', label: 'Rentabilité et indépendance', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { value: 'Leader marché français', label: 'Leader marché français', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'Expansion européenne', label: 'Expansion européenne', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'Scale-up et exit', label: 'Scale-up et exit', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'Licorne', label: 'Licorne', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'Je ne sais pas encore', label: 'Je ne sais pas encore', color: 'bg-gray-100 text-gray-700 border-gray-300' },
];

const REGIONS_FRANCE = [
  'Île-de-France', 'Auvergne-Rhône-Alpes', 'Bretagne', 'Occitanie',
  'Nouvelle-Aquitaine', 'Hauts-de-France', 'Grand Est', 'Provence-Alpes-Côte d\'Azur',
  'Normandie', 'Pays de la Loire', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire',
  'Corse', 'Outre-mer',
];

const LEGAL_FORMS = ['SAS', 'SASU', 'SARL', 'EURL', 'SA', 'SNC', 'Auto-entrepreneur', 'Non encore créée'];
const SECTORS = ['Fintech', 'Healthtech', 'Edtech', 'Proptech', 'Greentech', 'SaaS B2B', 'E-commerce', 'IA & Data', 'Marketplace', 'Deeptech', 'Legaltech', 'Foodtech', 'Autre'];
const BUSINESS_MODELS = ['SaaS', 'Marketplace', 'E-commerce', 'Freemium', 'Hardware + services', 'Abonnement', 'Commission', 'Licences', 'Autre'];
const CLIENT_TYPES = ['B2B', 'B2C', 'B2B2C', 'B2G', 'Mixte'];
const EXPERIENCE_OPTIONS = ['< 1 an', '1-2 ans', '2-5 ans', '5+ ans'];
const FUNDING_TIMELINES = ['< 3 mois', '3-6 mois', '6-12 mois', '12-18 mois', '> 18 mois'];
const FUNDING_PREFERENCES = ['Equity (levée de fonds)', 'Prêt / dette', 'Subventions', 'Revenue-based financing', 'Mixte'];

const steps = ['Ambition', "L'entreprise", 'Siège social', 'Situation actuelle', 'Équipe', 'Financement'];

type AgencyResult = { id: string; name: string; type: string; email: string };

const RaisupOnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromDashboard = searchParams.get('from') === 'dashboard';
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<RaisupFormData>(() => {
    try {
      const saved = localStorage.getItem('raisupOnboardingData');
      return saved ? { ...defaultFormData, ...JSON.parse(saved) } : defaultFormData;
    } catch {
      return defaultFormData;
    }
  });

  // ── Partner search ───────────────────────────────────────────────────────────
  const [hasPartner, setHasPartner] = useState(!!formData.partnerConfirmed);
  const [partnerSearch, setPartnerSearch] = useState(formData.partnerName ?? '');
  const [partnerResults, setPartnerResults] = useState<AgencyResult[]>([]);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerPending, setPartnerPending] = useState<AgencyResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const partnerDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasPartner || formData.partnerConfirmed) return;
    if (partnerDebounce.current) clearTimeout(partnerDebounce.current);
    if (partnerSearch.trim().length < 2) { setPartnerResults([]); setShowDropdown(false); return; }
    partnerDebounce.current = setTimeout(async () => {
      setPartnerLoading(true);
      try {
        const { data } = await supabase
          .from('agency_accounts')
          .select('id, name, type, email')
          .ilike('name', `%${partnerSearch}%`)
          .limit(6);
        setPartnerResults(data ?? []);
        setShowDropdown(true);
      } catch { setPartnerResults([]); }
      finally { setPartnerLoading(false); }
    }, 300);
    return () => { if (partnerDebounce.current) clearTimeout(partnerDebounce.current); };
  }, [partnerSearch, hasPartner, formData.partnerConfirmed]);

  const confirmPartner = (agency: AgencyResult) => {
    setPartnerPending(agency);
    setShowDropdown(false);
  };

  const validatePartner = (agency: AgencyResult) => {
    setFormData(prev => ({ ...prev, partnerId: agency.id, partnerName: agency.name, partnerEmail: agency.email, partnerOnRaisup: true, partnerConfirmed: true }));
    setPartnerPending(null);
  };

  const validateManual = () => {
    setFormData(prev => ({ ...prev, partnerId: null, partnerName: partnerSearch, partnerEmail: null, partnerOnRaisup: false, partnerConfirmed: true }));
    setShowDropdown(false);
  };

  const clearPartner = () => {
    setFormData(prev => ({ ...prev, partnerId: null, partnerName: null, partnerEmail: null, partnerOnRaisup: false, partnerConfirmed: false }));
    setPartnerPending(null);
    setPartnerSearch('');
    setPartnerResults([]);
    setShowDropdown(false);
  };
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem('raisupOnboardingData', JSON.stringify(formData));
  }, [formData]);

  const set = (field: keyof RaisupFormData, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const numOrNull = (v: string): number | null => {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let saved = false;
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('raisup_profiles').insert([{
          ambition: formData.ambition,
          startup_name: formData.startupName,
          founder_name: formData.founderName,
          description: formData.description,
          business_model: formData.businessModel,
          sector: formData.sector,
          client_type: formData.clientType,
          country: formData.country,
          region: formData.region,
          city: formData.city,
          legal_form: formData.legalForm,
          founder_share: formData.founderShare,
          is_pre_revenue: formData.isPreRevenue,
          mrr: formData.mrr,
          mom_growth: formData.momGrowth,
          active_clients: formData.activeClients,
          runway: formData.runway,
          burn_rate: formData.burnRate,
          team_size: formData.teamSize,
          has_cto: formData.hasCTO,
          sector_experience: formData.sectorExperience,
          previous_startup: formData.previousStartup,
          had_exit: formData.hadExit,
          advisors: formData.advisors,
          problem: formData.problem,
          solution: formData.solution,
          competitive_advantage: formData.competitiveAdvantage,
          funding_timeline: formData.fundingTimeline,
          amount_sought: formData.fundraisingGoal,
          max_dilution: formData.maxDilution,
          funding_preference: formData.fundingPreference,
          target_valuation: formData.finalGoalValuation,
        }]);
        saved = !error;
      } catch {
        saved = false;
      }
    }
    setSubmitting(false);
    if (fromDashboard) {
      navigate('/dashboard/score');
    } else {
      navigate(`/onboarding/raisup/success?saved=${saved}`);
    }
  };

  const progress = (step / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-2xl">
          <div className="flex items-center gap-3">
            {fromDashboard && (
              <button
                onClick={() => navigate('/dashboard/score')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au score
              </button>
            )}
            {!fromDashboard && (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-secondary-lighter" />
                <span className="font-semibold text-gray-900">Raisup</span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">Étape {step} sur {steps.length}</span>
        </div>
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-secondary-lighter transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="container mx-auto px-4 py-2 max-w-2xl">
          <div className="flex justify-between">
            {steps.map((label, i) => (
              <span key={label} className={clsx('text-xs transition-colors', i + 1 <= step ? 'text-primary font-medium' : 'text-gray-400')}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* ─── Step 1: Ambition ─────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quelle est votre ambition ?</h2>
            <p className="text-gray-500 mb-6">Choisissez l'objectif principal de votre startup.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AMBITIONS.map(a => (
                <button key={a.value} type="button"
                  onClick={() => set('ambition', a.value)}
                  className={clsx('flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    formData.ambition === a.value
                      ? 'border-primary bg-secondary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  )}>
                  <div className={clsx('w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    formData.ambition === a.value ? 'border-primary bg-primary' : 'border-gray-300')}>
                    {formData.ambition === a.value && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-medium text-gray-900">{a.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setStep(2)} disabled={!formData.ambition}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 2: L'entreprise ─────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">L'entreprise</h2>
            <p className="text-gray-500 mb-6">Décrivez votre startup et son modèle.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Nom de la startup</label>
                  <input className="input-field" placeholder="Ex: MediScan" value={formData.startupName}
                    onChange={e => set('startupName', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Nom du fondateur principal</label>
                  <input className="input-field" placeholder="Ex: Alice Dupont" value={formData.founderName}
                    onChange={e => set('founderName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Description courte</label>
                <textarea className="input-field" rows={3} placeholder="En une phrase, décrivez votre produit ou service..."
                  value={formData.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="form-label">Modèle économique</label>
                  <select className="input-field" value={formData.businessModel} onChange={e => set('businessModel', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {BUSINESS_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Secteur</label>
                  <select className="input-field" value={formData.sector} onChange={e => set('sector', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Type de client</label>
                  <select className="input-field" value={formData.clientType} onChange={e => set('clientType', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {CLIENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Section partenaire ─────────────────────────────────────────── */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Structure d'accompagnement</span>
                  <span className="text-xs text-gray-400">(optionnel)</span>
                </div>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => { setHasPartner(h => !h); if (hasPartner) clearPartner(); }}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
                  style={{ backgroundColor: hasPartner ? '#F4B8CC' : '#D1D5DB' }}
                >
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                    style={{ transform: hasPartner ? 'translateX(18px)' : 'translateX(3px)' }} />
                </button>
              </div>

              {hasPartner && (
                <div className="space-y-2">
                  {/* Partenaire confirmé → badge gomette */}
                  {formData.partnerConfirmed && formData.partnerName ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: '#F0FFF4', border: '1.5px solid #D8FFBD' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                        {formData.partnerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{formData.partnerName}</p>
                        {formData.partnerOnRaisup && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5"
                            style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                            <Check className="h-3 w-3" /> Sur Raisup
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={clearPartner}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                  /* Card de confirmation avant validation */
                  ) : partnerPending ? (
                    <div className="p-4 rounded-xl space-y-3"
                      style={{ backgroundColor: '#FFFBEB', border: '1.5px solid #FEF3C7' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                          {partnerPending.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{partnerPending.name}</p>
                          <p className="text-xs text-gray-500">{partnerPending.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        Faites-vous bien partie de <strong>{partnerPending.name}</strong> ?
                      </p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => validatePartner(partnerPending)}
                          className="flex-1 py-2 text-sm font-semibold rounded-full transition-opacity hover:opacity-80"
                          style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                          Oui, confirmer ✓
                        </button>
                        <button type="button" onClick={() => { setPartnerPending(null); setPartnerSearch(''); }}
                          className="flex-1 py-2 text-sm font-medium rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
                          Non, changer
                        </button>
                      </div>
                    </div>

                  /* Champ de recherche */
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          value={partnerSearch}
                          onChange={e => { setPartnerSearch(e.target.value); setShowDropdown(false); }}
                          onFocus={() => partnerResults.length > 0 && setShowDropdown(true)}
                          placeholder="Rechercher votre structure d'accompagnement..."
                          className="input-field pl-9 pr-9"
                        />
                        {partnerLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        )}
                      </div>

                      {/* Dropdown */}
                      {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-lg z-20 overflow-hidden bg-white"
                          style={{ border: '1.5px solid #E5E7EB' }}>
                          {partnerResults.length > 0 && partnerResults.map(agency => (
                            <button key={agency.id} type="button"
                              onClick={() => confirmPartner(agency)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                                style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}>
                                {agency.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">{agency.name}</p>
                                <p className="text-xs text-gray-500 truncate">{agency.type}</p>
                              </div>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: '#D8FFBD', color: '#2D6A00' }}>
                                Sur Raisup
                              </span>
                            </button>
                          ))}
                          {/* Pas trouvé */}
                          <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
                            <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold text-gray-700">"{partnerSearch}"</span> n'est pas encore sur Raisup — on les préviendra
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pas sur Raisup, confirmer manuellement */}
                      {!showDropdown && partnerSearch.length >= 2 && partnerResults.length === 0 && !partnerLoading && (
                        <button type="button" onClick={validateManual}
                          className="mt-2 w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-left transition-colors"
                          style={{ border: '1.5px dashed #E5E7EB', color: '#6B7280' }}>
                          <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span>
                            Confirmer <strong className="text-gray-800">"{partnerSearch}"</strong> — on les préviendra de votre démarche
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* ── Fin section partenaire ──────────────────────────────────────── */}

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Retour</button>
              <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">Continuer <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Siège social ─────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Siège social</h2>
            <p className="text-gray-500 mb-6">Localisation et structure juridique.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Pays</label>
                  <input className="input-field" value={formData.country} onChange={e => set('country', e.target.value)} />
                </div>
                {formData.country === 'France' && (
                  <div>
                    <label className="form-label">Région</label>
                    <select className="input-field" value={formData.region} onChange={e => set('region', e.target.value)}>
                      <option value="">Sélectionner</option>
                      {REGIONS_FRANCE.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Ville</label>
                  <input className="input-field" placeholder="Paris" value={formData.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Forme juridique</label>
                  <select className="input-field" value={formData.legalForm} onChange={e => set('legalForm', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {LEGAL_FORMS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Part du fondateur principal (%)</label>
                <input className="input-field" type="number" min={0} max={100} placeholder="Ex: 60"
                  value={formData.founderShare ?? ''} onChange={e => set('founderShare', numOrNull(e.target.value))} />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Retour</button>
              <button onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">Continuer <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* ─── Step 4: Situation actuelle ───────────────────────── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Situation actuelle</h2>
            <p className="text-gray-500 mb-6">Métriques clés de votre startup aujourd'hui.</p>
            <div className="space-y-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.isPreRevenue}
                  onChange={e => set('isPreRevenue', e.target.checked)} />
                <span className="text-gray-700 font-medium">Pre-revenue (pas encore de revenus)</span>
              </label>
              {!formData.isPreRevenue && (
                <div>
                  <label className="form-label">MRR — Monthly Recurring Revenue (€)</label>
                  <input className="input-field" type="number" min={0} placeholder="Ex: 15000"
                    value={formData.mrr ?? ''} onChange={e => set('mrr', numOrNull(e.target.value))} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Croissance MoM (%)</label>
                  <input className="input-field" type="number" placeholder="Ex: 15"
                    value={formData.momGrowth ?? ''} onChange={e => set('momGrowth', numOrNull(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Clients actifs</label>
                  <input className="input-field" type="number" min={0} placeholder="Ex: 45"
                    value={formData.activeClients ?? ''} onChange={e => set('activeClients', numOrNull(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Runway (mois)</label>
                  <input className="input-field" type="number" min={0} placeholder="Ex: 18"
                    value={formData.runway ?? ''} onChange={e => set('runway', numOrNull(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Burn rate mensuel (€)</label>
                  <input className="input-field" type="number" min={0} placeholder="Ex: 30000"
                    value={formData.burnRate ?? ''} onChange={e => set('burnRate', numOrNull(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Taille de l'équipe</label>
                  <input className="input-field" type="number" min={1} placeholder="Ex: 6"
                    value={formData.teamSize ?? ''} onChange={e => set('teamSize', numOrNull(e.target.value))} />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={formData.hasCTO}
                  onChange={e => set('hasCTO', e.target.checked)} />
                <span className="text-gray-700 font-medium">L'équipe a un CTO (ou profil technique dédié)</span>
              </label>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(3)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Retour</button>
              <button onClick={() => setStep(5)} className="btn-primary flex items-center gap-2">Continuer <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* ─── Step 5: Équipe ───────────────────────────────────── */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Équipe & Pitch</h2>
            <p className="text-gray-500 mb-6">Expérience, problème, solution et différenciation.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="form-label">Expérience dans le secteur</label>
                  <select className="input-field" value={formData.sectorExperience} onChange={e => set('sectorExperience', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {EXPERIENCE_OPTIONS.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Startup précédente ?</label>
                  <select className="input-field" value={formData.previousStartup} onChange={e => set('previousStartup', e.target.value)}>
                    <option value="">Sélectionner</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Exit réalisé ?</label>
                  <select className="input-field" value={formData.hadExit} onChange={e => set('hadExit', e.target.value)}>
                    <option value="">Sélectionner</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Nombre d'advisors</label>
                <input className="input-field" type="number" min={0} placeholder="Ex: 2"
                  value={formData.advisors ?? ''} onChange={e => set('advisors', numOrNull(e.target.value))} />
              </div>
              <div>
                <label className="form-label">Problème résolu</label>
                <textarea className="input-field" rows={2} placeholder="Quel problème résolvez-vous ?"
                  value={formData.problem} onChange={e => set('problem', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Solution proposée</label>
                <textarea className="input-field" rows={2} placeholder="Comment le résolvez-vous ?"
                  value={formData.solution} onChange={e => set('solution', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Avantage concurrentiel</label>
                <textarea className="input-field" rows={2} placeholder="En quoi êtes-vous différent(e) ?"
                  value={formData.competitiveAdvantage} onChange={e => set('competitiveAdvantage', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(4)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Retour</button>
              <button onClick={() => setStep(6)} className="btn-primary flex items-center gap-2">Continuer <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}

        {/* ─── Step 6: Stratégie de financement ─────────────────── */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stratégie de financement</h2>
            <p className="text-gray-500 mb-6">Objectifs et préférences pour votre levée.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Timeline souhaitée</label>
                  <select className="input-field" value={formData.fundingTimeline} onChange={e => set('fundingTimeline', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {FUNDING_TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Préférence de financement</label>
                  <select className="input-field" value={formData.fundingPreference} onChange={e => set('fundingPreference', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {FUNDING_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Montant recherché (€)</label>
                  <input className="input-field" type="number" min={0} placeholder="Ex: 500000"
                    value={formData.fundraisingGoal ?? ''} onChange={e => set('fundraisingGoal', numOrNull(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Dilution max acceptée (%)</label>
                  <input className="input-field" type="number" min={0} max={100} placeholder="Ex: 20"
                    value={formData.maxDilution ?? ''} onChange={e => set('maxDilution', numOrNull(e.target.value))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Objectif de valorisation finale (€)</label>
                  <input className="input-field" type="number" min={0} placeholder="Ex: 5000000"
                    value={formData.finalGoalValuation ?? ''} onChange={e => set('finalGoalValuation', numOrNull(e.target.value))} />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(5)} className="btn-secondary flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Retour</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-60">
                {submitting ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement...</span>
                ) : (<><Sparkles className="h-4 w-4" /> Voir mon profil Raisup</>)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaisupOnboardingForm;
