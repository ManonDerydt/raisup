import React, { useState } from 'react';
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
  Briefcase
} from 'lucide-react';
import clsx from 'clsx';

const B2BDashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Mock user data for B2B structure
  const user = {
    name: 'Jean Martin',
    email: 'jean.martin@techincubator.com',
    structure: 'Tech Incubator Paris',
    role: 'Directeur des Investissements',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };
  
  // Mock notifications for B2B
  const notifications = [
    {
      id: 1,
      title: 'Aide BPI France expire bientôt',
      message: 'L\'aide pour MediScan expire dans 15 jours.',
      time: '2 heures',
      unread: true,
      type: 'warning'
    },
    {
      id: 2,
      title: 'Nouveau diagnostic IA disponible',
      message: 'GreenTech SAS a mis à jour ses données financières.',
      time: '5 heures',
      unread: true,
      type: 'info'
    },
    {
      id: 3,
      title: 'Rapport mensuel généré',
      message: 'Le rapport de performance de votre portefeuille est prêt.',
      time: '1 jour',
      unread: false,
      type: 'success'
    }
  ];
  
  const mainNavItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard/b2b' },
    { name: 'Portefeuille Startups', icon: Briefcase, href: '/dashboard/b2b/portfolio' },
    { name: 'Synthèse d\'aides', icon: FileText, href: '/dashboard/b2b/funding-synthesis' },
    { name: 'Simulateur Dilution', icon: Calculator, href: '/dashboard/b2b/dilution-simulator' },
    { name: 'Rapports Stratégiques', icon: BarChart3, href: '/dashboard/b2b/reports' },
    { name: 'Paramètres', icon: Settings, href: '/dashboard/b2b/settings' }
  ];
  
  const handleLogout = () => {
    navigate('/');
  };
  
  return (
    <div className={clsx(
      "min-h-screen flex",
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Left sidebar navigation */}
      <div className={clsx(
        "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:pb-4",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center gap-x-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Sparkles className={clsx(
            "h-6 w-6",
            darkMode ? "text-purple-400" : "text-secondary-lighter"
          )} />
          <span className="text-lg font-semibold">FundAI</span>
          <span className={clsx(
            "text-xs px-2 py-1 rounded-full",
            darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
          )}>
            Structure
          </span>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex items-center gap-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? darkMode 
                      ? "bg-gray-700 text-purple-400" 
                      : "bg-secondary-light text-primary"
                    : darkMode 
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="px-4 py-4 mt-auto border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <img
                className="h-10 w-10 rounded-full bg-gray-50 object-cover"
                src={user.avatar}
                alt=""
              />
              <div className="ml-3 min-w-0 flex-1">
                <p className={clsx(
                  "text-sm font-medium truncate",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {user.name}
                </p>
                <p className={clsx(
                  "text-xs truncate",
                  darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {user.structure}
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
                <span className={clsx(
                  "text-lg font-semibold",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  FundAI
                </span>
                <span className={clsx(
                  "text-xs px-2 py-1 rounded-full",
                  darkMode ? "bg-purple-900/30 text-purple-300" : "bg-secondary-light text-primary"
                )}>
                  Structure
                </span>
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
                  {item.name}
                </Link>
              ))}
            </div>
            
            <div className="mt-auto px-4 py-4 border-t border-opacity-20">
              <div className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full bg-gray-50 object-cover"
                  src={user.avatar}
                  alt=""
                />
                <div className="ml-3">
                  <p className={clsx(
                    "text-sm font-medium",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {user.name}
                  </p>
                  <p className={clsx(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {user.email}
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
      <div className="lg:pl-64 flex flex-col flex-1">
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
                    placeholder="Rechercher une startup..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
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
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className={clsx(
                    "absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none",
                    darkMode 
                      ? "bg-gray-800 ring-gray-700" 
                      : "bg-white ring-gray-200"
                  )}>
                    <div className="py-2 px-3 border-b border-opacity-20 flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Alertes & Notifications</h3>
                      <button 
                        className={clsx(
                          "text-xs font-medium",
                          darkMode ? "text-purple-400" : "text-primary"
                        )}
                      >
                        Tout marquer comme lu
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={clsx(
                            "px-4 py-3 hover:bg-opacity-10 transition-colors border-b border-opacity-10 relative",
                            notification.unread 
                              ? notification.type === 'warning'
                                ? darkMode 
                                  ? "bg-amber-900 bg-opacity-10 border-amber-800" 
                                  : "bg-amber-50 bg-opacity-30 border-amber-200"
                                : darkMode 
                                  ? "bg-purple-900 bg-opacity-10 border-purple-800" 
                                  : "bg-secondary-light bg-opacity-30 border-secondary-light"
                              : darkMode 
                                ? "border-gray-700" 
                                : "border-gray-100"
                          )}
                        >
                          {notification.unread && (
                            <span className={clsx(
                              "absolute left-2 top-4 block h-2 w-2 rounded-full",
                              notification.type === 'warning'
                                ? "bg-amber-500"
                                : darkMode ? "bg-purple-400" : "bg-primary"
                            )} />
                          )}
                          <div className="ml-2">
                            <p className={clsx(
                              "text-sm font-medium",
                              darkMode ? "text-white" : "text-gray-900"
                            )}>
                              {notification.title}
                            </p>
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
                      ))}
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
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50 object-cover"
                    src={user.avatar}
                    alt=""
                  />
                  <span className={clsx(
                    "hidden text-sm font-medium lg:block",
                    darkMode ? "text-white" : "text-gray-900"
                  )}>
                    {user.name}
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
                        <img
                          className="h-10 w-10 rounded-full bg-gray-50 object-cover"
                          src={user.avatar}
                          alt=""
                        />
                        <div className="ml-3">
                          <p className={clsx(
                            "text-sm font-medium",
                            darkMode ? "text-white" : "text-gray-900"
                          )}>
                            {user.name}
                          </p>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {user.email}
                          </p>
                          <p className={clsx(
                            "text-xs font-medium",
                            darkMode ? "text-purple-400" : "text-primary"
                          )}>
                            {user.structure}
                          </p>
                          <p className={clsx(
                            "text-xs",
                            darkMode ? "text-gray-400" : "text-gray-500"
                          )}>
                            {user.role}
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