import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  acceptTerms: boolean;
  acceptGDPR: boolean;
  password: string;
  confirmPassword: string;
};

const ValidationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      acceptTerms: false,
      acceptGDPR: false,
      password: '',
      confirmPassword: '',
    }
  });
  
  // Load saved form data to show summary
  const [formSummary, setFormSummary] = useState<any>({});
  
  useEffect(() => {
    const structureData = localStorage.getItem('b2bStructureFormData');
    const financialsData = localStorage.getItem('b2bFinancialsFormData');
    const objectivesData = localStorage.getItem('b2bObjectivesFormData');
    const contactData = localStorage.getItem('b2bContactFormData');
    
    setFormSummary({
      structure: structureData ? JSON.parse(structureData) : {},
      financials: financialsData ? JSON.parse(financialsData) : {},
      objectives: objectivesData ? JSON.parse(objectivesData) : {},
      contact: contactData ? JSON.parse(contactData) : {},
    });
  }, []);
  
  const onSubmit = (data: FormData) => {
    setLoading(true);
    
    // Always redirect to B2B dashboard - no validation required
    setTimeout(() => {
      setLoading(false);
      
      // Clear saved form data
      localStorage.removeItem('b2bStructureFormData');
      localStorage.removeItem('b2bFinancialsFormData');
      localStorage.removeItem('b2bObjectivesFormData');
      localStorage.removeItem('b2bContactFormData');
      
      // Guaranteed redirect to B2B dashboard
      navigate('/dashboard/b2b');
    }, 100);
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-primary dark:text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold dark:text-white">Validation et création du compte</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Vérifiez vos informations et finalisez la création de votre compte structure.
      </p>
      
      <div className="space-y-8">
        {/* Récapitulatif */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Récapitulatif de vos informations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-primary dark:text-purple-400 mb-2">Structure</h3>
              <div className="space-y-1 text-sm">
                <p className="dark:text-gray-300"><span className="font-medium">Nom:</span> {formSummary.structure?.structureName || 'Non renseigné'}</p>
                <p className="dark:text-gray-300"><span className="font-medium">Type:</span> {formSummary.structure?.structureType || 'Non renseigné'}</p>
                <p className="dark:text-gray-300"><span className="font-medium">Localisation:</span> {formSummary.structure?.city || 'Non renseigné'}, {formSummary.structure?.country || 'Non renseigné'}</p>
                <p className="dark:text-gray-300"><span className="font-medium">Équipe:</span> {formSummary.structure?.teamSize || 'Non renseigné'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-primary dark:text-purple-400 mb-2">Opérationnel</h3>
              <div className="space-y-1 text-sm">
                <p className="dark:text-gray-300"><span className="font-medium">Ticket moyen:</span> {formSummary.financials?.averageTicket ? `${formSummary.financials.averageTicket.toLocaleString()}€` : 'Non renseigné'}</p>
                <p className="dark:text-gray-300"><span className="font-medium">Portefeuille:</span> {formSummary.financials?.portfolioSize || 'Non renseigné'} startups</p>
                <p className="dark:text-gray-300"><span className="font-medium">Nouvelles/an:</span> {formSummary.financials?.newStartupsPerYear || 'Non renseigné'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-primary dark:text-purple-400 mb-2">Contact</h3>
              <div className="space-y-1 text-sm">
                <p className="dark:text-gray-300"><span className="font-medium">Nom:</span> {formSummary.contact?.fullName || 'Non renseigné'}</p>
                <p className="dark:text-gray-300"><span className="font-medium">Rôle:</span> {formSummary.contact?.role || 'Non renseigné'}</p>
                <p className="dark:text-gray-300"><span className="font-medium">Email:</span> {formSummary.contact?.email || 'Non renseigné'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-primary dark:text-purple-400 mb-2">Objectifs</h3>
              <div className="space-y-1 text-sm">
                <p className="dark:text-gray-300"><span className="font-medium">Principaux:</span> {formSummary.objectives?.mainObjectives?.length || 0} sélectionnés</p>
                <p className="dark:text-gray-300"><span className="font-medium">Types recherchés:</span> {formSummary.objectives?.targetStartupTypes?.length || 0} sélectionnés</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/register/b2b/structure')}
              className="text-primary dark:text-purple-400 hover:text-opacity-80 text-sm font-medium"
            >
              Modifier les informations
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Sécurité du compte */}
            <div className="bg-secondary-light dark:bg-purple-900/20 p-4 rounded-xl">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-primary dark:text-purple-400 mb-1">Création de votre espace</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Votre espace structure sera créé avec les informations fournies. 
                    Vous pourrez compléter et modifier ces informations depuis votre dashboard.
                  </p>
                </div>
              </div>
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
                type="submit" 
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
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationForm;