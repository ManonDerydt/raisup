import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

type CompetitorData = {
  name: string;
  url?: string;
  differentiation: string;
};

type FormData = {
  // Vision & Stratégie
  mission: string;
  uniqueValue: string;
  objectives: {
    oneYear: string;
    threeYears: string;
    fiveYears: string;
  };
  challenges: string;
  
  // Offre & Business Model
  products: string;
  businessModel: string;
  otherBusinessModel?: string;
  averagePrice: number;
  cac: number;
  ltv: number;
  
  // Analyse Marché & Concurrence
  marketSize: number;
  marketSizeUnit: string;
  competitors: CompetitorData[];
  competitiveAdvantages: string[];
  otherCompetitiveAdvantage?: string;
  
  // Besoin en Financement
  fundingAmount: number;
  securedAmount: number;
  fundingTypes: string[];
  otherFundingType?: string;
  fundAllocation: {
    product: number;
    marketing: number;
    hr: number;
    operations: number;
    other: number;
  };
  otherAllocation?: string;
};

const BusinessPlanForm: React.FC = () => {
  const navigate = useNavigate();
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    control,
    watch, 
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      // Vision & Stratégie
      mission: '',
      uniqueValue: '',
      objectives: {
        oneYear: '',
        threeYears: '',
        fiveYears: '',
      },
      challenges: '',
      
      // Offre & Business Model
      products: '',
      businessModel: '',
      otherBusinessModel: '',
      averagePrice: 0,
      cac: 0,
      ltv: 0,
      
      // Analyse Marché & Concurrence
      marketSize: 0,
      marketSizeUnit: 'euros',
      competitors: [{ name: '', url: '', differentiation: '' }],
      competitiveAdvantages: [],
      otherCompetitiveAdvantage: '',
      
      // Besoin en Financement
      fundingAmount: 0,
      securedAmount: 0,
      fundingTypes: [],
      otherFundingType: '',
      fundAllocation: {
        product: 40,
        marketing: 30,
        hr: 20,
        operations: 10,
        other: 0,
      },
      otherAllocation: '',
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "competitors",
  });
  
  // Watch values for conditional rendering and validation
  const businessModel = watch('businessModel');
  const competitiveAdvantages = watch('competitiveAdvantages');
  const fundingTypes = watch('fundingTypes');
  const fundAllocation = watch('fundAllocation');
  const mission = watch('mission');
  const uniqueValue = watch('uniqueValue');
  const challenges = watch('challenges');
  const products = watch('products');
  
  // Calculate total allocation percentage
  const totalAllocation = Object.values(fundAllocation || {}).reduce((sum, value) => sum + value, 0);
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('businessPlanFormData');
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
        localStorage.setItem('businessPlanFormData', JSON.stringify(value));
        setAutoSaveStatus('Sauvegardé');
        
        // Clear the status message after 2 seconds
        const timer = setTimeout(() => {
          setAutoSaveStatus(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);
  
  // Handle fund allocation slider changes
  const handleAllocationChange = (key: keyof FormData['fundAllocation'], value: number) => {
    // Calculate the current total excluding the changed value
    const currentTotal = Object.entries(fundAllocation)
      .filter(([k]) => k !== key)
      .reduce((sum, [, val]) => sum + val, 0);
    
    // Calculate the maximum allowed value for this slider
    const maxAllowed = 100 - currentTotal;
    
    // Ensure the new value doesn't exceed the maximum allowed
    const newValue = Math.min(value, maxAllowed);
    
    // Update the value
    setValue(`fundAllocation.${key}`, newValue, { shouldValidate: true, shouldDirty: true });
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    // In a real app, you would save this data to your state management or API
    navigate('/onboarding/financials');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Business Plan & Besoin en Financement</h1>
      <p className="text-gray-600 mb-8">
        Ces informations nous aideront à structurer votre dossier de levée de fonds et à présenter votre vision aux investisseurs.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-10">
          {/* Vision & Stratégie */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Vision & Stratégie</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="mission" className="form-label">
                  Mission de l'entreprise
                </label>
                <textarea
                  id="mission"
                  rows={3}
                  className={clsx('input-field resize-none', errors.mission && 'border-red-500')}
                  maxLength={500}
                  placeholder="Quelle est la mission principale de votre entreprise ?"
                  {...register('mission', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 500, message: 'Maximum 500 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.mission && errors.mission.message}</span>
                  <span>{mission?.length || 0}/500</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="uniqueValue" className="form-label">
                  Pourquoi ce projet est-il unique ?
                </label>
                <textarea
                  id="uniqueValue"
                  rows={2}
                  className={clsx('input-field resize-none', errors.uniqueValue && 'border-red-500')}
                  maxLength={300}
                  placeholder="Qu'est-ce qui rend votre projet vraiment différent ?"
                  {...register('uniqueValue', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 300, message: 'Maximum 300 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.uniqueValue && errors.uniqueValue.message}</span>
                  <span>{uniqueValue?.length || 0}/300</span>
                </div>
              </div>
              
              <div>
                <label className="form-label">Objectifs à court et long terme</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label htmlFor="oneYearObjective" className="text-sm text-gray-600">À 1 an</label>
                    <input
                      id="oneYearObjective"
                      type="text"
                      className={clsx('input-field mt-1', errors.objectives?.oneYear && 'border-red-500')}
                      placeholder="Objectif à 1 an"
                      {...register('objectives.oneYear', { required: 'Ce champ est requis' })}
                    />
                    {errors.objectives?.oneYear && <p className="form-error">{errors.objectives.oneYear.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="threeYearsObjective" className="text-sm text-gray-600">À 3 ans</label>
                    <input
                      id="threeYearsObjective"
                      type="text"
                      className={clsx('input-field mt-1', errors.objectives?.threeYears && 'border-red-500')}
                      placeholder="Objectif à 3 ans"
                      {...register('objectives.threeYears', { required: 'Ce champ est requis' })}
                    />
                    {errors.objectives?.threeYears && <p className="form-error">{errors.objectives.threeYears.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="fiveYearsObjective" className="text-sm text-gray-600">À 5 ans</label>
                    <input
                      id="fiveYearsObjective"
                      type="text"
                      className={clsx('input-field mt-1', errors.objectives?.fiveYears && 'border-red-500')}
                      placeholder="Objectif à 5 ans"
                      {...register('objectives.fiveYears', { required: 'Ce champ est requis' })}
                    />
                    {errors.objectives?.fiveYears && <p className="form-error">{errors.objectives.fiveYears.message}</p>}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="challenges" className="form-label">
                  Challenges principaux à surmonter
                </label>
                <textarea
                  id="challenges"
                  rows={2}
                  className={clsx('input-field resize-none', errors.challenges && 'border-red-500')}
                  maxLength={300}
                  placeholder="Quels sont les principaux défis que vous devez surmonter ?"
                  {...register('challenges', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 300, message: 'Maximum 300 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.challenges && errors.challenges.message}</span>
                  <span>{challenges?.length || 0}/300</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Offre & Business Model */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Offre & Business Model</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="products" className="form-label">
                  Quels produits/services vendez-vous ?
                </label>
                <textarea
                  id="products"
                  rows={3}
                  className={clsx('input-field resize-none', errors.products && 'border-red-500')}
                  maxLength={500}
                  placeholder="Décrivez vos produits ou services principaux"
                  {...register('products', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 500, message: 'Maximum 500 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.products && errors.products.message}</span>
                  <span>{products?.length || 0}/500</span>
                </div>
              </div>
              
              <div>
                <label className="form-label">Votre modèle économique principal</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {[
                    { value: 'Abonnement', description: 'Revenus récurrents via des abonnements' },
                    { value: 'Transactionnel', description: 'Commission sur chaque transaction' },
                    { value: 'Licence', description: 'Vente de licences d\'utilisation' },
                    { value: 'Publicité', description: 'Revenus générés par la publicité' },
                    { value: 'Autre', description: 'Précisez votre modèle économique' }
                  ].map((model) => (
                    <label key={model.value} className="flex items-start cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center mr-3 mt-1">
                        <input
                          type="radio"
                          value={model.value}
                          className="sr-only"
                          {...register('businessModel', { required: 'Ce champ est requis' })}
                        />
                        <div className={clsx(
                          'w-5 h-5 rounded-full border flex items-center justify-center',
                          businessModel === model.value 
                            ? 'border-secondary-lighter bg-secondary-light' 
                            : 'border-gray-300'
                        )}>
                          {businessModel === model.value && (
                            <Check className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{model.value}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.businessModel && <p className="form-error mt-2">{errors.businessModel.message}</p>}
                
                {businessModel === 'Autre' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className={clsx('input-field', errors.otherBusinessModel && 'border-red-500')}
                      placeholder="Précisez votre modèle économique"
                      {...register('otherBusinessModel', { 
                        required: businessModel === 'Autre' ? 'Ce champ est requis' : false
                      })}
                    />
                    {errors.otherBusinessModel && <p className="form-error">{errors.otherBusinessModel.message}</p>}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="averagePrice" className="form-label">Prix moyen du produit/service (€)</label>
                  <input
                    id="averagePrice"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.averagePrice && 'border-red-500')}
                    {...register('averagePrice', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.averagePrice && <p className="form-error">{errors.averagePrice.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="cac" className="form-label">Coût d'acquisition client (CAC) (€)</label>
                  <input
                    id="cac"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.cac && 'border-red-500')}
                    {...register('cac', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.cac && <p className="form-error">{errors.cac.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="ltv" className="form-label">Valeur vie client (LTV) (€)</label>
                  <input
                    id="ltv"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.ltv && 'border-red-500')}
                    {...register('ltv', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.ltv && <p className="form-error">{errors.ltv.message}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Analyse Marché & Concurrence */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Analyse Marché & Concurrence</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="marketSize" className="form-label">Taille du marché ciblé</label>
                  <div className="flex">
                    <input
                      id="marketSize"
                      type="number"
                      min="0"
                      className={clsx('input-field rounded-r-none flex-1', errors.marketSize && 'border-red-500')}
                      {...register('marketSize', { 
                        required: 'Ce champ est requis',
                        min: { value: 0, message: 'La valeur doit être positive ou zéro' },
                        valueAsNumber: true
                      })}
                    />
                    <select
                      className="input-field rounded-l-none border-l-0 w-32"
                      {...register('marketSizeUnit')}
                    >
                      <option value="euros">€</option>
                      <option value="utilisateurs">Utilisateurs</option>
                    </select>
                  </div>
                  {errors.marketSize && <p className="form-error">{errors.marketSize.message}</p>}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label mb-0">Vos principaux concurrents</label>
                  <button
                    type="button"
                    onClick={() => append({ name: '', url: '', differentiation: '' })}
                    className="flex items-center text-primary font-medium hover:text-opacity-80 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter un concurrent
                  </button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Concurrent {index + 1}</h3>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Nom</label>
                          <input
                            type="text"
                            className={clsx(
                              'input-field mt-1',
                              errors.competitors?.[index]?.name && 'border-red-500'
                            )}
                            {...register(`competitors.${index}.name` as const, {
                              required: 'Ce champ est requis'
                            })}
                          />
                          {errors.competitors?.[index]?.name && (
                            <p className="form-error">{errors.competitors?.[index]?.name?.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Lien (optionnel)</label>
                          <input
                            type="url"
                            placeholder="https://exemple.com"
                            className={clsx(
                              'input-field mt-1',
                              errors.competitors?.[index]?.url && 'border-red-500'
                            )}
                            {...register(`competitors.${index}.url` as const, {
                              pattern: {
                                value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                                message: 'URL invalide'
                              }
                            })}
                          />
                          {errors.competitors?.[index]?.url && (
                            <p className="form-error">{errors.competitors?.[index]?.url?.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Différenciation clé</label>
                          <input
                            type="text"
                            className={clsx(
                              'input-field mt-1',
                              errors.competitors?.[index]?.differentiation && 'border-red-500'
                            )}
                            {...register(`competitors.${index}.differentiation` as const, {
                              required: 'Ce champ est requis',
                              maxLength: { value: 200, message: 'Maximum 200 caractères' }
                            })}
                          />
                          {errors.competitors?.[index]?.differentiation && (
                            <p className="form-error">{errors.competitors?.[index]?.differentiation?.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="form-label">Avantages compétitifs</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    'Technologie innovante',
                    'Accès exclusif à des données',
                    'Barrière réglementaire',
                    'Communauté forte',
                    'Autre'
                  ].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        className="sr-only"
                        {...register('competitiveAdvantages', { required: 'Sélectionnez au moins une option' })}
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded border flex items-center justify-center mr-2',
                        competitiveAdvantages?.includes(option)
                          ? 'border-secondary-lighter bg-secondary-light' 
                          : 'border-gray-300'
                      )}>
                        {competitiveAdvantages?.includes(option) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.competitiveAdvantages && <p className="form-error mt-1">{errors.competitiveAdvantages.message}</p>}
                
                {competitiveAdvantages?.includes('Autre') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className={clsx('input-field', errors.otherCompetitiveAdvantage && 'border-red-500')}
                      placeholder="Précisez votre avantage compétitif"
                      {...register('otherCompetitiveAdvantage', { 
                        required: competitiveAdvantages?.includes('Autre') ? 'Ce champ est requis' : false
                      })}
                    />
                    {errors.otherCompetitiveAdvantage && <p className="form-error">{errors.otherCompetitiveAdvantage.message}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Besoin en Financement */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Besoin en Financement & Utilisation des Fonds</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fundingAmount" className="form-label">Montant recherché pour cette levée (€)</label>
                  <input
                    id="fundingAmount"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.fundingAmount && 'border-red-500')}
                    {...register('fundingAmount', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.fundingAmount && <p className="form-error">{errors.fundingAmount.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="securedAmount" className="form-label">Montant déjà sécurisé (€)</label>
                  <input
                    id="securedAmount"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.securedAmount && 'border-red-500')}
                    {...register('securedAmount', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.securedAmount && <p className="form-error">{errors.securedAmount.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="form-label">Type de financement recherché</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {['Equity (actions)', 'Dette', 'Subvention', 'Autre'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        className="sr-only"
                        {...register('fundingTypes', { required: 'Sélectionnez au moins une option' })}
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded border flex items-center justify-center mr-2',
                        fundingTypes?.includes(option)
                          ? 'border-secondary-lighter bg-secondary-light' 
                          : 'border-gray-300'
                      )}>
                        {fundingTypes?.includes(option) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.fundingTypes && <p className="form-error mt-1">{errors.fundingTypes.message}</p>}
                
                {fundingTypes?.includes('Autre') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className={clsx('input-field', errors.otherFundingType && 'border-red-500')}
                      placeholder="Précisez le type de financement"
                      {...register('otherFundingType', { 
                        required: fundingTypes?.includes('Autre') ? 'Ce champ est requis' : false
                      })}
                    />
                    {errors.otherFundingType && <p className="form-error">{errors.otherFundingType.message}</p>}
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label mb-0">Utilisation des fonds (%)</label>
                  <div className={clsx(
                    'text-sm font-medium',
                    totalAllocation === 100 ? 'text-green-600' : 'text-red-500'
                  )}>
                    Total: {totalAllocation}%
                    {totalAllocation !== 100 && (
                      <span className="ml-2 inline-flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {totalAllocation < 100 ? 'Manque' : 'Excès'} {Math.abs(100 - totalAllocation)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  {[
                    { key: 'product', label: 'Produit & Développement' },
                    { key: 'marketing', label: 'Marketing & Acquisition' },
                    { key: 'hr', label: 'RH & Recrutement' },
                    { key: 'operations', label: 'Frais opérationnels' },
                    { key: 'other', label: 'Autre' }
                  ].map((item) => (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium">{item.label}</label>
                        <span className="text-sm">{fundAllocation[item.key as keyof FormData['fundAllocation']]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={fundAllocation[item.key as keyof FormData['fundAllocation']]}
                        onChange={(e) => handleAllocationChange(
                          item.key as keyof FormData['fundAllocation'], 
                          parseInt(e.target.value)
                        )}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                
                {fundAllocation.other > 0 && (
                  <div className="mt-3">
                    <input
                      type="text"
                      className={clsx('input-field', errors.otherAllocation && 'border-red-500')}
                      placeholder="Précisez l'utilisation des fonds 'Autre'"
                      {...register('otherAllocation', { 
                        required: fundAllocation.other > 0 ? 'Ce champ est requis' : false
                      })}
                    />
                    {errors.otherAllocation && <p className="form-error">{errors.otherAllocation.message}</p>}
                  </div>
                )}
                
                {totalAllocation !== 100 && (
                  <p className="form-error mt-3">Le total doit être égal à 100%</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/onboarding/entreprise')}
              className="btn-secondary"
            >
              Retour
            </button>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!isValid || totalAllocation !== 100}
            >
              Continuer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessPlanForm;