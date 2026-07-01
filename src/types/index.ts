// Base types for RespFrias — Fase 1

export type Priority = 'high' | 'medium' | 'low'
export type AlertType = 'clinical' | 'financial' | 'technical'
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'agreement'
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'done'
export type SessionType = 'quick' | 'full'
export type AssessmentType = 'initial' | 'periodic'
export type GoalStatus = 'active' | 'achieved' | 'cancelled'
export type AuditEntityType =
  | 'patient' | 'session' | 'appointment' | 'payment'
  | 'report' | 'financial_close' | 'clinical_file' | 'assessment' | 'goal'
export type AuditAction = 'create' | 'update' | 'delete' | 'reopen' | 'finalize' | 'send'

export interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  birth_date?: string
  diagnosis?: string
  notes?: string
  color: string
  is_fictitious: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ClinicalFile {
  id: string
  patient_id: string
  diagnosis_detail?: string
  history?: string
  current_medications?: string
  allergies?: string
  precautions?: string
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  patient_id: string
  assessment_type: AssessmentType
  date: string
  spo2?: number
  borg?: number
  respiratory_rate?: number
  heart_rate?: number
  mrc_scale?: number
  six_mwt_distance?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  patient_id: string
  appointment_id?: string
  session_type: SessionType
  date: string
  duration_minutes?: number
  spo2_before?: number
  spo2_after?: number
  borg_before?: number
  borg_after?: number
  respiratory_rate_before?: number
  respiratory_rate_after?: number
  heart_rate_before?: number
  heart_rate_after?: number
  techniques_used?: string[]
  notes?: string
  evolution_draft?: string
  evolution_final?: string
  evolution_finalized_at?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  patient_id: string
  description: string
  target_date?: string
  status: GoalStatus
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  duration_minutes: number
  status: AppointmentStatus
  notes?: string
  google_event_id?: string
  google_sync_status?: 'synced' | 'failed' | 'pending'
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface AppointmentWithPatient extends Appointment {
  patient_name: string
  patient_color?: string
}

export interface AppointmentInput {
  patient_id: string
  date: string
  time: string
  duration_minutes?: number
  status?: AppointmentStatus
  notes?: string
}

export interface Payment {
  id: string
  patient_id: string
  session_id?: string
  amount: number
  amount_paid?: number
  status: PaymentStatus
  payment_method?: string
  due_date?: string
  paid_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PaymentWithPatient extends Payment {
  patient_name: string
}

export interface PaymentInput {
  patient_id: string
  session_id?: string
  amount: number
  amount_paid?: number
  status?: PaymentStatus
  payment_method?: string
  due_date?: string
  notes?: string
}

export interface FinancialClose {
  id: string
  period_key: string
  total_expected: number
  total_received: number
  closed_at: string
  reopened_at?: string
  created_at: string
  updated_at: string
}

export interface PatientAlert {
  patient_id: string
  patient_name: string
  reason: string
  priority: Priority
  type: AlertType
  last_appointment?: string
}

export interface AuditLog {
  id: string
  entity_type: AuditEntityType
  entity_id: string
  patient_id?: string
  action: AuditAction
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  justification?: string
  created_at: string
}

export type ReportStatus = 'draft' | 'approved'

export interface Report {
  id: string
  patient_id: string
  title: string
  status: ReportStatus
  content: ReportContent
  created_at: string
  approved_at?: string
}

export interface ReportContent {
  patient: Patient
  clinicalFile?: ClinicalFile
  assessments: Assessment[]
  sessions: Session[]
  goals: Goal[]
  generatedAt: string
}

export interface JobRun {
  id: string
  job_name: string
  period_key: string
  status: 'success' | 'error' | 'skipped'
  error_message?: string
  created_at: string
}

export interface PatientInput {
  name: string
  email?: string
  phone?: string
  birth_date?: string
  diagnosis?: string
  notes?: string
}

export interface ClinicalFileInput {
  diagnosis_detail?: string
  history?: string
  current_medications?: string
  allergies?: string
  precautions?: string
}

export interface AssessmentInput {
  assessment_type: AssessmentType
  date: string
  spo2?: number
  borg?: number
  respiratory_rate?: number
  heart_rate?: number
  mrc_scale?: number
  six_mwt_distance?: number
  notes?: string
}

export interface SessionInput {
  session_type: SessionType
  date: string
  duration_minutes?: number
  spo2_before?: number
  spo2_after?: number
  borg_before?: number
  borg_after?: number
  respiratory_rate_before?: number
  respiratory_rate_after?: number
  heart_rate_before?: number
  heart_rate_after?: number
  techniques_used?: string[]
  notes?: string
}

export interface GoalInput {
  description: string
  target_date?: string
  status?: GoalStatus
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
