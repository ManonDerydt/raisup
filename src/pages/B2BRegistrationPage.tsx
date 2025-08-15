import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles, Building2, Users, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

type FormData = {
  // Structure information
  structureName: string;
  structureType: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website?: string;
  
  // Contact person
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  contactPosition: string;
  
  // Account
  password: string;
  confirmPassword: string;
  
  // Preferences
  acceptTerms: boolean;
  acceptMarketing: boolean;
};

const B2BRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check if dark mode is enabled
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors, isValid } 
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      country: 'France',
      acceptTerms: false,
      acceptMarketing: false
    }
  });

  const password = watch('password');

  const onSubmit = (data: FormData) => {
    setLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      // Redirect to B2B dashboard or welcome page
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className={clsx(
      "min-h-screen",
      darkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <Sparkles className={clsx(
            "h-6 w-6",
            darkMode ? "text-purple-400" : "text-secondary-lighter"
          )} />
          <span className={clsx(
            "font-semibold text-xl",
            darkMode ? "text-white" : "text-gray-900"
          )}>
            FundAI
          </span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className={clsx(
          "rounded-xl shadow-sm p-8",
          darkMode ? "bg-gray-800" : "bg-white"
        )}>
          <div className="text-center mb-8">
            <div className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              darkMode ? "bg-purple-900/30" : "bg-secondary-light"
            )}>
              <Building2 className={clsx(
                "h-8 w-8",
                darkMode ? "text-purple-400" : "text-primary"
              )} />
            </div>
            <h1 className={clsx(
              "text-3xl font-bold mb-2",
              darkMode ? "text-white" : "text-gray-900"
            )}>
              Inscription Structure d'Accompagnement
            </h1>
            <p className={clsx(
              "text-lg",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}>
              Créez votre compte professionnel pour accompagner vos startups
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Structure Information */}
            <div>
              <h2 className={clsx(
                "text-xl font-semibold mb-4 flex items-center",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                <Building2 className="h-5 w-5 mr-2" />
                Informations sur votre structure
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Nom de la structure *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.structureName && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="Nom de votre incubateur, accélérateur, etc."
                    {...register('structureName', { required: 'Ce champ est requis' })}
                  />
                  {errors.structureName && (
                    <p className="text-red-500 text-sm mt-1">{errors.structureName.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Type de structure *
                  </label>
                  <select
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.structureType && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    {...register('structureType', { required: 'Ce champ est requis' })}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="incubateur">Incubateur</option>
                    <option value="accelerateur">Accélérateur</option>
                    <option value="pepiniere">Pépinière d'entreprises</option>
                    <option value="consultant">Cabinet de conseil</option>
                    <option value="fonds">Fonds d'investissement</option>
                    <option value="autre">Autre</option>
                  </select>
                  {errors.structureType && (
                    <p className="text-red-500 text-sm mt-1">{errors.structureType.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    SIRET *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.siret && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="12345678901234"
                    {...register('siret', { 
                      required: 'Ce champ est requis',
                      pattern: {
                        value: /^[0-9]{14}$/,
                        message: 'Le SIRET doit contenir 14 chiffres'
                      }
                    })}
                  />
                  {errors.siret && (
                    <p className="text-red-500 text-sm mt-1">{errors.siret.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Adresse *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.address && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="123 rue de la République"
                    {...register('address', { required: 'Ce champ est requis' })}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Ville *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.city && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="Paris"
                    {...register('city', { required: 'Ce champ est requis' })}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Code postal *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.postalCode && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="75001"
                    {...register('postalCode', { 
                      required: 'Ce champ est requis',
                      pattern: {
                        value: /^[0-9]{5}$/,
                        message: 'Code postal invalide'
                      }
                    })}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Site web
                  </label>
                  <input
                    type="url"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.website && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="https://votre-site.com"
                    {...register('website', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'URL invalide'
                      }
                    })}
                  />
                  {errors.website && (
                    <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h2 className={clsx(
                "text-xl font-semibold mb-4 flex items-center",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                <Users className="h-5 w-5 mr-2" />
                Personne de contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Prénom *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.contactFirstName && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="Jean"
                    {...register('contactFirstName', { required: 'Ce champ est requis' })}
                  />
                  {errors.contactFirstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactFirstName.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Nom *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.contactLastName && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="Dupont"
                    {...register('contactLastName', { required: 'Ce champ est requis' })}
                  />
                  {errors.contactLastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactLastName.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.contactEmail && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="jean.dupont@structure.com"
                    {...register('contactEmail', { 
                      required: 'Ce champ est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide'
                      }
                    })}
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.contactPhone && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="+33 1 23 45 67 89"
                    {...register('contactPhone', { required: 'Ce champ est requis' })}
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Fonction *
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                      errors.contactPosition && "border-red-500",
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                        : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                    )}
                    placeholder="Directeur, Responsable accompagnement, etc."
                    {...register('contactPosition', { required: 'Ce champ est requis' })}
                  />
                  {errors.contactPosition && (
                    <p className="text-red-500 text-sm mt-1">{errors.contactPosition.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div>
              <h2 className={clsx(
                "text-xl font-semibold mb-4 flex items-center",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                <Mail className="h-5 w-5 mr-2" />
                Sécurité du compte
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={clsx(
                        "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                        errors.password && "border-red-500",
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                          : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                      )}
                      placeholder="••••••••"
                      {...register('password', { 
                        required: 'Ce champ est requis',
                        minLength: {
                          value: 8,
                          message: 'Le mot de passe doit contenir au moins 8 caractères'
                        }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={clsx(
                        "absolute right-3 top-1/2 transform -translate-y-1/2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className={clsx(
                    "block text-sm font-medium mb-2",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}>
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={clsx(
                        "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200",
                        errors.confirmPassword && "border-red-500",
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500/30 focus:border-purple-500"
                          : "bg-white border-gray-200 text-gray-900 focus:ring-primary/20 focus:border-primary"
                      )}
                      placeholder="••••••••"
                      {...register('confirmPassword', { 
                        required: 'Ce champ est requis',
                        validate: value => value === password || 'Les mots de passe ne correspondent pas'
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={clsx(
                        "absolute right-3 top-1/2 transform -translate-y-1/2",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Preferences */}
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="sr-only"
                  {...register('acceptTerms', { required: 'Vous devez accepter les conditions' })}
                />
                <div
                  className={clsx(
                    "w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer mt-0.5",
                    watch('acceptTerms')
                      ? darkMode
                        ? "border-purple-500 bg-purple-500/30"
                        : "border-secondary-lighter bg-secondary-light"
                      : darkMode
                        ? "border-gray-600"
                        : "border-gray-300"
                  )}
                  onClick={() => {
                    const currentValue = watch('acceptTerms');
                    register('acceptTerms').onChange({
                      target: { value: !currentValue, name: 'acceptTerms' }
                    });
                  }}
                >
                  {watch('acceptTerms') && (
                    <svg className={clsx(
                      "h-3 w-3",
                      darkMode ? "text-purple-400" : "text-primary"
                    )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <label className={clsx(
                  "text-sm cursor-pointer",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  J'accepte les{' '}
                  <Link to="/terms" className={clsx(
                    "font-medium hover:underline",
                    darkMode ? "text-purple-400" : "text-primary"
                  )}>
                    conditions d'utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link to="/privacy" className={clsx(
                    "font-medium hover:underline",
                    darkMode ? "text-purple-400" : "text-primary"
                  )}>
                    politique de confidentialité
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="sr-only"
                  {...register('acceptMarketing')}
                />
                <div
                  className={clsx(
                    "w-5 h-5 rounded border flex items-center justify-center mr-3 cursor-pointer mt-0.5",
                    watch('acceptMarketing')
                      ? darkMode
                        ? "border-purple-500 bg-purple-500/30"
                        : "border-secondary-lighter bg-secondary-light"
                      : darkMode
                        ? "border-gray-600"
                        : "border-gray-300"
                  )}
                  onClick={() => {
                    const currentValue = watch('acceptMarketing');
                    register('acceptMarketing').onChange({
                      target: { value: !currentValue, name: 'acceptMarketing' }
                    });
                  }}
                >
                  {watch('acceptMarketing') && (
                    <svg className={clsx(
                      "h-3 w-3",
                      darkMode ? "text-purple-400" : "text-primary"
                    )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <label className={clsx(
                  "text-sm cursor-pointer",
                  darkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  J'accepte de recevoir des communications marketing et des mises à jour produit
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={!isValid || loading}
                className={clsx(
                  "w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200",
                  isValid && !loading
                    ? darkMode
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-primary hover:bg-primary-dark text-white"
                    : darkMode
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <span>Créer mon compte structure</span>
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>

          <div className={clsx(
            "mt-8 pt-6 text-center border-t",
            darkMode ? "border-gray-700" : "border-gray-100"
          )}>
            <p className={clsx(
              "text-sm",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className={clsx(
                  "font-medium hover:underline",
                  darkMode ? "text-purple-400" : "text-primary"
                )}
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default B2BRegistrationPage;