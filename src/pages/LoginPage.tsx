import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [segment, setSegment] = useState<'B2B' | 'B2C'>('B2B');
  
  // Using placeholder logo - replace with actual logo URL when available
  const Logo = "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop&crop=center";

  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate authentication
    setTimeout(() => {
      setLoading(false);
      // For demo purposes, allow any login
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className={clsx(
      "min-h-screen flex flex-col",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="flex items-center space-x-3">
          <img src={Logo} alt="RAISUP Logo" className="h-16 w-auto" />
          <span className={clsx(
            "font-semibold text-xl tracking-wide",
            darkMode ? "text-white" : "text-gray-900"
          )}>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className={clsx(
          "w-full max-w-md rounded-xl shadow-sm p-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="flex flex-col items-center text-center mb-8">
            {/* <div className="flex items-center gap-3 mb-4">
              <img src={Logo} alt="RAISUP Logo" className="h-16 w-auto" />
            </div> */}
            <h1 className={clsx(
              "text-2xl font-bold mb-2",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Connexion
            </h1>
            <p className={clsx(
            
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Accédez à votre espace pour gérer votre levée de fonds
            </p>
          </div>

          <div className="flex justify-center mb-8 gap-4">
            <button
              type="button"
              onClick={() => setSegment('B2B')}
              className={clsx(
                "px-6 py-2 rounded-full font-semibold text-lg transition",
                segment === "B2B"
                  ? darkMode
                    ? "bg-[purple-500] text-white"
                    : "bg-primary text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 border border-gray-600"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              )}
            >
              B2B
            </button>
            <button
              type="button"
              onClick={() => setSegment('B2C')}
              className={clsx(
                "px-6 py-2 rounded-full font-semibold text-lg transition",
                segment === "B2C"
                  ? darkMode
                    ? "bg-purple-500 text-white"
                    : "bg-primary text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 border border-gray-600"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              )}
            >
              B2C
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={clsx(
                  "block text-sm font-medium mb-2",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                Email {segment === 'B2B' ? 'structure' : 'utilisateur'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={clsx(
                  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                    : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                )}
                placeholder={segment === 'B2B' ? "structure@email.com" : "votre@email.com"}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={clsx(
                  "block text-sm font-medium mb-2",
                  darkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={clsx(
                    "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                      : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={clsx(
                    "absolute right-3 top-1/2 transform -translate-y-1/2",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="sr-only"
              />
              <div
                className={clsx(
                  "w-5 h-5 rounded border flex items-center justify-center mr-2 cursor-pointer",
                  rememberMe
                    ? darkMode
                      ? "border-purple-500 bg-purple-500/30"
                      : "border-secondary-lighter bg-secondary-light"
                    : darkMode
                      ? "border-gray-600"
                      : "border-gray-300"
                )}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <svg className={clsx(
                    "h-3 w-3",
                    darkMode ? "text-purple-400" : "text-primary"
                  )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <label
                htmlFor="remember-me"
                className={clsx(
                  "text-sm cursor-pointer",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}
              >
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200",
                darkMode
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-primary hover:bg-primary-dark text-white",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              <span>Se connecter</span>
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </form>

          <div className={clsx(
            "mt-8 pt-6 text-center border-t",
            darkMode ? "border-gray-700" : "border-gray-100"
          )}>
            <p className={clsx(
              "text-sm mb-4",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Vous n'avez pas encore de compte ?{' '}
              <Link
                to="/register"
                className={clsx(
                  "font-medium hover:underline",
                  darkMode ? "text-purple-400" : "text-primary"
                )}
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
