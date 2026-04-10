import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { EmployeeDashboardData, ManagerDashboardData, HrDashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getEmployeeDashboard(): Observable<ApiResponse<EmployeeDashboardData>> {
    return this.http.get<ApiResponse<EmployeeDashboardData>>(`${this.apiUrl}/employee`);
  }

  getManagerDashboard(): Observable<ApiResponse<ManagerDashboardData>> {
    return this.http.get<ApiResponse<ManagerDashboardData>>(`${this.apiUrl}/manager`);
  }

  getHrDashboard(): Observable<ApiResponse<HrDashboardData>> {
    return this.http.get<ApiResponse<HrDashboardData>>(`${this.apiUrl}/hr`);
  }

  getStatusDistribution(): Observable<ApiResponse<Record<string, number>>> {
    return this.http.get<ApiResponse<Record<string, number>>>(`${this.apiUrl}/status-distribution`);
  }
}
