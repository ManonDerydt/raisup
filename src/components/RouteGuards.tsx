import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isB2BUser(): boolean {
  return localStorage.getItem('raisup_user_type') === 'agency';
}

// ─── RequireAuth ─────────────────────────────────────────────────────────────
// Bloque l'accès si l'utilisateur n'est pas connecté.

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">Accès non autorisé</h1>
        <p className="text-sm text-gray-500 mb-8">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  if (!user) return <ErrorPage />;

  return <>{children}</>;
};

// ─── RequirePlan ─────────────────────────────────────────────────────────────
// Bloque l'accès si le plan est expiré ou free.

const ExpiredPlanPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">Abonnement expiré</h1>
        <p className="text-sm text-gray-500 mb-8">
          Votre accès au dashboard a expiré. Renouvelez votre abonnement pour continuer.
        </p>
        <button
          onClick={() => navigate('/pricing', { replace: true })}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 mb-3"
          style={{ backgroundColor: '#0A0A0A' }}
        >
          Voir les offres
        </button>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export const RequirePlan: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [planStatus, setPlanStatus] = useState<'loading' | 'active' | 'blocked'>('loading');

  useEffect(() => {
    if (!user?.id) { setPlanStatus('active'); return; } // pas d'auth = RequireAuth s'en charge
    supabase
      .from('profiles')
      .select('plan_status')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data || data.plan_status === 'active') {
          setPlanStatus('active');
        } else {
          setPlanStatus('blocked');
        }
      });
  }, [user?.id]);

  if (planStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  if (planStatus === 'blocked') return <ExpiredPlanPage />;

  return <>{children}</>;
};

// ─── RequireB2C ───────────────────────────────────────────────────────────────
// Réserve la route aux utilisateurs B2C (fondateurs).
// Si un utilisateur B2B tente d'y accéder → il est renvoyé vers /dashboard/b2b.

export const RequireB2C: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (isB2BUser()) {
    return <Navigate to="/dashboard/b2b" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

// ─── RequireB2B ───────────────────────────────────────────────────────────────
// Réserve la route aux utilisateurs B2B (agences / partenaires).
// Si un utilisateur B2C tente d'y accéder → il est renvoyé vers /dashboard.

export const RequireB2B: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  if (!isB2BUser()) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
