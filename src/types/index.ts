// Base types for RespFrias

export type Priority = 'high' | 'medium' | 'low'
export type AlertType = 'clinical' | 'financial' | 'technical'
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'agreement'
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'done'
export type SessionType = 'quick' | 'full'

export interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  diagnosis?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ClinicalFile {
  id: string
  patient_id: string
  initial_assessment?: string
  therapeutic_goals?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  patient_id: string
  appointment_id?: string
  session_type: SessionType
  date: string
  spo2_before?: number
  spo2_after?: number
  borg_before?: number
  borg_after?: number
  respiratory_rate_before?: number
  respiratory_rate_after?: number
  heart_rate_before?: number
  heart_rate_after?: number
  evolution_draft?: string
  evolution_final?: string
  evolution_finalized_at?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  status: AppointmentStatus
  google_event_id?: string
  google_sync_status?: 'synced' | 'failed' | 'pending'
  created_at: string
  updated_at: string
  deleted_at?: string
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
  entity_type: 'patient' | 'session' | 'appointment' | 'payment' | 'report' | 'financial_close'
  entity_id: string
  patient_id?: string
  action: 'create' | 'update' | 'delete' | 'reopen' | 'finalize' | 'send'
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  justification?: string
  created_at: string
}

export interface JobRun {
  id: string
  job_name: string
  period_key: string
  status: 'success' | 'error' | 'skipped'
  error_message?: string
  created_at: string
}
