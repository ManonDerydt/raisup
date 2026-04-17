import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase envoie le token dans le hash de l'URL (#access_token=...&type=recovery)
  // onAuthStateChange le détecte automatiquement et établit la session
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase non configuré.');
      return;
    }

    // Vérifie si on a déjà une session (token dans le hash traité par Supabase)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/welcome'), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F8F8' }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-5 w-5" style={{ color: '#F4B8CC' }} />
          <span className="font-black text-lg tracking-wide text-gray-900">RAISUP</span>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#D8FFBD' }}>
              <CheckCircle className="h-8 w-8" style={{ color: '#2D6A00' }} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Mot de passe mis à jour !</h2>
            <p className="text-sm text-gray-500">Vous allez être redirigé vers votre tableau de bord…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
            <p className="text-sm text-gray-500 mb-8">
              {sessionReady
                ? 'Choisissez un nouveau mot de passe pour votre compte.'
                : 'Vérification du lien en cours…'}
            </p>

            {!sessionReady && !error && (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <div className="rounded-xl p-4 bg-red-50 border border-red-100 text-sm text-red-700 mb-4">
                {error}
                <br />
                <button onClick={() => navigate('/login')} className="mt-2 font-semibold underline">
                  Retourner à la connexion
                </button>
              </div>
            )}

            {sessionReady && !error && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoFocus
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 placeholder-gray-300 transition-colors pr-10"
                    />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none placeholder-gray-300 transition-colors ${
                      confirm && confirm !== password
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-gray-900'
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || (!!confirm && confirm !== password)}
                  className="w-full py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: '#0A0A0A' }}
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ArrowRight className="h-4 w-4" /> Définir mon nouveau mot de passe</>}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button onClick={() => navigate('/login')}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Retour à la connexion
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
