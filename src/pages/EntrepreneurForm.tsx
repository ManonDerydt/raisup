import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import clsx from 'clsx';

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  hasFundraised: string;
  amountRaised: number | null;
  entrepreneurTime: string;
  industry: string;
  coFoundersCount: number;
  fundraisingReason: string;
  biggestChallenge: string;
};

const EntrepreneurForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      hasFundraised: '',
      amountRaised: null,
      entrepreneurTime: '',
      industry: '',
      coFoundersCount: 1,
      fundraisingReason: '',
      biggestChallenge: '',
    }
  });
  
  const hasFundraised = watch('hasFundraised');
  
  // Mock industry suggestions for autocomplete
  const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.length > 2) {
      // Mock AI suggestions based on input
      const mockSuggestions = [
        'SaaS', 'Fintech', 'E-commerce', 'Healthtech', 'Edtech', 
        'Proptech', 'Foodtech', 'Greentech', 'AI & Machine Learning',
        'Blockchain', 'IoT', 'Marketplace'
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
    navigate('/onboarding/entreprise');
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Parlez-nous de vous</h1>
      <p className="text-gray-600 mb-8">
        Ces informations nous aideront à mieux comprendre votre profil d'entrepreneur.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          {/* Identité & Contact */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Identité & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="form-label">Nom complet</label>
                <input
                  id="fullName"
                  type="text"
                  className={clsx('input-field', errors.fullName && 'border-red-500')}
                  {...register('fullName', { required: 'Ce champ est requis' })}
                />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className={clsx('input-field', errors.email && 'border-red-500')}
                  {...register('email', { 
                    required: 'Ce champ est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse email invalide'
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
              
              <div>
                <label htmlFor="linkedinUrl" className="form-label">Lien LinkedIn (optionnel)</label>
                <input
                  id="linkedinUrl"
                  type="url"
                  className="input-field"
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
          </div>
          
          {/* Expérience & Contexte */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Expérience & Contexte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Avez-vous déjà levé des fonds ?</label>
                <div className="flex space-x-4 mt-2">
                  {['Oui', 'Non', 'En cours'].map((option) => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={option}
                        className="sr-only"
                        {...register('hasFundraised', { required: 'Ce champ est requis' })}
                      />
                      <div className={clsx(
                        'w-5 h-5 rounded-full border flex items-center justify-center mr-2',
                        hasFundraised === option 
                          ? 'border-secondary-lighter bg-secondary-light' 
                          : 'border-gray-300'
                      )}>
                        {hasFundraised === option && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.hasFundraised && <p className="form-error">{errors.hasFundraised.message}</p>}
              </div>
              
              {(hasFundraised === 'Oui' || hasFundraised === 'En cours') && (
                <div>
                  <label htmlFor="amountRaised" className="form-label">Montant levé (en €)</label>
                  <input
                    id="amountRaised"
                    type="number"
                    className={clsx('input-field', errors.amountRaised && 'border-red-500')}
                    {...register('amountRaised', { 
                      required: 'Ce champ est requis',
                      min: { value: 1, message: 'Le montant doit être positif' }
                    })}
                  />
                  {errors.amountRaised && <p className="form-error">{errors.amountRaised.message}</p>}
                </div>
              )}
              
              <div>
                <label htmlFor="entrepreneurTime" className="form-label">Temps en tant qu'entrepreneur</label>
                <select
                  id="entrepreneurTime"
                  className={clsx('input-field', errors.entrepreneurTime && 'border-red-500')}
                  {...register('entrepreneurTime', { required: 'Ce champ est requis' })}
                >
                  <option value="">Sélectionnez une option</option>
                  <option value="<1 an">Moins d'1 an</option>
                  <option value="1-3 ans">1-3 ans</option>
                  <option value="3-5 ans">3-5 ans</option>
                  <option value="5+ ans">Plus de 5 ans</option>
                </select>
                {errors.entrepreneurTime && <p className="form-error">{errors.entrepreneurTime.message}</p>}
              </div>
              
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
                <label htmlFor="coFoundersCount" className="form-label">Nombre de co-fondateurs</label>
                <input
                  id="coFoundersCount"
                  type="number"
                  min="0"
                  className={clsx('input-field', errors.coFoundersCount && 'border-red-500')}
                  {...register('coFoundersCount', { 
                    required: 'Ce champ est requis',
                    min: { value: 0, message: 'Le nombre doit être positif ou zéro' }
                  })}
                />
                {errors.coFoundersCount && <p className="form-error">{errors.coFoundersCount.message}</p>}
              </div>
            </div>
          </div>
          
          {/* Objectifs & Vision */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Objectifs & Vision</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="fundraisingReason" className="form-label">
                  Pourquoi cherchez-vous à lever des fonds ?
                </label>
                <textarea
                  id="fundraisingReason"
                  rows={4}
                  className={clsx('input-field resize-none', errors.fundraisingReason && 'border-red-500')}
                  maxLength={500}
                  {...register('fundraisingReason', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 500, message: 'Maximum 500 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.fundraisingReason && errors.fundraisingReason.message}</span>
                  <span>{watch('fundraisingReason')?.length || 0}/500</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="biggestChallenge" className="form-label">
                  Quel est votre plus grand défi actuellement ?
                </label>
                <textarea
                  id="biggestChallenge"
                  rows={3}
                  className={clsx('input-field resize-none', errors.biggestChallenge && 'border-red-500')}
                  maxLength={300}
                  {...register('biggestChallenge', { 
                    required: 'Ce champ est requis',
                    maxLength: { value: 300, message: 'Maximum 300 caractères' }
                  })}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.biggestChallenge && errors.biggestChallenge.message}</span>
                  <span>{watch('biggestChallenge')?.length || 0}/300</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end">
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

export default EntrepreneurForm;