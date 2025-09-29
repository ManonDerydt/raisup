import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Building2 } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  structureName: string;
  structureType: string;
  foundationYear: number;
  website: string;
  country: string;
  city: string;
  activityZones: string[];
  targetSectors: string[];
  startupStages: string[];
  teamSize: string;
};

const StructureInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const [autoSaveStatus, setAutoSaveStatus] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      structureName: '',
      structureType: '',
      foundationYear: new Date().getFullYear(),
      website: '',
      country: 'France',
      city: '',
      activityZones: [],
      targetSectors: [],
      startupStages: [],
      teamSize: '',
    }
  });
  
  const activityZones = watch('activityZones');
  const targetSectors = watch('targetSectors');
  const startupStages = watch('startupStages');
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('b2bStructureFormData');
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
        localStorage.setItem('b2bStructureFormData', JSON.stringify(value));
        setAutoSaveStatus('Sauvegardé');
        
        const timer = setTimeout(() => {
          setAutoSaveStatus(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);
  
  const onSubmit = (data: FormData) => {
    console.log(data);
    navigate('/register/b2b/financials');
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Building2 className="h-6 w-6 text-primary dark:text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold dark:text-white">Informations sur votre structure</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Présentez votre structure d'accompagnement pour que nous puissions adapter notre plateforme à vos besoins.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          {/* Informations de base */}
          <div>
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="structureName" className="form-label">Nom de la structure</label>
                <input
                  id="structureName"
                  type="text"
                  className={clsx('input-field', errors.structureName && 'border-red-500')}
                  placeholder="Nom de votre incubateur, accélérateur, etc."
                  {...register('structureName', { required: 'Ce champ est requis' })}
                />
                {errors.structureName && <p className="form-error">{errors.structureName.message}</p>}
              </div>
              
              <div>
                <label htmlFor="structureType" className="form-label">Type de structure</label>
                <select
                  id="structureType"
                  className={clsx('input-field', errors.structureType && 'border-red-500')}
                  {...register('structureType', { required: 'Ce champ est requis' })}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="Incubateur">Incubateur</option>
                  <option value="Accélérateur">Accélérateur</option>
                  <option value="Fonds d'investissement">Fonds d'investissement</option>
                  <option value="CCI">Chambre de Commerce et d'Industrie</option>
                  <option value="Pépinière d'entreprises">Pépinière d'entreprises</option>
                  <option value="Cabinet de conseil">Cabinet de conseil</option>
                  <option value="Organisme public">Organisme public</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.structureType && <p className="form-error">{errors.structureType.message}</p>}
              </div>
              
              <div>
                <label htmlFor="foundationYear" className="form-label">Année de création</label>
                <input
                  id="foundationYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className={clsx('input-field', errors.foundationYear && 'border-red-500')}
                  {...register('foundationYear', { 
                    required: 'Ce champ est requis',
                    min: { value: 1900, message: 'Année invalide' },
                    max: { value: new Date().getFullYear(), message: 'Année invalide' },
                    valueAsNumber: true
                  })}
                />
                {errors.foundationYear && <p className="form-error">{errors.foundationYear.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="website" className="form-label">Site web</label>
                <input
                  id="website"
                  type="url"
                  className={clsx('input-field', errors.website && 'border-red-500')}
                  placeholder="https://votre-structure.com"
                  {...register('website', { 
                    required: 'Ce champ est requis',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'URL invalide'
                    }
                  })}
                />
                {errors.website && <p className="form-error">{errors.website.message}</p>}
              </div>
              
              <div>
                <label htmlFor="country" className="form-label">Pays</label>
                <select
                  id="country"
                  className={clsx('input-field', errors.country && 'border-red-500')}
                  {...register('country', { required: 'Ce champ est requis' })}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Allemagne">Allemagne</option>
                  <option value="Royaume-Uni">Royaume-Uni</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.country && <p className="form-error">{errors.country.message}</p>}
              </div>
              
              <div>
                <label htmlFor="city" className="form-label">Ville principale</label>
                <input
                  id="city"
                  type="text"
                  className={clsx('input-field', errors.city && 'border-red-500')}
                  placeholder="Paris, Lyon, etc."
                  {...register('city', { required: 'Ce champ est requis' })}
                />
                {errors.city && <p className="form-error">{errors.city.message}</p>}
              </div>
            </div>
          </div>
          
          {/* Zones d'activité */}
          <div>
            <label className="form-label">Zones d'activité</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {['France', 'Europe', 'International'].map((zone) => (
                <label key={zone} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={zone}
                    className="sr-only"
                    {...register('activityZones', { required: 'Sélectionnez au moins une zone' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    activityZones?.includes(zone)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {activityZones?.includes(zone) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="dark:text-gray-300">{zone}</span>
                </label>
              ))}
            </div>
            {errors.activityZones && <p className="form-error mt-1">{errors.activityZones.message}</p>}
          </div>
          
          {/* Secteurs cibles */}
          <div>
            <label className="form-label">Secteurs cibles</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {[
                'Fintech', 'Healthtech', 'Edtech', 'Proptech', 'Foodtech', 
                'Greentech', 'SaaS', 'E-commerce', 'AI/ML', 'IoT', 
                'Blockchain', 'Cybersécurité'
              ].map((sector) => (
                <label key={sector} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={sector}
                    className="sr-only"
                    {...register('targetSectors', { required: 'Sélectionnez au moins un secteur' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    targetSectors?.includes(sector)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {targetSectors?.includes(sector) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-sm dark:text-gray-300">{sector}</span>
                </label>
              ))}
            </div>
            {errors.targetSectors && <p className="form-error mt-1">{errors.targetSectors.message}</p>}
          </div>
          
          {/* Stades des startups */}
          <div>
            <label className="form-label">Stades des startups accompagnées</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {['Idée', 'Pré-seed', 'Seed', 'Série A', 'Série B+', 'Scale-up'].map((stage) => (
                <label key={stage} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={stage}
                    className="sr-only"
                    {...register('startupStages', { required: 'Sélectionnez au moins un stade' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    startupStages?.includes(stage)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {startupStages?.includes(stage) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-sm dark:text-gray-300">{stage}</span>
                </label>
              ))}
            </div>
            {errors.startupStages && <p className="form-error mt-1">{errors.startupStages.message}</p>}
          </div>
          
          {/* Taille de l'équipe */}
          <div>
            <label htmlFor="teamSize" className="form-label">Taille de l'équipe</label>
            <select
              id="teamSize"
              className={clsx('input-field', errors.teamSize && 'border-red-500')}
              {...register('teamSize', { required: 'Ce champ est requis' })}
            >
              <option value="">Sélectionnez une taille</option>
              <option value="1-5">1-5 personnes</option>
              <option value="6-10">6-10 personnes</option>
              <option value="11-25">11-25 personnes</option>
              <option value="26-50">26-50 personnes</option>
              <option value="50+">Plus de 50 personnes</option>
            </select>
            {errors.teamSize && <p className="form-error">{errors.teamSize.message}</p>}
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
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

export default StructureInfoForm;