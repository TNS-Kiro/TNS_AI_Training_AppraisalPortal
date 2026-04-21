import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { NotificationTemplate, EmailNotificationLog } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  getAllTemplates(page = 0, size = 20): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/templates`, { params });
  }

  getTemplate(triggerEvent: string): Observable<ApiResponse<NotificationTemplate>> {
    return this.http.get<ApiResponse<NotificationTemplate>>(`${this.apiUrl}/templates/${triggerEvent}`);
  }

  updateTemplate(id: number, data: { subject: string; body: string; isActive: boolean }): Observable<ApiResponse<NotificationTemplate>> {
    return this.http.put<ApiResponse<NotificationTemplate>>(`${this.apiUrl}/templates/${id}`, data);
  }

  searchNotificationLogs(
    recipientEmail: string | null,
    triggerEvent: string | null,
    status: string | null,
    page = 0,
    size = 25
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (recipientEmail) params = params.set('recipientEmail', recipientEmail);
    if (triggerEvent) params = params.set('triggerEvent', triggerEvent);
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/logs`, { params });
  }
}
