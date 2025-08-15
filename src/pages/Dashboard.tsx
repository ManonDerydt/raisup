import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Bell, 
  ChevronRight,
  Mail,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data
  const companyData = {
    name: 'MediScan SAS',
    industry: 'Healthtech',
    stage: 'Seed',
    fundingGoal: '750 000 €',
    progress: 15, // percentage
    raised: '112 500 €',
    investors: {
      contacted: 12,
      interested: 3,
      meetings: 2,
      committed: 1
    },
    kpis: [
      { 
        name: 'Taux de réponse', 
        value: '42%', 
        change: 8, 
        trend: 'up' 
      },
      { 
        name: 'Taux de conversion', 
        value: '25%', 
        change: -3, 
        trend: 'down' 
      },
      { 
        name: 'Temps moyen de réponse', 
        value: '3.2 jours', 
        change: -12, 
        trend: 'up' 
      },
      { 
        name: 'Score de préparation', 
        value: '78/100', 
        change: 5, 
        trend: 'up' 
      }
    ],
    upcomingMeetings: [
      {
        id: 1,
        investor: 'Venture Capital Partners',
        date: '2025-03-15T14:00:00',
        type: 'Visioconférence'
      },
      {
        id: 2,
        investor: 'Innovation Fund',
        date: '2025-03-18T10:30:00',
        type: 'En personne'
      }
    ],
    recentActivities: [
      {
        id: 1,
        type: 'document_viewed',
        investor: 'Tech Accelerator',
        document: 'Pitch Deck',
        time: '2 heures'
      },
      {
        id: 2,
        type: 'message_received',
        investor: 'Venture Capital Partners',
        message: 'Questions sur votre modèle financier',
        time: '5 heures'
      },
      {
        id: 3,
        type: 'meeting_scheduled',
        investor: 'Innovation Fund',
        date: '2025-03-18T10:30:00',
        time: '1 jour'
      }
    ]
  };
  
  const todoItems = [
    {
      id: 1,
      title: 'Compléter votre profil financier',
      description: 'Ajoutez vos prévisions financières pour les 3 prochaines années',
      priority: 'high',
      completed: false
    },
    {
      id: 2,
      title: 'Ajouter votre équipe',
      description: 'Présentez les membres clés de votre équipe et leurs compétences',
      priority: 'medium',
      completed: false
    },
    {
      id: 3,
      title: 'Mettre à jour votre pitch deck',
      description: 'Intégrez les retours des dernières présentations',
      priority: 'medium',
      completed: true
    },
    {
      id: 4,
      title: 'Répondre aux messages',
      description: '2 investisseurs attendent votre réponse',
      priority: 'high',
      completed: false
    }
  ];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bienvenue sur votre tableau de bord
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Suivez l'avancement de votre levée de fonds et gérez vos interactions avec les investisseurs.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button className="btn-secondary flex items-center justify-center">
              <FileText className="h-5 w-5 mr-2" />
              Voir mon dossier
            </button>
            <button className="btn-primary flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              Contacter des investisseurs
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Funding progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Progression de votre levée
              </h2>
              <span className="text-sm font-medium text-primary dark:text-purple-400">
                {companyData.progress}% de l'objectif
              </span>
            </div>
            
            <div className="mb-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary dark:bg-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${companyData.progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Montant levé</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyData.raised}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400">Objectif</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{companyData.fundingGoal}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Contactés</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{companyData.investors.contacted}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Intéressés</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{companyData.investors.interested}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Rendez-vous</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{companyData.investors.meetings}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Engagés</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{companyData.investors.committed}</p>
              </div>
            </div>
          </div>
          
          {/* KPIs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Indicateurs clés
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {companyData.kpis.map((kpi, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{kpi.name}</span>
                    <div className={clsx(
                      "flex items-center text-xs font-medium",
                      kpi.trend === 'up' 
                        ? kpi.name.includes('Temps') ? 'text-red-500' : 'text-green-500'
                        : kpi.name.includes('Temps') ? 'text-green-500' : 'text-red-500'
                    )}>
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tabs for activities and meetings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  className={clsx(
                    "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'overview'
                      ? "border-primary dark:border-purple-500 text-primary dark:text-purple-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => setActiveTab('overview')}
                >
                  Activités récentes
                </button>
                <button
                  className={clsx(
                    "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'meetings'
                      ? "border-primary dark:border-purple-500 text-primary dark:text-purple-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => setActiveTab('meetings')}
                >
                  Rendez-vous à venir
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {companyData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                      <div className={clsx(
                        "rounded-full p-2 mr-3 flex-shrink-0",
                        activity.type === 'document_viewed' 
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : activity.type === 'message_received'
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      )}>
                        {activity.type === 'document_viewed' && <FileText className="h-5 w-5" />}
                        {activity.type === 'message_received' && <Mail className="h-5 w-5" />}
                        {activity.type === 'meeting_scheduled' && <Calendar className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {activity.investor}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Il y a {activity.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {activity.type === 'document_viewed' && `A consulté votre ${activity.document}`}
                          {activity.type === 'message_received' && `A envoyé: "${activity.message}"`}
                          {activity.type === 'meeting_scheduled' && `Rendez-vous prévu le ${formatDate(activity.date)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-2">
                    <button className="text-sm font-medium text-primary dark:text-purple-400 hover:underline">
                      Voir toutes les activités
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'meetings' && (
                <div className="space-y-4">
                  {companyData.upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                      <div className="rounded-full bg-secondary-light dark:bg-purple-900/30 p-2 mr-3 flex-shrink-0">
                        <Calendar className="h-5 w-5 text-primary dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {meeting.investor}
                          </p>
                          <span className="text-xs bg-secondary-light dark:bg-purple-900/30 text-primary dark:text-purple-300 px-2 py-1 rounded-full">
                            {meeting.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {formatDate(meeting.date)}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button className="text-xs font-medium text-primary dark:text-purple-400 hover:underline">
                            Voir les détails
                          </button>
                          <button className="text-xs font-medium text-primary dark:text-purple-400 hover:underline">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-2">
                    <button className="text-sm font-medium text-primary dark:text-purple-400 hover:underline">
                      Voir tous les rendez-vous
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-8">
          {/* Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Checklist des actions
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {todoItems.filter(item => item.completed).length}/{todoItems.length} complétées
              </span>
            </div>
            
            <div className="space-y-3">
              {todoItems.map((item) => (
                <div 
                  key={item.id} 
                  className={clsx(
                    "p-3 rounded-lg border transition-colors",
                    item.completed 
                      ? "border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10" 
                      : item.priority === 'high'
                        ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <div className={clsx(
                        "w-5 h-5 rounded-full border flex items-center justify-center",
                        item.completed 
                          ? "border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400" 
                          : "border-gray-300 dark:border-gray-600"
                      )}>
                        {item.completed && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={clsx(
                        "font-medium",
                        item.completed 
                          ? "text-gray-500 dark:text-gray-400 line-through" 
                          : "text-gray-900 dark:text-white"
                      )}>
                        {item.title}
                      </p>
                      <p className={clsx(
                        "text-sm mt-1",
                        item.completed 
                          ? "text-gray-400 dark:text-gray-500 line-through" 
                          : "text-gray-600 dark:text-gray-300"
                      )}>
                        {item.description}
                      </p>
                      {!item.completed && (
                        <button className="text-xs font-medium text-primary dark:text-purple-400 hover:underline mt-2">
                          Commencer
                        </button>
                      )}
                    </div>
                    {item.priority === 'high' && !item.completed && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full">
                        Prioritaire
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-sm font-medium text-primary dark:text-purple-400 hover:underline flex items-center justify-center">
              Voir toutes les actions
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {/* Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ressources utiles
            </h2>
            
            <div className="space-y-3">
              {[
                {
                  title: 'Guide de la levée de fonds',
                  description: 'Les étapes clés pour réussir votre levée',
                  icon: FileText
                },
                {
                  title: 'Modèles de documents',
                  description: 'Pitch deck, business plan, etc.',
                  icon: FileText
                },
                {
                  title: 'Webinaire: Pitcher efficacement',
                  description: 'Enregistrement du 12 mars 2025',
                  icon: Calendar
                }
              ].map((resource, index) => (
                <a 
                  key={index}
                  href="#"
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="rounded-full bg-secondary-light dark:bg-purple-900/30 p-2 mr-3 flex-shrink-0">
                      <resource.icon className="h-5 w-5 text-primary dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {resource.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {resource.description}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-auto" />
                  </div>
                </a>
              ))}
            </div>
            
            <button className="w-full mt-4 text-sm font-medium text-primary dark:text-purple-400 hover:underline flex items-center justify-center">
              Voir toutes les ressources
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;