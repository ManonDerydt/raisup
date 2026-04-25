import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User, Mail, Lock, Bell, CreditCard, LogOut, Check, X, Save, Edit,
  Shield, Smartphone, Moon, Sun, Camera, Building2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { notifyProfileUpdated } from '../hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';

// ─── Avatar ────────────────────────────────────────────────────────────────────

const UserAvatar: React.FC<{ avatarUrl: string | null; initials: string; size?: number }> = ({
  avatarUrl, initials, size = 96,
}) => {
  const [imgError, setImgError] = useState(false);
  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
      style={{ width: size, height: size, backgroundColor: '#FFD6E5', color: '#C4728A', fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
};

// ─── Toggle switch ─────────────────────────────────────────────────────────────

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={clsx(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
      value ? 'bg-[#F4B8CC]' : 'bg-gray-300'
    )}
  >
    <span className={clsx(
      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
      value ? 'translate-x-6' : 'translate-x-1'
    )} />
  </button>
);

// ─── Main component ────────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, updatePassword } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Password change state
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // ── Build initial profile from Supabase auth + localStorage
  const isAgency = localStorage.getItem('raisup_user_type') === 'agency';

  const initialProfile = useMemo(() => {
    let stored: Record<string, string> = {};
    let agency: Record<string, string> = {};
    try {
      const a = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
      const b = JSON.parse(localStorage.getItem('raisupOnboardingData') || '{}');
      const c = JSON.parse(localStorage.getItem('raisup_agency_profile') || '{}');
      stored = { ...b, ...a };
      agency = c;
    } catch { /* ignore */ }

    const meta = (user?.user_metadata ?? {}) as Record<string, string>;

    // Agency profile: use responsable field split into first/last name
    if (isAgency && agency.responsable) {
      const parts = (agency.responsable as string).split(' ');
      const firstName = parts[0] ?? '';
      const lastName  = parts.slice(1).join(' ');
      const email     = agency.email || user?.email || '';
      const company   = agency.name || '';
      const phone     = stored.phone || '';
      const position  = agency.type || 'Partenaire';
      const avatarUrl: string | null = meta.avatar_url || meta.picture || null;
      const initials  = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || (email[0] ?? 'U').toUpperCase();
      return { firstName, lastName, email, company, phone, position, avatarUrl, initials, plan: agency.plan || 'Growth Agency', partnerName: '', partnerOnRaisup: false, partnerConfirmed: false };
    }

    // Standard (founder) profile
    // RaisupOnboardingForm saves `founderName` (single field) — split it
    const founderNameParts = (stored.founderName ?? '').trim().split(' ');
    const founderFirst = founderNameParts[0] ?? '';
    const founderLast  = founderNameParts.slice(1).join(' ');

    const firstName = stored.firstName || founderFirst || meta.given_name || (meta.full_name ?? meta.name ?? '').split(' ')[0] || '';
    const lastName  = stored.lastName  || founderLast  || meta.family_name || (meta.full_name ?? meta.name ?? '').split(' ').slice(1).join(' ') || '';
    const email     = user?.email ?? stored.email ?? '';
    // Both onboardings use `startupName` — RaisupOnboarding also has it directly
    const company   = stored.startupName || stored.projectName || stored.startup_name || '';
    const phone     = stored.phone || '';
    const position  = stored.position || stored.role || 'Fondateur(rice)';
    const avatarUrl: string | null = meta.avatar_url || meta.picture || null;
    const initials  = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || (email[0] ?? 'U').toUpperCase();

    const partnerName      = stored.partnerName      || '';
    const partnerOnRaisup  = stored.partnerOnRaisup  === 'true' || stored.partnerOnRaisup === true;
    const partnerConfirmed = stored.partnerConfirmed === 'true' || stored.partnerConfirmed === true;

    return { firstName, lastName, email, company, phone, position, avatarUrl, initials, plan: 'Plan Pro', partnerName, partnerOnRaisup, partnerConfirmed };
  }, [user, isAgency]);

  const [profile, setProfile] = useState(initialProfile);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfile(p => ({ ...p, avatarUrl: dataUrl }));
      // Persist in localStorage
      try {
        const key = isAgency ? 'raisup_agency_profile' : 'raisup_profile';
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({ ...existing, avatarUrl: dataUrl }));
        notifyProfileUpdated();
      } catch { /* ignore */ }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // Sync when user loads (async)
  useEffect(() => { setProfile(initialProfile); }, [initialProfile]);

  // Dark mode sync
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState({
    email: { updates: true, investorMessages: true, documentGeneration: true, weeklyDigest: false },
    sms:   { investorMessages: true, importantUpdates: false },
    app:   { allNotifications: true, soundAlerts: false },
  });

  const toggleNotification = (cat: 'email' | 'sms' | 'app', key: string, val: boolean) => {
    setNotifications(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: val } }));
  };

  // Save profile → localStorage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAgency) {
        const existing = JSON.parse(localStorage.getItem('raisup_agency_profile') || '{}');
        localStorage.setItem('raisup_agency_profile', JSON.stringify({
          ...existing,
          responsable: `${profile.firstName} ${profile.lastName}`.trim(),
          email: existing.email, // email not editable
          name: profile.company,
          type: profile.position,
        }));
      } else {
        const existing = JSON.parse(localStorage.getItem('raisup_profile') || '{}');
        localStorage.setItem('raisup_profile', JSON.stringify({
          ...existing,
          firstName: profile.firstName,
          lastName:  profile.lastName,
          phone:     profile.phone,
          startupName: profile.company,
          position:  profile.position,
        }));
      }
      setEditMode(false);
      setSaveSuccess(true);
      notifyProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Erreur lors de la sauvegarde.');
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdNew !== pwdConfirm) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    if (pwdNew.length < 8) { setPwdError('Au moins 8 caractères requis.'); return; }
    setPwdLoading(true);
    const { error } = await updatePassword(pwdNew);
    setPwdLoading(false);
    if (error) { setPwdError(error.message); } else { setPwdSuccess(true); setPwdNew(''); setPwdConfirm(''); }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleToggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const dm = darkMode;
  const inputCls = (disabled = false) => clsx(
    'w-full px-3 py-2 rounded-lg border text-sm transition-colors',
    disabled
      ? dm ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
      : dm ? 'bg-gray-700 border-gray-600 text-white focus:border-[#F4B8CC] outline-none' : 'bg-white border-gray-300 text-gray-900 focus:border-[#F4B8CC] outline-none'
  );

  const tabCls = (val: string) => clsx(
    'flex items-center px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
    activeTab === val
      ? dm ? 'border-[#F4B8CC] text-[#F4B8CC]' : 'border-[#0A0A0A] text-[#0A0A0A]'
      : dm ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700'
  );

  return (
    <div className={clsx('py-8 px-4 sm:px-6 lg:px-8 min-h-screen', dm ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900')}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={clsx('text-2xl font-bold', dm ? 'text-white' : 'text-gray-900')}>Paramètres</h1>
            <p className={clsx('mt-1 text-sm', dm ? 'text-gray-400' : 'text-gray-500')}>Gérez votre compte et vos préférences</p>
          </div>
          <button
            onClick={handleToggleDarkMode}
            className={clsx(
              'mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
              dm ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {dm ? <><Sun className="h-4 w-4 mr-2" />Mode clair</> : <><Moon className="h-4 w-4 mr-2" />Mode sombre</>}
          </button>
        </div>

        {/* Card */}
        <div className={clsx('rounded-xl shadow-sm overflow-hidden', dm ? 'bg-gray-800' : 'bg-white')}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            {/* Tab bar */}
            <div className={clsx('flex border-b overflow-x-auto', dm ? 'border-gray-700' : 'border-gray-200')}>
              <TabsList className="flex p-0 bg-transparent">
                <TabsTrigger value="profile"       className={tabCls('profile')}><User className="h-4 w-4 mr-2" />Profil</TabsTrigger>
                <TabsTrigger value="security"      className={tabCls('security')}><Shield className="h-4 w-4 mr-2" />Sécurité</TabsTrigger>
                <TabsTrigger value="notifications" className={tabCls('notifications')}><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
                <TabsTrigger value="subscription"  className={tabCls('subscription')}><CreditCard className="h-4 w-4 mr-2" />Abonnement</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">

              {/* ── Profil ─────────────────────────────────────────────────── */}
              <TabsContent value="profile" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={clsx('text-lg font-semibold', dm ? 'text-white' : 'text-gray-900')}>Informations personnelles</h2>
                  <button
                    onClick={() => { setEditMode(!editMode); setSaveError(''); }}
                    className={clsx(
                      'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      editMode
                        ? dm ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-[#0A0A0A] text-white hover:bg-gray-800'
                    )}
                  >
                    {editMode ? <><X className="h-4 w-4 mr-1" />Annuler</> : <><Edit className="h-4 w-4 mr-1" />Modifier</>}
                  </button>
                </div>

                {saveSuccess && (
                  <div className={clsx('p-3 rounded-lg flex items-center gap-2 text-sm', dm ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800')}>
                    <Check className="h-4 w-4 flex-shrink-0" />Profil mis à jour avec succès.
                  </div>
                )}
                {saveError && (
                  <div className={clsx('p-3 rounded-lg flex items-center gap-2 text-sm', dm ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')}>
                    <X className="h-4 w-4 flex-shrink-0" />{saveError}
                  </div>
                )}

                <form onSubmit={handleSave}>
                  <div className="flex flex-col md:flex-row gap-8">

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3 md:w-48 flex-shrink-0">
                      <div
                        className="relative group cursor-pointer"
                        onClick={() => avatarInputRef.current?.click()}
                        title="Changer la photo de profil"
                      >
                        <UserAvatar avatarUrl={profile.avatarUrl} initials={profile.initials} size={96} />
                        {/* Overlay visible au hover toujours, ou en permanence en editMode */}
                        <div className={clsx(
                          'absolute inset-0 rounded-full flex items-center justify-center transition-opacity',
                          editMode
                            ? 'opacity-100 bg-black/40'
                            : 'opacity-0 group-hover:opacity-100 bg-black/40'
                        )}>
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        {/* Badge icône coin bas-droit */}
                        <div className={clsx(
                          'absolute bottom-0 right-0 p-1.5 rounded-full border-2 transition-colors',
                          dm
                            ? 'bg-gray-700 border-gray-800 text-gray-300'
                            : 'bg-white border-gray-100 text-gray-600'
                        )}>
                          <Camera className="h-3 w-3" />
                        </div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                      <div className="text-center">
                        <p className={clsx('font-semibold text-sm', dm ? 'text-white' : 'text-gray-900')}>
                          {profile.firstName} {profile.lastName}
                        </p>
                        {profile.company && (
                          <p className={clsx('text-xs mt-0.5', dm ? 'text-gray-400' : 'text-gray-500')}>{profile.company}</p>
                        )}
                        <p className={clsx('text-xs mt-0.5', dm ? 'text-gray-500' : 'text-gray-400')}>{profile.position}</p>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Prénom</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                          disabled={!editMode}
                          className={inputCls(!editMode)}
                        />
                      </div>
                      <div>
                        <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Nom</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                          disabled={!editMode}
                          className={inputCls(!editMode)}
                        />
                      </div>
                      <div>
                        <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Email</label>
                        <div className="relative">
                          <Mail className={clsx('absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4', dm ? 'text-gray-500' : 'text-gray-400')} />
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className={clsx(inputCls(true), 'pl-9')}
                          />
                        </div>
                        <p className={clsx('text-xs mt-1', dm ? 'text-gray-500' : 'text-gray-400')}>L'email ne peut pas être modifié ici.</p>
                      </div>
                      <div>
                        <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Téléphone</label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          disabled={!editMode}
                          placeholder="+33 6 00 00 00 00"
                          className={inputCls(!editMode)}
                        />
                      </div>
                      <div>
                        <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>{isAgency ? 'Nom de l\'agence' : 'Entreprise / Projet'}</label>
                        <input
                          type="text"
                          value={profile.company}
                          onChange={e => setProfile(p => ({ ...p, company: e.target.value }))}
                          disabled={!editMode}
                          className={inputCls(!editMode)}
                        />
                      </div>
                      <div>
                        <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Poste</label>
                        <input
                          type="text"
                          value={profile.position}
                          onChange={e => setProfile(p => ({ ...p, position: e.target.value }))}
                          disabled={!editMode}
                          className={inputCls(!editMode)}
                        />
                      </div>
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        className="inline-flex items-center px-5 py-2 rounded-full bg-[#0A0A0A] text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />Enregistrer
                      </button>
                    </div>
                  )}
                </form>

                {/* ── Partner badge (founders only) ─────────────────────── */}
                {!isAgency && profile.partnerName && (
                  <div className={clsx('mt-6 pt-6 border-t', dm ? 'border-gray-700' : 'border-gray-200')}>
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className={clsx('h-4 w-4', dm ? 'text-gray-400' : 'text-gray-500')} />
                      <h3 className={clsx('text-sm font-medium', dm ? 'text-gray-300' : 'text-gray-700')}>Structure partenaire</h3>
                    </div>
                    <div className={clsx(
                      'inline-flex items-center gap-3 px-4 py-3 rounded-xl border',
                      profile.partnerConfirmed
                        ? dm ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'
                        : dm ? 'border-amber-700 bg-amber-900/20' : 'border-amber-200 bg-amber-50'
                    )}>
                      {/* Initials gomette */}
                      <div className={clsx(
                        'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        profile.partnerConfirmed
                          ? 'bg-green-500 text-white'
                          : 'bg-amber-400 text-white'
                      )}>
                        {profile.partnerName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className={clsx('text-sm font-semibold leading-tight', dm ? 'text-white' : 'text-gray-900')}>
                          {profile.partnerName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {profile.partnerOnRaisup ? (
                            <span className={clsx(
                              'text-xs font-medium px-1.5 py-0.5 rounded-full',
                              'bg-[#F4B8CC] text-[#8B3A52]'
                            )}>
                              Sur Raisup ✓
                            </span>
                          ) : null}
                          <span className={clsx(
                            'text-xs',
                            profile.partnerConfirmed
                              ? dm ? 'text-green-400' : 'text-green-600'
                              : dm ? 'text-amber-400' : 'text-amber-600'
                          )}>
                            {profile.partnerConfirmed ? 'Partenariat confirmé' : 'En attente de confirmation'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── Sécurité ───────────────────────────────────────────────── */}
              <TabsContent value="security" className="space-y-6">
                <h2 className={clsx('text-lg font-semibold', dm ? 'text-white' : 'text-gray-900')}>Sécurité du compte</h2>

                {/* Change password */}
                <div className={clsx('p-5 rounded-xl border', dm ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50')}>
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className={clsx('h-5 w-5', dm ? 'text-gray-400' : 'text-gray-500')} />
                    <h3 className={clsx('font-medium', dm ? 'text-white' : 'text-gray-900')}>Changer le mot de passe</h3>
                  </div>

                  {pwdSuccess && (
                    <div className={clsx('mb-4 p-3 rounded-lg flex items-center gap-2 text-sm', dm ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800')}>
                      <Check className="h-4 w-4" />Mot de passe mis à jour.
                    </div>
                  )}
                  {pwdError && (
                    <div className={clsx('mb-4 p-3 rounded-lg flex items-center gap-2 text-sm', dm ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')}>
                      <X className="h-4 w-4" />{pwdError}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={pwdNew}
                        onChange={e => setPwdNew(e.target.value)}
                        placeholder="8 caractères minimum"
                        className={inputCls()}
                      />
                    </div>
                    <div>
                      <label className={clsx('block text-xs font-medium mb-1', dm ? 'text-gray-400' : 'text-gray-600')}>Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={pwdConfirm}
                        onChange={e => setPwdConfirm(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className={inputCls()}
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={pwdLoading || !pwdNew}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-[#0A0A0A] text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {pwdLoading ? 'Enregistrement…' : 'Mettre à jour'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2FA */}
                <div className={clsx('p-5 rounded-xl border', dm ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50')}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={clsx('font-medium', dm ? 'text-white' : 'text-gray-900')}>Authentification à deux facteurs</h3>
                      <p className={clsx('text-sm mt-1', dm ? 'text-gray-400' : 'text-gray-500')}>Ajoute une couche de sécurité supplémentaire</p>
                    </div>
                    <Toggle value={false} onChange={() => {}} />
                  </div>
                </div>

                {/* Danger zone */}
                <div className={clsx('p-5 rounded-xl border border-red-200', dm ? 'bg-red-900/10' : 'bg-red-50')}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={clsx('font-medium', dm ? 'text-red-300' : 'text-red-700')}>Supprimer mon compte</h3>
                      <p className={clsx('text-sm mt-1', dm ? 'text-red-400/70' : 'text-red-500')}>Suppression définitive de toutes vos données</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* ── Notifications ──────────────────────────────────────────── */}
              <TabsContent value="notifications" className="space-y-6">
                <h2 className={clsx('text-lg font-semibold', dm ? 'text-white' : 'text-gray-900')}>Préférences de notification</h2>

                {([
                  {
                    cat: 'email' as const, Icon: Mail, label: 'Par email',
                    items: [
                      { id: 'updates',            label: 'Mises à jour de la plateforme' },
                      { id: 'investorMessages',    label: 'Messages des investisseurs' },
                      { id: 'documentGeneration', label: 'Génération de documents' },
                      { id: 'weeklyDigest',        label: 'Résumé hebdomadaire' },
                    ],
                  },
                  {
                    cat: 'sms' as const, Icon: Smartphone, label: 'Par SMS',
                    items: [
                      { id: 'investorMessages',  label: 'Messages des investisseurs' },
                      { id: 'importantUpdates',  label: 'Mises à jour importantes' },
                    ],
                  },
                  {
                    cat: 'app' as const, Icon: Bell, label: 'Dans l\'application',
                    items: [
                      { id: 'allNotifications', label: 'Toutes les notifications' },
                      { id: 'soundAlerts',      label: 'Alertes sonores' },
                    ],
                  },
                ]).map(({ cat, Icon, label, items }) => (
                  <div key={cat} className={clsx('p-5 rounded-xl border', dm ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50')}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className={clsx('h-5 w-5', dm ? 'text-gray-400' : 'text-gray-500')} />
                      <h3 className={clsx('font-medium', dm ? 'text-white' : 'text-gray-900')}>{label}</h3>
                    </div>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className={clsx('text-sm', dm ? 'text-gray-300' : 'text-gray-700')}>{item.label}</span>
                          <Toggle
                            value={(notifications[cat] as Record<string, boolean>)[item.id]}
                            onChange={v => toggleNotification(cat, item.id, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* ── Abonnement ─────────────────────────────────────────────── */}
              <TabsContent value="subscription" className="space-y-6">
                <h2 className={clsx('text-lg font-semibold', dm ? 'text-white' : 'text-gray-900')}>Votre abonnement</h2>

                <div className={clsx('p-5 rounded-xl border-2', dm ? 'border-[#F4B8CC]/30 bg-gray-700/40' : 'border-[#F4B8CC]/40 bg-gray-50')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={clsx('text-xl font-semibold', dm ? 'text-white' : 'text-gray-900')}>{profile.plan ?? 'Plan Pro'}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#F4B8CC]/30 text-[#C4728A]">Actif</span>
                      </div>
                      <p className={clsx('mt-1 text-sm', dm ? 'text-gray-300' : 'text-gray-700')}>99 €/mois · Facturation mensuelle</p>
                      <p className={clsx('text-xs mt-1', dm ? 'text-gray-400' : 'text-gray-500')}>Prochaine facturation : 15 mai 2026</p>
                    </div>
                    <button className={clsx(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      dm ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    )}>
                      Changer de plan
                    </button>
                  </div>

                  <div className={clsx('mt-4 pt-4 border-t', dm ? 'border-gray-600' : 'border-gray-200')}>
                    <p className={clsx('text-xs font-semibold uppercase tracking-wider mb-3', dm ? 'text-gray-400' : 'text-gray-500')}>Fonctionnalités incluses</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'Génération illimitée de documents',
                        'Accès à tous les modèles de financement',
                        'Assistance IA personnalisée',
                        'Suivi de levée de fonds',
                        'Mise en relation avec des investisseurs',
                        'Ma Valorisation — tous les modules',
                      ].map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className={clsx('text-sm', dm ? 'text-gray-300' : 'text-gray-700')}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Payment history */}
                <div>
                  <h3 className={clsx('text-sm font-semibold mb-3', dm ? 'text-gray-300' : 'text-gray-700')}>Historique de paiement</h3>
                  <div className={clsx('rounded-lg border overflow-hidden', dm ? 'border-gray-700' : 'border-gray-200')}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className={dm ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          {['Date', 'Montant', 'Statut', 'Facture'].map(h => (
                            <th key={h} className={clsx('px-4 py-3 text-left text-xs font-medium uppercase tracking-wider', dm ? 'text-gray-300' : 'text-gray-600')}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className={clsx('divide-y', dm ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white')}>
                        {[
                          { date: '15 avr. 2026', amount: '99,00 €' },
                          { date: '15 mar. 2026', amount: '99,00 €' },
                          { date: '15 fév. 2026', amount: '99,00 €' },
                        ].map((p, i) => (
                          <tr key={i}>
                            <td className={clsx('px-4 py-3 text-sm', dm ? 'text-gray-300' : 'text-gray-700')}>{p.date}</td>
                            <td className={clsx('px-4 py-3 text-sm', dm ? 'text-gray-300' : 'text-gray-700')}>{p.amount}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', dm ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')}>Payé</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button className={clsx('text-xs hover:underline', dm ? 'text-[#F4B8CC]' : 'text-gray-500')}>Télécharger</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>

        {/* Logout */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className={clsx(
              'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
              dm ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            )}
          >
            <LogOut className="h-4 w-4 mr-2" />Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
