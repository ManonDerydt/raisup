import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isB2BUser(): boolean {
  return localStorage.getItem('raisup_user_type') === 'agency';
}

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
