import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Eye,
  Zap,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Building2
} from 'lucide-react';
import clsx from 'clsx';

const B2BDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);
  
  // Mock data for B2B dashboard
  const portfolioData = {
    totalStartups: 24,
    totalFundingRequested: 18500000,
    dilutivePercentage: 65,
    nonDilutivePercentage: 35,
    activeAlerts: 7,
    recentDiagnostics: 18
  };
  
  const startups = [
    {
      id: 1,
      name: 'MediScan SAS',
      sector: 'Healthtech',
      status: 'Levée en cours',
      lastDiagnostic: '2025-01-10',
      alerts: ['Aide BPI expire dans 15j'],
      fundingRequested: 750000,
      responsible: 'Marie Dupont',
      stage: 'Seed'
    },
    {
      id: 2,
      name: 'GreenTech Solutions',
      sector: 'Greentech',
      status: 'En accompagnement',
      lastDiagnostic: '2025-01-08',
      alerts: [],
      fundingRequested: 1200000,
      responsible: 'Thomas Martin',
      stage: 'Série A'
    },
    {
      id: 3,
      name: 'EduAI Platform',
      sector: 'Edtech',
      status: 'Levée terminée',
      lastDiagnostic: '2024-12-15',
      alerts: ['Diagnostic à mettre à jour'],
      fundingRequested: 500000,
      responsible: 'Sophie Leroy',
      stage: 'Pré-seed'
    },
    {
      id: 4,
      name: 'FinanceBot',
      sector: 'Fintech',
      status: 'En attente',
      lastDiagnostic: '2025-01-05',
      alerts: [],
      fundingRequested: 2000000,
      responsible: 'Pierre Dubois',
      stage: 'Série A'
    },
    {
      id: 5,
      name: 'PropTech Innovations',
      sector: 'Proptech',
      status: 'Levée en cours',
      lastDiagnostic: '2025-01-12',
      alerts: ['Échéance due diligence'],
      fundingRequested: 850000,
      responsible: 'Julie Bernard',
      stage: 'Seed'
    }
  ];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Levée en cours':
        return darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'En accompagnement':
        return darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
      case 'Levée terminée':
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
      case 'En attente':
        return darkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-800';
      default:
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className={clsx(
      "py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto",
      darkMode ? "text-white" : "text-gray-900"
    )}>
      {/* Welcome banner */}
      <div className={clsx(
        "rounded-xl shadow-sm p-6 mb-8",
        darkMode ? "bg-gray-800" : "bg-white"
      )}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={clsx(
              "text-2xl font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Dashboard Structure - Tech Incubator Paris
            </h1>
            <p className={clsx(
              "mt-1",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Gérez votre portefeuille de startups et optimisez vos accompagnements.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button className={clsx(
              "btn-secondary flex items-center justify-center",
              darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : ""
            )}>
              <FileText className="h-5 w-5 mr-2" />
              Synthèse d'aides
            </button>
            <button className={clsx(
              "btn-primary flex items-center justify-center",
              darkMode ? "bg-purple-600 hover:bg-purple-700" : ""
            )}>
              <Plus className="h-5 w-5 mr-2" />
              Ajouter une startup
            </button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center">
            <div className={clsx(
              "rounded-full p-2 mr-3",
              darkMode ? "bg-purple-900/30" : "bg-secondary-light"
            )}>
              <Building2 className={clsx(
                "h-5 w-5",
                darkMode ? "text-purple-400" : "text-primary"
              )} />
            </div>
            <div>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Startups suivies
              </p>
              <p className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {portfolioData.totalStartups}
              </p>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center">
            <div className={clsx(
              "rounded-full p-2 mr-3",
              darkMode ? "bg-green-900/30" : "bg-green-100"
            )}>
              <DollarSign className={clsx(
                "h-5 w-5",
                darkMode ? "text-green-400" : "text-green-600"
              )} />
            </div>
            <div>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Montant cumulé
              </p>
              <p className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {formatCurrency(portfolioData.totalFundingRequested)}
              </p>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center">
            <div className={clsx(
              "rounded-full p-2 mr-3",
              darkMode ? "bg-blue-900/30" : "bg-blue-100"
            )}>
              <Target className={clsx(
                "h-5 w-5",
                darkMode ? "text-blue-400" : "text-blue-600"
              )} />
            </div>
            <div>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Mix financement
              </p>
              <p className={clsx(
                "text-lg font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {portfolioData.dilutivePercentage}% / {portfolioData.nonDilutivePercentage}%
              </p>
              <p className={clsx(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Dilutif / Non dilutif
              </p>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center">
            <div className={clsx(
              "rounded-full p-2 mr-3",
              darkMode ? "bg-amber-900/30" : "bg-amber-100"
            )}>
              <AlertTriangle className={clsx(
                "h-5 w-5",
                darkMode ? "text-amber-400" : "text-amber-600"
              )} />
            </div>
            <div>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Alertes actives
              </p>
              <p className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {portfolioData.activeAlerts}
              </p>
            </div>
          </div>
        </div>
        
        <div className={clsx(
          "rounded-xl shadow-sm p-6",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex items-center">
            <div className={clsx(
              "rounded-full p-2 mr-3",
              darkMode ? "bg-teal-900/30" : "bg-teal-100"
            )}>
              <CheckCircle className={clsx(
                "h-5 w-5",
                darkMode ? "text-teal-400" : "text-teal-600"
              )} />
            </div>
            <div>
              <p className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                Diagnostics récents
              </p>
              <p className={clsx(
                "text-2xl font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                {portfolioData.recentDiagnostics}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Startups table - takes 3 columns */}
        <div className="lg:col-span-3">
          <div className={clsx(
            "rounded-xl shadow-sm overflow-hidden",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  Portefeuille de startups
                </h2>
                <div className="flex items-center gap-2">
                  <select className={clsx(
                    "text-sm border rounded-lg px-3 py-1",
                    darkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}>
                    <option>Tous les statuts</option>
                    <option>Levée en cours</option>
                    <option>En accompagnement</option>
                    <option>Levée terminée</option>
                  </select>
                  <button className={clsx(
                    "btn-primary text-sm px-3 py-1",
                    darkMode ? "bg-purple-600 hover:bg-purple-700" : ""
                  )}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={clsx(
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                )}>
                  <tr>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Startup
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Secteur
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Statut
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Dernier diagnostic
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Montant recherché
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Responsable
                    </th>
                    <th scope="col" className={clsx(
                      "px-6 py-3 text-right text-xs font-medium uppercase tracking-wider",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={clsx(
                  "divide-y",
                  darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"
                )}>
                  {startups.map((startup) => (
                    <tr key={startup.id} className={clsx(
                      "hover:bg-opacity-50 transition-colors",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    )}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            {startup.name}
                          </div>
                          <div className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {startup.stage}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                        )}>
                          {startup.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getStatusColor(startup.status)
                        )}>
                          {startup.status}
                        </span>
                        {startup.alerts.length > 0 && (
                          <div className="mt-1">
                            {startup.alerts.map((alert, index) => (
                              <div key={index} className={clsx(
                                "text-xs px-2 py-1 rounded-full inline-flex items-center",
                                darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-800"
                              )}>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {alert}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={clsx(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        darkMode ? "text-gray-300" : "text-gray-500"
                      )}>
                        {formatDate(startup.lastDiagnostic)}
                      </td>
                      <td className={clsx(
                        "px-6 py-4 whitespace-nowrap text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {formatCurrency(startup.fundingRequested)}
                      </td>
                      <td className={clsx(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        darkMode ? "text-gray-300" : "text-gray-500"
                      )}>
                        {startup.responsible}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className={clsx(
                              "p-1 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )}
                            title="Ouvrir fiche projet"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className={clsx(
                              "p-1 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-purple-400 hover:bg-gray-700" 
                                : "text-gray-500 hover:text-primary hover:bg-gray-100"
                            )}
                            title="Lancer diagnostic IA"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                          <button
                            className={clsx(
                              "p-1 rounded-full transition-colors",
                              darkMode 
                                ? "text-gray-400 hover:text-white hover:bg-gray-700" 
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )}
                            title="Générer rapport"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - takes 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Actions rapides
            </h3>
            
            <div className="space-y-3">
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <Plus className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Ajouter une startup</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Nouveau projet à accompagner
                  </p>
                </div>
              </button>
              
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <FileText className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Synthèse d'aides</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Aides disponibles et échéances
                  </p>
                </div>
              </button>
              
              <button className={clsx(
                "w-full flex items-center p-3 rounded-lg text-left transition-colors",
                darkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-900"
              )}>
                <BarChart3 className="h-5 w-5 mr-3 text-primary dark:text-purple-400" />
                <div>
                  <p className="font-medium">Rapport stratégique</p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    Performance du portefeuille
                  </p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Active Alerts */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={clsx(
                "text-lg font-semibold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Alertes prioritaires
              </h3>
              <span className={clsx(
                "text-sm",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {portfolioData.activeAlerts} actives
              </span>
            </div>
            
            <div className="space-y-3">
              {[
                {
                  startup: 'MediScan SAS',
                  alert: 'Aide BPI expire dans 15j',
                  type: 'warning',
                  urgency: 'high'
                },
                {
                  startup: 'EduAI Platform',
                  alert: 'Diagnostic à mettre à jour',
                  type: 'info',
                  urgency: 'medium'
                },
                {
                  startup: 'PropTech Innovations',
                  alert: 'Échéance due diligence',
                  type: 'warning',
                  urgency: 'high'
                }
              ].map((alert, index) => (
                <div key={index} className={clsx(
                  "p-3 rounded-lg border-l-4 transition-colors cursor-pointer",
                  alert.type === 'warning'
                    ? darkMode 
                      ? "border-amber-500 bg-amber-900/10 hover:bg-amber-900/20" 
                      : "border-amber-400 bg-amber-50 hover:bg-amber-100"
                    : darkMode 
                      ? "border-blue-500 bg-blue-900/10 hover:bg-blue-900/20" 
                      : "border-blue-400 bg-blue-50 hover:bg-blue-100"
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={clsx(
                        "text-sm font-medium",
                        darkMode ? "text-white" : "text-gray-900"
                      )}>
                        {alert.startup}
                      </p>
                      <p className={clsx(
                        "text-xs mt-1",
                        alert.type === 'warning'
                          ? darkMode ? "text-amber-300" : "text-amber-700"
                          : darkMode ? "text-blue-300" : "text-blue-700"
                      )}>
                        {alert.alert}
                      </p>
                    </div>
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full",
                      alert.urgency === 'high'
                        ? darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
                        : darkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-100 text-amber-700"
                    )}>
                      {alert.urgency === 'high' ? 'Urgent' : 'Moyen'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={clsx(
              "w-full mt-4 text-sm font-medium hover:underline",
              darkMode ? "text-purple-400" : "text-primary"
            )}>
              Voir toutes les alertes
            </button>
          </div>
          
          {/* Recent Activity */}
          <div className={clsx(
            "rounded-xl shadow-sm p-6",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h3 className={clsx(
              "text-lg font-semibold mb-4",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Activité récente
            </h3>
            
            <div className="space-y-3">
              {[
                {
                  action: 'Diagnostic IA généré',
                  startup: 'GreenTech Solutions',
                  time: '2 heures',
                  icon: Zap
                },
                {
                  action: 'Rapport téléchargé',
                  startup: 'MediScan SAS',
                  time: '5 heures',
                  icon: Download
                },
                {
                  action: 'Fiche projet mise à jour',
                  startup: 'FinanceBot',
                  time: '1 jour',
                  icon: FileText
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className={clsx(
                    "rounded-full p-2 mr-3",
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  )}>
                    <activity.icon className={clsx(
                      "h-4 w-4",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={clsx(
                      "text-sm",
                      darkMode ? "text-white" : "text-gray-900"
                    )}>
                      {activity.action}
                    </p>
                    <p className={clsx(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {activity.startup} • Il y a {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;