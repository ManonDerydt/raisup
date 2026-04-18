import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgencyDossierRow {
  id: string;
  agency_id: string;
  startup_name: string;
  sector: string;
  stage: string;
  statut: string;
  raisup_score: number;
  montant_cible: number;
  montant_leve: number;
  mrr: number;
  runway: number;
  fondateur: string;
  derniere_action: string;
  notes_partenaire: string;
  created_at: string;
  updated_at: string;
}

export interface AgencyActivityRow {
  id: string;
  agency_id: string;
  dossier_id: string | null;
  type: string;
  description: string;
  created_at: string;
  agency_dossiers?: { startup_name: string } | null;
}

export interface AgencyDeadlineRow {
  id: string;
  agency_id: string;
  dossier_id: string | null;
  label: string;
  date_echeance: string;
  done: boolean;
  priority: string;
  agency_dossiers?: { startup_name: string } | null;
}

export interface DashboardStats {
  totalDossiers: number;
  dossiersActifs: number;
  montantLeveTotal: number;
  tauxSucces: number;
  alertesCritiques: number;
  scoreMoyen: number;
}

export interface AgencyDashboardData {
  dossiers: AgencyDossierRow[];
  activities: AgencyActivityRow[];
  deadlines: AgencyDeadlineRow[];
  stats: DashboardStats;
}

// ─── Main query ───────────────────────────────────────────────────────────────

export async function getAgencyDashboardData(agencyId: string): Promise<AgencyDashboardData> {
  const [dossiersRes, activitiesRes, deadlinesRes] = await Promise.all([
    supabase
      .from('agency_dossiers')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false }),

    supabase
      .from('agency_activities')
      .select('*, agency_dossiers(startup_name)')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('agency_deadlines')
      .select('*, agency_dossiers(startup_name)')
      .eq('agency_id', agencyId)
      .gte('date_echeance', new Date().toISOString())
      .order('date_echeance', { ascending: true })
      .limit(5),
  ]);

  const dossiers: AgencyDossierRow[] = dossiersRes.data ?? [];
  const activities: AgencyActivityRow[] = activitiesRes.data ?? [];
  const deadlines: AgencyDeadlineRow[] = deadlinesRes.data ?? [];

  const stats: DashboardStats = {
    totalDossiers: dossiers.length,
    dossiersActifs: dossiers.filter(d => !['Closé ✓', 'En pause'].includes(d.statut)).length,
    montantLeveTotal: dossiers.reduce((sum, d) => sum + (d.montant_leve ?? 0), 0),
    tauxSucces: dossiers.length > 0
      ? Math.round((dossiers.filter(d => d.statut === 'Closé ✓').length / dossiers.length) * 100)
      : 0,
    alertesCritiques: dossiers.filter(d => (d.runway ?? 12) <= 4).length,
    scoreMoyen: dossiers.length > 0
      ? Math.round(dossiers.reduce((sum, d) => sum + (d.raisup_score ?? 0), 0) / dossiers.length)
      : 0,
  };

  return { dossiers, activities, deadlines, stats };
}

// ─── Account ──────────────────────────────────────────────────────────────────

export async function createAgencyAccount(data: Record<string, unknown>) {
  const { data: account, error } = await supabase
    .from('agency_accounts')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return account;
}

// ─── Dossiers ─────────────────────────────────────────────────────────────────

export async function createDossier(agencyId: string, data: Record<string, unknown>) {
  const { data: dossier, error } = await supabase
    .from('agency_dossiers')
    .insert({ agency_id: agencyId, ...data })
    .select()
    .single();
  if (error) throw error;
  return dossier;
}

export async function getDossierById(dossierId: string): Promise<AgencyDossierRow> {
  const { data, error } = await supabase
    .from('agency_dossiers')
    .select('*')
    .eq('id', dossierId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateDossierStatut(dossierId: string, statut: string, action?: string) {
  const update: Record<string, unknown> = { statut, updated_at: new Date().toISOString() };
  if (action) update.derniere_action = action;
  const { error } = await supabase
    .from('agency_dossiers')
    .update(update)
    .eq('id', dossierId);
  if (error) throw error;
}

export async function updateDossierNotes(dossierId: string, notes: string) {
  const { error } = await supabase
    .from('agency_dossiers')
    .update({ notes_partenaire: notes, updated_at: new Date().toISOString() })
    .eq('id', dossierId);
  if (error) throw error;
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function addActivity(
  dossierId: string,
  agencyId: string,
  type: string,
  description: string,
) {
  const { error } = await supabase
    .from('agency_activities')
    .insert({ dossier_id: dossierId, agency_id: agencyId, type, description });
  if (error) throw error;
}
