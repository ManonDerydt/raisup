import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check, BarChart3, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  averageTicket: number;
  portfolioSize: number;
  fundedStages: string[];
  newStartupsPerYear: number;
  annualBudget: number | null;
};

const FinancialsForm: React.FC = () => {
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
      averageTicket: 0,
      portfolioSize: 0,
      fundedStages: [],
      newStartupsPerYear: 0,
      annualBudget: null,
    }
  });
  
  const fundedStages = watch('fundedStages');
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('b2bFinancialsFormData');
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
        localStorage.setItem('b2bFinancialsFormData', JSON.stringify(value));
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
    navigate('/register/b2b/objectives');
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <BarChart3 className="h-6 w-6 text-primary dark:text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold dark:text-white">Informations financières et opérationnelles</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Ces informations nous aident à comprendre votre modèle d'accompagnement et vos capacités d'investissement.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="averageTicket" className="form-label">Ticket moyen investi ou montant d'accompagnement (€)</label>
              <input
                id="averageTicket"
                type="number"
                min="0"
                className={clsx('input-field', errors.averageTicket && 'border-red-500')}
                placeholder="50000"
                {...register('averageTicket', { 
                  required: 'Ce champ est requis',
                  min: { value: 0, message: 'Le montant doit être positif' },
                  valueAsNumber: true
                })}
              />
              {errors.averageTicket && <p className="form-error">{errors.averageTicket.message}</p>}
            </div>
            
            <div>
              <label htmlFor="portfolioSize" className="form-label">Taille du portefeuille actuel (nombre de startups)</label>
              <input
                id="portfolioSize"
                type="number"
                min="0"
                className={clsx('input-field', errors.portfolioSize && 'border-red-500')}
                placeholder="25"
                {...register('portfolioSize', { 
                  required: 'Ce champ est requis',
                  min: { value: 0, message: 'Le nombre doit être positif' },
                  valueAsNumber: true
                })}
              />
              {errors.portfolioSize && <p className="form-error">{errors.portfolioSize.message}</p>}
            </div>
            
            <div>
              <label htmlFor="newStartupsPerYear" className="form-label">Nouvelles startups accompagnées/investies par an</label>
              <input
                id="newStartupsPerYear"
                type="number"
                min="0"
                className={clsx('input-field', errors.newStartupsPerYear && 'border-red-500')}
                placeholder="10"
                {...register('newStartupsPerYear', { 
                  required: 'Ce champ est requis',
                  min: { value: 0, message: 'Le nombre doit être positif' },
                  valueAsNumber: true
                })}
              />
              {errors.newStartupsPerYear && <p className="form-error">{errors.newStartupsPerYear.message}</p>}
            </div>
            
            <div>
              <label htmlFor="annualBudget" className="form-label">Budget annuel dédié (€) - Optionnel</label>
              <input
                id="annualBudget"
                type="number"
                min="0"
                className={clsx('input-field', errors.annualBudget && 'border-red-500')}
                placeholder="1000000"
                {...register('annualBudget', { 
                  min: { value: 0, message: 'Le montant doit être positif' },
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : Number(v)
                })}
              />
              {errors.annualBudget && <p className="form-error">{errors.annualBudget.message}</p>}
            </div>
          </div>
          
          {/* Stades financés/accompagnés */}
          <div>
            <label className="form-label">Stades financés/accompagnés</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-2">
              {['Idée', 'Pré-seed', 'Seed', 'Série A', 'Série B', 'Série C+'].map((stage) => (
                <label key={stage} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value={stage}
                    className="sr-only"
                    {...register('fundedStages', { required: 'Sélectionnez au moins un stade' })}
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border flex items-center justify-center mr-2',
                    fundedStages?.includes(stage)
                      ? 'border-secondary-lighter bg-secondary-light' 
                      : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {fundedStages?.includes(stage) && (
                      <Check className="h-3 w-3 text-primary dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-sm dark:text-gray-300">{stage}</span>
                </label>
              ))}
            </div>
            {errors.fundedStages && <p className="form-error mt-1">{errors.fundedStages.message}</p>}
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/register/b2b/structure')}
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

export default FinancialsForm;