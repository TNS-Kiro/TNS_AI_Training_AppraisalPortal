import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppraisalCycle } from '../models/appraisal.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface TriggerCycleRequest {
  employeeIds: number[];
}

export interface TriggerCycleResult {
  successCount: number;
  failureCount: number;
  totalCount: number;
  failures: Array<{
    employeeId: number;
    employeeName: string;
    reason: string;
  }>;
}

/**
 * Service for managing appraisal cycles.
 */
@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private readonly API_URL = `${environment.apiUrl}/cycles`;

  constructor(private http: HttpClient) {}

  getCycles(): Observable<ApiResponse<AppraisalCycle[]>> {
    return this.http.get<ApiResponse<AppraisalCycle[]>>(this.API_URL);
  }

  getCycleById(id: number): Observable<ApiResponse<AppraisalCycle>> {
    return this.http.get<ApiResponse<AppraisalCycle>>(`${this.API_URL}/${id}`);
  }

  createCycle(cycle: Partial<AppraisalCycle>): Observable<ApiResponse<AppraisalCycle>> {
    return this.http.post<ApiResponse<AppraisalCycle>>(this.API_URL, cycle);
  }

  updateCycle(id: number, cycle: Partial<AppraisalCycle>): Observable<ApiResponse<AppraisalCycle>> {
    return this.http.put<ApiResponse<AppraisalCycle>>(`${this.API_URL}/${id}`, cycle);
  }

  triggerCycle(cycleId: number, request: TriggerCycleRequest): Observable<ApiResponse<TriggerCycleResult>> {
    return this.http.post<ApiResponse<TriggerCycleResult>>(`${this.API_URL}/${cycleId}/trigger`, request);
  }

  reopenForm(cycleId: number, formId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/${cycleId}/reopen/${formId}`, {});
  }

  assignBackupReviewer(cycleId: number, formId: number, backupReviewerId: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.API_URL}/${cycleId}/backup-reviewer`, {
      formId,
      backupReviewerId
    });
  }
}
