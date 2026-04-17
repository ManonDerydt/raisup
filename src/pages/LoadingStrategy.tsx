import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const phrases = [
  "Analyse de votre profil en cours...",
  "Identification des financements éligibles...",
  "Calcul de votre score Raisup...",
  "Matching avec les investisseurs...",
  "Construction de votre parcours financier...",
  "Votre stratégie est prête ✓"
]

export default function LoadingStrategy() {
  const navigate = useNavigate()
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const totalDuration = 4000
    const phraseInterval = totalDuration / phrases.length

    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentPhrase(prev => {
          if (prev >= phrases.length - 1) return prev
          return prev + 1
        })
        setVisible(true)
      }, 200)
    }, phraseInterval)

    const redirect = setTimeout(() => {
      navigate('/dashboard/welcome')
    }, totalDuration + 600)

    return () => {
      clearInterval(timer)
      clearTimeout(redirect)
    }
  }, [navigate])

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>

      {/* Logo */}
      <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)' }}>
        <span style={{ color: 'white', fontSize: '24px', fontWeight: '900', letterSpacing: '0.1em' }}>RAISUP</span>
      </div>

      {/* Spinner SVG */}
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: '40px' }}>
        <circle cx="40" cy="40" r="34" fill="none" stroke="#1A1A1A" strokeWidth="4"/>
        <circle cx="40" cy="40" r="34" fill="none" stroke="#F4B8CC" strokeWidth="4"
          strokeDasharray="60 153" strokeLinecap="round"
          style={{ transformOrigin: 'center', animation: 'spin 1.2s linear infinite' }}/>
      </svg>

      {/* Phrase animée */}
      <div style={{
        color: 'white', fontSize: '20px', fontWeight: '600',
        textAlign: 'center', marginBottom: '48px', height: '32px',
        opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease',
        maxWidth: '400px'
      }}>
        {phrases[currentPhrase]}
      </div>

      {/* Barre de progression */}
      <div style={{ width: '300px', height: '4px', background: '#1A1A1A', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: '#F4B8CC', borderRadius: '2px',
          animation: 'progress 4s linear forwards'
        }}/>
      </div>

      {/* Texte sécurité */}
      <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '40px' }}>
        Vos données sont sécurisées et chiffrées
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  )
}
