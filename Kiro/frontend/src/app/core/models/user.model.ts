export interface User {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  designation?: string;
  department?: string;
  managerId?: number;
  managerName?: string;
  isActive: boolean;
  // Backend returns roles as plain strings (e.g. "EMPLOYEE", "HR")
  roles: RoleName[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: number;
  name: RoleName;
}

export type RoleName = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';

export interface LoginRequest {
  loginIdentifier: string;
  password: string;
}

// Backend wraps responses in ApiResponse<T> with a `data` field
export interface LoginResponse {
  success: boolean;
  message: string;
  // data holds the UserProfileResponse from the backend
  data: User;
}
