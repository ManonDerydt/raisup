import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ProgressBar from './ProgressBar';

const steps = [
  { id: 'entrepreneur', label: 'Entrepreneur', path: '/onboarding/entrepreneur' },
  { id: 'entreprise', label: 'Entreprise', path: '/onboarding/entreprise' },
  { id: 'business-plan', label: 'Business Plan', path: '/onboarding/business-plan' },
  { id: 'financials', label: 'Rapport Financier', path: '/onboarding/financials' },
  { id: 'due-diligence', label: 'Due Diligence', path: '/onboarding/due-diligence' },
  { id: 'finalisation', label: 'Finalisation', path: '/onboarding/finalisation' },
];

const OnboardingLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Don't show progress bar on success page
  const isSuccessPage = currentPath === '/onboarding/success';
  
  const currentStepIndex = steps.findIndex(step => step.path === currentPath);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-secondary-lighter" />
            <span className="font-semibold text-lg">FundAI</span>
          </Link>
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {!isSuccessPage && (
          <div className="mb-8">
            <ProgressBar progress={progress} />
            
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`${
                    index <= currentStepIndex ? 'text-primary font-medium' : ''
                  }`}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className={isSuccessPage ? '' : 'card'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;