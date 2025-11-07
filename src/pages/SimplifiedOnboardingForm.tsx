import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Rocket, MapPin, DollarSign, Target, Sparkles } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  // Informations de base
  projectName: string;
  sector: string;
  stage: string;
  country: string;
  city: string;
  
  // Données financières simplifiées
  fundingNeeded: number;
  currentRevenue: number | null;
  
  // Besoins spécifiques
  fundingTypes: string[];
  
  // Ambitions
  ambitions: string[];
  
  // Sous-questions conditionnelles
  leadershipTimeline?: string;
  exitTimeline?: string;
  exitAmount?: string;
  fundingAmount?: string;
};

const SimplifiedOnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      projectName: '',
      sector: '',
      stage: '',
      country: 'France',
      city: '',
      fundingNeeded: 0,
      currentRevenue: null,
      fundingTypes: [],
      ambitions: [],
      leadershipTimeline: '',
      exitTimeline: '',
      exitAmount: '',
      fundingAmount: '',
    }
  });
  
  const fundingTypes = watch('fundingTypes');
  const ambitions = watch('ambitions');
  const projectName = watch('projectName');
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('simplifiedOnboardingData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        setValue(key as any, parsedData[key]);
      });
    }
  }, [setValue]);
  
  // Auto-save form data to localStorage when form changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (isDirty) {
        localStorage.setItem('simplifiedOnboardingData', JSON.stringify(value));
        setAutoSaveStatus('Sauvegardé automatiquement');
        
        const timer = setTimeout(() => {
          setAutoSaveStatus(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);
  
  const sectors = [
    'Fintech', 'Healthtech', 'Edtech', 'Proptech', 'Foodtech', 
    'Greentech', 'SaaS', 'E-commerce', 'AI & Machine Learning',
    'IoT', 'Blockchain', 'Cybersécurité', 'Marketplace', 'Autre'
  ];
  
  const countries = [
    'France', 'Belgique', 'Suisse', 'Luxembourg', 'Allemagne', 
    'Royaume-Uni', 'Espagne', 'Italie', 'Pays-Bas', 'Autre'
  ];
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    // Simulate diagnostic generation
    setTimeout(() => {
      navigate('/dashboard/welcome');
    }, 1000);
  };
  
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-secondary-lighter" />
            <span className="font-semibold text-lg dark:text-white">Raisup</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Étape {currentStep} sur {totalSteps}
          </div>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-2">
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary-lighter transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-lighter text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300 z-50">
          {autoSaveStatus}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Informations de base */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="bg-secondary-lighter rounded-full p-3 mr-4">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">Parlez-nous de votre projet</h1>
                  <p className="text-gray-600 dark:text-gray-300">Informations de base sur votre startup</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="projectName" className="form-label">Nom du projet / startup</label>
                  <input
                    id="projectName"
                    type="text"
                    className={clsx('input-field', errors.projectName && 'border-red-500')}
                    placeholder="Ex: MediScan, GreenTech Solutions..."
                    {...register('projectName', { required: 'Ce champ est requis' })}
                  />
                  {errors.projectName && <p className="form-error">{errors.projectName.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="sector" className="form-label">Secteur d'activité</label>
                  <select
                    id="sector"
                    className={clsx('input-field', errors.sector && 'border-red-500')}
                    {...register('sector', { required: 'Ce champ est requis' })}
                  >
                    <option value="">Sélectionnez votre secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  {errors.sector && <p className="form-error">{errors.sector.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Stade de développement</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'Idéation', description: 'Concept et idée' },
                      { value: 'Prototype', description: 'Développement en cours' },
                      { value: 'MVP', description: 'Produit minimum viable' },
                      { value: 'Croissance', description: 'Commercialisation active' }
                    ].map((stage) => (
                      <label key={stage.value} className="flex items-start cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center mr-3 mt-1">
                          <input
                            type="radio"
                            value={stage.value}
                            className="sr-only"
                            {...register('stage', { required: 'Ce champ est requis' })}
                          />
                          <div className={clsx(
                            'w-5 h-5 rounded-full border flex items-center justify-center',
                            watch('stage') === stage.value 
                              ? 'border-secondary-lighter bg-secondary-lighter' 
                              : 'border-gray-300 dark:border-gray-600'
                          )}>
                            {watch('stage') === stage.value && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium dark:text-white">{stage.value}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{stage.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.stage && <p className="form-error mt-2">{errors.stage.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="form-label">Pays</label>
                    <select
                      id="country"
                      className={clsx('input-field', errors.country && 'border-red-500')}
                      {...register('country', { required: 'Ce champ est requis' })}
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.country && <p className="form-error">{errors.country.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="form-label">Ville</label>
                    <input
                      id="city"
                      type="text"
                      className={clsx('input-field', errors.city && 'border-red-500')}
                      placeholder="Paris, Lyon, Marseille..."
                      {...register('city', { required: 'Ce champ est requis' })}
                    />
                    {errors.city && <p className="form-error">{errors.city.message}</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                  disabled={!watch('projectName') || !watch('sector') || !watch('stage') || !watch('city')}
                >
                  Continuer
                  <Rocket className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Données financières */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="bg-secondary-lighter rounded-full p-3 mr-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">Situation financière</h1>
                  <p className="text-gray-600 dark:text-gray-300">Quelques chiffres pour mieux vous conseiller</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="fundingNeeded" className="form-label">Montant recherché ou besoin de financement (€)</label>
                  <input
                    id="fundingNeeded"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.fundingNeeded && 'border-red-500')}
                    placeholder="500000"
                    {...register('fundingNeeded', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.fundingNeeded && <p className="form-error">{errors.fundingNeeded.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="currentRevenue" className="form-label">Chiffre d'affaires actuel (€) - Optionnel</label>
                  <input
                    id="currentRevenue"
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="Si applicable, sinon laissez vide"
                    {...register('currentRevenue', { 
                      min: { value: 0, message: 'Le montant doit être positif' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.currentRevenue && <p className="form-error">{errors.currentRevenue.message}</p>}
                </div>
                
                <div>
                  <label className="form-label">Types de financement recherchés</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'Subventions', description: 'Aides publiques non remboursables' },
                      { value: 'Prêt', description: 'Financement bancaire ou institutionnel' },
                      { value: 'Levée de fonds', description: 'Investissement en capital (equity)' },
                      { value: 'Accompagnement', description: 'Support et mentorat' }
                    ].map((type) => (
                      <label key={type.value} className="flex items-start cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center mr-3 mt-1">
                          <input
                            type="checkbox"
                            value={type.value}
                            className="sr-only"
                            {...register('fundingTypes', { required: 'Sélectionnez au moins une option' })}
                          />
                          <div className={clsx(
                            'w-5 h-5 rounded border flex items-center justify-center',
                            fundingTypes?.includes(type.value)
                              ? 'border-secondary-lighter bg-secondary-lighter' 
                              : 'border-gray-300 dark:border-gray-600'
                          )}>
                            {fundingTypes?.includes(type.value) && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium dark:text-white">{type.value}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.fundingTypes && <p className="form-error mt-2">{errors.fundingTypes.message}</p>}
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                  disabled={!watch('fundingNeeded') || !fundingTypes?.length}
                >
                  Continuer
                  <DollarSign className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Ambitions */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="bg-secondary-lighter rounded-full p-3 mr-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">Vos ambitions</h1>
                  <p className="text-gray-600 dark:text-gray-300">Quels sont vos objectifs pour {projectName || 'votre projet'} ?</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Quelles sont vos ambitions ? (plusieurs choix possibles)</label>
                  <div className="space-y-3 mt-2">
                    {[
                      'Devenir leader de ton secteur',
                      'Te faire racheter / exit',
                      'Déploiement international',
                      'Levée de fonds importante',
                      'Fusion/partenariat stratégique',
                      'Croissance maîtrisée et durable',
                      'Autre'
                    ].map((ambition) => (
                      <label key={ambition} className="flex items-center cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <input
                          type="checkbox"
                          value={ambition}
                          className="sr-only"
                          {...register('ambitions', { required: 'Sélectionnez au moins une ambition' })}
                        />
                        <div className={clsx(
                          'w-5 h-5 rounded border flex items-center justify-center mr-3',
                          ambitions?.includes(ambition)
                            ? 'border-secondary-lighter bg-secondary-lighter' 
                            : 'border-gray-300 dark:border-gray-600'
                        )}>
                          {ambitions?.includes(ambition) && (
                            <Check className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <span className="font-medium dark:text-white">{ambition}</span>
                      </label>
                    ))}
                  </div>
                  {errors.ambitions && <p className="form-error mt-2">{errors.ambitions.message}</p>}
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                  disabled={!ambitions?.length}
                >
                  Continuer
                  <Target className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Questions conditionnelles */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="bg-secondary-lighter rounded-full p-3 mr-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">Précisions sur vos objectifs</h1>
                  <p className="text-gray-600 dark:text-gray-300">Quelques détails pour personnaliser votre diagnostic</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Questions conditionnelles basées sur les ambitions sélectionnées */}
                {ambitions?.includes('Devenir leader de ton secteur') && (
                  <div className="p-4 bg-secondary-lighter bg-opacity-20 rounded-xl">
                    <h3 className="font-medium mb-3 dark:text-white">Leadership sectoriel</h3>
                    <div>
                      <label htmlFor="leadershipTimeline" className="form-label">D'ici combien d'années souhaites-tu atteindre ce statut ?</label>
                      <select
                        id="leadershipTimeline"
                        className="input-field"
                        {...register('leadershipTimeline', { 
                          required: ambitions?.includes('Devenir leader de ton secteur') ? 'Ce champ est requis' : false
                        })}
                      >
                        <option value="">Sélectionnez une période</option>
                        <option value="1 an">1 an</option>
                        <option value="2 à 3 ans">2 à 3 ans</option>
                        <option value="4 à 5 ans">4 à 5 ans</option>
                        <option value="Plus de 5 ans">Plus de 5 ans</option>
                      </select>
                      {errors.leadershipTimeline && <p className="form-error">{errors.leadershipTimeline.message}</p>}
                    </div>
                  </div>
                )}
                
                {ambitions?.includes('Te faire racheter / exit') && (
                  <div className="p-4 bg-secondary-lighter bg-opacity-20 rounded-xl">
                    <h3 className="font-medium mb-3 dark:text-white">Stratégie de sortie</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="exitTimeline" className="form-label">Dans combien de temps envisages-tu une sortie ?</label>
                        <select
                          id="exitTimeline"
                          className="input-field"
                          {...register('exitTimeline', { 
                            required: ambitions?.includes('Te faire racheter / exit') ? 'Ce champ est requis' : false
                          })}
                        >
                          <option value="">Sélectionnez une période</option>
                          <option value="Moins de 2 ans">Moins de 2 ans</option>
                          <option value="2 à 3 ans">2 à 3 ans</option>
                          <option value="4 à 5 ans">4 à 5 ans</option>
                          <option value="Plus de 5 ans">Plus de 5 ans</option>
                        </select>
                        {errors.exitTimeline && <p className="form-error">{errors.exitTimeline.message}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="exitAmount" className="form-label">Montant approximatif souhaité pour le rachat</label>
                        <select
                          id="exitAmount"
                          className="input-field"
                          {...register('exitAmount', { 
                            required: ambitions?.includes('Te faire racheter / exit') ? 'Ce champ est requis' : false
                          })}
                        >
                          <option value="">Sélectionnez un montant</option>
                          <option value="Moins de 1 M€">Moins de 1 M€</option>
                          <option value="1 à 5 M€">1 à 5 M€</option>
                          <option value="5 à 10 M€">5 à 10 M€</option>
                          <option value="10 à 50 M€">10 à 50 M€</option>
                          <option value="Plus de 50 M€">Plus de 50 M€</option>
                        </select>
                        {errors.exitAmount && <p className="form-error">{errors.exitAmount.message}</p>}
                      </div>
                    </div>
                  </div>
                )}
                
                {ambitions?.includes('Levée de fonds importante') && (
                  <div className="p-4 bg-secondary-lighter bg-opacity-20 rounded-xl">
                    <h3 className="font-medium mb-3 dark:text-white">Levée de fonds</h3>
                    <div>
                      <label htmlFor="fundingAmount" className="form-label">Montant cible pour la prochaine levée</label>
                      <select
                        id="fundingAmount"
                        className="input-field"
                        {...register('fundingAmount', { 
                          required: ambitions?.includes('Levée de fonds importante') ? 'Ce champ est requis' : false
                        })}
                      >
                        <option value="">Sélectionnez un montant</option>
                        <option value="Moins de 500 K€">Moins de 500 K€</option>
                        <option value="500 K€ à 1 M€">500 K€ à 1 M€</option>
                        <option value="1 à 5 M€">1 à 5 M€</option>
                        <option value="Plus de 5 M€">Plus de 5 M€</option>
                      </select>
                      {errors.fundingAmount && <p className="form-error">{errors.fundingAmount.message}</p>}
                    </div>
                  </div>
                )}
                
                {(!ambitions?.includes('Devenir leader de ton secteur') && 
                  !ambitions?.includes('Te faire racheter / exit') && 
                  !ambitions?.includes('Levée de fonds importante')) && ambitions?.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      Parfait ! Nous avons toutes les informations nécessaires pour générer votre diagnostic personnalisé.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center bg-gradient-to-r from-secondary-lighter to-green-400 hover:from-green-400 hover:to-secondary-lighter"
                  disabled={!isValid}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Obtenir mon diagnostic
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SimplifiedOnboardingForm;