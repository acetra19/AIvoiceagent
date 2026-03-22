export type IssueType = 'Emergency' | 'Routine';

export type TriagePriority = 'HIGH' | 'NORMAL' | 'LOW';

export type DataCompleteness = 'COMPLETE' | 'INCOMPLETE';

export interface CallCustomVariables {
  customer_name?: string;
  customer_address?: string;
  issue_type?: IssueType;
  zip_code?: string;
}

export interface RetellCallData {
  call_id: string;
  transcript: string;
  duration: number;
  recording_url?: string;
  custom_variables: CallCustomVariables;
}

export interface TriageResult {
  priority: TriagePriority;
  data_status: DataCompleteness;
  is_berlin: boolean;
  missing_fields: string[];
}

export interface ProcessedCall {
  call_id: string;
  transcript: string;
  duration: number;
  recording_url?: string;
  customer_name: string | null;
  customer_address: string | null;
  issue_type: IssueType | null;
  zip_code: string | null;
  triage: TriageResult;
  processed_at: string;
}
