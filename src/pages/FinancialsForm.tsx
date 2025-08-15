import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, Trash2, Upload, AlertCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

type ShareholderData = {
  name: string;
  percentage: number;
  investment: number;
  investorType: string;
};

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

type FormData = {
  // Indicateurs Financiers Clés
  revenue: {
    year1: number | null;
    year2: number | null;
    year3: number | null;
  };
  grossMargin: number | null;
  ebitda: number | null;
  burnRate: number | null;
  runway: number | null;
  
  // Prévisions Financières
  projectedRevenue: {
    year1: number | null;
    year2: number | null;
    year3: number | null;
    year4: number | null;
    year5: number | null;
  };
  projectedGrossMargin: number | null;
  projectedEbitda: number | null;
  yearlyFundingNeeds: number | null;
  
  // Structure de l'Actionnariat
  shareholders: ShareholderData[];
  stockOptions: number | null;
  
  // Documents Due Diligence
  documents: {
    kbis: UploadedFile | null;
    financialStatements: UploadedFile | null;
    financialForecast: UploadedFile | null;
    companyBylaws: UploadedFile | null;
    shareholderAgreement: UploadedFile | null;
    keyContracts: UploadedFile | null;
  };
};

const FinancialsForm: React.FC = () => {
  const navigate = useNavigate();
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  
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
      // Indicateurs Financiers Clés
      revenue: {
        year1: null,
        year2: null,
        year3: null,
      },
      grossMargin: null,
      ebitda: null,
      burnRate: null,
      runway: null,
      
      // Prévisions Financières
      projectedRevenue: {
        year1: null,
        year2: null,
        year3: null,
        year4: null,
        year5: null,
      },
      projectedGrossMargin: null,
      projectedEbitda: null,
      yearlyFundingNeeds: null,
      
      // Structure de l'Actionnariat
      shareholders: [{ name: '', percentage: 0, investment: 0, investorType: '' }],
      stockOptions: null,
      
      // Documents Due Diligence
      documents: {
        kbis: null,
        financialStatements: null,
        financialForecast: null,
        companyBylaws: null,
        shareholderAgreement: null,
        keyContracts: null,
      },
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "shareholders",
  });
  
  // Calculate total shareholders percentage
  const shareholders = watch('shareholders');
  const totalShareholdersPercentage = shareholders.reduce((sum, shareholder) => sum + (shareholder.percentage || 0), 0);
  
  // Watch documents for validation
  const documents = watch('documents');
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('financialsFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // We can't restore file objects from localStorage, so we'll just restore the other data
        const { documents, ...restData } = parsedData;
        
        Object.keys(restData).forEach((key) => {
          setValue(key as any, restData[key]);
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [setValue]);
  
  // Auto-save form data to localStorage when form changes
  useEffect(() => {
    const subscription = watch((value) => {
      if (isDirty) {
        // We can't store File objects in localStorage, so we'll store everything else
        const { documents, ...dataToSave } = value;
        
        localStorage.setItem('financialsFormData', JSON.stringify(dataToSave));
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
  
  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData['documents']) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      setFileErrors({
        ...fileErrors,
        [fieldName]: 'Format de fichier non supporté. Formats acceptés: PDF, DOCX, XLSX, PNG, JPG'
      });
      return;
    }
    
    if (file.size > maxSize) {
      setFileErrors({
        ...fileErrors,
        [fieldName]: 'Fichier trop volumineux. Taille maximale: 10MB'
      });
      return;
    }
    
    // Clear any previous errors
    if (fileErrors[fieldName]) {
      const newErrors = { ...fileErrors };
      delete newErrors[fieldName];
      setFileErrors(newErrors);
    }
    
    // Store file metadata (we can't store the actual File object in state that will be saved to localStorage)
    setValue(`documents.${fieldName}` as any, {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
  };
  
  // Check if required documents are uploaded
  const requiredDocumentsUploaded = () => {
    return documents.kbis && documents.financialStatements && 
           documents.financialForecast && documents.companyBylaws;
  };
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    // In a real app, you would save this data to your state management or API
    // and upload the files to your server or cloud storage
    navigate('/onboarding/due-diligence');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Données Financières & Due Diligence</h1>
      <p className="text-gray-600 mb-8">
        Ces informations financières et documents sont essentiels pour renforcer la crédibilité de votre projet auprès des investisseurs.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-10">
          {/* Indicateurs Financiers Clés */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Indicateurs Financiers Clés</h2>
            <div className="space-y-6">
              <div>
                <label className="form-label">Chiffre d'affaires des 3 dernières années (si existant)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label htmlFor="revenue.year1" className="text-sm text-gray-600">Année 1 (€)</label>
                    <input
                      id="revenue.year1"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.revenue?.year1 && 'border-red-500')}
                      {...register('revenue.year1', { 
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.revenue?.year1 && <p className="form-error">{errors.revenue.year1.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="revenue.year2" className="text-sm text-gray-600">Année 2 (€)</label>
                    <input
                      id="revenue.year2"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.revenue?.year2 && 'border-red-500')}
                      {...register('revenue.year2', { 
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.revenue?.year2 && <p className="form-error">{errors.revenue.year2.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="revenue.year3" className="text-sm text-gray-600">Année 3 (€)</label>
                    <input
                      id="revenue.year3"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.revenue?.year3 && 'border-red-500')}
                      {...register('revenue.year3', { 
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.revenue?.year3 && <p className="form-error">{errors.revenue.year3.message}</p>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="grossMargin" className="form-label">Marge brute (%)</label>
                  <input
                    id="grossMargin"
                    type="number"
                    min="0"
                    max="100"
                    className={clsx('input-field', errors.grossMargin && 'border-red-500')}
                    {...register('grossMargin', { 
                      min: { value: 0, message: 'La valeur doit être entre 0 et 100' },
                      max: { value: 100, message: 'La valeur doit être entre 0 et 100' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.grossMargin && <p className="form-error">{errors.grossMargin.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="ebitda" className="form-label">EBITDA (%)</label>
                  <input
                    id="ebitda"
                    type="number"
                    className={clsx('input-field', errors.ebitda && 'border-red-500')}
                    {...register('ebitda', { 
                      min: { value: -100, message: 'La valeur minimale est -100' },
                      max: { value: 100, message: 'La valeur maximale est 100' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.ebitda && <p className="form-error">{errors.ebitda.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="burnRate" className="form-label">Burn Rate mensuel (€)</label>
                  <input
                    id="burnRate"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.burnRate && 'border-red-500')}
                    {...register('burnRate', { 
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.burnRate && <p className="form-error">{errors.burnRate.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="runway" className="form-label">Runway actuel (mois)</label>
                  <input
                    id="runway"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.runway && 'border-red-500')}
                    {...register('runway', { 
                      min: { value: 0, message: 'La valeur doit être positive ou zéro' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.runway && <p className="form-error">{errors.runway.message}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Prévisions Financières */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Prévisions Financières à 3-5 ans</h2>
            <div className="space-y-6">
              <div>
                <label className="form-label">Chiffre d'affaires estimé</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label htmlFor="projectedRevenue.year1" className="text-sm text-gray-600">Année 1 (€)</label>
                    <input
                      id="projectedRevenue.year1"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.projectedRevenue?.year1 && 'border-red-500')}
                      {...register('projectedRevenue.year1', { 
                        required: 'Ce champ est requis',
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.projectedRevenue?.year1 && <p className="form-error">{errors.projectedRevenue.year1.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="projectedRevenue.year2" className="text-sm text-gray-600">Année 2 (€)</label>
                    <input
                      id="projectedRevenue.year2"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.projectedRevenue?.year2 && 'border-red-500')}
                      {...register('projectedRevenue.year2', { 
                        required: 'Ce champ est requis',
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.projectedRevenue?.year2 && <p className="form-error">{errors.projectedRevenue.year2.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="projectedRevenue.year3" className="text-sm text-gray-600">Année 3 (€)</label>
                    <input
                      id="projectedRevenue.year3"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.projectedRevenue?.year3 && 'border-red-500')}
                      {...register('projectedRevenue.year3', { 
                        required: 'Ce champ est requis',
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.projectedRevenue?.year3 && <p className="form-error">{errors.projectedRevenue.year3.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="projectedRevenue.year4" className="text-sm text-gray-600">Année 4 (€) (optionnel)</label>
                    <input
                      id="projectedRevenue.year4"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.projectedRevenue?.year4 && 'border-red-500')}
                      {...register('projectedRevenue.year4', { 
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.projectedRevenue?.year4 && <p className="form-error">{errors.projectedRevenue.year4.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="projectedRevenue.year5" className="text-sm text-gray-600">Année 5 (€) (optionnel)</label>
                    <input
                      id="projectedRevenue.year5"
                      type="number"
                      min="0"
                      className={clsx('input-field mt-1', errors.projectedRevenue?.year5 && 'border-red-500')}
                      {...register('projectedRevenue.year5', { 
                        min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                        valueAsNumber: true,
                        setValueAs: v => v === '' ? null : Number(v)
                      })}
                    />
                    {errors.projectedRevenue?.year5 && <p className="form-error">{errors.projectedRevenue.year5.message}</p>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="projectedGrossMargin" className="form-label">Marge brute prévue (%)</label>
                  <input
                    id="projectedGrossMargin"
                    type="number"
                    min="0"
                    max="100"
                    className={clsx('input-field', errors.projectedGrossMargin && 'border-red-500')}
                    {...register('projectedGrossMargin', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'La valeur doit être entre 0 et 100' },
                      max: { value: 100, message: 'La valeur doit être entre 0 et 100' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.projectedGrossMargin && <p className="form-error">{errors.projectedGrossMargin.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="projectedEbitda" className="form-label">EBITDA cible (%)</label>
                  <input
                    id="projectedEbitda"
                    type="number"
                    min="-100"
                    max="100"
                    className={clsx('input-field', errors.projectedEbitda && 'border-red-500')}
                    {...register('projectedEbitda', { 
                      required: 'Ce champ est requis',
                      min: { value: -100, message: 'La valeur minimale est -100' },
                      max: { value: 100, message: 'La valeur maximale est 100' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.projectedEbitda && <p className="form-error">{errors.projectedEbitda.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="yearlyFundingNeeds" className="form-label">Besoin en financement estimé par an (€)</label>
                  <input
                    id="yearlyFundingNeeds"
                    type="number"
                    min="0"
                    className={clsx('input-field', errors.yearlyFundingNeeds && 'border-red-500')}
                    {...register('yearlyFundingNeeds', { 
                      required: 'Ce champ est requis',
                      min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                      valueAsNumber: true,
                      setValueAs: v => v === '' ? null : Number(v)
                    })}
                  />
                  {errors.yearlyFundingNeeds && <p className="form-error">{errors.yearlyFundingNeeds.message}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Structure de l'Actionnariat */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Structure de l'Actionnariat (Cap Table)</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="form-label mb-0">Actionnaires</label>
                  <div className="flex items-center">
                    <div className={clsx(
                      'text-sm font-medium mr-4',
                      totalShareholdersPercentage === 100 ? 'text-green-600' : 'text-red-500'
                    )}>
                      Total: {totalShareholdersPercentage}%
                      {totalShareholdersPercentage !== 100 && (
                        <span className="ml-2 inline-flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {totalShareholdersPercentage < 100 ? 'Manque' : 'Excès'} {Math.abs(100 - totalShareholdersPercentage)}%
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => append({ name: '', percentage: 0, investment: 0, investorType: '' })}
                      className="flex items-center text-primary font-medium hover:text-opacity-80 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter un actionnaire
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Actionnaire {index + 1}</h3>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Nom</label>
                          <input
                            type="text"
                            className={clsx(
                              'input-field mt-1',
                              errors.shareholders?.[index]?.name && 'border-red-500'
                            )}
                            {...register(`shareholders.${index}.name` as const, {
                              required: 'Ce champ est requis'
                            })}
                          />
                          {errors.shareholders?.[index]?.name && (
                            <p className="form-error">{errors.shareholders?.[index]?.name?.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Part détenue (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className={clsx(
                              'input-field mt-1',
                              errors.shareholders?.[index]?.percentage && 'border-red-500'
                            )}
                            {...register(`shareholders.${index}.percentage` as const, {
                              required: 'Ce champ est requis',
                              min: { value: 0, message: 'La valeur doit être entre 0 et 100' },
                              max: { value: 100, message: 'La valeur doit être entre 0 et 100' },
                              valueAsNumber: true
                            })}
                          />
                          {errors.shareholders?.[index]?.percentage && (
                            <p className="form-error">{errors.shareholders?.[index]?.percentage?.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Montant investi (€)</label>
                          <input
                            type="number"
                            min="0"
                            className={clsx(
                              'input-field mt-1',
                              errors.shareholders?.[index]?.investment && 'border-red-500'
                            )}
                            {...register(`shareholders.${index}.investment` as const, {
                              required: 'Ce champ est requis',
                              min: { value: 0, message: 'Le montant doit être positif ou zéro' },
                              valueAsNumber: true
                            })}
                          />
                          {errors.shareholders?.[index]?.investment && (
                            <p className="form-error">{errors.shareholders?.[index]?.investment?.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600">Type d'investisseur</label>
                          <select
                            className={clsx(
                              'input-field mt-1',
                              errors.shareholders?.[index]?.investorType && 'border-red-500'
                            )}
                            {...register(`shareholders.${index}.investorType` as const, {
                              required: 'Ce champ est requis'
                            })}
                          >
                            <option value="">Sélectionnez une option</option>
                            <option value="Fondateur">Fondateur</option>
                            <option value="Business Angel">Business Angel</option>
                            <option value="VC">VC</option>
                            <option value="Autre">Autre</option>
                          </select>
                          {errors.shareholders?.[index]?.investorType && (
                            <p className="form-error">{errors.shareholders?.[index]?.investorType?.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {totalShareholdersPercentage !== 100 && (
                  <p className="form-error mt-3">Le total des parts doit être égal à 100%</p>
                )}
              </div>
              
              <div>
                <label htmlFor="stockOptions" className="form-label">Stock-options attribués (% du capital total)</label>
                <input
                  id="stockOptions"
                  type="number"
                  min="0"
                  max="100"
                  className={clsx('input-field w-full md:w-1/3', errors.stockOptions && 'border-red-500')}
                  {...register('stockOptions', { 
                    min: { value: 0, message: 'La valeur doit être entre 0 et 100' },
                    max: { value: 100, message: 'La valeur doit être entre 0 et 100' },
                    valueAsNumber: true,
                    setValueAs: v => v === '' ? null : Number(v)
                  })}
                />
                {errors.stockOptions && <p className="form-error">{errors.stockOptions.message}</p>}
              </div>
            </div>
          </div>
          
          {/* Documents Due Diligence */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Documents à Uploader pour la Due Diligence</h2>
            <p className="text-sm text-gray-600 mb-4">
              Formats acceptés : PDF, DOCX, XLSX, PNG, JPG. Taille maximale : 10MB par fichier.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="kbis" className="form-label">
                  K-BIS (extrait d'immatriculation de l'entreprise) <span className="text-red-500">*</span>
                </label>
                <div className={clsx(
                  'border-2 border-dashed rounded-xl p-4 transition-colors',
                  documents.kbis ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-secondary-lighter'
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      id="kbis"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, 'kbis')}
                    />
                    
                    {documents.kbis ? (
                      <div className="flex items-center text-green-600">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{documents.kbis.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(documents.kbis.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Cliquez pour uploader</span>
                      </div>
                    )}
                  </label>
                </div>
                {fileErrors.kbis && <p className="form-error mt-1">{fileErrors.kbis}</p>}
              </div>
              
              <div>
                <label htmlFor="financialStatements" className="form-label">
                  Bilan & Compte de résultat des 3 dernières années <span className="text-red-500">*</span>
                </label>
                <div className={clsx(
                  'border-2 border-dashed rounded-xl p-4 transition-colors',
                  documents.financialStatements ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-secondary-lighter'
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      id="financialStatements"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, 'financialStatements')}
                    />
                    
                    {documents.financialStatements ? (
                      <div className="flex items-center text-green-600">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{documents.financialStatements.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(documents.financialStatements.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Cliquez pour uploader</span>
                      </div>
                    )}
                  </label>
                </div>
                {fileErrors.financialStatements && <p className="form-error mt-1">{fileErrors.financialStatements}</p>}
              </div>
              
              <div>
                <label htmlFor="financialForecast" className="form-label">
                  Tableau prévisionnel financier <span className="text-red-500">*</span>
                </label>
                <div className={clsx(
                  'border-2 border-dashed rounded-xl p-4 transition-colors',
                  documents.financialForecast ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-secondary-lighter'
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      id="financialForecast"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, 'financialForecast')}
                    />
                    
                    {documents.financialForecast ? (
                      <div className="flex items-center text-green-600">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{documents.financialForecast.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(documents.financialForecast.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Cliquez pour uploader</span>
                      </div>
                    )}
                  </label>
                </div>
                {fileErrors.financialForecast && <p className="form-error mt-1">{fileErrors.financialForecast}</p>}
              </div>
              
              <div>
                <label htmlFor="companyBylaws" className="form-label">
                  Statuts de l'entreprise <span className="text-red-500">*</span>
                </label>
                <div className={clsx(
                  'border-2 border-dashed rounded-xl p-4 transition-colors',
                  documents.companyBylaws ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-secondary-lighter'
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      id="companyBylaws"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, 'companyBylaws')}
                    />
                    
                    {documents.companyBylaws ? (
                      <div className="flex items-center text-green-600">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{documents.companyBylaws.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(documents.companyBylaws.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Cliquez pour uploader</span>
                      </div>
                    )}
                  </label>
                </div>
                {fileErrors.companyBylaws && <p className="form-error mt-1">{fileErrors.companyBylaws}</p>}
              </div>
              
              <div>
                <label htmlFor="shareholderAgreement" className="form-label">
                  Pacte d'actionnaires (si existant)
                </label>
                <div className={clsx(
                  'border-2 border-dashed rounded-xl p-4 transition-colors',
                  documents.shareholderAgreement ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-secondary-lighter'
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      id="shareholderAgreement"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, 'shareholderAgreement')}
                    />
                    
                    {documents.shareholderAgreement ? (
                      <div className="flex items-center text-green-600">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{documents.shareholderAgreement.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(documents.shareholderAgreement.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Cliquez pour uploader (optionnel)</span>
                      </div>
                    )}
                  </label>
                </div>
                {fileErrors.shareholderAgreement && <p className="form-error mt-1">{fileErrors.shareholderAgreement}</p>}
              </div>
              
              <div>
                <label htmlFor="keyContracts" className="form-label">
                  Contrats clés (clients, fournisseurs, partenaires, etc.)
                </label>
                <div className={clsx(
                  'border-2 border-dashed rounded-xl p-4 transition-colors',
                  documents.keyContracts ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-secondary-lighter'
                )}>
                  <label className="flex flex-col items-center cursor-pointer">
                    <input
                      id="keyContracts"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileChange(e, 'keyContracts')}
                    />
                    
                    {documents.keyContracts ? (
                      <div className="flex items-center text-green-600">
                        <FileText className="h-5 w-5 mr-2" />
                        <span className="font-medium">{documents.keyContracts.name}</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({(documents.keyContracts.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="font-medium">Cliquez pour uploader (optionnel)</span>
                      </div>
                    )}
                  </label>
                </div>
                {fileErrors.keyContracts && <p className="form-error mt-1">{fileErrors.keyContracts}</p>}
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/onboarding/business-plan')}
              className="btn-secondary"
            >
              Retour
            </button>
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!isValid || totalShareholdersPercentage !== 100 || !requiredDocumentsUploaded()}
            >
              Continuer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FinancialsForm;