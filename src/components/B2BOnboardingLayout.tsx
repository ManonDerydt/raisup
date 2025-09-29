import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ProgressBar from './ProgressBar';

const steps = [
  { id: 'structure', label: 'Structure', path: '/register/b2b/structure' },
  { id: 'financials', label: 'Financier', path: '/register/b2b/financials' },
  { id: 'objectives', label: 'Objectifs', path: '/register/b2b/objectives' },
  { id: 'contact', label: 'Contact', path: '/register/b2b/contact' },
  { id: 'validation', label: 'Validation', path: '/register/b2b/validation' },
];

const B2BOnboardingLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const currentStepIndex = steps.findIndex(step => step.path === currentPath);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-secondary-lighter" />
            <span className="font-semibold text-lg dark:text-white">Raisup</span>
          </Link>
          <Link to="/register" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-purple-400 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au choix de profil
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <ProgressBar progress={progress} />
          
          <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`${
                  index <= currentStepIndex ? 'text-primary dark:text-purple-400 font-medium' : ''
                }`}
              >
                {step.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="card dark:bg-gray-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default B2BOnboardingLayout;