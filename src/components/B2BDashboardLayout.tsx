import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut,
  Moon,
  Sun,
  Building2,
  Calculator,
  TrendingUp,
  Briefcase,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Eye,
  UserPlus,
  Shield,
  Target,
  Globe,
  PieChart,
  Activity
} from 'lucide-react';
import clsx from 'clsx';

const B2BDashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [agencyProfile, setAgencyProfile] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('raisup_agency_profile');
      if (raw) setAgencyProfile(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const agencyName = agencyProfile.name || agencyProfile.agencyName || 'Mon agence';
  const responsableName =
    agencyProfile.responsable_first_name && agencyProfile.responsable_last_name
      ? `${agencyProfile.responsable_first_name} ${agencyProfile.responsable_last_name}`
      : agencyProfile.firstName && agencyProfile.lastName
      ? `${agencyProfile.firstName} ${agencyProfile.lastName}`
      : agencyProfile.responsable || 'Responsable';
  const agencyEmail = agencyProfile.email || '';
  const agencyType = agencyProfile.type || agencyProfile.agencyType || 'Structure partenaire';
  const initials = agencyName.substring(0, 2).toUpperCase();

  const [notifications, setNotifications] = useState<{
    id: string; title: string; message: string; time: string;
    unread: boolean; type: string; priority: string; category: string;
  }[]>([]);

  useEffect(() => {
    const load = async () => {
      // Resolve agency id: try local first, then email lookup, then most recent
      let agencyId: string | null =
        agencyProfile.id || agencyProfile.supabase_id || null;

      if (!agencyId) {
        const email = agencyProfile.email;
        const query = email
          ? supabase.from('agency_accounts').select('id').eq('email', email).single()
          : supabase.from('agency_accounts').select('id').order('created_at', { ascending: false }).limit(1).single();
        const { data: agency } = await query;
        if (agency) {
          agencyId = agency.id;
          // Persist so next render is instant
          localStorage.setItem('raisup_agency_profile',
            JSON.stringify({ ...agencyProfile, id: agency.id }));
        }
      }

      console.log('[Notifs] agencyId resolved:', agencyId);
      if (!agencyId) return;

      const { data: reqs, error } = await supabase
        .from('partner_requests')
        .select('id, startup_name, founder_name, created_at')
        .eq('agency_id', agencyId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('[Notifs] partner_requests:', reqs, error);
      if (!reqs?.length) return;

      setNotifications(reqs.map(r => {
        const diffH = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 3600000);
        const timeLabel = diffH < 1 ? 'À l\'instant' : diffH < 24 ? `${diffH}h` : `${Math.floor(diffH / 24)}j`;
        return {
          id: r.id,
          title: 'Nouvelle demande d\'accompagnement',
          message: `${r.startup_name} (${r.founder_name}) souhaite rejoindre votre structure.`,
          time: timeLabel,
          unread: true,
          type: 'new_request',
          priority: 'high',
          category: 'Demandes',
        };
      }));
    };

    // Run once profile is loaded (has at least a name)
    if (agencyProfile.name || agencyProfile.email || agencyProfile.id) load();
  }, [agencyProfile.id, agencyProfile.email, agencyProfile.name]);

  const mainNavItems = [
    { 
      name: 'Vue d\'ensemble', 
      icon: LayoutDashboard, 
      href: '/dashboard/b2b',
      description: 'KPIs et synthèse globale'
    },
    { 
      name: 'Portefeuille Startups', 
      icon: Briefcase, 
      href: '/dashboard/b2b/portfolio',
      description: 'Gestion et suivi des projets'
    },
    { 
      name: 'Synthèse d\'aides', 
      icon: FileText, 
      href: '/dashboard/b2b/funding-synthesis',
      description: 'Aides et subventions'
    },
    { 
      name: 'Rapports Stratégiques', 
      icon: PieChart, 
      href: '/dashboard/b2b/reports',
      description: 'Reporting et exports'
    },
    { 
      name: 'Paramètres', 
      icon: Settings, 
      href: '/dashboard/b2b/settings',
      description: 'Configuration structure'
    }
  ];
  
  const handleLogout = () => {
    navigate('/');
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_request':
        return <UserPlus className="h-4 w-4" />;
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4" />;
      case 'success':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return darkMode ? "bg-red-900/20 border-red-800/30" : "bg-red-50 border-red-200";
    }
    
    switch (type) {
      case 'deadline':
        return darkMode ? "bg-amber-900/20 border-amber-800/30" : "bg-amber-50 border-amber-200";
      case 'risk':
        return darkMode ? "bg-red-900/20 border-red-800/30" : "bg-red-50 border-red-200";
      case 'opportunity':
        return darkMode ? "bg-blue-900/20 border-blue-800/30" : "bg-blue-50 border-blue-200";
      case 'success':
        return darkMode ? "bg-green-900/20 border-green-800/30" : "bg-green-50 border-green-200";
      default:
        return darkMode ? "bg-purple-900/20 border-purple-800/30" : "bg-secondary-light/30 border-secondary-lighter";
    }
  };
  
  // Count high priority notifications
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && n.unread).length;
  
  return (
    <div className={clsx(
      "min-h-screen flex",
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Left sidebar navigation */}
      <div className={clsx(
        "hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:pb-4",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center gap-x-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
     
          <div className="flex flex-col">
             <img src="/raisup_logo.png"  alt="Logo" className="h-20  w-auto"/>
            <span className={clsx(
              "text-xs px-2 py-1 rounded-full w-fit",
              darkMode ? "bg-purple-900/30 text-purple-300" : "bg-[#acc5ff] text-primary"
            )}>
              Structure Pro
            </span>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex items-start gap-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors group",
                  location.pathname === item.href
                    ? darkMode
                      ? "bg-gray-700 text-purple-400"
                      : "bg-[#d8ffbd] text-primary"
                    : darkMode 
                      ? "text-gray-300 hover:bg-[gray-700] hover:text-white" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={clsx(
                    "text-xs mt-0.5",
                    location.pathname === item.href
                      ? darkMode ? "text-purple-300" : "text-primary/70"
                      : darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>
          
          <div className="px-4 py-4 mt-auto border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-600 flex-shrink-0">
                {initials}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className={clsx(
                  "text-sm font-medium truncate",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {responsableName}
                </p>
                <p className={clsx(
                  "text-xs truncate",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {agencyName}
                </p>
                <p className={clsx(
                  "text-xs truncate",
                  darkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  {agencyType}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={clsx(
                  "ml-auto p-1 rounded-full",
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          
          <div className={clsx(
            "fixed inset-0 flex w-full max-w-xs flex-col overflow-y-auto pb-12 pt-5 shadow-lg",
            darkMode ? "bg-gray-800" : "bg-white"
          )}>
            <div className="flex px-6 pb-4 items-center justify-between">
              <div className="flex items-center gap-x-2">
                <Sparkles className={clsx(
                  "h-6 w-6",
                  darkMode ? "text-purple-400" : "text-secondary-lighter"
                )} />
                <div className="flex flex-col">
                  <span className={clsx(
                    "text-lg font-semibold",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    Raiusp
                  </span>
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded-full w-fit",
                    darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                  )}>
                    Structure Pro
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={clsx(
                  "-m-2.5 p-2.5",
                  darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-700 hover:text-gray-900"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Fermer le menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <div className="mt-2 space-y-2 px-4">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                    location.pathname === item.href
                      ? darkMode 
                        ? "bg-gray-700 text-purple-400" 
                        : "bg-secondary-light text-primary"
                      : darkMode 
                        ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <div>
                    <div>{item.name}</div>
                    <div className={clsx(
                      "text-xs",
                      location.pathname === item.href
                        ? darkMode ? "text-purple-300" : "text-primary/70"
                        : darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-auto px-4 py-4 border-t border-opacity-20">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-600 flex-shrink-0">
                  {initials}
                </div>
                <div className="ml-3">
                  <p className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {responsableName}
                  </p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {agencyEmail}
                  </p>
                </div>
              </div>
              
              <button
                className={clsx(
                  "mt-4 flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm font-medium",
                  darkMode 
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        {/* Top navigation */}
        <header className={clsx(
          "sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b px-4 shadow-sm sm:px-6",
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
          <button
            type="button"
            className={clsx(
              "-m-2.5 p-2.5 lg:hidden",
              darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-700 hover:text-gray-900"
            )}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <div className="flex flex-1 items-center">
              <div className="w-full max-w-lg">
                <label htmlFor="search" className="sr-only">Rechercher</label>
                <div className="relative">
                  <div className={clsx(
                    "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    <Search className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className={clsx(
                      "block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-sm ring-1 ring-inset focus:ring-2 focus:ring-inset",
                      darkMode 
                        ? "bg-gray-700 text-white placeholder:text-gray-400 ring-gray-600 focus:ring-purple-500" 
                        : "bg-white text-gray-900 placeholder:text-gray-400 ring-gray-300 focus:ring-primary"
                    )}
                    placeholder="Rechercher une startup, un projet, une aide..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Structure name display */}
              <div className="hidden md:flex items-center">
                <Building2 className={clsx(
                  "h-5 w-5 mr-2",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )} />
                <span className={clsx(
                  "text-sm font-medium",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  {agencyName}
                </span>
              </div>

              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className={clsx(
                  "rounded-full p-1 transition-colors",
                  darkMode 
                    ? "bg-gray-700 text-gray-300 hover:text-white" 
                    : "bg-gray-100 text-gray-500 hover:text-gray-900"
                )}
              >
                <span className="sr-only">
                  {darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
                </span>
                {darkMode ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className={clsx(
                    "rounded-full p-1 relative transition-colors",
                    darkMode 
                      ? "bg-gray-700 text-gray-300 hover:text-white" 
                      : "bg-gray-100 text-gray-500 hover:text-gray-900"
                  )}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="sr-only">Voir les notifications</span>
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                  )}
                  {highPriorityCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {highPriorityCount}
                    </span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className={clsx(
                    "absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none",
                    darkMode 
                      ? "bg-gray-800 ring-gray-700" 
                      : "bg-white ring-gray-200"
                  )}>
                    <div className="py-2 px-3 border-b border-opacity-20 flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Alertes & Notifications</h3>
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-xs px-2 py-1 rounded-full",
                          darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
                        )}>
                          {highPriorityCount} urgentes
                        </span>
                        <button 
                          className={clsx(
                            "text-xs font-medium",
                            darkMode ? "text-purple-400" : "text-primary"
                          )}
                        >
                          Tout marquer comme lu
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={clsx(
                            "px-4 py-3 hover:bg-opacity-10 transition-colors border-b border-opacity-10 relative",
                            notification.unread 
                              ? getNotificationColor(notification.type, notification.priority)
                              : darkMode 
                                ? "border-gray-700" 
                                : "border-gray-100"
                          )}
                        >
                          {notification.unread && (
                            <span className={clsx(
                              "absolute left-2 top-4 block h-2 w-2 rounded-full",
                              notification.priority === 'high'
                                ? "bg-red-500"
                                : notification.type === 'deadline'
                                  ? "bg-amber-500"
                                  : notification.type === 'opportunity'
                                    ? "bg-blue-500"
                                    : darkMode ? "bg-purple-400" : "bg-primary"
                            )} />
                          )}
                          <div className="ml-2 flex items-start">
                            <div className={clsx(
                              "rounded-full p-1 mr-2 flex-shrink-0",
                              notification.type === 'deadline'
                                ? darkMode ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600"
                                : notification.type === 'risk'
                                  ? darkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"
                                  : notification.type === 'opportunity'
                                    ? darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600"
                                    : notification.type === 'success'
                                      ? darkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-600"
                                      : darkMode ? "bg-purple-900/30 text-purple-400" : "bg-secondary-light text-primary"
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className={clsx(
                                    "text-sm font-medium",
                                    darkMode ? "text-white" : "text-gray-900"
                                  )}>
                                    {notification.title}
                                  </p>
                                  <span className={clsx(
                                    "text-xs px-2 py-1 rounded-full",
                                    darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                                  )}>
                                    {notification.category}
                                  </span>
                                </div>
                                {notification.priority === 'high' && (
                                  <span className={clsx(
                                    "text-xs px-2 py-1 rounded-full ml-2",
                                    darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"
                                  )}>
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <p className={clsx(
                                "text-xs mt-1",
                                darkMode ? "text-gray-400" : "text-gray-500"
                              )}>
                                {notification.message}
                              </p>
                              <p className={clsx(
                                "text-xs mt-1",
                                darkMode ? "text-gray-500" : "text-gray-400"
                              )}>
                                Il y a {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="py-2 px-3 text-center border-t border-gray-200 dark:border-gray-700">
                      <Link 
                        to="/dashboard/b2b/notifications" 
                        className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-purple-400" : "text-primary"
                        )}
                      >
                        Voir toutes les notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-x-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-600">
                    {initials}
                  </div>
                  <span className={clsx(
                    "hidden text-sm font-medium lg:block",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {responsableName}
                  </span>
                  <ChevronDown className={clsx(
                    "h-4 w-4 hidden lg:block",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )} />
                </button>
                
                {userMenuOpen && (
                  <div className={clsx(
                    "absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none",
                    darkMode 
                      ? "bg-gray-800 ring-gray-700" 
                      : "bg-white ring-gray-200"
                  )}>
                    <div className="py-3 px-4 border-b border-opacity-20">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-600 flex-shrink-0">
                          {initials}
                        </div>
                        <div className="ml-3">
                          <p className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            {responsableName}
                          </p>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {agencyEmail}
                          </p>
                          <p className={clsx(
                            "text-xs font-medium",
                            darkMode ? "text-purple-400" : "text-primary"
                          )}>
                            {agencyName}
                          </p>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {agencyType}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard/b2b/profile"
                        className={clsx(
                          "block px-4 py-2 text-sm",
                          darkMode 
                            ? "text-gray-300 hover:bg-gray-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mon profil
                      </Link>
                      <Link
                        to="/dashboard/b2b/team"
                        className={clsx(
                          "block px-4 py-2 text-sm",
                          darkMode 
                            ? "text-gray-300 hover:bg-gray-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Gestion équipe
                      </Link>
                      <Link
                        to="/dashboard/b2b/settings"
                        className={clsx(
                          "block px-4 py-2 text-sm",
                          darkMode 
                            ? "text-gray-300 hover:bg-gray-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Paramètres
                      </Link>
                      <button
                        className={clsx(
                          "block w-full text-left px-4 py-2 text-sm",
                          darkMode 
                            ? "text-gray-300 hover:bg-gray-700" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={handleLogout}
                      >
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default B2BDashboardLayout;