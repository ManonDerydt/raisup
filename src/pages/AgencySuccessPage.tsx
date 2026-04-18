import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { mockFundherzAccount } from '../data/mockAgencyData';

const AgencySuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const agencyName = useMemo(() => {
    try {
      const p = JSON.parse(localStorage.getItem('raisup_agency_profile') || '{}');
      return p.name || 'votre agence';
    } catch { return 'votre agence'; }
  }, []);

  const handleGo = () => {
    // Charge les dossiers mockés si pas encore de dossiers réels
    if (!localStorage.getItem('raisup_agency_dossiers')) {
      localStorage.setItem('raisup_agency_dossiers', JSON.stringify(mockFundherzAccount.dossiers));
    }
    navigate('/dashboard/b2b');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F8F8F8' }}>
      <div
        className="w-full max-w-md text-center"
        style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 48, border: '1.5px solid #E5E7EB' }}
      >
        {/* Confetti icon */}
        <div
          className="mx-auto flex items-center justify-center mb-6"
          style={{ width: 80, height: 80, backgroundColor: '#FFD6E5', borderRadius: 20 }}
        >
          <Sparkles style={{ width: 36, height: 36, color: '#C4728A' }} />
        </div>

        <h1 className="font-bold mb-3" style={{ fontSize: 24, color: '#0A0A0A' }}>
          Votre espace <span style={{ color: '#C4728A' }}>{agencyName}</span> est prêt !
        </h1>
        <p className="text-[14px] mb-8" style={{ color: '#6B7280', lineHeight: 1.7 }}>
          Votre compte partenaire a été créé avec succès. Vous pouvez maintenant ajouter vos premiers dossiers clients et accéder à toutes vos analyses.
        </p>

        <button
          onClick={handleGo}
          className="w-full font-semibold text-[14px] py-3.5 rounded-full transition-opacity hover:opacity-90 mb-4"
          style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}
        >
          Accéder à mon dashboard partenaire →
        </button>

        <p className="text-[12px]" style={{ color: '#9CA3AF' }}>
          Des questions ? Contactez-nous à{' '}
          <a href="mailto:hello@raisup.co" className="underline">hello@raisup.co</a>
        </p>
      </div>
    </div>
  );
};

export default AgencySuccessPage;
