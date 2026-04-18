import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Building2, MapPin, TrendingUp, Target,
  Save, Check, X, Search, RefreshCw,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateScore } from '../services/generateTimeline';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgencyResult = { id: string; name: string; type: string; email: string };

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startupName: string;
  oneLiner: string;
  sector: string;
  businessModel: string;
  clientType: string;
  country: string;
  region: string;
  city: string;
  mrr: number;
  growthMoM: number;
  activeClients: number;
  churnRate: number;
  runway: number;
  burnRate: number;
  fundraisingGoal: number;
  maxDilution: number;
  fundingPreference: string;
  finalObjective: string;
  finalGoalValuation: number;
  partnerName: string;
  partnerId: string | null;
  partnerEmail: string | null;
  partnerOnRaisup: boolean;
  partnerConfirmed: boolean;
};

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  startupName: '', oneLiner: '', sector: '', businessModel: '', clientType: '',
  country: 'France', region: '', city: '',
  mrr: 0, growthMoM: 0, activeClients: 0, churnRate: 0,
  runway: 12, burnRate: 0, fundraisingGoal: 0, maxDilution: 20,
  fundingPreference: '', finalObjective: '', finalGoalValuation: 0,
  partnerName: '', partnerId: null, partnerEmail: null,
  partnerOnRaisup: false, partnerConfirmed: false,
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
      <span className="text-[#F4B8CC]">{icon}</span>
      <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
    </div>
    {children}
  </div>
);

// ─── Field ────────────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  half?: boolean;
}> = ({ label, children, half }) => (
  <div className={half ? 'col-span-1' : 'col-span-2 md:col-span-1'}>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:border-[#F4B8CC] focus:outline-none transition-colors placeholder:text-gray-400';
const selectCls = `${inputCls} cursor-pointer`;

// ─── Main component ───────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Partner search state
  const [partnerSearch, setPartnerSearch] = useState('');
  const [allPartners, setAllPartners] = useState<AgencyResult[]>([]);
  const [partnerResults, setPartnerResults] = useState<AgencyResult[]>([]);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [partnerPending, setPartnerPending] = useState<AgencyResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('raisupOnboardingData');
    console.log('Raw localStorage raisupOnboardingData:', raw);

    // Also check other possible keys
    const rawProfile = localStorage.getItem('raisup_profile');
    const rawV2 = localStorage.getItem('raisup_onboarding_v2');
    console.log('raisup_profile:', rawProfile);
    console.log('raisup_onboarding_v2:', rawV2);

    let merged: Record<string, unknown> = {};

    if (rawProfile) {
      try { merged = { ...merged, ...JSON.parse(rawProfile) }; } catch { /* skip */ }
    }
    if (rawV2) {
      try { merged = { ...merged, ...JSON.parse(rawV2) }; } catch { /* skip */ }
    }
    if (raw) {
      try { merged = { ...merged, ...JSON.parse(raw) }; } catch (e) {
        console.error('Erreur parsing raisupOnboardingData:', e);
      }
    }

    console.log('Merged profile data:', merged);

    // founderName can be "Prénom Nom" — split it
    const founderParts = ((merged.founderName as string) ?? '').trim().split(' ');
    const founderFirst = founderParts[0] ?? '';
    const founderLast = founderParts.slice(1).join(' ');

    const next: FormData = {
      firstName:        (merged.firstName as string)        || founderFirst                                     || user?.user_metadata?.given_name  || '',
      lastName:         (merged.lastName as string)         || founderLast                                      || user?.user_metadata?.family_name || '',
      email:            (merged.email as string)            || user?.email                                      || '',
      phone:            (merged.phone as string)            || '',
      startupName:      (merged.startupName as string)      || (merged.startup_name as string)                  || '',
      oneLiner:         (merged.oneLiner as string)         || (merged.description as string)                   || '',
      sector:           (merged.sector as string)           || '',
      businessModel:    (merged.businessModel as string)    || (merged.business_model as string)                || '',
      clientType:       (merged.clientType as string)       || (merged.client_type as string)                   || '',
      country:          (merged.country as string)          || 'France',
      region:           (merged.region as string)           || '',
      city:             (merged.city as string)             || '',
      mrr:              Number(merged.mrr)                  || 0,
      growthMoM:        Number(merged.growthMoM ?? merged.momGrowth)  || 0,
      activeClients:    Number(merged.activeClients ?? merged.active_clients) || 0,
      churnRate:        Number(merged.churnRate)            || 0,
      runway:           Number(merged.runway)               || 12,
      burnRate:         Number(merged.burnRate ?? merged.burn_rate)    || 0,
      fundraisingGoal:  Number(merged.fundraisingGoal ?? merged.amount_sought) || 0,
      maxDilution:      Number(merged.maxDilution ?? merged.max_dilution)      || 20,
      fundingPreference:(merged.fundingPreference as string)|| (merged.funding_preference as string)            || '',
      finalObjective:   (merged.finalObjective as string)   || (merged.ambition as string)                     || '',
      finalGoalValuation: Number(merged.finalGoalValuation ?? merged.target_valuation) || 0,
      partnerName:      (merged.partnerName as string)      || '',
      partnerId:        (merged.partnerId as string)        || null,
      partnerEmail:     (merged.partnerEmail as string)     || null,
      partnerOnRaisup:  Boolean(merged.partnerOnRaisup),
      partnerConfirmed: Boolean(merged.partnerConfirmed),
    };

    console.log('Populated formData:', next);
    setFormData(next);

    if (next.partnerName) {
      setPartnerSearch(next.partnerName);
    }
  }, [user]);

  // ── Save to localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
    localStorage.setItem('raisupOnboardingData', JSON.stringify({
      ...existing,
      firstName:        formData.firstName,
      lastName:         formData.lastName,
      founderName:      `${formData.firstName} ${formData.lastName}`.trim(),
      phone:            formData.phone,
      startupName:      formData.startupName,
      oneLiner:         formData.oneLiner,
      description:      formData.oneLiner,
      sector:           formData.sector,
      businessModel:    formData.businessModel,
      clientType:       formData.clientType,
      country:          formData.country,
      region:           formData.region,
      city:             formData.city,
      mrr:              formData.mrr,
      growthMoM:        formData.growthMoM,
      momGrowth:        formData.growthMoM,
      activeClients:    formData.activeClients,
      churnRate:        formData.churnRate,
      runway:           formData.runway,
      burnRate:         formData.burnRate,
      fundraisingGoal:  formData.fundraisingGoal,
      maxDilution:      formData.maxDilution,
      fundingPreference: formData.fundingPreference,
      finalObjective:   formData.finalObjective,
      ambition:         formData.finalObjective,
      finalGoalValuation: formData.finalGoalValuation,
      partnerName:      formData.partnerName || null,
      partnerId:        formData.partnerId,
      partnerEmail:     formData.partnerEmail,
      partnerOnRaisup:  formData.partnerOnRaisup,
      partnerConfirmed: formData.partnerConfirmed,
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const syncToSupabase = async () => {
    const raw = localStorage.getItem('raisup_profile');
    if (!raw) {
      alert('Aucune donnée locale trouvée');
      return;
    }

    const data = JSON.parse(raw);

    if (data.supabase_id) {
      alert('Ce profil est déjà synchronisé avec Supabase — id : ' + data.supabase_id);
      return;
    }

    const score = calculateScore({
      startupName: data.startupName,
      mrr: data.mrr,
      momGrowth: data.momGrowth ?? data.growthMoM,
      activeClients: data.activeClients,
      runway: data.runway,
      burnRate: data.burnRate,
      hasCTO: data.hasCTO,
      advisors: data.hasAdvisors ? 1 : 0,
      problem: data.problem,
      solution: data.solution,
      competitiveAdvantage: data.competitiveAdvantage,
    });

    const { data: saved, error } = await supabase
      .from('profiles')
      .insert({
        startup_name: data.startupName || '',
        founder_name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        one_liner: data.oneLiner || '',
        ambition: data.ambition || data.finalObjective || '',
        business_model: data.businessModel || '',
        sector: data.sector || '',
        client_type: data.clientType || '',
        country: data.country || 'France',
        region: data.region || '',
        city: data.city || '',
        has_revenue: (data.mrr || 0) > 0,
        mrr: Number(data.mrr) || 0,
        growth_mom: Number(data.momGrowth ?? data.growthMoM) || 0,
        active_clients: Number(data.activeClients) || 0,
        runway: Number(data.runway) || 12,
        burn_rate: Number(data.burnRate) || 0,
        fundraising_goal: Number(data.fundraisingGoal) || 0,
        max_dilution: Number(data.maxDilution) || 20,
        funding_preference: data.fundingPreference || '',
        final_goal_valuation: Number(data.finalGoalValuation) || 0,
        fundraising_timeline: data.fundingTimeline || data.fundraisingTimeline || '',
        raisup_score: score.total,
        has_cto: data.hasCTO || false,
        problem: data.problem || '',
        solution: data.solution || '',
        competitive_advantage: data.competitiveAdvantage || '',
        has_advisors: data.hasAdvisors || false,
        has_previous_startup: data.hasPreviousStartup || false,
        had_exit: data.hadExit || false,
        sector_experience: data.sectorExperience || '',
        team_size: data.teamSize || 0,
        existing_funding: data.existingFunding || data.previousFunding || [],
      })
      .select()
      .single();

    if (error) {
      alert('Erreur Supabase : ' + error.message);
      return;
    }

    localStorage.setItem('raisup_profile', JSON.stringify({
      ...data,
      supabase_id: saved.id,
    }));

    alert('✓ Données synchronisées — Supabase id : ' + saved.id);
  };

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // ── Load all partners once
  const loadAllPartners = async () => {
    if (allPartners.length > 0) return; // already loaded
    setPartnerLoading(true);
    const { data } = await supabase
      .from('agency_accounts')
      .select('id, name, type, email')
      .order('name', { ascending: true })
      .limit(50);
    setPartnerLoading(false);
    if (data) setAllPartners(data);
  };

  // ── Filter list based on search term
  useEffect(() => {
    if (formData.partnerConfirmed) return;
    const term = partnerSearch.trim().toLowerCase();
    if (!term) {
      setPartnerResults(allPartners);
    } else {
      setPartnerResults(allPartners.filter(a => a.name.toLowerCase().includes(term)));
    }
  }, [partnerSearch, allPartners, formData.partnerConfirmed]);

  // ── Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const confirmPartner = (agency: AgencyResult) => {
    setPartnerPending(agency);
    setShowDropdown(false);
  };

  const validatePartner = () => {
    if (!partnerPending) return;
    setFormData(prev => ({
      ...prev,
      partnerId: partnerPending.id,
      partnerName: partnerPending.name,
      partnerEmail: partnerPending.email,
      partnerOnRaisup: true,
      partnerConfirmed: true,
    }));
    setPartnerSearch(partnerPending.name);
    setPartnerPending(null);
  };

  const validateManual = () => {
    if (!partnerSearch.trim()) return;
    setFormData(prev => ({
      ...prev,
      partnerId: null,
      partnerName: partnerSearch.trim(),
      partnerEmail: null,
      partnerOnRaisup: false,
      partnerConfirmed: true,
    }));
    setPartnerPending(null);
  };

  const clearPartner = async () => {
    setFormData(prev => ({ ...prev, partnerId: null, partnerName: '', partnerEmail: null, partnerOnRaisup: false, partnerConfirmed: false }));
    setPartnerPending(null);
    setPartnerSearch('');
    await loadAllPartners();
    setShowDropdown(true);
  };

  // ── Completion score
  const fields = [
    formData.firstName, formData.lastName, formData.startupName, formData.sector,
    formData.businessModel, formData.region, formData.oneLiner, formData.fundraisingGoal,
  ];
  const filled = fields.filter(v => v && v !== 0).length;
  const completion = Math.round((filled / fields.length) * 100);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
            <p className="text-sm text-gray-500 mt-0.5">Complétez votre profil pour améliorer votre score Raisup</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={syncToSupabase}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:opacity-80"
            >
              <RefreshCw size={14} />
              Synchroniser mes données
            </button>
            {/* Debug button (temporary) */}
            <button
              type="button"
              onClick={() => {
                const data = localStorage.getItem('raisupOnboardingData');
                console.log('localStorage raisupOnboardingData:', data);
                alert(data
                  ? `Données trouvées :\n${data.substring(0, 300)}...`
                  : 'VIDE — aucune donnée dans raisupOnboardingData\n\nAutres clés:\n' +
                    `raisup_profile: ${localStorage.getItem('raisup_profile') ? 'présent' : 'vide'}`
                );
              }}
              className="text-xs text-gray-400 underline flex-shrink-0"
            >
              Debug localStorage
            </button>
          </div>
        </div>

        {/* Completion bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Complétion du profil</span>
              <span className="font-semibold text-gray-900">{completion}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F4B8CC] to-[#e89ab0] transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-green-700 text-xs font-medium bg-green-50 px-3 py-1.5 rounded-full">
              <Check className="h-3.5 w-3.5" />Enregistré
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">

          {/* ── Informations personnelles */}
          <Section icon={<User className="h-4 w-4" />} title="Informations personnelles">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" half>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={set('firstName')}
                  className={inputCls}
                  placeholder="Votre prénom"
                />
              </Field>
              <Field label="Nom" half>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={set('lastName')}
                  className={inputCls}
                  placeholder="Votre nom"
                />
              </Field>
              <Field label="Email" half>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className={clsx(inputCls, 'pl-9 bg-gray-50 text-gray-500')}
                  />
                </div>
              </Field>
              <Field label="Téléphone" half>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={set('phone')}
                    className={clsx(inputCls, 'pl-9')}
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* ── Ma startup */}
          <Section icon={<Building2 className="h-4 w-4" />} title="Ma startup">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom de la startup" half>
                <input
                  type="text"
                  value={formData.startupName}
                  onChange={set('startupName')}
                  className={inputCls}
                  placeholder="Nom de votre startup"
                />
              </Field>
              <Field label="Secteur" half>
                <select value={formData.sector} onChange={set('sector')} className={selectCls}>
                  <option value="">Choisir un secteur</option>
                  {['Fintech', 'Healthtech', 'Edtech', 'Proptech', 'Greentech', 'SaaS B2B', 'E-commerce', 'IA & Data', 'Marketplace', 'Deeptech', 'Legaltech', 'Foodtech', 'Autre'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Description courte (one-liner)">
                  <textarea
                    value={formData.oneLiner}
                    onChange={set('oneLiner')}
                    rows={2}
                    className={clsx(inputCls, 'resize-none')}
                    placeholder="En une phrase, décrivez votre solution..."
                  />
                </Field>
              </div>
              <Field label="Modèle business" half>
                <select value={formData.businessModel} onChange={set('businessModel')} className={selectCls}>
                  <option value="">Choisir</option>
                  {['SaaS', 'Marketplace', 'E-commerce', 'Freemium', 'Hardware + services', 'Abonnement', 'Commission', 'Licences', 'Autre'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type de clients" half>
                <select value={formData.clientType} onChange={set('clientType')} className={selectCls}>
                  <option value="">Choisir</option>
                  {['B2B', 'B2C', 'B2B2C', 'B2G', 'Mixte'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Section>

          {/* ── Localisation */}
          <Section icon={<MapPin className="h-4 w-4" />} title="Localisation">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pays" half>
                <input
                  type="text"
                  value={formData.country}
                  onChange={set('country')}
                  className={inputCls}
                  placeholder="France"
                />
              </Field>
              <Field label="Région" half>
                <select value={formData.region} onChange={set('region')} className={selectCls}>
                  <option value="">Choisir une région</option>
                  {['Île-de-France', 'Auvergne-Rhône-Alpes', 'Bretagne', 'Occitanie', 'Nouvelle-Aquitaine', 'Hauts-de-France', 'Grand Est', "Provence-Alpes-Côte d'Azur", 'Normandie', 'Pays de la Loire', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Corse', 'Outre-mer'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Ville" half>
                <input
                  type="text"
                  value={formData.city}
                  onChange={set('city')}
                  className={inputCls}
                  placeholder="Paris"
                />
              </Field>
            </div>
          </Section>

          {/* ── Métriques */}
          <Section icon={<TrendingUp className="h-4 w-4" />} title="Métriques clés">
            <div className="grid grid-cols-2 gap-4">
              <Field label="MRR (€)" half>
                <input
                  type="number"
                  value={formData.mrr || ''}
                  onChange={set('mrr')}
                  className={inputCls}
                  placeholder="0"
                  min={0}
                />
              </Field>
              <Field label="Croissance MoM (%)" half>
                <input
                  type="number"
                  value={formData.growthMoM || ''}
                  onChange={set('growthMoM')}
                  className={inputCls}
                  placeholder="0"
                />
              </Field>
              <Field label="Clients actifs" half>
                <input
                  type="number"
                  value={formData.activeClients || ''}
                  onChange={set('activeClients')}
                  className={inputCls}
                  placeholder="0"
                  min={0}
                />
              </Field>
              <Field label="Churn (%)" half>
                <input
                  type="number"
                  value={formData.churnRate || ''}
                  onChange={set('churnRate')}
                  className={inputCls}
                  placeholder="0"
                  min={0}
                  max={100}
                />
              </Field>
              <Field label="Runway (mois)" half>
                <input
                  type="number"
                  value={formData.runway || ''}
                  onChange={set('runway')}
                  className={inputCls}
                  placeholder="12"
                  min={0}
                />
              </Field>
              <Field label="Burn rate (€/mois)" half>
                <input
                  type="number"
                  value={formData.burnRate || ''}
                  onChange={set('burnRate')}
                  className={inputCls}
                  placeholder="0"
                  min={0}
                />
              </Field>
            </div>
          </Section>

          {/* ── Objectifs de levée */}
          <Section icon={<Target className="h-4 w-4" />} title="Objectifs de levée">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Montant recherché (€)" half>
                <input
                  type="number"
                  value={formData.fundraisingGoal || ''}
                  onChange={set('fundraisingGoal')}
                  className={inputCls}
                  placeholder="500000"
                  min={0}
                />
              </Field>
              <Field label="Dilution max (%)" half>
                <input
                  type="number"
                  value={formData.maxDilution || ''}
                  onChange={set('maxDilution')}
                  className={inputCls}
                  placeholder="20"
                  min={0}
                  max={100}
                />
              </Field>
              <Field label="Type de financement préféré" half>
                <select value={formData.fundingPreference} onChange={set('fundingPreference')} className={selectCls}>
                  <option value="">Choisir</option>
                  {["Equity", "Dette", "Subventions", "Revenue-based", "Mixte"].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field label="Objectif final" half>
                <select value={formData.finalObjective} onChange={set('finalObjective')} className={selectCls}>
                  <option value="">Choisir</option>
                  {['Rentabilité et indépendance', 'Leader marché français', 'Expansion européenne', 'Scale-up et exit', 'Licorne', 'Je ne sais pas encore'].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Valorisation cible (€)" half>
                <input
                  type="number"
                  value={formData.finalGoalValuation || ''}
                  onChange={set('finalGoalValuation')}
                  className={inputCls}
                  placeholder="5000000"
                  min={0}
                />
              </Field>
            </div>
          </Section>

          {/* ── Structure partenaire */}
          <Section icon={<Building2 className="h-4 w-4" />} title="Structure partenaire">
            <p className="text-xs text-gray-500 -mt-2">Associez votre dossier à une agence ou accélérateur partenaire Raisup.</p>

            {/* Confirmed partner — card with "Modifier" button */}
            {formData.partnerConfirmed && formData.partnerName && !partnerPending && (
              <div className={clsx(
                'rounded-xl border p-4 flex items-center gap-3',
                formData.partnerOnRaisup ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
              )}>
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  formData.partnerOnRaisup ? 'bg-green-500 text-white' : 'bg-blue-400 text-white'
                )}>
                  {formData.partnerName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{formData.partnerName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {formData.partnerOnRaisup && (
                      <span className="text-xs bg-[#F4B8CC] text-[#8B3A52] px-1.5 py-0.5 rounded-full font-medium">
                        Sur Raisup ✓
                      </span>
                    )}
                    <span className={clsx('text-xs', formData.partnerOnRaisup ? 'text-green-600' : 'text-blue-500')}>
                      Partenaire lié
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearPartner}
                  className="text-xs text-gray-500 hover:text-gray-800 flex-shrink-0 border border-gray-200 bg-white rounded-full px-3 py-1.5 transition-colors"
                >
                  Modifier
                </button>
              </div>
            )}

            {/* Search — shown when no confirmed partner */}
            {!formData.partnerConfirmed && !partnerPending && (
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={partnerSearch}
                    onChange={e => setPartnerSearch(e.target.value)}
                    onFocus={async () => {
                      await loadAllPartners();
                      setShowDropdown(true);
                    }}
                    className={clsx(inputCls, 'pl-9 pr-4')}
                    placeholder="Rechercher une structure (ex: Fundherz, BPI...)"
                  />
                  {partnerLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-[#F4B8CC] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {showDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                    {partnerResults.length === 0 && !partnerLoading && (
                      <div className="px-4 py-3 text-xs text-gray-400 text-center">
                        {partnerSearch.trim() ? `Aucun résultat pour "${partnerSearch}"` : 'Aucune structure trouvée dans la base'}
                      </div>
                    )}
                    {partnerResults.map(agency => (
                      <button
                        key={agency.id}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); confirmPartner(agency); }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#F4B8CC]/30 flex items-center justify-center text-xs font-bold text-[#C4728A] flex-shrink-0">
                          {agency.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{agency.name}</p>
                          <p className="text-xs text-gray-500">{agency.type}</p>
                        </div>
                        <span className="ml-auto text-xs bg-[#F4B8CC]/20 text-[#C4728A] px-2 py-0.5 rounded-full font-medium flex-shrink-0">Sur Raisup</span>
                      </button>
                    ))}
                    {partnerSearch.trim().length >= 2 && (
                      <button
                        type="button"
                        onMouseDown={e => { e.preventDefault(); validateManual(); setShowDropdown(false); }}
                        className="w-full px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50 text-left border-t border-gray-100"
                      >
                        + Ajouter "{partnerSearch}" manuellement
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pending confirmation */}
            {partnerPending && (
              <div className="bg-[#F4B8CC]/10 border border-[#F4B8CC]/40 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F4B8CC]/30 flex items-center justify-center text-sm font-bold text-[#C4728A] flex-shrink-0">
                  {partnerPending.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{partnerPending.name}</p>
                  <p className="text-xs text-gray-500">{partnerPending.type}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={validatePartner}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0A0A] text-white text-xs rounded-full font-medium"
                  >
                    <Check className="h-3 w-3" />Confirmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerPending(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Save */}
          <div className="flex justify-end pb-8">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              Enregistrer le profil
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
