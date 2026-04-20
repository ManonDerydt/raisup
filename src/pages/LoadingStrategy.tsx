import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calculateScore } from '../services/generateTimeline'

const phrases = [
  "Analyse de votre profil en cours...",
  "Identification des financements éligibles...",
  "Calcul de votre score Raisup...",
  "Matching avec les investisseurs...",
  "Construction de votre parcours financier...",
  "Votre stratégie est prête ✓"
]

async function trySaveToSupabase(form: Record<string, any>) {
  try {
    const score = calculateScore({
      startupName: form.startupName,
      mrr: form.mrr,
      momGrowth: form.momGrowth,
      activeClients: form.activeClients,
      runway: form.runway,
      burnRate: form.burnRate,
      hasCTO: form.hasCTO,
      hasAdvisors: form.hasAdvisors,
      problem: form.problem,
      solution: form.solution,
      competitiveAdvantage: form.competitiveAdvantage,
    });

    const { data: savedProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        startup_name: form.startupName || '',
        founder_name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
        one_liner: form.oneLiner || '',
        ambition: form.finalObjective || '',
        business_model: form.businessModel || '',
        sector: form.sector || '',
        client_type: form.clientType || '',
        country: form.country || 'France',
        region: form.region || '',
        city: form.city || '',
        has_revenue: (form.mrr || 0) > 0,
        mrr: Number(form.mrr) || 0,
        growth_mom: Number(form.momGrowth) || 0,
        active_clients: Number(form.activeClients) || 0,
        runway: Number(form.runway) || 12,
        burn_rate: Number(form.burnRate) || 0,
        fundraising_goal: Number(form.fundraisingGoal) || 0,
        max_dilution: Number(form.maxDilution) || 20,
        funding_preference: form.fundingPreference || '',
        final_goal_valuation: Number(form.finalGoalValuation) || 0,
        fundraising_timeline: form.fundingTimeline || '',
        raisup_score: score.total,
        has_cto: form.hasCTO || false,
        problem: form.problem || '',
        solution: form.solution || '',
        competitive_advantage: form.competitiveAdvantage || '',
        has_advisors: form.hasAdvisors || false,
        has_previous_startup: false,
        had_exit: false,
        sector_experience: '',
        team_size: Number(form.teamSize) || 0,
        existing_funding: form.previousFunding || [],
      })
      .select()
      .single();

    if (profileError) {
      console.error('LoadingStrategy: erreur save profile:', profileError);
      return;
    }

    const savedId = savedProfile.id;
    localStorage.setItem('raisup_profile', JSON.stringify({ ...form, supabase_id: savedId }));
    console.log('LoadingStrategy: profil sauvegardé Supabase id:', savedId);

    if (form.partnerId && form.partnerConfirmed) {
      const { error: reqError } = await supabase.from('partner_requests').insert({
        startup_profile_id: savedId,
        startup_name: form.startupName || '',
        founder_name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
        founder_email: form.email || '',
        agency_id: form.partnerId,
        agency_name: form.partnerName || '',
        agency_email: form.partnerEmail || '',
        status: 'pending',
        raisup_score: score.total,
      });
      if (reqError) console.error('LoadingStrategy: erreur partner_request:', reqError);
      else console.log('LoadingStrategy: demande partenaire envoyée à:', form.partnerName);
    }
  } catch (e) {
    console.error('LoadingStrategy: erreur trySaveToSupabase:', e);
  }
}

export default function LoadingStrategy() {
  const navigate = useNavigate()
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // If returning from Google OAuth, the profile may be in localStorage but not yet in Supabase
    const raw = localStorage.getItem('raisup_profile')
    if (raw) {
      try {
        const profile = JSON.parse(raw)
        if (profile.startupName && !profile.supabase_id) {
          trySaveToSupabase(profile)
        }
      } catch { /* ignore */ }
    }
  }, [])

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
