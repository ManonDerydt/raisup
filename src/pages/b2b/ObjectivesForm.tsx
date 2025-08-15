import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, Target, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  mainObjectives: string[];
  targetStartupTypes: string[];
  eliminatoryCriteria: string;
  collaborationFormats: string[];
};

const ObjectivesForm: React.FC = () => {
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
      mainObjectives: [],
      targetStartupTypes: [],
      eliminatoryCriteria: '',
      collaborationFormats: [],
    }
  });
  
  const mainObjectives = watch('mainObjectives');
  const targetStartupTypes = watch('targetStartupTypes');
  const collaborationFormats = watch('collaborationFormats');
  const eliminatoryCriteria = watch('eliminatoryCriteria');
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('b2bObjectivesFormData');
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
        localStorage.setItem('b2bObjectivesFormData', JSON.stringify(value));
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
    navigate('/register/b2b/contact');
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Target className="h-6 w-6 text-primary dark:text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold dark:text-white">Objectifs et collaboration</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Définissez vos objectifs et préférences pour optimiser votre utilisation de la plateforme.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          {/* Objectifs principaux */}
          <div>
            <label className="form-label">Objectifs principaux en rejoignant la plateforme</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {[
                'Sourcing de startups',
                'Screening automatisé',
                'Gain de temps',
                'Analyse IA avancée',
                'Suivi de portefeuille',
                'Reporting automatisé',
                'Mise en réseau',
                'Due diligence assistée'
              ].map((objective) => (
                <label key={objective} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={objective}
                    className="sr-only"
                    {...register('mainObjectives', { required: 'Sélectionnez au moins un objectif' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    mainObjectives?.includes(objective)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {mainObjectives?.includes(objective) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-sm dark:text-gray-300">{objective}</span>
                </label>
              ))}
            </div>
            {errors.mainObjectives && <p className="form-error mt-1">{errors.mainObjectives.message}</p>}
          </div>
          
          {/* Types de startups recherchées */}
          <div>
            <label className="form-label">Types de startups recherchées</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {[
                'Startups B2B',
                'Startups B2C',
                'Deep Tech',
                'Impact/ESG',
                'Hardware',
                'Software',
                'Marketplace',
                'SaaS'
              ].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={type}
                    className="sr-only"
                    {...register('targetStartupTypes', { required: 'Sélectionnez au moins un type' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    targetStartupTypes?.includes(type)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {targetStartupTypes?.includes(type) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-sm dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
            {errors.targetStartupTypes && <p className="form-error mt-1">{errors.targetStartupTypes.message}</p>}
          </div>
          
          {/* Critères éliminatoires */}
          <div>
            <label htmlFor="eliminatoryCriteria" className="form-label">
              Critères éliminatoires
            </label>
            <textarea
              id="eliminatoryCriteria"
              rows={4}
              className={clsx('input-field resize-none', errors.eliminatoryCriteria && 'border-red-500')}
              maxLength={500}
              placeholder="Décrivez les critères qui vous feraient automatiquement rejeter une startup (ex: secteurs exclus, localisation, etc.)"
              {...register('eliminatoryCriteria', { 
                required: 'Ce champ est requis',
                maxLength: { value: 500, message: 'Maximum 500 caractères' }
              })}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{errors.eliminatoryCriteria && errors.eliminatoryCriteria.message}</span>
              <span>{eliminatoryCriteria?.length || 0}/500</span>
            </div>
          </div>
          
          {/* Formats de collaboration */}
          <div>
            <label className="form-label">Formats de collaboration préférés</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {[
                'Accès plateforme en libre-service',
                'Alertes personnalisées',
                'Matching IA automatique',
                'Reporting mensuel',
                'Sessions de formation',
                'Support dédié',
                'API intégration',
                'Événements networking'
              ].map((format) => (
                <label key={format} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={format}
                    className="sr-only"
                    {...register('collaborationFormats', { required: 'Sélectionnez au moins un format' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    collaborationFormats?.includes(format)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {collaborationFormats?.includes(format) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-sm dark:text-gray-300">{format}</span>
                </label>
              ))}
            </div>
            {errors.collaborationFormats && <p className="form-error mt-1">{errors.collaborationFormats.message}</p>}
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/register/b2b/financials')}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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

export default ObjectivesForm;