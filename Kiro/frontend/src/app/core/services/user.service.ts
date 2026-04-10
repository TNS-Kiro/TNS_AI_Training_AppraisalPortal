import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface UserSearchParams {
  search?: string;
  department?: string;
  isActive?: boolean;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UserCreateRequest {
  employeeId: string;
  fullName: string;
  email: string;
  password: string;
  designation?: string;
  department?: string;
  managerId?: number | null;
  roles?: string[];
}

export interface UserUpdateRequest {
  fullName?: string;
  email?: string;
  designation?: string;
  department?: string;
  managerId?: number | null;
}

export interface RoleDto {
  id: number;
  name: string;
}

/**
 * Service for managing users.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with optional filters
   */
  getUsers(params?: UserSearchParams): Observable<ApiResponse<User[]>> {
    let httpParams = new HttpParams();
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.department) {
      httpParams = httpParams.set('department', params.department);
    }
    if (params?.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params?.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<ApiResponse<User[]>>(this.API_URL, { params: httpParams });
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/${id}`);
  }

  /**
   * Create new user
   */
  createUser(user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.API_URL, user);
  }

  /**
   * Update existing user
   */
  updateUser(id: number, user: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${id}`, user);
  }

  /**
   * Deactivate user
   */
  deactivateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  /**
   * Reactivate user
   */
  reactivateUser(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.API_URL}/${id}/reactivate`, {});
  }

  /**
   * Assign roles to user
   */
  assignRoles(userId: number, roleNames: string[]): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${userId}/roles`, { roleNames });
  }

  /**
   * Get all available roles
   */
  getRoles(): Observable<ApiResponse<RoleDto[]>> {
    return this.http.get<ApiResponse<RoleDto[]>>(`${environment.apiUrl}/roles`);
  }
}
