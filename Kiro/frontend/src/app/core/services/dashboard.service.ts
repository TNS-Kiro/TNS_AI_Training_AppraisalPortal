import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeDashboard, ManagerDashboard, HRDashboard } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

/**
 * Service for fetching role-specific dashboard data.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Get employee dashboard data (current form + historical forms)
   */
  getEmployeeDashboard(): Observable<EmployeeDashboard> {
    return this.http.get<EmployeeDashboard>(`${this.API_URL}/employee`);
  }

  /**
   * Get manager dashboard data (own form + team forms + metrics)
   */
  getManagerDashboard(): Observable<ManagerDashboard> {
    return this.http.get<ManagerDashboard>(`${this.API_URL}/manager`);
  }

  /**
   * Get HR dashboard data (org-wide metrics + department progress)
   */
  getHRDashboard(): Observable<HRDashboard> {
    return this.http.get<HRDashboard>(`${this.API_URL}/hr`);
  }
}
