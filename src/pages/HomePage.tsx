import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const HomePage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Using placeholder logos - replace with actual logo URLs when available
  const Logo = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop&crop=center";
  const LogoWhite = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop&crop=center&blend=ffffff&blend-mode=overlay";

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* <Sparkles className="h-6 w-6 text-secondary-lighter" />
            <span className="font-semibold text-xl">HELO</span> */}
            <img src={Logo}  alt="Logo" className="h-20  w-auto"/>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">Accueil</a>
            <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">Tarifs</Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-primary transition-colors">Comment ça marche</Link>
            <Link to="/login" className="text-primary font-medium hover:text-opacity-80 transition-colors">Connexion</Link>
          </nav>
          <button 
            className="md:hidden text-gray-700 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-2">
            
              <img src={Logo}  alt="Logo" className="h-20  w-auto"/>
              </div>
              <button 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              <a 
                href="#" 
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </a>
              <Link 
                to="/pricing" 
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tarifs
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-gray-900 font-medium text-lg hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link 
                to="/login" 
                className="text-primary font-medium text-lg hover:text-opacity-80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main>

        <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
    <h1 className="text-5xl md:text-7xl  mb-8 max-w-3xl leading-relaxed md:leading-tight">
      Your funding copilot<br />
      <span className="block mt-4">powered by AI</span>
    </h1>
    <p className="text-xl text-gray-600 mb-10 max-w-2xl">
      Une plateforme structurée pour optimiser votre dossier de financement et maximiser vos chances de succès.
    </p>
    {/* <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <Link 
        to="/login"
        className="btn-primary flex items-center justify-center px-8 py-3 rounded-full text-lg font-semibold"
      >
        B2B
      </Link>
      <Link 
        to="/login"
        className="btn-secondary flex items-center justify-center px-8 py-3 rounded-full text-lg font-semibold"
      >
        B2C
      </Link>
    </div> */}
    <div className="flex flex-col sm:flex-row gap-4">
      <Link 
        to="/onboarding/entrepreneur" 
        className="btn-primary flex items-center justify-center"
      >
        Démarrer mon dossier
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
      <Link 
        to="/login" 
        className="btn-secondary bg-[#d3efdd] flex items-center justify-center"
      >
        Connexion
      </Link>
    </div>
  </section>
        
        </main>
        
      <footer className="bg-black text-white pt-16 pb-6 px-4 mt-0">
    <div className="max-w-7xl mx-auto">
      {/* Lignes de liens */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-10 pb-10 border-b border-gray-800">
        {/* Logo et colonne gauche */}
        <div className="mb-8 md:mb-0 flex-shrink-0">
          <img src={LogoWhite}  alt="Logo" className="h-20  w-auto"/>
        </div>
        {/* Liens */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-grow">
          <div>
            <div className="font-semibold mb-3">Produit</div>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>Confiance</li>
              <li>QG de l’IA</li>
              <li>AI Studio</li>
              <li>Graphique RAG</li>
              <li>Masters de droit de Palmyre</li>
              <li>Essayez gratuitement</li>
              <li>Demander une démo</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Ressources</div>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>Guides</li>
              <li>Blog sur l’IA</li>
              <li>Bibliothèque d’agents d’IA</li>
              <li>Blog d’ingénierie</li>
              <li>Agents d’IA d’entreprise</li>
              <li>Détecteur de contenu IA</li>
              <li>IA générative pour le commerce de détail</li>
              <li>IA générative pour l’assurance</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Entreprise</div>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>À propos</li>
              <li>Carrières</li>
              <li>Partenaires</li>
              <li>Pôle juridique</li>
              <li>Rédaction</li>
              <li>Contactez-nous</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Soutien</div>
            <ul className="space-y-1 text-sm text-gray-200">
              <li>Statut</li>
              <li>Centre d’aide</li>
              <li>Académie d’IA</li>
              <li>Documentation du développeur</li>
            </ul>
          </div>
        </div>
    </div>

    {/* Newsletter */}
    <div className="pt-8 pb-2 border-b border-gray-800 mt-8">
      <div className="text-base font-semibold mb-2">Recevez les dernières mises à jour sur l’IA d’entreprise</div>
      <div className="text-sm text-gray-300 mb-1">Abonnez-vous à Writer’s Brief</div>
      {/* (Zone d’inscription optionnelle ici) */}
    </div>

    {/* Lignes du bas */}
    <div className="flex flex-col md:flex-row md:justify-between items-center gap-6 pt-8">
      <div className="text-xs text-gray-400">
        © 2025 ÉCRIVAIN
      </div>
      <div className="flex items-center gap-3">
        <a href="#" aria-label="LinkedIn" className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 transition">
          <svg className="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.7 0-5 2.3-5 5v14c0 2.7 2.3 5 5 5h14c2.7 0 5-2.3 5-5v-14C24 2.3 21.7 0 19 0zM7.1 20H3.6V9h3.4v11zm-1.7-12.3C4.1 7.7 4 7.3 4 6.8c0-.5.1-.9.4-1.3.3-.3.8-.5 1.4-.5s1.1.2 1.4.5c.3.3.5.8.5 1.3s-.2 1-.5 1.3c-.3.3-.8.5-1.4.5zm14.2 12.4h-3.5v-5c0-1.2 0-2.7-1.6-2.7s-1.8 1.2-1.8 2.5v5.2H8.9V9h3.3v1.5h.1c.4-.8 1.2-1.6 2.5-1.6 2.7 0 3.2 1.8 3.2 4v6.1h-.1z"/></svg>
        </a>
        <a href="#" aria-label="X / Twitter" className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 transition">
          <svg className="w-5 h-5" fill="currentColor" aria-hidden="true"><path d="M19.6 2H4.4C3 2 2 3.2 2 4.8v14.4C2 20.8 3 22 4.4 22h15.2c1.4 0 2.4-1.2 2.4-2.8V4.8C22 3.2 21 2 19.6 2zm-3.5 13H8.9V9h7.2v6zm-1.5-.5l-2.2-2.2-2.2 2.2V9h4.4v5.5z"/></svg>
        </a>
        <a href="#" aria-label="Gérer les paramètres" className="p-2 rounded-full bg-gray-900 hover:bg-gray-800 transition text-xs font-bold">G</a>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2 text-xs text-gray-400">
        <a href="#" className="hover:underline">GÉRER LES PARAMÈTRES</a>
        <span className="hidden md:inline">|</span>
        <a href="#" className="hover:underline">TERMES</a>
        <span className="hidden md:inline">|</span>
        <a href="#" className="hover:underline">CONFIDENTIALITÉ</a>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
};

export default HomePage;