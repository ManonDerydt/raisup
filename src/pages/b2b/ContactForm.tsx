import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  linkedinUrl: string;
};

const ContactForm: React.FC = () => {
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
      fullName: '',
      role: '',
      email: '',
      phone: '',
      linkedinUrl: '',
    }
  });
  
  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('b2bContactFormData');
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
        localStorage.setItem('b2bContactFormData', JSON.stringify(value));
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
    navigate('/register/b2b/validation');
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <User className="h-6 w-6 text-primary dark:text-purple-400 mr-3" />
        <h1 className="text-2xl font-bold dark:text-white">Contact référent</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Renseignez les informations de la personne qui sera le contact principal pour votre structure.
      </p>
      
      {autoSaveStatus && (
        <div className="fixed top-4 right-4 bg-secondary-light text-primary px-4 py-2 rounded-xl text-sm font-medium transition-opacity duration-300">
          {autoSaveStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="form-label">Nom complet</label>
              <input
                id="fullName"
                type="text"
                className={clsx('input-field', errors.fullName && 'border-red-500')}
                placeholder="Jean Dupont"
                {...register('fullName', { required: 'Ce champ est requis' })}
              />
              {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label htmlFor="role" className="form-label">Rôle ou fonction</label>
              <input
                id="role"
                type="text"
                className={clsx('input-field', errors.role && 'border-red-500')}
                placeholder="Directeur, Responsable investissement, etc."
                {...register('role', { required: 'Ce champ est requis' })}
              />
              {errors.role && <p className="form-error">{errors.role.message}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="form-label">Email professionnel</label>
              <input
                id="email"
                type="email"
                className={clsx('input-field', errors.email && 'border-red-500')}
                placeholder="jean.dupont@structure.com"
                {...register('email', { 
                  required: 'Ce champ est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide'
                  }
                })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="form-label">Numéro de téléphone</label>
              <input
                id="phone"
                type="tel"
                className={clsx('input-field', errors.phone && 'border-red-500')}
                placeholder="+33 1 23 45 67 89"
                {...register('phone', { 
                  required: 'Ce champ est requis',
                  pattern: {
                    value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                    message: 'Numéro de téléphone invalide'
                  }
                })}
              />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="linkedinUrl" className="form-label">Profil LinkedIn (optionnel)</label>
              <input
                id="linkedinUrl"
                type="url"
                className={clsx('input-field', errors.linkedinUrl && 'border-red-500')}
                placeholder="https://linkedin.com/in/votre-profil"
                {...register('linkedinUrl', {
                  pattern: {
                    value: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
                    message: 'URL LinkedIn invalide'
                  }
                })}
              />
              {errors.linkedinUrl && <p className="form-error">{errors.linkedinUrl.message}</p>}
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button 
              type="button"
              onClick={() => navigate('/register/b2b/objectives')}
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

export default ContactForm;