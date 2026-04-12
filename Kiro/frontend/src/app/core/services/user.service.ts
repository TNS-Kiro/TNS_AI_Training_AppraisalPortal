import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

export interface UserSearchParams {
  search?: string;
  searchTerm?: string;
  department?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** Returns users as a flat array, unwrapping the paginated response from the backend */
  getUsers(params?: UserSearchParams): Observable<ApiResponse<User[]>> {
    let httpParams = new HttpParams();
    if (params?.search)      httpParams = httpParams.set('searchTerm', params.search);
    if (params?.searchTerm)  httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params?.department)  httpParams = httpParams.set('department', params.department);
    if (params?.role)        httpParams = httpParams.set('role', params.role);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', String(params.isActive));
    if (params?.page !== undefined)     httpParams = httpParams.set('page', String(params.page));
    if (params?.size !== undefined)     httpParams = httpParams.set('size', String(params.size));

    // Backend returns ApiResponse<PageResponse<User>> — unwrap to ApiResponse<User[]>
    return this.http.get<ApiResponse<PageResponse<User>>>(this.API_URL, { params: httpParams }).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data?.content ?? []
      }))
    );
  }

  /** Returns the raw paginated response (for components that need pagination metadata) */
  getUsersPaginated(params?: UserSearchParams): Observable<ApiResponse<PageResponse<User>>> {
    let httpParams = new HttpParams();
    if (params?.search)      httpParams = httpParams.set('searchTerm', params.search);
    if (params?.searchTerm)  httpParams = httpParams.set('searchTerm', params.searchTerm);
    if (params?.department)  httpParams = httpParams.set('department', params.department);
    if (params?.role)        httpParams = httpParams.set('role', params.role);
    if (params?.isActive !== undefined) httpParams = httpParams.set('isActive', String(params.isActive));
    if (params?.page !== undefined)     httpParams = httpParams.set('page', String(params.page));
    if (params?.size !== undefined)     httpParams = httpParams.set('size', String(params.size));
    return this.http.get<ApiResponse<PageResponse<User>>>(this.API_URL, { params: httpParams });
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/${id}`);
  }

  createUser(user: UserCreateRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.API_URL, user);
  }

  updateUser(id: number, user: UserUpdateRequest): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${id}`, user);
  }

  deactivateUser(id: number): Observable<ApiResponse<User>> {
    return this.http.delete<ApiResponse<User>>(`${this.API_URL}/${id}`);
  }

  reactivateUser(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.API_URL}/${id}/reactivate`, {});
  }

  assignRoles(userId: number, roleNames: string[]): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.API_URL}/${userId}/roles`, { roles: roleNames });
  }

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${environment.apiUrl}/roles`);
  }
}
