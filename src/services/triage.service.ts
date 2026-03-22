import {
  RetellWebhookPayload,
  ProcessedCall,
  TriageResult,
  TriagePriority,
  DataCompleteness,
  IssueType,
} from '../models';
import { isBerlinZipCode } from '../data/berlin-zipcodes';
import { normalizeZipCode, trimAndCapitalize } from '../utils';

class TriageService {
  processCall(payload: RetellWebhookPayload): ProcessedCall {
    const cv = payload.custom_variables;

    const customerName = trimAndCapitalize(cv.customer_name);
    const customerAddress = trimAndCapitalize(cv.customer_address);
    const issueType = (cv.issue_type as IssueType) ?? null;
    const zipCode = normalizeZipCode(cv.zip_code);

    const triage = this.triageCall(issueType, zipCode, customerName, customerAddress);

    return {
      call_id: payload.call_id,
      transcript: payload.transcript,
      duration: payload.duration,
      recording_url: payload.recording_url,
      customer_name: customerName,
      customer_address: customerAddress,
      issue_type: issueType,
      zip_code: zipCode,
      triage,
      processed_at: new Date().toISOString(),
    };
  }

  private triageCall(
    issueType: IssueType | null,
    zipCode: string | null,
    customerName: string | null,
    customerAddress: string | null,
  ): TriageResult {
    const missingFields = this.findMissingFields(customerName, customerAddress, issueType, zipCode);
    const dataStatus: DataCompleteness = missingFields.length > 0 ? 'INCOMPLETE' : 'COMPLETE';
    const isBerlin = zipCode ? isBerlinZipCode(zipCode) : false;

    const priority = this.determinePriority(issueType, isBerlin, dataStatus);

    return { priority, data_status: dataStatus, is_berlin: isBerlin, missing_fields: missingFields };
  }

  private determinePriority(
    issueType: IssueType | null,
    isBerlin: boolean,
    dataStatus: DataCompleteness,
  ): TriagePriority {
    if (issueType === 'Emergency' && isBerlin) return 'HIGH';
    if (issueType === 'Emergency' && !isBerlin) return 'NORMAL';
    if (dataStatus === 'INCOMPLETE') return 'LOW';
    return 'NORMAL';
  }

  private findMissingFields(
    name: string | null,
    address: string | null,
    issueType: IssueType | null,
    zipCode: string | null,
  ): string[] {
    const missing: string[] = [];
    if (!name) missing.push('customer_name');
    if (!address) missing.push('customer_address');
    if (!issueType) missing.push('issue_type');
    if (!zipCode) missing.push('zip_code');
    return missing;
  }
}

export const triageService = new TriageService();
