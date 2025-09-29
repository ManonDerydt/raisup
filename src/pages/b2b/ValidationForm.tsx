import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ArrowRight } from 'lucide-react';

const ValidationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleCreateAccount = () => {
    setLoading(true);
    
    // Redirection garantie vers le dashboard B2B
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard/b2b');
    }, 300);
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-primary dark:text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold dark:text-white">Finalisation de votre espace</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Votre espace structure est prêt à être créé. Cliquez sur "Créer mon espace" pour accéder à votre dashboard.
      </p>
      
      <div className="bg-secondary-light dark:bg-purple-900/20 p-6 rounded-xl mb-8">
        <h2 className="font-semibold text-primary dark:text-purple-400 mb-3">Votre espace structure inclut :</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Dashboard de pilotage complet</li>
          <li>• Gestion de portefeuille de startups</li>
          <li>• Synthèse d'aides et opportunités</li>
          <li>• Calendrier des échéances</li>
          <li>• Rapports stratégiques automatisés</li>
          <li>• Gestion d'équipe et droits d'accès</li>
        </ul>
      </div>
      
      <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <button 
          type="button"
          onClick={() => navigate('/register/b2b/contact')}
          className="btn-secondary flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </button>
        
        <button 
          onClick={handleCreateAccount}
          className="btn-primary flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Création en cours...
            </>
          ) : (
            <>
              Créer mon espace
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ValidationForm;