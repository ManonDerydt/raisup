import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard, 
  LogOut, 
  Check, 
  X, 
  Save, 
  Edit, 
  ChevronRight, 
  Shield, 
  Smartphone, 
  Globe, 
  Moon, 
  Sun
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import clsx from 'clsx';

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: 'Marie Dupont',
    email: 'marie.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    company: 'MediScan SAS',
    position: 'CEO & Co-fondatrice',
    language: 'Français',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });
  
  // Subscription plan state
  const [subscription, setSubscription] = useState({
    plan: 'Pro',
    price: '99€/mois',
    billingCycle: 'Mensuel',
    nextBilling: '15 avril 2025',
    features: [
      'Génération illimitée de documents',
      'Accès à tous les modèles de financement',
      'Assistance IA personnalisée',
      'Suivi de levée de fonds',
      'Mise en relation avec des investisseurs'
    ]
  });
  
  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: {
      updates: true,
      investorMessages: true,
      documentGeneration: true,
      weeklyDigest: false
    },
    sms: {
      investorMessages: true,
      importantUpdates: false
    },
    app: {
      allNotifications: true,
      soundAlerts: false
    }
  });
  
  // Check if dark mode is enabled
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    setTimeout(() => {
      setEditMode(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 500);
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (
    category: 'email' | 'sms' | 'app', 
    setting: string, 
    value: boolean
  ) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, this would handle logout logic
    window.location.href = '/';
  };
  
  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  return (
    <div className={clsx(
      "py-8 px-4 sm:px-6 lg:px-8",
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Paramètres
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Gérez votre compte et vos préférences
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleToggleDarkMode}
              className={clsx(
                "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                darkMode 
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              )}
            >
              {darkMode ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Mode clair
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Mode sombre
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm overflow-hidden",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className={clsx(
              "flex border-b",
              darkMode ? "border-gray-700" : "border-gray-200"
            )}>
              <TabsList className={clsx(
                "flex p-0 bg-transparent",
                darkMode ? "bg-gray-800" : "bg-white"
              )}>
                <TabsTrigger 
                  value="profile" 
                  className={clsx(
                    "flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'profile'
                      ? darkMode 
                        ? "border-purple-500 text-purple-400" 
                        : "border-primary text-primary"
                      : darkMode 
                        ? "border-transparent text-gray-400 hover:text-gray-300" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger 
                  value="subscription" 
                  className={clsx(
                    "flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'subscription'
                      ? darkMode 
                        ? "border-purple-500 text-purple-400" 
                        : "border-primary text-primary"
                      : darkMode 
                        ? "border-transparent text-gray-400 hover:text-gray-300" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Abonnement
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className={clsx(
                    "flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'notifications'
                      ? darkMode 
                        ? "border-purple-500 text-purple-400" 
                        : "border-primary text-primary"
                      : darkMode 
                        ? "border-transparent text-gray-400 hover:text-gray-300" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className={clsx(
                    "flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'security'
                      ? darkMode 
                        ? "border-purple-500 text-purple-400" 
                        : "border-primary text-primary"
                      : darkMode 
                        ? "border-transparent text-gray-400 hover:text-gray-300" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sécurité
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className={clsx(
                    "text-lg font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Informations personnelles
                  </h2>
                  
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={clsx(
                      "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      editMode
                        ? darkMode 
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : darkMode 
                          ? "bg-purple-600 text-white hover:bg-purple-700" 
                          : "bg-primary text-white hover:bg-opacity-90"
                    )}
                  >
                    {editMode ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Annuler
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </>
                    )}
                  </button>
                </div>
                
                {saveSuccess && (
                  <div className={clsx(
                    "p-3 rounded-lg flex items-start",
                    darkMode ? "bg-green-900/30 text-green-300" : "bg-green-50 text-green-800"
                  )}>
                    <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Vos informations ont été mises à jour avec succès.</span>
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <div className="relative">
                        <img 
                          src={userProfile.avatar} 
                          alt={userProfile.name} 
                          className="w-32 h-32 rounded-full object-cover"
                        />
                        {editMode && (
                          <button
                            type="button"
                            className={clsx(
                              "absolute bottom-0 right-0 p-2 rounded-full",
                              darkMode ? "bg-gray-700 text-gray-300" : "bg-white text-gray-700 border border-gray-200"
                            )}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className={clsx(
                        "mt-4 text-center",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        <p className="font-medium">{userProfile.name}</p>
                        <p className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {userProfile.position}
                        </p>
                        <p className={clsx(
                          "text-sm",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {userProfile.company}
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label 
                            htmlFor="name" 
                            className={clsx(
                              "block text-sm font-medium mb-1",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            Nom complet
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                            disabled={!editMode}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg border transition-colors",
                              !editMode && "bg-opacity-50",
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500" 
                                : "bg-white border-gray-300 text-gray-900 focus:border-primary",
                              !editMode && (darkMode ? "bg-gray-800" : "bg-gray-50")
                            )}
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="email" 
                            className={clsx(
                              "block text-sm font-medium mb-1",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                            disabled={!editMode}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg border transition-colors",
                              !editMode && "bg-opacity-50",
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500" 
                                : "bg-white border-gray-300 text-gray-900 focus:border-primary",
                              !editMode && (darkMode ? "bg-gray-800" : "bg-gray-50")
                            )}
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="phone" 
                            className={clsx(
                              "block text-sm font-medium mb-1",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            Téléphone
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={userProfile.phone}
                            onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                            disabled={!editMode}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg border transition-colors",
                              !editMode && "bg-opacity-50",
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500" 
                                : "bg-white border-gray-300 text-gray-900 focus:border-primary",
                              !editMode && (darkMode ? "bg-gray-800" : "bg-gray-50")
                            )}
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="company" 
                            className={clsx(
                              "block text-sm font-medium mb-1",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            Entreprise
                          </label>
                          <input
                            id="company"
                            type="text"
                            value={userProfile.company}
                            onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                            disabled={!editMode}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg border transition-colors",
                              !editMode && "bg-opacity-50",
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500" 
                                : "bg-white border-gray-300 text-gray-900 focus:border-primary",
                              !editMode && (darkMode ? "bg-gray-800" : "bg-gray-50")
                            )}
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="position" 
                            className={clsx(
                              "block text-sm font-medium mb-1",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            Poste
                          </label>
                          <input
                            id="position"
                            type="text"
                            value={userProfile.position}
                            onChange={(e) => setUserProfile({...userProfile, position: e.target.value})}
                            disabled={!editMode}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg border transition-colors",
                              !editMode && "bg-opacity-50",
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500" 
                                : "bg-white border-gray-300 text-gray-900 focus:border-primary",
                              !editMode && (darkMode ? "bg-gray-800" : "bg-gray-50")
                            )}
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="language" 
                            className={clsx(
                              "block text-sm font-medium mb-1",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}
                          >
                            Langue
                          </label>
                          <select
                            id="language"
                            value={userProfile.language}
                            onChange={(e) => setUserProfile({...userProfile, language: e.target.value})}
                            disabled={!editMode}
                            className={clsx(
                              "w-full px-3 py-2 rounded-lg border transition-colors",
                              !editMode && "bg-opacity-50",
                              darkMode 
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500" 
                                : "bg-white border-gray-300 text-gray-900 focus:border-primary",
                              !editMode && (darkMode ? "bg-gray-800" : "bg-gray-50")
                            )}
                          >
                            <option value="Français">Français</option>
                            <option value="English">English</option>
                          </select>
                        </div>
                      </div>
                      
                      {editMode && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className={clsx(
                              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                              darkMode 
                                ? "bg-purple-600 text-white hover:bg-purple-700" 
                                : "bg-primary text-white hover:bg-opacity-90"
                            )}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Enregistrer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6">
                <div>
                  <h2 className={clsx(
                    "text-lg font-medium mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Votre abonnement
                  </h2>
                  
                  <div className={clsx(
                    "p-4 rounded-xl border-2",
                    darkMode 
                      ? "bg-gray-700 border-purple-800/30" 
                      : "bg-gray-50 border-secondary-lighter/30"
                  )}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className={clsx(
                            "text-xl font-semibold",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Plan {subscription.plan}
                          </h3>
                          <span className={clsx(
                            "ml-2 px-2 py-0.5 text-xs font-medium rounded-full",
                            darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                          )}>
                            Actif
                          </span>
                        </div>
                        <p className={clsx(
                          "mt-1",
                          darkMode ? "text-gray-300" : "text-gray-700"
                        )}>
                          {subscription.price} • Facturation {subscription.billingCycle.toLowerCase()}
                        </p>
                        <p className={clsx(
                          "text-sm mt-1",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          Prochaine facturation: {subscription.nextBilling}
                        </p>
                      </div>
                      
                      <button className={clsx(
                        "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                        darkMode 
                          ? "bg-gray-600 text-white hover:bg-gray-500" 
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      )}>
                        Changer de plan
                      </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h4 className={clsx(
                        "text-sm font-medium mb-2",
                        darkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        Fonctionnalités incluses:
                      </h4>
                      <ul className="space-y-2">
                        {subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className={clsx(
                              "h-4 w-4 mr-2 flex-shrink-0",
                              darkMode ? "text-green-400" : "text-green-500"
                            )} />
                            <span className={clsx(
                              "text-sm",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className={clsx(
                    "text-lg font-medium mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Historique de paiement
                  </h2>
                  
                  <div className={clsx(
                    "rounded-lg border overflow-hidden",
                    darkMode ? "border-gray-700" : "border-gray-200"
                  )}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className={clsx(
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <tr>
                          <th scope="col" className={clsx(
                            "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            Date
                          </th>
                          <th scope="col" className={clsx(
                            "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            Montant
                          </th>
                          <th scope="col" className={clsx(
                            "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            Statut
                          </th>
                          <th scope="col" className={clsx(
                            "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )}>
                            Facture
                          </th>
                        </tr>
                      </thead>
                      <tbody className={clsx(
                        "divide-y",
                        darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"
                      )}>
                        {[
                          { date: '15 mars 2025', amount: '99,00 €', status: 'Payé' },
                          { date: '15 février 2025', amount: '99,00 €', status: 'Payé' },
                          { date: '15 janvier 2025', amount: '99,00 €', status: 'Payé' }
                        ].map((payment, index) => (
                          <tr key={index}>
                            <td className={clsx(
                              "px-4 py-3 text-sm",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {payment.date}
                            </td>
                            <td className={clsx(
                              "px-4 py-3 text-sm",
                              darkMode ? "text-gray-300" : "text-gray-700"
                            )}>
                              {payment.amount}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={clsx(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
                              )}>
                                {payment.status}
                              </span>
                            </td>
                            <td className={clsx(
                              "px-4 py-3 text-sm text-right",
                              darkMode ? "text-purple-400" : "text-primary"
                            )}>
                              <button className="hover:underline">Télécharger</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h2 className={clsx(
                    "text-lg font-medium mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Méthode de paiement
                  </h2>
                  
                  <div className={clsx(
                    "p-4 rounded-lg border",
                    darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                  )}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={clsx(
                          "w-10 h-6 rounded mr-3 flex items-center justify-center",
                          darkMode ? "bg-gray-600" : "bg-white"
                        )}>
                          <CreditCard className={clsx(
                            "h-4 w-4",
                            darkMode ? "text-gray-300" : "text-gray-700"
                          )} />
                        </div>
                        <div>
                          <p className={clsx(
                            "font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Visa •••• 4242
                          </p>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Expire le 12/2026
                          </p>
                        </div>
                      </div>
                      
                      <button className={clsx(
                        "text-sm font-medium hover:underline",
                        darkMode ? "text-purple-400" : "text-primary"
                      )}>
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h2 className={clsx(
                    "text-lg font-medium mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Préférences de notification
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-4">
                        <Mail className={clsx(
                          "h-5 w-5 mr-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                        <h3 className={clsx(
                          "text-md font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          Notifications par email
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { id: 'updates', label: 'Mises à jour de la plateforme' },
                          { id: 'investorMessages', label: 'Messages des investisseurs' },
                          { id: 'documentGeneration', label: 'Génération de documents' },
                          { id: 'weeklyDigest', label: 'Résumé hebdomadaire' }
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <label 
                              htmlFor={`email-${item.id}`}
                              className={clsx(
                                "text-sm",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}
                            >
                              {item.label}
                            </label>
                            <button
                              type="button"
                              id={`email-${item.id}`}
                              onClick={() => handleNotificationToggle('email', item.id, !notifications.email[item.id as keyof typeof notifications.email])}
                              className={clsx(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                notifications.email[item.id as keyof typeof notifications.email]
                                  ? darkMode ? "bg-purple-600" : "bg-primary"
                                  : darkMode ? "bg-gray-600" : "bg-gray-300"
                              )}
                            >
                              <span
                                className={clsx(
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  notifications.email[item.id as keyof typeof notifications.email] ? "translate-x-6" : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-4">
                        <Smartphone className={clsx(
                          "h-5 w-5 mr-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                        <h3 className={clsx(
                          "text-md font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          Notifications par SMS
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { id: 'investorMessages', label: 'Messages des investisseurs' },
                          { id: 'importantUpdates', label: 'Mises à jour importantes' }
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <label 
                              htmlFor={`sms-${item.id}`}
                              className={clsx(
                                "text-sm",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}
                            >
                              {item.label}
                            </label>
                            <button
                              type="button"
                              id={`sms-${item.id}`}
                              onClick={() => handleNotificationToggle('sms', item.id, !notifications.sms[item.id as keyof typeof notifications.sms])}
                              className={clsx(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                notifications.sms[item.id as keyof typeof notifications.sms]
                                  ? darkMode ? "bg-purple-600" : "bg-primary"
                                  : darkMode ? "bg-gray-600" : "bg-gray-300"
                              )}
                            >
                              <span
                                className={clsx(
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  notifications.sms[item.id as keyof typeof notifications.sms] ? "translate-x-6" : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-4">
                        <Bell className={clsx(
                          "h-5 w-5 mr-2",
                          darkMode ? "text-gray-400" : "text-gray-500"
                        )} />
                        <h3 className={clsx(
                          "text-md font-medium",
                          darkMode ? "text-white" : "text-gray-900"
                        )}>
                          Notifications dans l'application
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { id: 'allNotifications', label: 'Toutes les notifications' },
                          { id: 'soundAlerts', label: 'Alertes sonores' }
                        ].map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <label 
                              htmlFor={`app-${item.id}`}
                              className={clsx(
                                "text-sm",
                                darkMode ? "text-gray-300" : "text-gray-700"
                              )}
                            >
                              {item.label}
                            </label>
                            <button
                              type="button"
                              id={`app-${item.id}`}
                              onClick={() => handleNotificationToggle('app', item.id, !notifications.app[item.id as keyof typeof notifications.app])}
                              className={clsx(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                notifications.app[item.id as keyof typeof notifications.app]
                                  ? darkMode ? "bg-purple-600" : "bg-primary"
                                  : darkMode ? "bg-gray-600" : "bg-gray-300"
                              )}
                            >
                              <span
                                className={clsx(
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                  notifications.app[item.id as keyof typeof notifications.app] ? "translate-x-6" : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div>
                  <h2 className={clsx(
                    "text-lg font-medium mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Sécurité du compte
                  </h2>
                  
                  <div className="space-y-4">
                    <div className={clsx(
                      "p-4 rounded-lg border",
                      darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={clsx(
                            "text-md font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Mot de passe
                          </h3>
                          <p className={clsx(
                            "text-sm mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Dernière modification il y a 3 mois
                          </p>
                        </div>
                        
                        <button className={clsx(
                          "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                          darkMode 
                            ? "bg-gray-600 text-white hover:bg-gray-500" 
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        )}>
                          Changer
                        </button>
                      </div>
                    </div>
                    
                    <div className={clsx(
                      "p-4 rounded-lg border",
                      darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={clsx(
                            "text-md font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Authentification à deux facteurs
                          </h3>
                          <p className={clsx(
                            "text-sm mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Ajoute une couche de sécurité supplémentaire à votre compte
                          </p>
                        </div>
                        
                        <button
                          className={clsx(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                            darkMode ? "bg-gray-600" : "bg-gray-300"
                          )}
                        >
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={clsx(
                      "p-4 rounded-lg border",
                      darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={clsx(
                            "text-md font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Sessions actives
                          </h3>
                          <p className={clsx(
                            "text-sm mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Vous êtes actuellement connecté sur 2 appareils
                          </p>
                        </div>
                        
                        <button className={clsx(
                          "text-sm font-medium hover:underline",
                          darkMode ? "text-purple-400" : "text-primary"
                        )}>
                          Gérer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className={clsx(
                    "text-lg font-medium mb-4",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Confidentialité des données
                  </h2>
                  
                  <div className="space-y-4">
                    <div className={clsx(
                      "p-4 rounded-lg border",
                      darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={clsx(
                            "text-md font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Télécharger mes données
                          </h3>
                          <p className={clsx(
                            "text-sm mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Recevez une copie de toutes vos données personnelles
                          </p>
                        </div>
                        
                        <button className={clsx(
                          "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                          darkMode 
                            ? "bg-gray-600 text-white hover:bg-gray-500" 
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        )}>
                          Télécharger
                        </button>
                      </div>
                    </div>
                    
                    <div className={clsx(
                      "p-4 rounded-lg border",
                      darkMode ? "border-gray-700 bg-gray-700" : "border-gray-200 bg-gray-50"
                    )}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={clsx(
                            "text-md font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            Supprimer mon compte
                          </h3>
                          <p className={clsx(
                            "text-sm mt-1",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            Supprime définitivement votre compte et toutes vos données
                          </p>
                        </div>
                        
                        <button className={clsx(
                          "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                          "bg-red-600 text-white hover:bg-red-700"
                        )}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className={clsx(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              darkMode 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            )}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;