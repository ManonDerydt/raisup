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
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      acceptTerms: false,
      acceptGDPR: false,
      password: '',
      confirmPassword: '',
    }
  });
  
  const password = watch('password');
  const acceptTerms = watch('acceptTerms');
  const acceptGDPR = watch('acceptGDPR');
  
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
    
    // Simulate account creation
    setTimeout(() => {
      setLoading(false);
      
      // Clear saved form data
      localStorage.removeItem('b2bStructureFormData');
      localStorage.removeItem('b2bFinancialsFormData');
      localStorage.removeItem('b2bObjectivesFormData');
      localStorage.removeItem('b2bContactFormData');
      
      // Redirect to B2B dashboard or success page
      navigate('/dashboard/b2b');
    }, 2000);
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
            <div>
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Sécurité du compte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={clsx('input-field', errors.password && 'border-red-500')}
                      placeholder="••••••••"
                      {...register('password', { 
                        required: 'Ce champ est requis',
                        minLength: {
                          value: 8,
                          message: 'Le mot de passe doit contenir au moins 8 caractères'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
                        }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className={clsx('input-field', errors.confirmPassword && 'border-red-500')}
                      placeholder="••••••••"
                      {...register('confirmPassword', { 
                        required: 'Ce champ est requis',
                        validate: value => value === password || 'Les mots de passe ne correspondent pas'
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
            
            {/* Acceptation des conditions */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="sr-only"
                  {...register('acceptTerms', { required: 'Vous devez accepter les conditions' })}
                />
                <div
                  className={clsx(
                    "w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer mt-0.5",
                    acceptTerms
                      ? 'border-secondary-lighter bg-secondary-light'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  onClick={() => {
                    const event = {
                      target: { value: !acceptTerms, name: 'acceptTerms' }
                    } as any;
                    register('acceptTerms').onChange(event);
                  }}
                >
                  {acceptTerms && (
                    <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                  )}
                </div>
                <label className="text-sm cursor-pointer dark:text-gray-300">
                  J'accepte les{' '}
                  <a href="/terms" className="text-primary dark:text-purple-400 font-medium hover:underline">
                    conditions générales d'utilisation
                  </a>
                  {' '}de FundAI
                </label>
              </div>
              {errors.acceptTerms && <p className="form-error">{errors.acceptTerms.message}</p>}
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="sr-only"
                  {...register('acceptGDPR', { required: 'Vous devez accepter le traitement des données' })}
                />
                <div
                  className={clsx(
                    "w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer mt-0.5",
                    acceptGDPR
                      ? 'border-secondary-lighter bg-secondary-light'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  onClick={() => {
                    const event = {
                      target: { value: !acceptGDPR, name: 'acceptGDPR' }
                    } as any;
                    register('acceptGDPR').onChange(event);
                  }}
                >
                  {acceptGDPR && (
                    <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                  )}
                </div>
                <label className="text-sm cursor-pointer dark:text-gray-300">
                  J'accepte le traitement de mes données personnelles conformément à la{' '}
                  <a href="/privacy" className="text-primary dark:text-purple-400 font-medium hover:underline">
                    politique de confidentialité
                  </a>
                  {' '}et au RGPD
                </label>
              </div>
              {errors.acceptGDPR && <p className="form-error">{errors.acceptGDPR.message}</p>}
            </div>
            
            {/* Informations importantes */}
            <div className="bg-secondary-light dark:bg-purple-900/20 p-4 rounded-xl">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary dark:text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-primary dark:text-purple-400 mb-1">Prochaines étapes</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Après la création de votre compte, vous recevrez un email de confirmation. 
                    Notre équipe vous contactera sous 48h pour finaliser la configuration de votre espace 
                    et vous présenter les fonctionnalités avancées.
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
                disabled={!isValid || loading}
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