import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createAgencyAccount } from '../services/agencyService';
import { supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AgencyForm {
  // Étape 1
  name: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website: string;
  // Étape 2
  volumeParAn: string;
  sectors: string[];
  stages: string[];
  countries: string[];
  specialty: string;
  // Étape 3
  plan: string;
}

const STRUCTURE_TYPES = [
  'Agence de levée de fonds',
  'Incubateur',
  'Accélérateur',
  'Cabinet de conseil',
  'Réseau entrepreneurial',
];

const SECTORS = ['SaaS B2B', 'HealthTech', 'GreenTech', 'FinTech', 'DeepTech', 'IA', 'Généraliste'];
const STAGES = ['Pre-seed', 'Seed', 'Série A', 'Série B+'];
const COUNTRIES = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Autre EU'];
const VOLUMES = ['1 à 5', '5 à 20', '20 à 50', '50+'];
const SPECIALTIES = [
  'Levée de fonds dilutive',
  'Financement non-dilutif',
  'Les deux',
  'Stratégie financière',
  'Autre',
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter Agency',
    price: '99€/mois',
    limit: "Jusqu'à 5 dossiers actifs",
    features: ['Dashboard partenaire', 'Accès aux analyses', 'Export PDF'],
    recommended: false,
  },
  {
    id: 'growth',
    name: 'Growth Agency',
    price: '299€/mois',
    limit: "Jusqu'à 20 dossiers actifs",
    features: ['Tout Starter inclus', 'Génération documents illimitée', 'Marque blanche', 'Rapports clients', 'API access'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sur devis',
    limit: 'Dossiers illimités',
    features: ['Tout Growth inclus', 'Onboarding dédié', 'Account manager', 'SLA garanti', 'Intégration CRM'],
    recommended: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-[14px] outline-none transition-colors focus:border-gray-900';
const inputStyle = { borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#0A0A0A' };

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
      style={{
        border: active ? '2px solid #0A0A0A' : '1.5px solid #E5E7EB',
        backgroundColor: active ? '#0A0A0A' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#374151',
      }}
    >
      {active && <Check style={{ width: 12, height: 12 }} />}
      {label}
    </button>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className="flex items-center justify-center rounded-full text-[12px] font-bold transition-all"
            style={{
              width: 28, height: 28,
              backgroundColor: i < current ? '#0A0A0A' : i === current ? '#0A0A0A' : '#E5E7EB',
              color: i <= current ? '#FFFFFF' : '#9CA3AF',
            }}
          >
            {i < current ? <Check style={{ width: 12, height: 12 }} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: i < current ? '#0A0A0A' : '#E5E7EB' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const AgencyOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AgencyForm>({
    name: '', type: '', firstName: '', lastName: '', email: '', phone: '', website: '',
    volumeParAn: '', sectors: [], stages: [], countries: [], specialty: '',
    plan: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const set = (key: keyof AgencyForm, value: string) => setForm(f => ({ ...f, [key]: value }));
  const toggle = (key: 'sectors' | 'stages' | 'countries', val: string) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setAuthError(null);
    if (password !== confirmPassword) {
      setAuthError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setAuthError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setAuthLoading(true);

    // 1. Créer le compte Supabase Auth
    const { error: signUpError } = await signUp(form.email, password);
    if (signUpError && !signUpError.message.toLowerCase().includes('already registered')) {
      setAuthError(signUpError.message);
      setAuthLoading(false);
      return;
    }

    // 2. Sauvegarder le compte agence dans Supabase
    const planName = PLANS.find(p => p.id === form.plan)?.name ?? form.plan;
    let profile: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      email: form.email,
      phone: form.phone,
      plan: planName,
    };

    try {
      const { data, error } = await supabase
        .from('agency_accounts')
        .insert({
          name: form.name || '',
          type: form.type || '',
          responsable_first_name: form.firstName || '',
          responsable_last_name: form.lastName || '',
          email: form.email || '',
          phone: form.phone || '',
          plan: planName || 'Growth Agency',
        })
        .select()
        .single();

      if (data) {
        profile = { ...profile, id: data.id, supabase_id: data.id };
        console.log('Agence sauvegardée:', data.id);
      }
      if (error) console.error('Erreur agence Supabase:', error);
    } catch (e) {
      console.error('Erreur saveAgency:', e);
    }

    setAuthLoading(false);
    localStorage.setItem('raisup_agency_profile', JSON.stringify(profile));
    localStorage.setItem('raisup_user_type', 'agency');
    navigate('/onboarding/agency/success');
  };

  const stepTitles = ['Votre structure', 'Votre activité', 'Votre formule', 'Votre compte'];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F8F8' }}>
      {/* Header */}
      <header className="px-8 py-6 border-b" style={{ borderColor: '#F3F4F6', backgroundColor: '#FFFFFF' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img src="/raisup_logo.png" alt="Raisup" className="h-10 w-auto" />
          <span className="text-[13px]" style={{ color: '#9CA3AF' }}>
            Espace partenaire
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="mb-8">
            <p className="text-[12px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#F4B8CC' }}>
              Étape {step + 1} sur {stepTitles.length}
            </p>
            <h1 className="text-[26px] font-bold" style={{ color: '#0A0A0A' }}>
              {stepTitles[step]}
            </h1>
          </div>

          <StepIndicator current={step} total={stepTitles.length} />

          {/* Card */}
          <div
            className="mb-6"
            style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 36, border: '1.5px solid #E5E7EB' }}
          >

            {/* ── ÉTAPE 1 ─────────────────────────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Nom de la structure <span style={{ color: '#F4B8CC' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ex : Fundherz, Station F, Wilco"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-2" style={{ color: '#374151' }}>
                    Type de structure <span style={{ color: '#F4B8CC' }}>*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STRUCTURE_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('type', t)}
                        className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                        style={{
                          border: form.type === t ? '2px solid #0A0A0A' : '1.5px solid #E5E7EB',
                          backgroundColor: form.type === t ? '#0A0A0A' : '#FFFFFF',
                          color: form.type === t ? '#FFFFFF' : '#374151',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Prénom <span style={{ color: '#F4B8CC' }}>*</span>
                    </label>
                    <input type="text" placeholder="Manon" value={form.firstName}
                      onChange={e => set('firstName', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Nom <span style={{ color: '#F4B8CC' }}>*</span>
                    </label>
                    <input type="text" placeholder="Derydt" value={form.lastName}
                      onChange={e => set('lastName', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Email professionnel <span style={{ color: '#F4B8CC' }}>*</span>
                  </label>
                  <input type="email" placeholder="manon@fundherz.co" value={form.email}
                    onChange={e => set('email', e.target.value)} className={inputCls} style={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Téléphone
                    </label>
                    <input type="tel" placeholder="+33 6 00 00 00 00" value={form.phone}
                      onChange={e => set('phone', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                      Site web
                    </label>
                    <input type="url" placeholder="https://fundherz.co" value={form.website}
                      onChange={e => set('website', e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 ─────────────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-semibold mb-2" style={{ color: '#374151' }}>
                    Combien de startups accompagnez-vous par an ?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VOLUMES.map(v => (
                      <button key={v} type="button" onClick={() => set('volumeParAn', v)}
                        className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all"
                        style={{
                          border: form.volumeParAn === v ? '2px solid #0A0A0A' : '1.5px solid #E5E7EB',
                          backgroundColor: form.volumeParAn === v ? '#0A0A0A' : '#FFFFFF',
                          color: form.volumeParAn === v ? '#FFFFFF' : '#374151',
                        }}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-2" style={{ color: '#374151' }}>
                    Secteurs d'intervention (multi-sélection)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map(s => (
                      <Toggle key={s} label={s} active={form.sectors.includes(s)} onClick={() => toggle('sectors', s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-2" style={{ color: '#374151' }}>
                    Stades accompagnés
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map(s => (
                      <Toggle key={s} label={s} active={form.stages.includes(s)} onClick={() => toggle('stages', s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-2" style={{ color: '#374151' }}>
                    Pays d'opération
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map(c => (
                      <Toggle key={c} label={c} active={form.countries.includes(c)} onClick={() => toggle('countries', c)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-2" style={{ color: '#374151' }}>
                    Spécialité principale
                  </label>
                  <select
                    value={form.specialty}
                    onChange={e => set('specialty', e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">Choisir…</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 4 ─────────────────────────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl mb-2" style={{ backgroundColor: '#F8F8F8', border: '1.5px solid #E5E7EB' }}>
                  <p className="text-[13px]" style={{ color: '#6B7280' }}>
                    Compte pour{' '}
                    <span className="font-semibold" style={{ color: '#0A0A0A' }}>{form.email}</span>
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#9CA3AF' }}>
                    Ce sera votre identifiant pour vous connecter
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl text-[13px]" style={{ backgroundColor: '#FFF0F0', color: '#B91C1C', border: '1px solid #FECACA' }}>
                    {authError}
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Mot de passe <span style={{ color: '#F4B8CC' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="8 caractères minimum"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#9CA3AF' }}
                    >
                      {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#374151' }}>
                    Confirmer le mot de passe <span style={{ color: '#F4B8CC' }}>*</span>
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Répétez votre mot de passe"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={inputCls}
                    style={{
                      ...inputStyle,
                      borderColor: confirmPassword && confirmPassword !== password ? '#FCA5A5' : '#E5E7EB',
                    }}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[12px] mt-1" style={{ color: '#B91C1C' }}>Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <p className="text-[12px]" style={{ color: '#9CA3AF' }}>
                  Vous pourrez vous connecter depuis la page de connexion avec cet email et ce mot de passe.
                </p>
              </div>
            )}

            {/* ── ÉTAPE 3 ─────────────────────────────────────────────────────── */}
            {step === 2 && (
              <div>
                <p className="text-[15px] font-semibold mb-6" style={{ color: '#0A0A0A' }}>
                  Choisissez votre formule
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PLANS.map(plan => {
                    const isSelected = form.plan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => set('plan', plan.id)}
                        className="text-left flex flex-col transition-all"
                        style={{
                          border: isSelected ? '2px solid #0A0A0A' : plan.recommended ? '2px solid #F4B8CC' : '1.5px solid #E5E7EB',
                          borderRadius: 16,
                          padding: 20,
                          backgroundColor: isSelected ? '#F8F8F8' : plan.recommended ? '#FFF5F8' : '#FFFFFF',
                          position: 'relative',
                        }}
                      >
                        {plan.recommended && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full"
                            style={{ backgroundColor: '#FFD6E5', color: '#C4728A' }}>
                            RECOMMANDÉ
                          </span>
                        )}
                        <p className="font-bold text-[14px] mb-0.5" style={{ color: '#0A0A0A' }}>{plan.name}</p>
                        <p className="font-black text-[22px] mb-1" style={{ color: '#0A0A0A' }}>{plan.price}</p>
                        <p className="text-[12px] mb-4" style={{ color: '#6B7280' }}>{plan.limit}</p>
                        <ul className="space-y-1.5 flex-1">
                          {plan.features.map(f => (
                            <li key={f} className="flex items-start gap-2">
                              <Check style={{ width: 12, height: 12, color: '#2D6A00', flexShrink: 0, marginTop: 2 }} />
                              <span className="text-[12px]" style={{ color: '#374151' }}>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <div
                          className="mt-5 w-full text-center font-semibold text-[13px] py-2 rounded-full transition-opacity"
                          style={{
                            backgroundColor: plan.recommended ? '#0A0A0A' : 'transparent',
                            color: plan.recommended ? '#FFFFFF' : '#0A0A0A',
                            border: plan.recommended ? 'none' : '1.5px solid #0A0A0A',
                          }}
                        >
                          {plan.id === 'enterprise' ? 'Nous contacter' : 'Choisir'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button onClick={handleBack} className="text-[14px] font-medium transition-colors hover:text-gray-900"
                style={{ color: '#6B7280' }}>
                ← Retour
              </button>
            ) : <div />}

            {step < stepTitles.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={
                  (step === 0 && (!form.name || !form.type || !form.firstName || !form.email)) ||
                  (step === 2 && !form.plan)
                }
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-[14px] transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}
              >
                Continuer <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={authLoading || !password || !confirmPassword}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-[14px] transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Créer mon espace → <ChevronRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgencyOnboarding;
