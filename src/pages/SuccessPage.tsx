import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, Users, FileText } from 'lucide-react';

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
        <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Félicitations !</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Votre dossier d'investissement a été généré avec succès et est prêt à être partagé avec des investisseurs potentiels.
        </p>
        
        <div className="bg-secondary-light dark:bg-purple-900/30 p-6 rounded-xl mb-8">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">Votre dossier en chiffres</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-primary dark:text-purple-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">24 pages</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dossier complet</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-primary dark:text-purple-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">5 sections</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Structurées</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary dark:text-purple-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">100%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Prêt pour les investisseurs</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link to="/dashboard" className="btn-primary w-full flex items-center justify-center">
            Accéder à mon tableau de bord
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          
          <Link to="/" className="btn-secondary w-full flex items-center justify-center">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;