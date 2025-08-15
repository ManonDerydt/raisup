import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';

type FounderData = {
  name: string;
  role: string;
  linkedin?: string;
};

type FormData = {
  companyName: string;
  legalStatus: string;
  foundationDate: string;
  country: string;
  city: string;
  employeesCount: string;
  industry: string;
  description: string;
  targetMarket: string[];
  businessModel: string;
  website?: string;
  foundersCount: number;
  founders: FounderData[];
  projectStage: string;
  annualRevenue?: number;
  usersCount?: number;
  keyPartnerships?: string;
};

const CompanyForm: React.FC = () => {
  const navigate = useNavigate();
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  
  // Mock industry suggestions for autocomplete
  const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Countries list for dropdown
  const countries = [
    "France", "Allemagne", "Royaume-Uni", "Espagne", "Italie", 
    "Belgique", "Suisse", "Luxembourg", "Pays-Bas", "Portugal",
    "États-Unis", "Canada", "Autre"
  ];
  
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
      companyName: '',
      legalStatus: '',
      foundationDate: '',
      country: 'France',
      city: '',
      employeesCount: '',
      industry: '',
      description: '',
      targetMarket: [],
      businessModel: '',
      website: '',
      foundersCount: 1,
      founders: [{ name: '', role: '', linkedin: '' }],
      projectStage: '',
      annualRevenue: undefined,
      usersCount: undefined,
      keyPartnerships: '',
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "founders",
  });
  
  const projectStage = watch('projectStage');
  const foundersCount = watch('foundersCount');
  const description = watch('description');
  const keyPartnerships = watch('keyPartnerships');
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('companyFormData');
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
        localStorage.setItem('companyFormData', JSON.stringify(value));
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
  
  // Update founders array when foundersCount changes
  useEffect(() => {
    const currentLength = fields.length;
    
    if (foundersCount > currentLength) {
      // Add new founders
      for (let i = 0; i < foundersCount - currentLength; i++) {
        append({ name: '', role: '', linkedin: '' });
      }
    } else if (foundersCount < currentLength) {
      // Remove excess founders
      for (let i = currentLength - 1; i >= foundersCount; i--) {
        remove(i);
      }
    }
  }, [foundersCount, fields.length, append, remove]);
  
  const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.length > 2) {
      // Mock AI suggestions based on input
      const mockSuggestions = [
        'SaaS', 'Fintech', 'E-commerce', 'Healthtech', 'Edtech', 
        'Proptech', 'Foodtech', 'Greentech', 'AI & Machine Learning',
        'Blockchain', 'IoT', 'Marketplace', 'Cybersecurity', 'Cleantech',
        'Biotech', 'Agritech', 'Insurtech', 'Legaltech', 'Retailtech'
      ].filter(industry => 
        industry.toLowerCase().includes(value.toLowerCase())
      );
      
      setIndustrySuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const selectIndustry = (industry: string) => {
    const event = {
      target: { value: industry, name: 'industry' }
    } as React.ChangeEvent<HTMLInputElement>;
    
    register('industry').onChange(event);
    setShowSuggestions(false);
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    // In a real app, you would save this data to your state management or API
    navigate('/onboarding/business-plan');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Informations sur votre entreprise</h1>
      <p className="text-gray-600 mb-8">
        Ces informations nous aideront à structurer votre dossier de levée de fonds.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-10">
          {/* Informations générales */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="form-label">Nom de l'entreprise</label>
                <input
                  id="companyName"
                  type="text"
                  className={clsx('input-field', errors.companyName && 'border-red-500')}
                  {...register('companyName', { required: 'Ce champ est requis' })}
                />
                {errors.companyName && <p className="form-error">{errors.companyName.message}</p>}
              </div>
              
              <div>
                <label htmlFor="legalStatus" className="form-label">Statut juridique</label>
                <select
                  id="legalStatus"
                  className={clsx('input-field', errors.legalStatus && 'border-red-500')}
                  {...register('legalStatus', { required: 'Ce champ est requis' })}
                >
                  <option value="">Sélectionnez une option</option>
                  <option value="SAS">SAS</option>
                  <option value="SARL">SARL</option>
                  <option value="SA">SA</option>
                  <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                  <option value="Association">Association</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.legalStatus && <p className="form-error">{errors.legalStatus.message}</p>}
              </div>
              
              <div>
                <label htmlFor="foundationDate" className="form-label">Date de création</label>
                <input
                  id="foundationDate"
                  type="date"
                  className={clsx('input-field', errors.foundationDate && 'border-red-500')}
                  {...register('foundationDate', { required: 'Ce champ est requis' })}
                />
                {errors.foundationDate && <p className="form-error">{errors.foundationDate.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="country" className="form-label">Pays d'implantation</label>
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
                    {...register('city', { required: 'Ce champ est requis' })}
                  />
                  {errors.city && <p className="form-error">{errors.city.message}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="employeesCount" className="form-label">Nombre d'employés</label>
                <select
                  id="employeesCount"
                  className={clsx('input-field', errors.employeesCount && 'border-red-500')}
                  {...register('employeesCount', { required: 'Ce champ est requis' })}
                >
                  <option value="">Sélectionnez une option</option>
                  <option value="1-5">1-5</option>
                  <option value="5-10">5-10</option>
                  <option value="10-50">10-50</option>
                  <option value="50-100">50-100</option>
                  <option value="100+">100+</option>
                </select>
                {errors.employeesCount && <p className="form-error">{errors.employeesCount.message}</p>}
              </div>
            </div>
          </div>
          
          {/* Secteur & Activité */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Secteur & Activité</h2>
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="industry" className="form-label">Secteur d'activité</label>
                <input
                  id="industry"
                  type="text"
                  className={clsx('input-field', errors.industry && 'border-red-500')}
                  {...register('industry', { required: 'Ce champ est requis' })}
                  onChange={(e) => {
                    register('industry').onChange(e);
                    handleIndustryChange(e);
                  }}
                  autoComplete="off"
                />
                {showSuggestions && industrySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {industrySuggestions.map((industry, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-secondary-light"
                        onClick={() => selectIndustry(industry)}
                      >
                        {industry}
                      </div>
                    ))}
                  </div>
                )}
                {errors.industry && <p className="form-error">{errors.industry.message}</p>}
              </div>
              
              <div>
                <label htmlFor="description" className="form-label">
                  Description courte de l'activité
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className={clsx('input-field resize-none', errors.description && 'border-red-500')}
                  maxLength={300}
                  {...register('description', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 300, message: 'Maximum 300 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.description && errors.description.message}</span>
                  <span>{description?.length || 0}/300</span>
                </div>
              </div>
              
              <div>
                <label className="form-label">Marché cible</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {['B2B', 'B2C', 'B2G', 'Autre'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        className="sr-only"
                        {...register('targetMarket', { required: 'Sélectionnez au moins une option' })}
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded border flex items-center justify-center mr-2',
                        watch('targetMarket')?.includes(option)
                          ? 'border-secondary-lighter bg-secondary-light' 
                          : 'border-gray-300'
                      )}>
                        {watch('targetMarket')?.includes(option) && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.targetMarket && <p className="form-error">{errors.targetMarket.message}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessModel" className="form-label">Modèle économique principal</label>
                  <select
                    id="businessModel"
                    className={clsx('input-field', errors.businessModel && 'border-red-500')}
                    {...register('businessModel', { required: 'Ce champ est requis' })}
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="Abonnement">Abonnement</option>
                    <option value="Produit unique">Produit unique</option>
                    <option value="Services">Services</option>
                    <option value="Plateforme">Plateforme</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Autre">Autre</option>
                  </select>
                  {errors.businessModel && <p className="form-error">{errors.businessModel.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="website" className="form-label">Lien vers le site web (optionnel)</label>
                  <input
                    id="website"
                    type="url"
                    className="input-field"
                    placeholder="https://votre-site.com"
                    {...register('website', {
                      pattern: {
                        value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                        message: 'URL invalide'
                      }
                    })}
                  />
                  {errors.website && <p className="form-error">{errors.website.message}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Équipe fondatrice */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Équipe fondatrice</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="foundersCount" className="form-label">Nombre de fondateurs</label>
                <input
                  id="foundersCount"
                  type="number"
                  min="1"
                  max="10"
                  className={clsx('input-field w-32', errors.foundersCount && 'border-red-500')}
                  {...register('foundersCount', { 
                    required: 'Ce champ est requis',
                    min: { value: 1, message: 'Minimum 1 fondateur' },
                    max: { value: 10, message: 'Maximum 10 fondateurs' },
                    valueAsNumber: true
                  })}
                />
                {errors.foundersCount && <p className="form-error">{errors.foundersCount.message}</p>}
              </div>
              
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Fondateur {index + 1}</h3>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            remove(index);
                            setValue('foundersCount', foundersCount - 1);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="form-label">Nom</label>
                        <input
                          type="text"
                          className={clsx(
                            'input-field',
                            errors.founders?.[index]?.name && 'border-red-500'
                          )}
                          {...register(`founders.${index}.name` as const, {
                            required: 'Ce champ est requis'
                          })}
                        />
                        {errors.founders?.[index]?.name && (
                          <p className="form-error">{errors.founders?.[index]?.name?.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="form-label">Rôle</label>
                        <select
                          className={clsx(
                            'input-field',
                            errors.founders?.[index]?.role && 'border-red-500'
                          )}
                          {...register(`founders.${index}.role` as const, {
                            required: 'Ce champ est requis'
                          })}
                        >
                          <option value="">Sélectionnez un rôle</option>
                          <option value="CEO">CEO</option>
                          <option value="CTO">CTO</option>
                          <option value="CFO">CFO</option>
                          <option value="COO">COO</option>
                          <option value="CMO">CMO</option>
                          <option value="Autre">Autre</option>
                        </select>
                        {errors.founders?.[index]?.role && (
                          <p className="form-error">{errors.founders?.[index]?.role?.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="form-label">LinkedIn (optionnel)</label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/..."
                          className={clsx(
                            'input-field',
                            errors.founders?.[index]?.linkedin && 'border-red-500'
                          )}
                          {...register(`founders.${index}.linkedin` as const, {
                            pattern: {
                              value: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
                              message: 'URL LinkedIn invalide'
                            }
                          })}
                        />
                        {errors.founders?.[index]?.linkedin && (
                          <p className="form-error">{errors.founders?.[index]?.linkedin?.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    append({ name: '', role: '', linkedin: '' });
                    setValue('foundersCount', foundersCount + 1);
                  }}
                  className="flex items-center text-primary font-medium hover:text-opacity-80 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un fondateur
                </button>
              </div>
            </div>
          </div>
          
          {/* Stade de développement */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Stade de développement</h2>
            <div className="space-y-6">
              <div>
                <label className="form-label">Avancement du projet</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                  {['Idée', 'Prototype', 'Produit en Beta', 'Produit sur le marché', 'Scale-up'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={option}
                        className="sr-only"
                        {...register('projectStage', { required: 'Ce champ est requis' })}
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded-full border flex items-center justify-center mr-2',
                        projectStage === option 
                          ? 'border-secondary-lighter bg-secondary-light' 
                          : 'border-gray-300'
                      )}>
                        {projectStage === option && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.projectStage && <p className="form-error">{errors.projectStage.message}</p>}
              </div>
              
              {(projectStage === 'Produit sur le marché' || projectStage === 'Scale-up') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="annualRevenue" className="form-label">Chiffre d'affaires annuel (€)</label>
                    <input
                      id="annualRevenue"
                      type="number"
                      min="0"
                      className={clsx('input-field', errors.annualRevenue && 'border-red-500')}
                      {...register('annualRevenue', { 
                        required: 'Ce champ est requis',
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.annualRevenue && <p className="form-error">{errors.annualRevenue.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="usersCount" className="form-label">Nombre d'utilisateurs / clients</label>
                    <input
                      id="usersCount"
                      type="number"
                      min="0"
                      className={clsx('input-field', errors.usersCount && 'border-red-500')}
                      {...register('usersCount', { 
                        required: 'Ce champ est requis',
                        min: { value: 0, message: 'Le nombre doit être positif ou zéro' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.usersCount && <p className="form-error">{errors.usersCount.message}</p>}
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="keyPartnerships" className="form-label">
                  Partenariats clés (optionnel)
                </label>
                <textarea
                  id="keyPartnerships"
                  rows={3}
                  className="input-field resize-none"
                  maxLength={300}
                  {...register('keyPartnerships', { 
                    maxLength: { value: 300, message: 'Maximum 300 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.keyPartnerships && errors.keyPartnerships.message}</span>
                  <span>{keyPartnerships?.length || 0}/300</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/onboarding/entrepreneur')}
              className="btn-secondary"
            >
              Retour
            </button>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!isValid}
            >
              Continuer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;